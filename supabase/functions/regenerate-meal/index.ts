import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { mealId, userId, feedback } = await req.json()

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
      .filter(r => r.restriction_type === 'dietary_theme')
      .map(r => r.restriction_name)

    // Add hardcoded low-FODMAP restrictions if applicable
    const lowFodmapIngredients = [
      'artichoke', 'asparagus', 'garlic', 'green peas', 'leek', 'mushrooms', 'onion', 'red capsicum', 'bell pepper',
      'apples', 'apple juice', 'cherries', 'dried fruit', 'mango', 'nectarines', 'peaches', 'pears', 'plums', 'watermelon',
      'milk', 'custard', 'evaporated milk', 'ice cream', 'soy milk', 'sweetened condensed milk', 'yogurt',
      'wheat', 'rye', 'barley', 'wheat bread', 'rye bread', 'barley bread', 'breakfast cereals', 'biscuits',
      'high fructose corn syrup', 'honey', 'sugar free confectionery',
      'cashews', 'pistachios'
    ];
    
    const isLowFodmap = dietaryThemes.some(theme => theme.toLowerCase().includes('low-fodmap'));
    const fodmapRestriction = isLowFodmap ? `\n- STRICTLY AVOID these low-FODMAP ingredients: ${lowFodmapIngredients.join(', ')}` : '';

    // Create the AI prompt for regenerating the meal
    const prompt = `Generate a new ${currentMeal.meal_type} meal that is different from the previous one. 

Previous meal: ${currentMeal.meal_name} - ${currentMeal.description}

Requirements:
- Meal type: ${currentMeal.meal_type}
- Target calories: ${goals?.calorie_min || 400}-${goals?.calorie_max || 600} calories
- Minimum protein: ${goals?.protein_goal || 25}g
- Minimum fiber: ${goals?.fiber_goal || 8}g
- Avoid allergies: ${allergies.join(', ') || 'None'}
- Follow dietary themes: ${dietaryThemes.join(', ') || 'None'}${fodmapRestriction}
- Make it completely different from the previous meal
${feedback ? `- User feedback: ${feedback}` : ''}

Provide a JSON response with:
{
  "meal_name": "...",
  "description": "...",
  "calories": number,
  "protein": number,
  "fiber": number,
  "ingredients": ["ingredient1", "ingredient2", ...],
  "instructions": "Step by step cooking instructions..."
}`

    console.log('Sending prompt to OpenAI:', prompt.substring(0, 200) + '...')

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist and chef. Generate healthy, balanced meals that meet specific nutritional requirements. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
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