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
    const customRequirements = restrictions.find((r: any) => r.restriction_type === 'custom_requirement')?.restriction_name || '';
    
    // Get cooking frequency preferences
    const breakfastCookingFreq = parseInt(restrictions.find((r: any) => r.restriction_type === 'breakfast_cooking_frequency')?.restriction_name) || 7;
    const lunchDinnerCookingFreq = parseInt(restrictions.find((r: any) => r.restriction_type === 'lunch_dinner_cooking_frequency')?.restriction_name) || 14;

    // Add hardcoded low-FODMAP restrictions if applicable
    const lowFodmapIngredients = [
      'artichoke', 'asparagus', 'garlic', 'green peas', 'leek', 'mushrooms', 'onion', 'red capsicum', 'bell pepper',
      'apples', 'apple juice', 'cherries', 'dried fruit', 'mango', 'nectarines', 'peaches', 'pears', 'plums', 'watermelon',
      'milk', 'custard', 'evaporated milk', 'ice cream', 'soy milk', 'sweetened condensed milk', 'yogurt',
      'wheat', 'rye', 'barley', 'wheat bread', 'rye bread', 'barley bread', 'breakfast cereals', 'biscuits',
      'high fructose corn syrup', 'honey', 'sugar free confectionery',
      'cashews', 'pistachios'
    ];
    
    // Add hardcoded low histamine restrictions if applicable
    const lowHistamineIngredients = [
      'parmesan', 'blue cheese', 'brie', 'aged cheese', 'fermented cheese',
      'alcohol', 'wine', 'beer', 'spirits',
      'avocado',
      'kiwi', 'pineapple', 'papaya', 'strawberries', 'passionfruit', 'plum', 'bananas',
      'peanuts', 'walnuts', 'cashews',
      'allspice', 'anise', 'cinnamon', 'chili powder', 'clove', 'curry powder', 'cayenne', 'msg', 'nutmeg', 'paprika',
      'chocolate',
      'lemon', 'lime', 'grapefruit', 'orange',
      'dried fruit',
      'eggplant',
      'kimchi', 'sauerkraut', 'tempeh', 'yogurt', 'kefir', 'sourdough',
      'canned fish',
      'beans', 'chickpeas', 'soybeans', 'peanut',
      'licorice',
      'pickles', 'olives', 'mustard', 'ketchup',
      'hot dogs', 'sausage', 'deli meat', 'jerky', 'canned meat',
      'shellfish',
      'sour cream', 'buttermilk',
      'soy', 'soy sauce', 'soybeans', 'soy lecithin', 'tofu',
      'spinach',
      'squash',
      'tomatoes',
      'unpasteurized milk', 'goat milk', 'sheep milk',
      'wheat',
      'vinegar', 'balsamic vinegar'
    ];
    
    const isLowFodmap = dietaryThemes.some(theme => theme.toLowerCase().replace(/\s/g, '').includes('lowfodmap'));
    const isNoFodmap = dietaryThemes.some(theme => theme.toLowerCase().replace(/\s/g, '').includes('nofodmap'));
    const isLowHistamine = dietaryThemes.some(theme => theme.toLowerCase().replace(/\s/g, '').includes('lowhistamine'));
    const isNoHistamine = dietaryThemes.some(theme => theme.toLowerCase().replace(/\s/g, '').includes('nohistamine'));
    const isAIP = dietaryThemes.some(theme => theme.toLowerCase().includes('autoimmune protocol') || theme.toLowerCase().includes('aip'));
    const isWhole30 = dietaryThemes.some(theme => theme.toLowerCase().includes('whole30'));
    
    const aipForbiddenFoods = [
      'amaranth', 'barley', 'buckwheat', 'bulgur', 'corn', 'farro', 'kamut', 'millet', 'oats', 'oatmeal', 'quinoa', 'rice', 'rye', 'sorghum', 'spelt', 'teff', 'wheat',
      'eggs',
      'cayenne', 'chili pepper', 'eggplant', 'goji berry', 'ground cherry', 'habanero', 'jalapeno', 'paprika', 'poblano', 'potato', 'sweet pepper', 'tobacco', 'tomato', 'tomatillo', 'wolf berries',
      'anise', 'canola', 'caraway', 'chia', 'coriander', 'cumin', 'fennel seed', 'fenugreek', 'mustard', 'nutmeg', 'poppy', 'pumpkin', 'sesame', 'sunflower', 'hemp',
      'almond', 'brazil nuts', 'coffee', 'cocoa', 'hazelnuts', 'pecan', 'macadamia', 'walnut',
      'butter', 'cheese', 'cream', 'cream cheese', 'ghee', 'milk', 'yogurt',
      'alcohol'
    ];

    const whole30ForbiddenFoods = [
      'sugar', 'brown sugar', 'cane sugar', 'coconut sugar', 'agave nectar', 'date syrup', 'high-fructose corn syrup', 'honey', 'maple syrup', 'molasses', 'monk fruit extract', 'stevia', 'truvia', 'saccharin', 'sweet n low', 'sucralose', 'splenda', 'aspartame', 'equal', 'nutrasweet', 'erythritol', 'xylitol',
      'alcohol',
      'wheat', 'rye', 'barley', 'triticale', 'oats', 'corn', 'rice', 'millet', 'bulgur', 'sorghum', 'sprouted grains', 'quinoa', 'amaranth', 'buckwheat', 'bran', 'germ', 'starch',
      'beans', 'black beans', 'red beans', 'pinto beans', 'navy beans', 'garbanzo', 'chickpeas', 'white beans', 'kidney beans', 'lima beans', 'fava beans', 'cannellini', 'lentils', 'adzuki', 'mung beans', 'cranberry beans', 'black-eyed peas', 'peanuts', 'peanut butter', 'soy', 'soy sauce', 'miso', 'tofu', 'tempeh', 'edamame', 'soy protein', 'soy milk', 'soy lecithin',
      'milk', 'cheese', 'sour cream', 'yogurt', 'cream', 'cottage cheese', 'kefir', 'ice cream', 'frozen yogurt',
      'bread', 'tortillas', 'wraps', 'crackers', 'pizza crust', 'pie crust', 'biscuits', 'pancakes', 'crepes', 'waffles', 'muffins', 'cupcakes', 'cookies', 'brownies', 'pasta', 'noodles', 'cereal', 'chips', 'potato chips', 'sweet potato chips', 'tortilla chips', 'plantain chips', 'taro chips', 'cassava chips', 'french fries', 'tots'
    ];

    const whole30AllowedExceptions = [
      'fruit juice', 'green beans', 'sugar snap peas', 'snow peas', 'green peas', 'yellow peas', 'split peas', 'ghee', 'clarified butter', 'coconut aminos', 'vanilla extract', 'lemon extract', 'lavender extract', 'champagne vinegar', 'red wine vinegar', 'sherry vinegar', 'white wine vinegar', 'rice vinegar', 'iodized salt'
    ];

    const fodmapRestriction = isNoFodmap ? `\n- STRICTLY AVOID these FODMAP ingredients: ${lowFodmapIngredients.join(', ')}` 
      : isLowFodmap ? `\n- Use only SMALL AMOUNTS of these FODMAP ingredients (max 1-2 tablespoons per meal): ${lowFodmapIngredients.join(', ')}` : '';
    const histamineRestriction = isNoHistamine ? `\n- STRICTLY AVOID these histamine ingredients: ${lowHistamineIngredients.join(', ')}` 
      : isLowHistamine ? `\n- Use only SMALL AMOUNTS of these histamine ingredients (max 1-2 tablespoons per meal): ${lowHistamineIngredients.join(', ')}` : '';
    const aipRestriction = isAIP ? `\n- STRICTLY AVOID ALL AIP forbidden ingredients: ${aipForbiddenFoods.join(', ')}` : '';
    const whole30Restriction = isWhole30 ? `\n- STRICTLY AVOID ALL Whole30 forbidden ingredients: ${whole30ForbiddenFoods.join(', ')}. HOWEVER, these Whole30 exceptions ARE allowed: ${whole30AllowedExceptions.join(', ')}` : '';

    // Build cooking frequency instructions
    const breakfastInstructions = breakfastCookingFreq === 7 
      ? "Create 7 different breakfast meals, one for each day."
      : `Create only ${breakfastCookingFreq} different breakfast meal types. Repeat these meals across the week so that consecutive days have the same breakfast until all ${breakfastCookingFreq} types are used.`;
    
    const lunchDinnerInstructions = lunchDinnerCookingFreq === 14
      ? "Create unique lunch and dinner meals for each day (14 total different meals)."
      : lunchDinnerCookingFreq === 7
      ? "Create 7 different meal types. For each day, use the SAME meal type for both lunch AND dinner (same meal_name, ingredients, instructions for both lunch and dinner on the same day)."
      : `Create only ${lunchDinnerCookingFreq} different meal types for lunch and dinner. Each meal type should be used for both lunch AND dinner on consecutive days until all ${lunchDinnerCookingFreq} types are used across the week.`;

    const prompt = `
Generate a complete 7-day meal plan with the following requirements:

DIETARY RESTRICTIONS:
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
- Dietary themes to follow: ${dietaryThemes.length > 0 ? dietaryThemes.join(', ') : 'None'}${fodmapRestriction}${histamineRestriction}${aipRestriction}${whole30Restriction}
${customRequirements ? `\nCUSTOM MEAL REQUIREMENTS:\n- ${customRequirements}` : ''}

NUTRITIONAL GOALS:
- Daily calories: ${goals?.calorie_min || 1800}-${goals?.calorie_max || 2200}
- Daily protein: ${goals?.protein_goal || 150}g
- Daily fiber: ${goals?.fiber_goal || 25}g

COOKING FREQUENCY REQUIREMENTS:
- BREAKFAST: ${breakfastInstructions}
- LUNCH & DINNER: ${lunchDinnerInstructions}

REQUIREMENTS:
1. STRICTLY follow the cooking frequency requirements above - this is CRITICAL
2. Each meal should include realistic nutrition estimates
3. Provide detailed ingredient lists for each meal
4. Include clear cooking instructions
5. Make sure all meals respect the dietary restrictions
6. Aim to meet the nutritional goals across the day

IMPORTANT CLARIFICATION FOR COOKING FREQUENCY:
${lunchDinnerCookingFreq === 7 ? 
`- You must create exactly 7 different meal types for lunch/dinner
- Each day (Monday through Sunday) should have the SAME meal for lunch AND dinner
- For example: Day 1 lunch = "Grilled Chicken Salad", Day 1 dinner = "Grilled Chicken Salad" (same meal_name, ingredients, instructions)
- This creates 7 different meal types total, each used twice per day (once for lunch, once for dinner)
- Total meals to generate: 7 breakfasts + 7 lunches + 7 dinners = 21 meals, but only 14 unique meal types (7 breakfast types + 7 lunch/dinner types)` 
: 
`- You must create exactly ${lunchDinnerCookingFreq} different meal types for lunch and dinner combined
- These ${lunchDinnerCookingFreq} meal types should be distributed across the week for both lunch and dinner
- Each meal type should be used for consecutive meals until all ${lunchDinnerCookingFreq} types are used`}

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

Generate meals for all 7 days, following the cooking frequency requirements exactly.
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
