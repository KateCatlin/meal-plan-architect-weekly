import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Users, Flame, Activity, Wheat, Calendar, History, ShoppingCart, Target, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GroceryList } from "./GroceryList";

interface MealPlanProps {
  restrictions: {
    allergies: string[];
    dietaryThemes: string[];
    calories: number[];
    protein: number[];
    fiber: number[];
  };
}

interface Meal {
  id: string;
  meal_name: string;
  description: string;
  calories: number;
  protein: number;
  fiber: number;
  meal_type: string;
  day_of_week: number;
  ingredients: string[];
  instructions: string;
}

interface GroupedMeals {
  [dayOfWeek: number]: {
    [mealType: string]: Meal;
  };
}


const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function MealPlan({ restrictions }: MealPlanProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [meals, setMeals] = useState<GroupedMeals>({});
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  
  const [currentMealPlan, setCurrentMealPlan] = useState<any>(null);
  const [regeneratingMeals, setRegeneratingMeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user) return;

      try {
        // Check if we're viewing a specific meal plan
        const planId = searchParams.get('planId');
        const week = searchParams.get('week');
        
        let mealPlan;
        
        if (planId) {
          // Load specific meal plan by ID
          const { data: specificPlan, error: planError } = await supabase
            .from('meal_plans')
            .select('*')
            .eq('id', planId)
            .eq('user_id', user.id)
            .single();
            
          if (planError || !specificPlan) {
            console.error('Error fetching specific meal plan:', planError);
            navigate('/?view=plan');
            return;
          }
          mealPlan = specificPlan;
        } else {
          // Get the most recent active meal plan
          const { data: activePlan, error: planError } = await supabase
            .from('meal_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (planError || !activePlan) {
            console.error('Error fetching meal plan:', planError);
            setLoading(false);
            return;
          }
          mealPlan = activePlan;
        }

        setCurrentMealPlan(mealPlan);

        // Get all meals for this meal plan
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('meal_plan_id', mealPlan.id)
          .order('day_of_week', { ascending: true });

        if (mealsError) {
          console.error('Error fetching meals:', mealsError);
          setLoading(false);
          return;
        }

        // Group meals by day and meal type
        const groupedMeals: GroupedMeals = {};
        mealsData?.forEach((meal) => {
          if (!groupedMeals[meal.day_of_week]) {
            groupedMeals[meal.day_of_week] = {};
          }
          groupedMeals[meal.day_of_week][meal.meal_type] = meal;
        });

        setMeals(groupedMeals);
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [user, searchParams]);

  const optimizeMealPlan = async () => {
    if (!user || !currentMealPlan) return;

    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-meal-plan', {
        body: {
          userId: user.id,
          mealPlanId: currentMealPlan.id
        }
      });

      if (error) throw error;

      if (data.optimized) {
        toast({
          title: "Meal plan optimized!",
          description: data.message,
        });
        // Refresh the meals to show the optimized version
        window.location.reload();
      } else {
        toast({
          title: "No optimization needed",
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error('Error optimizing meal plan:', error);
      toast({
        title: "Optimization failed",
        description: error.message || "Failed to optimize meal plan",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  const checkNutritionalGoals = () => {
    const dailyTotals = Object.entries(meals).map(([dayOfWeek, dayMeals]) => {
      const totals = calculateDayTotals(dayMeals);
      return {
        day: parseInt(dayOfWeek),
        ...totals,
        meetsProteinGoal: totals.protein >= restrictions.protein[0],
        meetsFiberGoal: totals.fiber >= restrictions.fiber[0]
      };
    });

    const daysNotMeetingGoals = dailyTotals.filter(day => 
      !day.meetsProteinGoal || !day.meetsFiberGoal
    );

    return { dailyTotals, daysNotMeetingGoals };
  };

  const regenerateMeal = async (mealId: string) => {
    if (!user) return;

    setRegeneratingMeals(prev => new Set(prev).add(mealId));
    
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-meal', {
        body: {
          mealId,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Meal regenerated!",
          description: data.message,
        });
        // Refresh the meals to show the new version
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error regenerating meal:', error);
      toast({
        title: "Regeneration failed",
        description: error.message || "Failed to regenerate meal",
        variant: "destructive",
      });
    } finally {
      setRegeneratingMeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(mealId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 text-center">
        <h2 className="text-3xl font-bold text-foreground">Loading your meal plan...</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(day => (
            <Card key={day} className="h-64">
              <CardContent className="p-6">
                <div className="h-full bg-muted/30 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (Object.keys(meals).length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 text-center">
        <h2 className="text-3xl font-bold text-foreground">No meal plan found</h2>
        <p className="text-muted-foreground">Please generate a meal plan first.</p>
      </div>
    );
  }
  const renderMeal = (meal: Meal) => (
    <Card className="shadow-soft border-border/50 hover:shadow-medium transition-all duration-300 relative">
      <div className="cursor-pointer" onClick={() => navigate(`/meal/${meal.id}`)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
            {meal.meal_name}
            <Badge variant="outline" className="capitalize">{meal.meal_type}</Badge>
          </CardTitle>
          <CardDescription className="text-sm">{meal.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
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
          </div>
        </CardContent>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/90 hover:bg-background border shadow-md z-10"
        onClick={(e) => {
          e.stopPropagation();
          regenerateMeal(meal.id);
        }}
        disabled={regeneratingMeals.has(meal.id)}
      >
        <RefreshCw className={`h-4 w-4 ${regeneratingMeals.has(meal.id) ? 'animate-spin' : ''}`} />
      </Button>
    </Card>
  );

  const renderSnacks = (snack: Meal) => (
    <Card className="shadow-soft border-border/50 hover:shadow-medium transition-all duration-300 relative">
      <div className="cursor-pointer" onClick={() => navigate(`/meal/${snack.id}`)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
            {snack.meal_name}
            <Badge variant="outline" className="capitalize">snack</Badge>
          </CardTitle>
          <CardDescription className="text-sm">{snack.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="flex flex-col items-center">
              <Flame className="h-4 w-4 text-warning mb-1" />
              <span className="font-semibold">{snack.calories}</span>
              <span className="text-muted-foreground text-xs">cal</span>
            </div>
            <div className="flex flex-col items-center">
              <Activity className="h-4 w-4 text-primary mb-1" />
              <span className="font-semibold">{snack.protein}g</span>
              <span className="text-muted-foreground text-xs">protein</span>
            </div>
            <div className="flex flex-col items-center">
              <Wheat className="h-4 w-4 text-success mb-1" />
              <span className="font-semibold">{snack.fiber}g</span>
              <span className="text-muted-foreground text-xs">fiber</span>
            </div>
          </div>
        </CardContent>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/90 hover:bg-background border shadow-md z-10"
        onClick={(e) => {
          e.stopPropagation();
          regenerateMeal(snack.id);
        }}
        disabled={regeneratingMeals.has(snack.id)}
      >
        <RefreshCw className={`h-4 w-4 ${regeneratingMeals.has(snack.id) ? 'animate-spin' : ''}`} />
      </Button>
    </Card>
  );

  const calculateDayTotals = (dayMeals: { [mealType: string]: Meal }) => {
    return Object.values(dayMeals).reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      fiber: acc.fiber + (meal.fiber || 0)
    }), { calories: 0, protein: 0, fiber: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">
            {currentMealPlan ? currentMealPlan.plan_name : 'Your Weekly Meal Plan'}
          </h2>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover-scale">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Grocery List
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Weekly Grocery List</DialogTitle>
                </DialogHeader>
                <GroceryList 
                  mealPlanId={currentMealPlan?.id || null}
                  mealPlanName={currentMealPlan?.plan_name}
                 />
               </DialogContent>
             </Dialog>

             <Button 
               onClick={optimizeMealPlan}
               disabled={optimizing}
               variant="outline" 
               size="sm"
               className="hover-scale"
             >
               <Target className="h-4 w-4 mr-2" />
               {optimizing ? 'Optimizing...' : 'Optimize Goals'}
             </Button>
             
             <Button 
               onClick={() => navigate('/history')} 
               variant="outline" 
               size="sm"
               className="hover-scale"
             >
               <History className="h-4 w-4 mr-2" />
               View History
             </Button>
          </div>
        </div>
        
        {currentMealPlan && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Week of {new Date(currentMealPlan.start_date).toLocaleDateString()} - {new Date(currentMealPlan.end_date).toLocaleDateString()}
            </span>
          </div>
        )}
        
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
        {Object.entries(meals)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .slice(0, 7)
          .map(([dayOfWeek, dayMeals]) => {
            const dayName = days[parseInt(dayOfWeek) - 1];
            const totals = calculateDayTotals(dayMeals);
            
            return (
              <Card key={dayOfWeek} className="shadow-medium border-border/50">
                <CardHeader className="bg-gradient-card">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold text-foreground">{dayName}</CardTitle>
                     <div className="flex gap-6 text-sm">
                       <div className="text-center">
                         <div className="font-bold text-primary">{totals.calories}</div>
                         <div className="text-muted-foreground">calories</div>
                       </div>
                       <div className="text-center">
                         <div className={`font-bold ${totals.protein >= restrictions.protein[0] ? 'text-success' : 'text-warning'}`}>
                           {Math.round(totals.protein)}g
                         </div>
                         <div className="text-muted-foreground">protein {totals.protein >= restrictions.protein[0] ? '✓' : '⚠'}</div>
                       </div>
                       <div className="text-center">
                         <div className={`font-bold ${totals.fiber >= restrictions.fiber[0] ? 'text-success' : 'text-warning'}`}>
                           {Math.round(totals.fiber)}g
                         </div>
                         <div className="text-muted-foreground">fiber {totals.fiber >= restrictions.fiber[0] ? '✓' : '⚠'}</div>
                       </div>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dayMeals.breakfast && renderMeal(dayMeals.breakfast)}
                    {dayMeals.lunch && renderMeal(dayMeals.lunch)}
                    {dayMeals.dinner && renderMeal(dayMeals.dinner)}
                    {dayMeals.snack && renderSnacks(dayMeals.snack)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

    </div>
  );
}