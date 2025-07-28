import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GroceryItem {
  ingredient: string;
  count: number;
  totalQuantity: number;
  meals: string[];
}

export const useGroceryList = (mealPlanId: string | null) => {
  const { user } = useAuth();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroceryList = async () => {
      if (!user || !mealPlanId) return;

      setLoading(true);
      try {
        // Fetch all meals for the meal plan
        const { data: meals, error } = await supabase
          .from('meals')
          .select('meal_name, ingredients')
          .eq('meal_plan_id', mealPlanId);

        if (error) {
          console.error('Error fetching meals for grocery list:', error);
          return;
        }

        // Process ingredients into grocery list
        const ingredientMap = new Map<string, GroceryItem>();

        meals?.forEach((meal) => {
          if (meal.ingredients && Array.isArray(meal.ingredients)) {
            meal.ingredients.forEach((ingredient: string) => {
              // Clean up the ingredient string
              const cleanIngredient = ingredient.trim().toLowerCase();
              
              // Skip water - don't add it to grocery list
              if (cleanIngredient === 'water' || cleanIngredient.includes('water') && cleanIngredient.split(' ').length === 1) {
                return;
              }
              
              // Extract quantity and base ingredient
              const { quantity, baseIngredient, displayIngredient } = extractIngredientWithQuantity(ingredient.trim());
              
              if (ingredientMap.has(baseIngredient)) {
                const existing = ingredientMap.get(baseIngredient)!;
                existing.count += 1;
                existing.totalQuantity += quantity;
                if (!existing.meals.includes(meal.meal_name)) {
                  existing.meals.push(meal.meal_name);
                }
              } else {
                ingredientMap.set(baseIngredient, {
                  ingredient: displayIngredient,
                  count: 1,
                  totalQuantity: quantity,
                  meals: [meal.meal_name]
                });
              }
            });
          }
        });

        // Update display ingredients with total quantities
        const groceryItems = Array.from(ingredientMap.values()).map(item => ({
          ...item,
          ingredient: createDisplayIngredient(item.totalQuantity, extractBaseIngredient(item.ingredient), item.ingredient)
        })).sort((a, b) =>
          a.ingredient.localeCompare(b.ingredient)
        );

        setGroceryList(groceryItems);
      } catch (error) {
        console.error('Error processing grocery list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroceryList();
  }, [user, mealPlanId]);

  return { groceryList, loading };
};

// Helper function to extract quantity and base ingredient name
const extractIngredientWithQuantity = (ingredient: string): { quantity: number; baseIngredient: string; displayIngredient: string } => {
  const originalIngredient = ingredient;
  const lowerIngredient = ingredient.toLowerCase();
  
  // Extract quantity - look for numbers at the beginning
  const quantityMatch = lowerIngredient.match(/^(\d+(?:\.\d+)?|\d*\.?\d+)\s*/);
  let quantity = 1; // Default quantity
  
  if (quantityMatch) {
    quantity = parseFloat(quantityMatch[1]);
  }
  
  // Get base ingredient using the existing function logic
  const baseIngredient = extractBaseIngredient(lowerIngredient);
  
  // For display, we want to show the aggregated quantity with the base ingredient
  const displayIngredient = createDisplayIngredient(quantity, baseIngredient, originalIngredient);
  
  return { quantity, baseIngredient, displayIngredient };
};

// Helper function to create display ingredient with proper quantity
const createDisplayIngredient = (quantity: number, baseIngredient: string, originalIngredient: string): string => {
  // Extract unit from original ingredient
  const unitMatch = originalIngredient.toLowerCase().match(/^\d+(?:\.\d+)?\s*(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|l|liters?|small|medium|large)\s+/i);
  const unit = unitMatch ? unitMatch[1] : '';
  
  if (unit) {
    return `${quantity} ${unit} ${baseIngredient}`;
  } else if (quantity > 1) {
    return `${quantity} ${baseIngredient}`;
  } else {
    return baseIngredient;
  }
};

// Helper function to extract base ingredient name
const extractBaseIngredient = (ingredient: string): string => {
  // Remove common measurements and quantities
  let cleanedIngredient = ingredient.toLowerCase()
    .replace(/^\d+(\.\d+)?\s*(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|l|liters?)\s+/i, '')
    .replace(/^\d+(\.\d+)?\s*(small|medium|large|extra\s+large)\s+/i, '') // Remove size descriptors
    .replace(/^\d+(\.\d+)?\s+/i, '') // Remove standalone numbers
    .replace(/^(a|an|the)\s+/i, '') // Remove articles
    .replace(/,.*$/, '') // Remove everything after comma
    .replace(/\(.*?\)/g, '') // Remove parenthetical content
    .replace(/\s+(diced|chopped|sliced|shredded|minced|grated|fresh|frozen|dried|cooked|raw)(\s|$)/gi, ' ') // Remove preparation methods
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Normalize common ingredient variations
  if (cleanedIngredient.includes('zucchini')) cleanedIngredient = 'zucchini';
  if (cleanedIngredient.includes('sweet potato')) cleanedIngredient = 'sweet potato';
  if (cleanedIngredient.includes('bell pepper') || cleanedIngredient.includes('pepper')) cleanedIngredient = 'bell pepper';
  if (cleanedIngredient.includes('onion')) cleanedIngredient = 'onion';
  if (cleanedIngredient.includes('garlic')) cleanedIngredient = 'garlic';
  if (cleanedIngredient.includes('tomato')) cleanedIngredient = 'tomato';

  return cleanedIngredient || ingredient.toLowerCase(); // Fallback to original if cleaning removed everything
};