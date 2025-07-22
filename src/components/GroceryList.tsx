import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Check, Copy } from "lucide-react";
import { useState } from "react";
import { useGroceryList } from "@/hooks/useGroceryList";
import { toast } from "@/hooks/use-toast";

interface GroceryListProps {
  mealPlanId: string | null;
  mealPlanName?: string;
}

export function GroceryList({ mealPlanId, mealPlanName }: GroceryListProps) {
  const { groceryList, loading } = useGroceryList(mealPlanId);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItemCheck = (ingredient: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(ingredient)) {
      newCheckedItems.delete(ingredient);
    } else {
      newCheckedItems.add(ingredient);
    }
    setCheckedItems(newCheckedItems);
  };

  const copyGroceryList = async () => {
    const listText = groceryList
      .map(item => `• ${item.ingredient}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(listText);
      toast({
        title: "Copied to clipboard!",
        description: "Your grocery list has been copied to the clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-muted rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (groceryList.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Ingredients Found</h3>
          <p className="text-muted-foreground">
            No ingredients could be found for this meal plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group ingredients by category (simple categorization)
  const categorizeIngredients = (items: typeof groceryList) => {
    const categories = {
      produce: [] as typeof groceryList,
      protein: [] as typeof groceryList,
      dairy: [] as typeof groceryList,
      grains: [] as typeof groceryList,
      pantry: [] as typeof groceryList,
      other: [] as typeof groceryList,
    };

    items.forEach(item => {
      const ingredient = item.ingredient.toLowerCase();
      
      if (ingredient.includes('lettuce') || ingredient.includes('tomato') || 
          ingredient.includes('onion') || ingredient.includes('pepper') ||
          ingredient.includes('carrot') || ingredient.includes('cucumber') ||
          ingredient.includes('spinach') || ingredient.includes('broccoli') ||
          ingredient.includes('avocado') || ingredient.includes('fruit') ||
          ingredient.includes('berry') || ingredient.includes('apple') ||
          ingredient.includes('banana') || ingredient.includes('lemon')) {
        categories.produce.push(item);
      } else if (ingredient.includes('chicken') || ingredient.includes('beef') ||
                ingredient.includes('fish') || ingredient.includes('salmon') ||
                ingredient.includes('turkey') || ingredient.includes('egg') ||
                ingredient.includes('tofu') || ingredient.includes('lentil')) {
        categories.protein.push(item);
      } else if (ingredient.includes('milk') || ingredient.includes('cheese') ||
                ingredient.includes('yogurt') || ingredient.includes('butter') ||
                ingredient.includes('cream')) {
        categories.dairy.push(item);
      } else if (ingredient.includes('rice') || ingredient.includes('pasta') ||
                ingredient.includes('bread') || ingredient.includes('quinoa') ||
                ingredient.includes('oats') || ingredient.includes('flour')) {
        categories.grains.push(item);
      } else if (ingredient.includes('oil') || ingredient.includes('salt') ||
                ingredient.includes('pepper') || ingredient.includes('garlic') ||
                ingredient.includes('herbs') || ingredient.includes('spice') ||
                ingredient.includes('vinegar') || ingredient.includes('sauce')) {
        categories.pantry.push(item);
      } else {
        categories.other.push(item);
      }
    });

    return categories;
  };

  const categories = categorizeIngredients(groceryList);

  const renderCategory = (title: string, items: typeof groceryList, icon: string) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {title}
          <Badge variant="outline" className="text-xs">
            {items.length} items
          </Badge>
        </h4>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                checkedItems.has(item.ingredient) 
                  ? 'bg-muted/30 opacity-60' 
                  : 'bg-background'
              }`}
              onClick={() => toggleItemCheck(item.ingredient)}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                checkedItems.has(item.ingredient)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground'
              }`}>
                {checkedItems.has(item.ingredient) && (
                  <Check className="h-3 w-3" />
                )}
              </div>
              <div className="flex-1">
                <span className={`${
                  checkedItems.has(item.ingredient) ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {item.ingredient}
                </span>
                {item.count > 1 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Used in {item.count} meals
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Grocery List
          </h3>
          {mealPlanName && (
            <p className="text-muted-foreground mt-1">For {mealPlanName}</p>
          )}
        </div>
        <Button onClick={copyGroceryList} variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Copy List
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Total ingredients: {groceryList.length} • Click items to check them off</p>
      </div>

      <Separator />

      <div className="space-y-6">
        {renderCategory("Fresh Produce", categories.produce, "🥬")}
        {renderCategory("Proteins", categories.protein, "🥩")}
        {renderCategory("Dairy & Eggs", categories.dairy, "🥛")}
        {renderCategory("Grains & Bread", categories.grains, "🍞")}
        {renderCategory("Pantry Items", categories.pantry, "🧂")}
        {renderCategory("Other Items", categories.other, "🛒")}
      </div>

      <div className="text-xs text-muted-foreground text-center pt-4">
        <p>Ingredients are automatically grouped by category. Check off items as you shop!</p>
      </div>
    </div>
  );
}