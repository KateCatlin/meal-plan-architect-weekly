
import { supabase } from "@/integrations/supabase/client";

export interface DietaryRestrictions {
  allergies: string[];
  dietaryThemes: string[];
  calories: number[];
  protein: number[];
  fiber: number[];
  customMealRequirements?: string;
  breakfastCookingFrequency: number[];
  lunchDinnerCookingFrequency: number[];
}

export interface SavedDietaryData {
  restrictions: Array<{
    id: string;
    restriction_type: string;
    restriction_name: string;
    severity?: string;
  }>;
  goals: {
    id: string;
    calorie_min?: number;
    calorie_max?: number;
    protein_goal?: number;
    fiber_goal?: number;
  } | null;
}

export const saveDietaryRestrictions = async (userId: string, data: DietaryRestrictions) => {
  console.log('Saving dietary restrictions for user:', userId, data);
  
  // First, delete existing restrictions for this user
  const { error: deleteError } = await supabase
    .from('dietary_restrictions')
    .delete()
    .eq('user_id', userId);
    
  if (deleteError) {
    console.error('Error deleting existing restrictions:', deleteError);
    throw deleteError;
  }

  // Save allergies
  const allergyInserts = data.allergies.map(allergy => ({
    user_id: userId,
    restriction_type: 'allergy',
    restriction_name: allergy,
    severity: 'moderate'
  }));

  // Save dietary themes
  const themeInserts = data.dietaryThemes.map(theme => ({
    user_id: userId,
    restriction_type: 'diet',
    restriction_name: theme
  }));

  // Save custom meal requirements as a special restriction type
  const customRequirementsInserts = data.customMealRequirements ? [{
    user_id: userId,
    restriction_type: 'custom_requirement',
    restriction_name: data.customMealRequirements
  }] : [];

  // Save cooking frequency preferences
  const cookingFrequencyInserts = [
    {
      user_id: userId,
      restriction_type: 'breakfast_cooking_frequency',
      restriction_name: data.breakfastCookingFrequency[0].toString()
    },
    {
      user_id: userId,
      restriction_type: 'lunch_dinner_cooking_frequency',
      restriction_name: data.lunchDinnerCookingFrequency[0].toString()
    }
  ];

  const allRestrictions = [...allergyInserts, ...themeInserts, ...customRequirementsInserts, ...cookingFrequencyInserts];

  if (allRestrictions.length > 0) {
    const { error: restrictionsError } = await supabase
      .from('dietary_restrictions')
      .insert(allRestrictions);

    if (restrictionsError) {
      console.error('Error saving restrictions:', restrictionsError);
      throw restrictionsError;
    }
  }

  // Save or update nutritional goals
  const goalData = {
    user_id: userId,
    calorie_min: data.calories[0],
    calorie_max: data.calories.length > 1 ? data.calories[1] : data.calories[0],
    protein_goal: data.protein[0],
    fiber_goal: data.fiber[0]
  };

  const { error: goalsError } = await supabase
    .from('nutritional_goals')
    .upsert(goalData, { onConflict: 'user_id' });

  if (goalsError) {
    console.error('Error saving goals:', goalsError);
    throw goalsError;
  }

  console.log('Successfully saved dietary data');
};

export const loadDietaryRestrictions = async (userId: string): Promise<DietaryRestrictions> => {
  console.log('Loading dietary restrictions for user:', userId);
  
  // Load restrictions
  const { data: restrictions, error: restrictionsError } = await supabase
    .from('dietary_restrictions')
    .select('*')
    .eq('user_id', userId);

  if (restrictionsError) {
    console.error('Error loading restrictions:', restrictionsError);
    throw restrictionsError;
  }

  // Load goals
  const { data: goals, error: goalsError } = await supabase
    .from('nutritional_goals')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (goalsError) {
    console.error('Error loading goals:', goalsError);
    throw goalsError;
  }

  // Convert database format back to form format
  const allergies = restrictions
    ?.filter(r => r.restriction_type === 'allergy')
    .map(r => r.restriction_name) || [];

  const dietaryThemes = restrictions
    ?.filter(r => r.restriction_type === 'diet')
    .map(r => r.restriction_name) || [];

  const customMealRequirements = restrictions
    ?.find(r => r.restriction_type === 'custom_requirement')
    ?.restriction_name || '';

  const breakfastCookingFrequency = restrictions
    ?.find(r => r.restriction_type === 'breakfast_cooking_frequency')
    ?.restriction_name ? [parseInt(restrictions.find(r => r.restriction_type === 'breakfast_cooking_frequency')!.restriction_name)] : [7];

  const lunchDinnerCookingFrequency = restrictions
    ?.find(r => r.restriction_type === 'lunch_dinner_cooking_frequency')
    ?.restriction_name ? [parseInt(restrictions.find(r => r.restriction_type === 'lunch_dinner_cooking_frequency')!.restriction_name)] : [14];

  const result: DietaryRestrictions = {
    allergies,
    dietaryThemes,
    calories: goals?.calorie_min && goals?.calorie_max ? [goals.calorie_min, goals.calorie_max] : [1800, 2200],
    protein: goals?.protein_goal ? [goals.protein_goal] : [150],
    fiber: goals?.fiber_goal ? [goals.fiber_goal] : [25],
    customMealRequirements,
    breakfastCookingFrequency,
    lunchDinnerCookingFrequency
  };

  console.log('Loaded dietary restrictions:', result);
  return result;
};
