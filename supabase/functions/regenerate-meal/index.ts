import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { loadPrompt, getPromptPath } from '../shared/prompt-loader.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate request body
    const body = await req.json();
    const { mealId, userId, feedback } = body;
    
    // Input validation
    if (!mealId || typeof mealId !== 'string') {
      throw new Error('Valid Meal ID is required');
    }
    
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid User ID is required');
    }
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(mealId) || !uuidRegex.test(userId)) {
      throw new Error('Invalid ID format');
    }
    
    // Sanitize feedback
    const sanitizedFeedback = feedback ? feedback.toString().slice(0, 1000) : '';

    console.log('Regenerating meal:', { mealId, userId, feedback })

    // Get the current meal details
    const { data: currentMeal, error: mealError } = await supabase
      .from('meals')
      .select(`
        *,
        meal_plans!inner(user_id)
      `)
      .eq('id', mealId)
      .eq('meal_plans.user_id', userId)
      .single()

    if (mealError || !currentMeal) {
      throw new Error('Meal not found or unauthorized')
    }

    // Get user's dietary restrictions and goals
    const [restrictionsResponse, goalsResponse] = await Promise.all([
      supabase
        .from('dietary_restrictions')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', userId)
        .single()
    ])

    const restrictions = restrictionsResponse.data || []
    const goals = goalsResponse.data

    // Format dietary restrictions for AI
    const allergies = restrictions
      .filter(r => r.restriction_type === 'allergy')
      .map(r => r.restriction_name)
    
    const dietaryThemes = restrictions
      .filter(r => r.restriction_type === 'diet')
      .map(r => r.restriction_name)
    
    const customRequirements = restrictions
      .find(r => r.restriction_type === 'custom_requirement')?.restriction_name || ''

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
    
    const fodmapRestriction = isNoFodmap ? `\n- STRICTLY AVOID these FODMAP ingredients: ${lowFodmapIngredients.join(', ')}` 
      : isLowFodmap ? `\n- Use only SMALL AMOUNTS of these FODMAP ingredients (max 1-2 tablespoons per meal): ${lowFodmapIngredients.join(', ')}` : '';
    const histamineRestriction = isNoHistamine ? `\n- STRICTLY AVOID these histamine ingredients: ${lowHistamineIngredients.join(', ')}` 
      : isLowHistamine ? `\n- Use only SMALL AMOUNTS of these histamine ingredients (max 1-2 tablespoons per meal): ${lowHistamineIngredients.join(', ')}` : '';

    // Load and process the external prompt file
    const promptData = await loadPrompt(getPromptPath('regenerate-meal.prompt.yml'), {
      mealType: currentMeal.meal_type,
      previousMealName: currentMeal.meal_name,
      previousMealDescription: currentMeal.description,
      calorieMin: goals?.calorie_min || 400,
      calorieMax: goals?.calorie_max || 600,
      proteinGoal: goals?.protein_goal || 25,
      fiberGoal: goals?.fiber_goal || 8,
      allergies: allergies.join(', ') || 'None',
      dietaryThemes: dietaryThemes.join(', ') || 'None',
      fodmapRestriction,
      histamineRestriction,
      customRequirements,
      feedback
    });

    console.log('Sending prompt to OpenAI for meal regeneration...')

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: promptData.messages,
        temperature: promptData.modelParameters.temperature,
        max_tokens: promptData.modelParameters.max_tokens,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received')

    const content = openaiData.choices[0].message.content
    let newMealData

    try {
      // Remove markdown code block formatting if present
      let jsonContent = content.trim()
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      newMealData = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid response format from AI')
    }

    // Update the meal in the database
    const { data: updatedMeal, error: updateError } = await supabase
      .from('meals')
      .update({
        meal_name: newMealData.meal_name,
        description: newMealData.description,
        calories: newMealData.calories,
        protein: newMealData.protein,
        fiber: newMealData.fiber,
        ingredients: newMealData.ingredients,
        instructions: newMealData.instructions,
      })
      .eq('id', mealId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update meal: ${updateError.message}`)
    }

    console.log('Meal regenerated successfully:', updatedMeal.meal_name)

    return new Response(
      JSON.stringify({
        success: true,
        meal: updatedMeal,
        message: `${currentMeal.meal_type} regenerated successfully!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error regenerating meal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})