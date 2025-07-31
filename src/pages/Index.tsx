import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DietaryRestrictionsForm } from "@/components/DietaryRestrictionsForm";
import { MealPlan } from "@/components/MealPlan";
import { ChefHat, Heart, Target, Shield, Clock, Users, Star, User, LogOut, CheckCircle, AlertCircle, Coffee, Utensils } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loadDietaryRestrictions } from "@/services/dietaryService";
import heroImage from "@/assets/hero-nutrition.jpg";
interface DietaryRestrictions {
  allergies: string[];
  dietaryThemes: string[];
  calories: number[];
  protein: number[];
  fiber: number[];
}
const Index = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'form' | 'plan'>('welcome');
  const [userPreferences, setUserPreferences] = useState<DietaryRestrictions | null>(null);
  const [hasExistingPreferences, setHasExistingPreferences] = useState<boolean>(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  useEffect(() => {
    // Check for existing preferences when user is available
    const checkExistingPreferences = async () => {
      if (user?.id) {
        try {
          await loadDietaryRestrictions(user.id);
          setHasExistingPreferences(true);
        } catch (error) {
          console.log('No existing preferences found:', error);
          setHasExistingPreferences(false);
        }
      }
    };

    if (user?.id && !loading) {
      checkExistingPreferences();
    }
  }, [user, loading]);

  useEffect(() => {
    // Check if we should show the meal plan view based on URL params
    const view = searchParams.get('view');
    const week = searchParams.get('week');
    const planId = searchParams.get('planId');
    if (view === 'plan' && user?.id) {
      // Load existing preferences when going directly to plan view
      const loadPreferences = async () => {
        try {
          const existingData = await loadDietaryRestrictions(user.id);
          setUserPreferences(existingData);
          setCurrentStep('plan');
        } catch (error) {
          console.log('No existing preferences found:', error);
          // If no preferences exist, stay on form
        }
      };
      loadPreferences();
    }
  }, [searchParams, user]);
  const handlePreferencesSubmit = (data: DietaryRestrictions) => {
    setUserPreferences(data);
    setCurrentStep('plan');
    // Update URL to reflect the plan view
    navigate('/?view=plan', {
      replace: true
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  const features = [{
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Personalized Nutrition",
    description: "Tailored meal plans based on your specific dietary restrictions and health goals"
  }, {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Goal-Oriented Planning",
    description: "Hit your calorie, protein, and fiber targets with precision-crafted meals"
  }, {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Time-Efficient",
    description: "Quick meal prep solutions that fit your busy lifestyle"
  }, {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Family-Friendly",
    description: "Accommodate multiple dietary needs in one convenient meal plan"
  }];
  if (currentStep === 'form') {
    return <div className="min-h-screen bg-background py-12 px-4">
        <DietaryRestrictionsForm onSubmit={handlePreferencesSubmit} />
      </div>;
  }
  if (currentStep === 'plan' && userPreferences) {
    return <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-20 p-4 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">The Gentle Plate</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        
        <div className="py-12 px-4">
          <MealPlan restrictions={userPreferences} />
          <div className="text-center mt-12">
            <Button variant="outline" onClick={() => setCurrentStep('form')} size="lg">
              Adjust Preferences
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">The Gentle Plate</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="animate-fade-in">
            <ChefHat className="h-16 w-16 text-primary mx-auto mb-6 animate-bounce-gentle" />
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Smart Meal Planning for
              <span className="text-primary block">Your Unique Needs</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Personalized weekly meal plans that respect your dietary restrictions and help you achieve your nutritional goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" onClick={() => setCurrentStep('form')} className="text-lg px-8 py-4">
                Start Your Meal Plan
              </Button>
              {hasExistingPreferences ? (
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={() => navigate('/?view=plan')}
                  className="text-lg px-8 py-4"
                >
                  Return to Your Current Plan
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="xl"
                  className="text-lg px-8 py-4"
                >
                  Learn More
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Our Meal Planner?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We understand that everyone's nutritional needs are different. Our intelligent system creates meal plans that work for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-300 border-border/50">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-16">
            Simple Steps to Better Nutrition
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">Set Your Preferences</h3>
              <p className="text-muted-foreground">
                Tell us about your allergies, dietary themes, and nutritional goals
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">Get Your Plan</h3>
              <p className="text-muted-foreground">
                Receive a customized weekly meal plan with recipes and nutrition info
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground">Enjoy Better Health</h3>
              <p className="text-muted-foreground">
                Follow your plan and track your progress toward your nutrition goals
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <Button variant="hero" size="xl" onClick={() => setCurrentStep('form')} className="px-12">
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-16">
            Trusted by Health-Conscious Individuals
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-soft border-border/50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-warning fill-current" />)}
                </div>
                <p className="text-muted-foreground mb-4 italic">&quot;I don't have time or interest in learning how to cook - but I do want to eat food that makes me feel good! This app feels like it was built by me!&quot; </p>
                <p className="font-semibold text-foreground">Kate C.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft border-border/50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-warning fill-current" />)}
                </div>
                <p className="text-muted-foreground mb-4 italic">&quot;It's hard finding recipes for my vegetarian lifestyle and my partner's low histamine needs. This will save me a lot of time.&quot;</p>
                <p className="font-semibold text-foreground">John C. </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who have improved their health with personalized meal planning
          </p>
          <Button variant="secondary" size="xl" onClick={() => setCurrentStep('form')} className="px-12 text-lg">
            Create My Meal Plan
          </Button>
        </div>
      </section>
    </div>;
};
export default Index;