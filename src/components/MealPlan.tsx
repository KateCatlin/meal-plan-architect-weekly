import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Flame, Activity, Wheat } from "lucide-react";

interface MealPlanProps {
  restrictions: {
    allergies: string[];
    dietaryThemes: string[];
    calories: number[];
    protein: number[];
    fiber: number[];
  };
}

const sampleMealPlan = {
  Monday: {
    breakfast: {
      name: "Green Smoothie Bowl",
      description: "Spinach, banana, almond milk, chia seeds, topped with berries and granola",
      calories: 320,
      protein: 12,
      fiber: 8,
      cookTime: 10,
      servings: 1
    },
    lunch: {
      name: "Quinoa Buddha Bowl",
      description: "Roasted vegetables, chickpeas, avocado, tahini dressing",
      calories: 480,
      protein: 18,
      fiber: 12,
      cookTime: 25,
      servings: 1
    },
    dinner: {
      name: "Grilled Salmon with Sweet Potato",
      description: "Herb-crusted salmon, roasted sweet potato, steamed broccoli",
      calories: 520,
      protein: 35,
      fiber: 8,
      cookTime: 30,
      servings: 1
    },
    snacks: [
      {
        name: "Apple with Almond Butter",
        calories: 180,
        protein: 6,
        fiber: 4
      }
    ]
  },
  Tuesday: {
    breakfast: {
      name: "Overnight Oats",
      description: "Steel-cut oats, almond milk, berries, maple syrup, walnuts",
      calories: 350,
      protein: 12,
      fiber: 10,
      cookTime: 5,
      servings: 1
    },
    lunch: {
      name: "Mediterranean Wrap",
      description: "Hummus, grilled vegetables, feta cheese, mixed greens in whole wheat wrap",
      calories: 420,
      protein: 16,
      fiber: 8,
      cookTime: 15,
      servings: 1
    },
    dinner: {
      name: "Lentil Curry",
      description: "Red lentils, coconut milk, vegetables, served with brown rice",
      calories: 510,
      protein: 22,
      fiber: 15,
      cookTime: 35,
      servings: 1
    },
    snacks: [
      {
        name: "Greek Yogurt with Berries",
        calories: 150,
        protein: 15,
        fiber: 3
      }
    ]
  }
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function MealPlan({ restrictions }: MealPlanProps) {
  const renderMeal = (meal: any, type: string) => (
    <Card className="shadow-soft border-border/50 hover:shadow-medium transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          {meal.name}
          <Badge variant="outline" className="capitalize">{type}</Badge>
        </CardTitle>
        <CardDescription className="text-sm">{meal.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-4 text-center text-sm">
          <div className="flex flex-col items-center">
            <Flame className="h-4 w-4 text-warning mb-1" />
            <span className="font-semibold">{meal.calories}</span>
            <span className="text-muted-foreground text-xs">cal</span>
          </div>
          <div className="flex flex-col items-center">
            <Activity className="h-4 w-4 text-primary mb-1" />
            <span className="font-semibold">{meal.protein}g</span>
            <span className="text-muted-foreground text-xs">protein</span>
          </div>
          <div className="flex flex-col items-center">
            <Wheat className="h-4 w-4 text-success mb-1" />
            <span className="font-semibold">{meal.fiber}g</span>
            <span className="text-muted-foreground text-xs">fiber</span>
          </div>
          {meal.cookTime && (
            <div className="flex flex-col items-center">
              <Clock className="h-4 w-4 text-info mb-1" />
              <span className="font-semibold">{meal.cookTime}m</span>
              <span className="text-muted-foreground text-xs">cook</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSnacks = (snacks: any[]) => (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Snacks</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {snacks.map((snack, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="font-medium">{snack.name}</span>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{snack.calories} cal</span>
              <span>{snack.protein}g protein</span>
              <span>{snack.fiber}g fiber</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const calculateDayTotals = (day: any) => {
    const meals = [day.breakfast, day.lunch, day.dinner];
    const snackTotals = day.snacks.reduce((acc: any, snack: any) => ({
      calories: acc.calories + snack.calories,
      protein: acc.protein + snack.protein,
      fiber: acc.fiber + snack.fiber
    }), { calories: 0, protein: 0, fiber: 0 });

    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      fiber: acc.fiber + meal.fiber
    }), snackTotals);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Your Weekly Meal Plan</h2>
        <p className="text-muted-foreground">Customized based on your dietary preferences and nutritional goals</p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {restrictions.allergies.map(allergy => (
            <Badge key={allergy} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              No {allergy}
            </Badge>
          ))}
          {restrictions.dietaryThemes.map(theme => (
            <Badge key={theme} variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {theme}
            </Badge>
          ))}
        </div>

        <div className="flex justify-center gap-8 text-center">
          <div>
            <span className="text-2xl font-bold text-primary">{restrictions.calories[0]}</span>
            <p className="text-sm text-muted-foreground">Daily Calories</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-primary">{restrictions.protein[0]}g</span>
            <p className="text-sm text-muted-foreground">Protein Goal</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-primary">{restrictions.fiber[0]}g</span>
            <p className="text-sm text-muted-foreground">Fiber Goal</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {days.slice(0, 2).map(day => {
          const dayData = sampleMealPlan[day as keyof typeof sampleMealPlan];
          if (!dayData) return null;
          
          const totals = calculateDayTotals(dayData);
          
          return (
            <Card key={day} className="shadow-medium border-border/50">
              <CardHeader className="bg-gradient-card">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-foreground">{day}</CardTitle>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-primary">{totals.calories}</div>
                      <div className="text-muted-foreground">calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary">{totals.protein}g</div>
                      <div className="text-muted-foreground">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary">{totals.fiber}g</div>
                      <div className="text-muted-foreground">fiber</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {renderMeal(dayData.breakfast, 'breakfast')}
                  {renderMeal(dayData.lunch, 'lunch')}
                  {renderMeal(dayData.dinner, 'dinner')}
                  {renderSnacks(dayData.snacks)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          View Complete 7-Day Plan
        </Button>
      </div>
    </div>
  );
}