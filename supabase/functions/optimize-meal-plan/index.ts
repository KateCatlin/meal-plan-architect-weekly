import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, mealPlanId } = await req.json();

    if (!userId || !mealPlanId) {
      throw new Error('User ID and meal plan ID are required');
    }

    console.log('Optimizing meal plan:', mealPlanId, 'for user:', userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's nutritional goals
    const { data: goals, error: goalsError } = await supabase
      .from('nutritional_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (goalsError || !goals) {
      throw new Error('Could not find nutritional goals for user');
    }

    // Get user's dietary restrictions
    const { data: restrictions, error: restrictionsError } = await supabase
      .from('dietary_restrictions')
      .select('*')
      .eq('user_id', userId);

    if (restrictionsError) {
      throw new Error('Could not find dietary restrictions for user');
    }

    // Get current meals for the meal plan
    const { data: currentMeals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .order('day_of_week', { ascending: true });

    if (mealsError || !currentMeals) {
      throw new Error('Could not find meals for meal plan');
    }

    console.log('Found', currentMeals.length, 'current meals');

    // Analyze daily nutrition and identify days that don't meet goals
    const dailyNutrition: { [day: number]: { protein: number; fiber: number; calories: number; meals: any[] } } = {};
    
    currentMeals.forEach(meal => {
      if (!dailyNutrition[meal.day_of_week]) {
        dailyNutrition[meal.day_of_week] = { protein: 0, fiber: 0, calories: 0, meals: [] };
      }
      dailyNutrition[meal.day_of_week].protein += meal.protein || 0;
      dailyNutrition[meal.day_of_week].fiber += meal.fiber || 0;
      dailyNutrition[meal.day_of_week].calories += meal.calories || 0;
      dailyNutrition[meal.day_of_week].meals.push(meal);
    });

    const daysNeedingOptimization = [];
    for (const [day, nutrition] of Object.entries(dailyNutrition)) {
      if (nutrition.protein < goals.protein_goal || nutrition.fiber < goals.fiber_goal) {
        daysNeedingOptimization.push({
          day: parseInt(day),
          currentProtein: nutrition.protein,
          currentFiber: nutrition.fiber,
          proteinDeficit: Math.max(0, goals.protein_goal - nutrition.protein),
          fiberDeficit: Math.max(0, goals.fiber_goal - nutrition.fiber)
        });
      }
    }

    console.log('Days needing optimization:', daysNeedingOptimization);

    if (daysNeedingOptimization.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Your meal plan already meets all nutritional goals!',
        optimized: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get OpenAI API key for meal optimization
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build dietary context for AI
    const allergies = restrictions.filter((r: any) => r.restriction_type === 'allergy')
      .map((r: any) => r.restriction_name);
    const dietaryThemes = restrictions.filter((r: any) => r.restriction_type === 'diet')
      .map((r: any) => r.restriction_name);

    // Create optimization prompt for each day that needs improvement
    const optimizationPrompts = daysNeedingOptimization.map(dayInfo => {
      const dayMeals = dailyNutrition[dayInfo.day].meals;
      return `
Day ${dayInfo.day} needs optimization:
Current meals: ${JSON.stringify(dayMeals.map(m => ({ name: m.meal_name, type: m.meal_type, protein: m.protein, fiber: m.fiber, calories: m.calories })))}
Protein deficit: ${dayInfo.proteinDeficit}g
Fiber deficit: ${dayInfo.fiberDeficit}g
`;
    }).join('\n');

    const prompt = `
You are a nutritionist optimizing a meal plan. The user needs to meet these daily goals:
- Protein: ${goals.protein_goal}g
- Fiber: ${goals.fiber_goal}g
- Calories: ${goals.calorie_min}-${goals.calorie_max}

DIETARY RESTRICTIONS:
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
- Dietary themes to follow: ${dietaryThemes.length > 0 ? dietaryThemes.join(', ') : 'None'}

DAYS NEEDING OPTIMIZATION:
${optimizationPrompts}

Please suggest optimized meals to replace existing ones to meet the nutritional goals. For each day that needs optimization, suggest which meal to replace and what to replace it with.

Respond with a JSON object in this format:
{
  "optimizations": [
    {
      "day_of_week": 1,
      "meal_to_replace": "meal_id_here",
      "new_meal": {
        "meal_name": "New Meal Name",
        "description": "Brief description",
        "meal_type": "breakfast|lunch|dinner",
        "ingredients": ["ingredient 1", "ingredient 2"],
        "instructions": "Cooking instructions",
        "calories": 500,
        "protein": 35,
        "fiber": 12
      }
    }
  ]
}
`;

    console.log('Sending optimization request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist specializing in meal plan optimization. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI optimization response received');

    let optimizationData;
    try {
      const content = aiResponse.choices[0].message.content;
      console.log('AI optimization content:', content);
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizationData = JSON.parse(jsonMatch[0]);
      } else {
        optimizationData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI optimization response');
    }

    if (!optimizationData.optimizations || !Array.isArray(optimizationData.optimizations)) {
      throw new Error('Invalid optimization structure from AI');
    }

    console.log('Processing', optimizationData.optimizations.length, 'optimizations');

    // Apply the optimizations by updating meals
    const updatedMeals = [];
    for (const optimization of optimizationData.optimizations) {
      const mealToReplace = currentMeals.find(m => m.id === optimization.meal_to_replace);
      if (!mealToReplace) {
        console.warn('Could not find meal to replace:', optimization.meal_to_replace);
        continue;
      }

      const updatedMeal = {
        ...mealToReplace,
        meal_name: optimization.new_meal.meal_name,
        description: optimization.new_meal.description,
        ingredients: optimization.new_meal.ingredients,
        instructions: optimization.new_meal.instructions,
        calories: optimization.new_meal.calories,
        protein: optimization.new_meal.protein,
        fiber: optimization.new_meal.fiber
      };

      const { error: updateError } = await supabase
        .from('meals')
        .update({
          meal_name: updatedMeal.meal_name,
          description: updatedMeal.description,
          ingredients: updatedMeal.ingredients,
          instructions: updatedMeal.instructions,
          calories: updatedMeal.calories,
          protein: updatedMeal.protein,
          fiber: updatedMeal.fiber
        })
        .eq('id', mealToReplace.id);

      if (updateError) {
        console.error('Error updating meal:', updateError);
        throw updateError;
      }

      updatedMeals.push(updatedMeal);
    }

    console.log('Successfully optimized', updatedMeals.length, 'meals');

    return new Response(JSON.stringify({
      success: true,
      message: `Optimized ${updatedMeals.length} meals to better meet your nutritional goals!`,
      optimized: true,
      updatedMeals: updatedMeals.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-meal-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});