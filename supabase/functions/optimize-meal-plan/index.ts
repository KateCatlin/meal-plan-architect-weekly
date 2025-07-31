import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ensureNutritionalGoals } from '../shared/optimize-helpers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, mealPlanId } = body;
    
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid User ID is required');
    }
    
    if (!mealPlanId || typeof mealPlanId !== 'string') {
      throw new Error('Valid Meal Plan ID is required');
    }
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(mealPlanId)) {
      throw new Error('Invalid ID format');
    }

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

    // Get OpenAI API key for meal optimization
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use the shared optimization logic
    const optimizationResult = await ensureNutritionalGoals({
      supabase,
      openAIApiKey,
      mealPlanId,
      userId,
      goals,
      restrictions,
      maxIterations: 3
    });

    return new Response(JSON.stringify({
      success: true,
      message: optimizationResult.message,
      optimized: optimizationResult.success,
      iterations: optimizationResult.iterations
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