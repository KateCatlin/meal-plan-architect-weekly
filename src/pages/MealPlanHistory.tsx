import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChefHat, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";

interface MealPlan {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  is_active: boolean;
  meals_count?: number;
}

export default function MealPlanHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealPlans = async () => {
      if (!user) return;

      try {
        // Fetch meal plans with meal counts
        const { data: plans, error } = await supabase
          .from('meal_plans')
          .select(`
            id,
            plan_name,
            start_date,
            end_date,
            created_at,
            is_active,
            meals(count)
          `)
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching meal plans:', error);
          return;
        }

        // Transform data to include meal counts
        const transformedPlans = plans?.map(plan => ({
          ...plan,
          meals_count: plan.meals?.[0]?.count || 0
        })) || [];

        setMealPlans(transformedPlans);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [user]);

  const handleViewMealPlan = async (planId: string, startDate: string, endDate: string) => {
    // Update URL to include the specific week dates
    navigate(`/?view=plan&week=${startDate}&planId=${planId}`);
  };

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const isCurrentWeek = (startDate: string, endDate: string) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const planStart = parseISO(startDate);
    const planEnd = parseISO(endDate);
    
    return planStart <= weekEnd && planEnd >= weekStart;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/?view=plan')} 
            variant="ghost" 
            size="sm"
            className="hover-scale"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Plan
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Meal Plan History
          </h1>
          <p className="text-muted-foreground">View and access your previous weekly meal plans</p>
        </div>

        {/* Meal Plans Grid */}
        <div className="space-y-4">
          {mealPlans.length === 0 ? (
            <Card className="shadow-medium border-border/50 text-center py-12">
              <CardContent>
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Meal Plans Yet</h3>
                <p className="text-muted-foreground mb-4">You haven't created any meal plans yet.</p>
                <Button onClick={() => navigate('/')} variant="outline">
                  Create Your First Meal Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            mealPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`shadow-soft border-border/50 hover:shadow-medium transition-all duration-300 cursor-pointer hover-scale ${
                  isCurrentWeek(plan.start_date, plan.end_date) ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
                onClick={() => handleViewMealPlan(plan.id, plan.start_date, plan.end_date)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        {plan.plan_name}
                        {isCurrentWeek(plan.start_date, plan.end_date) && (
                          <Badge variant="default" className="bg-primary text-primary-foreground">
                            Current Week
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-lg mt-1">
                        {formatWeekRange(plan.start_date, plan.end_date)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{plan.meals_count}</div>
                      <div className="text-sm text-muted-foreground">meals</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Created {format(parseISO(plan.created_at), 'MMM d, yyyy')}
                    </div>
                    <Badge 
                      variant={plan.is_active ? "default" : "outline"}
                      className={plan.is_active ? "bg-success text-success-foreground" : ""}
                    >
                      {plan.is_active ? "Active" : "Completed"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Showing your last {mealPlans.length} meal plans</p>
        </div>
      </div>
    </div>
  );
}