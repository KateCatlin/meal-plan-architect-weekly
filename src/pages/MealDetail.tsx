import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Flame, Activity, Wheat, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealDetail() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeal = async () => {
      if (!mealId || !user) return;

      try {
        const { data, error } = await supabase
          .from('meals')
          .select(`
            *,
            meal_plans!inner(user_id)
          `)
          .eq('id', mealId)
          .eq('meal_plans.user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching meal:', error);
          navigate('/');
          return;
        }

        setMeal(data);
      } catch (error) {
        console.error('Error fetching meal:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [mealId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Meal not found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plan
          </Button>
        </div>
      </div>
    );
  }

  const formatInstructions = (instructions: string) => {
    return instructions.split(/\d+\./).filter(step => step.trim()).map((step, index) => (
      <div key={index} className="flex gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>
        <p className="text-foreground flex-1 pt-1">{step.trim()}</p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            size="sm"
            className="hover-scale"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plan
          </Button>
        </div>

        {/* Meal Header */}
        <Card className="shadow-medium border-border/50">
          <CardHeader className="bg-gradient-card">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  {meal.meal_name}
                </CardTitle>
                <CardDescription className="text-lg mb-4">
                  {meal.description}
                </CardDescription>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                    {meal.meal_type}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                    {days[meal.day_of_week - 1]}
                  </Badge>
                </div>
              </div>
              <ChefHat className="h-12 w-12 text-primary/60" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Flame className="h-6 w-6 text-warning mb-2" />
                <span className="text-2xl font-bold text-foreground">{meal.calories}</span>
                <span className="text-muted-foreground">calories</span>
              </div>
              <div className="flex flex-col items-center">
                <Activity className="h-6 w-6 text-primary mb-2" />
                <span className="text-2xl font-bold text-foreground">{Math.round(meal.protein)}g</span>
                <span className="text-muted-foreground">protein</span>
              </div>
              <div className="flex flex-col items-center">
                <Wheat className="h-6 w-6 text-success mb-2" />
                <span className="text-2xl font-bold text-foreground">{Math.round(meal.fiber)}g</span>
                <span className="text-muted-foreground">fiber</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="shadow-medium border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {meal.ingredients && meal.ingredients.length > 0 ? (
                meal.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground">{ingredient}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">No ingredients listed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="shadow-medium border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meal.instructions ? (
                formatInstructions(meal.instructions)
              ) : (
                <p className="text-muted-foreground italic">No instructions provided</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}