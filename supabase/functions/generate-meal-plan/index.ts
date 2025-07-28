import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get current week's Monday and Sunday
const getCurrentWeekDates = () => {
  const now = new Date();
  const monday = new Date(now);
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Sunday = 7, Monday = 1
  monday.setDate(now.getDate() - dayOfWeek + 1);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      restrictions, 
      goals, 
      planName = "Weekly Meal Plan",
      planType = "weekly" 
    } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Generating meal plan for user:', userId);
    console.log('Restrictions:', restrictions);
    console.log('Goals:', goals);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current week dates
    const weekDates = getCurrentWeekDates();
    
    // Deactivate any existing active meal plans for this user
    await supabase
      .from('meal_plans')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Clean up old meal plans (keep only last 10 weeks)
    const { data: oldPlans } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .range(10, 1000); // Skip first 10, delete the rest

    if (oldPlans && oldPlans.length > 0) {
      const oldPlanIds = oldPlans.map(plan => plan.id);
      await supabase
        .from('meal_plans')
        .delete()
        .in('id', oldPlanIds);
    }

    // Generate AI meal plan using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build dietary context for AI
    const allergies = restrictions.filter((r: any) => r.restriction_type === 'allergy')
      .map((r: any) => r.restriction_name);
    const dietaryThemes = restrictions.filter((r: any) => r.restriction_type === 'diet')
      .map((r: any) => r.restriction_name);

    // Add hardcoded low-FODMAP restrictions if applicable
    const lowFodmapIngredients = [
      'artichoke', 'asparagus', 'garlic', 'green peas', 'leek', 'mushrooms', 'onion', 'red capsicum', 'bell pepper',
      'apples', 'apple juice', 'cherries', 'dried fruit', 'mango', 'nectarines', 'peaches', 'pears', 'plums', 'watermelon',
      'milk', 'custard', 'evaporated milk', 'ice cream', 'soy milk', 'sweetened condensed milk', 'yogurt',
      'wheat', 'rye', 'barley', 'wheat bread', 'rye bread', 'barley bread', 'breakfast cereals', 'biscuits',
      'high fructose corn syrup', 'honey', 'sugar free confectionery',
      'cashews', 'pistachios'
    ];
    
    const isLowFodmap = dietaryThemes.some(theme => theme.toLowerCase().replace(/\s/g, '').includes('lowfodmap'));
    const fodmapRestriction = isLowFodmap ? `\n- STRICTLY AVOID these low-FODMAP ingredients: ${lowFodmapIngredients.join(', ')}` : '';

    const prompt = `
Generate a complete 7-day meal plan with the following requirements:

DIETARY RESTRICTIONS:
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
- Dietary themes to follow: ${dietaryThemes.length > 0 ? dietaryThemes.join(', ') : 'None'}${fodmapRestriction}

NUTRITIONAL GOALS:
- Daily calories: ${goals?.calorie_min || 1800}-${goals?.calorie_max || 2200}
- Daily protein: ${goals?.protein_goal || 150}g
- Daily fiber: ${goals?.fiber_goal || 25}g

REQUIREMENTS:
1. Create 3 meals per day (breakfast, lunch, dinner) for 7 days (21 total meals)
2. Each meal should include realistic nutrition estimates
3. Provide detailed ingredient lists for each meal
4. Include clear cooking instructions
5. Ensure meals are varied and interesting
6. Make sure all meals respect the dietary restrictions
7. Aim to meet the nutritional goals across the day

Please respond with a JSON object in this exact format:
{
  "meals": [
    {
      "day_of_week": 1,
      "meal_type": "breakfast",
      "meal_name": "Meal Name",
      "description": "Brief description of the meal",
      "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
      "instructions": "Step by step cooking instructions",
      "calories": 450,
      "protein": 25,
      "fiber": 8
    }
  ]
}

Generate all 21 meals (3 meals × 7 days). Day 1 = Monday, Day 7 = Sunday.
`;

    console.log('Sending request to OpenAI...');

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
            content: 'You are a professional nutritionist and meal planning expert. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received');

    let mealPlanData;
    try {
      const content = aiResponse.choices[0].message.content;
      console.log('AI response content:', content);
      
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlanData = JSON.parse(jsonMatch[0]);
      } else {
        mealPlanData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    if (!mealPlanData.meals || !Array.isArray(mealPlanData.meals)) {
      throw new Error('Invalid meal plan structure from AI');
    }

    console.log('Generated', mealPlanData.meals.length, 'meals');

    // Create the meal plan with specific week dates
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        plan_name: `${planName} - Week of ${weekDates.start}`,
        plan_type: planType,
        start_date: weekDates.start,
        end_date: weekDates.end,
        is_active: true
      })
      .select()
      .single();

    if (mealPlanError) {
      console.error('Error creating meal plan:', mealPlanError);
      throw mealPlanError;
    }

    console.log('Created meal plan:', mealPlan.id);

    // Save individual meals
    const mealsToInsert = mealPlanData.meals.map((meal: any) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      meal_name: meal.meal_name,
      description: meal.description,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      calories: meal.calories,
      protein: meal.protein,
      fiber: meal.fiber
    }));

    const { error: mealsError } = await supabase
      .from('meals')
      .insert(mealsToInsert);

    if (mealsError) {
      console.error('Error saving meals:', mealsError);
      throw mealsError;
    }

    console.log('Successfully saved', mealsToInsert.length, 'meals');

    return new Response(JSON.stringify({
      success: true,
      mealPlan: mealPlan,
      mealsCount: mealsToInsert.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
