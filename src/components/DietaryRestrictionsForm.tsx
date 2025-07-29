import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { saveDietaryRestrictions, loadDietaryRestrictions, DietaryRestrictions } from "@/services/dietaryService";
import { supabase } from "@/integrations/supabase/client";

const commonAllergies = [
  "Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"
];

const dietaryThemes = [
  "Low FODMAP", "No FODMAP", "Low Histamine", "No Histamine", "Keto", "Paleo", "Vegetarian", "Vegan", "Mediterranean", "Low Sodium"
];

export function DietaryRestrictionsForm({ onSubmit }: { onSubmit: (data: DietaryRestrictions) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasExistingMealPlan, setHasExistingMealPlan] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [calories, setCalories] = useState([2000]);
  const [protein, setProtein] = useState([150]);
  const [fiber, setFiber] = useState([25]);
  const [customMealRequirements, setCustomMealRequirements] = useState("");
  const [breakfastCookingFrequency, setBreakfastCookingFrequency] = useState([7]);
  const [lunchDinnerCookingFrequency, setLunchDinnerCookingFrequency] = useState([14]);

  // Load existing preferences on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;
      
      try {
        // Check for existing meal plan
        const { data: existingMealPlan, error: mealPlanError } = await supabase
          .from('meal_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!mealPlanError && existingMealPlan) {
          setHasExistingMealPlan(true);
        }

        // Load existing dietary preferences
        const existingData = await loadDietaryRestrictions(user.id);
        setAllergies(existingData.allergies);
        setThemes(existingData.dietaryThemes);
        setCalories(existingData.calories);
        setProtein(existingData.protein);
        setFiber(existingData.fiber);
        setCustomMealRequirements(existingData.customMealRequirements || "");
        setBreakfastCookingFrequency(existingData.breakfastCookingFrequency);
        setLunchDinnerCookingFrequency(existingData.lunchDinnerCookingFrequency);
      } catch (error) {
        console.log('No existing data found or error loading:', error);
        // Don't show error toast for first-time users
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const addCustomTheme = () => {
    if (customTheme.trim() && !themes.includes(customTheme.trim())) {
      setThemes([...themes, customTheme.trim()]);
      setCustomTheme("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const removeTheme = (theme: string) => {
    setThemes(themes.filter(t => t !== theme));
  };

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      removeAllergy(allergy);
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const toggleTheme = (theme: string) => {
    if (themes.includes(theme)) {
      removeTheme(theme);
    } else {
      setThemes([...themes, theme]);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your preferences.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const data: DietaryRestrictions = {
        allergies,
        dietaryThemes: themes,
        calories,
        protein,
        fiber,
        customMealRequirements,
        breakfastCookingFrequency,
        lunchDinnerCookingFrequency
      };

      await saveDietaryRestrictions(user.id, data);
      
      // Generate AI meal plan
      const { data: restrictionsData } = await supabase
        .from('dietary_restrictions')
        .select('*')
        .eq('user_id', user.id);

      const { data: goalsData } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Generating meal plan with OpenAI...');
      
      const { data: mealPlanResult, error: mealPlanError } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          userId: user.id,
          restrictions: restrictionsData || [],
          goals: goalsData
        }
      });

      if (mealPlanError) {
        console.error('Error generating meal plan:', mealPlanError);
        throw new Error('Failed to generate meal plan');
      }

      console.log('Meal plan generated successfully:', mealPlanResult);
      
      onSubmit(data);
      toast({
        title: "Meal Plan Generated!",
        description: `Your personalized meal plan with ${mealPlanResult.mealsCount} meals has been created successfully.`,
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error Generating Meal Plan",
        description: "There was a problem generating your meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToMealPlan = () => {
    // Load existing preferences and go to meal plan
    const existingData = {
      allergies,
      dietaryThemes: themes,
      calories,
      protein,
      fiber,
      customMealRequirements,
      breakfastCookingFrequency,
      lunchDinnerCookingFrequency
    };
    onSubmit(existingData);
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Set Your Dietary Preferences</h2>
        <p className="text-muted-foreground">Tell us about your restrictions and goals so we can create the perfect meal plan</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Allergies Section */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Allergies & Intolerances</CardTitle>
            <CardDescription>Select any foods you need to avoid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {commonAllergies.map(allergy => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergy}
                    checked={allergies.includes(allergy)}
                    onCheckedChange={() => toggleAllergy(allergy)}
                  />
                  <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom allergy"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
              />
              <Button onClick={addCustomAllergy} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allergies.map(allergy => (
                <Badge key={allergy} variant="secondary" className="flex items-center gap-1">
                  {allergy}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeAllergy(allergy)} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Themes Section */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Dietary Themes</CardTitle>
            <CardDescription>Choose eating patterns that fit your lifestyle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {dietaryThemes.map(theme => (
                <div key={theme} className="flex items-center space-x-2">
                  <Checkbox
                    id={theme}
                    checked={themes.includes(theme)}
                    onCheckedChange={() => toggleTheme(theme)}
                  />
                  <Label htmlFor={theme} className="text-sm">{theme}</Label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom dietary theme"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTheme()}
              />
              <Button onClick={addCustomTheme} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {themes.map(theme => (
                <Badge key={theme} variant="secondary" className="flex items-center gap-1">
                  {theme}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTheme(theme)} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nutritional Goals Section */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Nutritional Goals</CardTitle>
          <CardDescription>Set your daily targets for optimal nutrition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Daily Calories</Label>
              <div className="px-2">
                <Slider
                  value={calories}
                  onValueChange={setCalories}
                  max={4000}
                  min={1200}
                  step={100}
                  className="w-full"
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{calories[0]}</span>
                <span className="text-sm text-muted-foreground ml-1">calories</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Protein Goal</Label>
              <div className="px-2">
                <Slider
                  value={protein}
                  onValueChange={setProtein}
                  max={300}
                  min={50}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{protein[0]}</span>
                <span className="text-sm text-muted-foreground ml-1">grams</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Fiber Goal</Label>
              <div className="px-2">
                <Slider
                  value={fiber}
                  onValueChange={setFiber}
                  max={60}
                  min={15}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{fiber[0]}</span>
                <span className="text-sm text-muted-foreground ml-1">grams</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cooking Frequency Section */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Cooking Frequency</CardTitle>
          <CardDescription>Control how often you want to cook to minimize leftovers or meal repetition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Breakfast Cooking Days per Week</Label>
              <div className="px-2">
                <Slider
                  value={breakfastCookingFrequency}
                  onValueChange={setBreakfastCookingFrequency}
                  max={7}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{breakfastCookingFrequency[0]}</span>
                <span className="text-sm text-muted-foreground ml-1">different breakfasts</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {breakfastCookingFrequency[0] === 7 ? "A different breakfast every day" : 
                 breakfastCookingFrequency[0] === 2 ? "2 breakfast types, each eaten multiple days" :
                 `${breakfastCookingFrequency[0]} breakfast types, distributed throughout the week`}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Lunch + Dinner Cooking Sessions per Week</Label>
              <div className="px-2">
                <Slider
                  value={lunchDinnerCookingFrequency}
                  onValueChange={setLunchDinnerCookingFrequency}
                  max={14}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{lunchDinnerCookingFrequency[0]}</span>
                <span className="text-sm text-muted-foreground ml-1">meal types</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {lunchDinnerCookingFrequency[0] === 14 ? "Different lunch and dinner every day" : 
                 lunchDinnerCookingFrequency[0] === 7 ? "Same meal for lunch & dinner each day, different daily" :
                 lunchDinnerCookingFrequency[0] === 2 ? "2 meal types, each eaten for multiple days" :
                 `${lunchDinnerCookingFrequency[0]} meal types, each eaten for consecutive meals`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Meal Requirements Section */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Custom Meal Requirements</CardTitle>
          <CardDescription>Specify any custom meal preferences or requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="customRequirements" className="text-sm font-medium">
              Custom Requirements (e.g., "Include 3 pan-fried eggs in every breakfast")
            </Label>
            <textarea
              id="customRequirements"
              className="w-full min-h-[100px] p-3 border border-border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              placeholder="Enter any specific meal requirements, like daily breakfast preferences, cooking methods, or ingredient inclusions..."
              value={customMealRequirements}
              onChange={(e) => setCustomMealRequirements(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        {hasExistingMealPlan && (
          <Button 
            onClick={handleReturnToMealPlan} 
            variant="outline" 
            size="lg" 
            className="px-8 mr-4"
          >
            Return to Meal Plan
          </Button>
        )}
        <Button 
          onClick={handleSubmit} 
          variant="hero" 
          size="xl" 
          className="px-12"
          disabled={loading}
        >
          {loading ? "Generating Meal Plan..." : hasExistingMealPlan ? "Generate New Meal Plan" : "Generate My Meal Plan"}
        </Button>
      </div>
    </div>
  );
}
