// Shared optimization helpers that can be used by both generate-meal-plan and optimize-meal-plan

interface OptimizationParams {
  supabase: any;
  openAIApiKey: string;
  mealPlanId: string;
  userId: string;
  goals: {
    protein_goal: number;
    fiber_goal: number;
    calorie_min: number;
    calorie_max: number;
  };
  restrictions: any[];
  maxIterations?: number;
}

export async function ensureNutritionalGoals({
  supabase,
  openAIApiKey,
  mealPlanId,
  userId,
  goals,
  restrictions,
  maxIterations = 3
}: OptimizationParams): Promise<{ success: boolean; message: string; iterations: number }> {
  let iterations = 0;
  
  while (iterations < maxIterations) {
    iterations++;
    console.log(`Optimization iteration ${iterations}/${maxIterations}`);
    
    // Get current meals for the meal plan
    const { data: currentMeals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .order('day_of_week', { ascending: true });

    if (mealsError || !currentMeals) {
      throw new Error('Could not find meals for meal plan');
    }

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

    console.log(`Iteration ${iterations}: Days needing optimization:`, daysNeedingOptimization);

    if (daysNeedingOptimization.length === 0) {
      return {
        success: true,
        message: `All nutritional goals met after ${iterations} iteration(s)!`,
        iterations
      };
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
You are a nutritionist optimizing a meal plan. The user MUST meet these daily goals:
- Protein: ${goals.protein_goal}g (CRITICAL: the new meal must provide enough protein to meet the daily goal)
- Fiber: ${goals.fiber_goal}g (CRITICAL: the new meal must provide enough fiber to meet the daily goal)
- Calories: ${goals.calorie_min}-${goals.calorie_max}

DIETARY RESTRICTIONS:
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
- Dietary themes to follow: ${dietaryThemes.length > 0 ? dietaryThemes.join(', ') : 'None'}

DAYS NEEDING OPTIMIZATION:
${optimizationPrompts}

CRITICAL: For each day, you must suggest a meal replacement that provides enough protein and fiber to close the deficits. The new meal's protein and fiber values must be sufficient to meet the daily targets.

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
            content: 'You are a professional nutritionist specializing in meal plan optimization. You must ensure daily protein and fiber targets are met. Always respond with valid JSON.'
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
    let updatedMealsCount = 0;
    for (const optimization of optimizationData.optimizations) {
      const mealToReplace = currentMeals.find(m => m.id === optimization.meal_to_replace);
      if (!mealToReplace) {
        console.warn('Could not find meal to replace:', optimization.meal_to_replace);
        continue;
      }

      const { error: updateError } = await supabase
        .from('meals')
        .update({
          meal_name: optimization.new_meal.meal_name,
          description: optimization.new_meal.description,
          ingredients: optimization.new_meal.ingredients,
          instructions: optimization.new_meal.instructions,
          calories: optimization.new_meal.calories,
          protein: optimization.new_meal.protein,
          fiber: optimization.new_meal.fiber
        })
        .eq('id', mealToReplace.id);

      if (updateError) {
        console.error('Error updating meal:', updateError);
        throw updateError;
      }

      updatedMealsCount++;
    }

    console.log(`Iteration ${iterations}: Successfully updated ${updatedMealsCount} meals`);
    
    // Continue to next iteration to check if goals are now met
  }

  return {
    success: false,
    message: `Could not meet all nutritional goals after ${maxIterations} iterations. Please try regenerating the meal plan.`,
    iterations
  };
}