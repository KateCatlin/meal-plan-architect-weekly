import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DietaryRestrictions {
  allergies: string[];
  dietaryThemes: string[];
  calories: number[];
  protein: number[];
  fiber: number[];
}

const commonAllergies = [
  "Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"
];

const dietaryThemes = [
  "Low FODMAP", "Low Histamine", "Keto", "Paleo", "Vegetarian", "Vegan", "Mediterranean", "Low Sodium"
];

export function DietaryRestrictionsForm({ onSubmit }: { onSubmit: (data: DietaryRestrictions) => void }) {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [calories, setCalories] = useState([2000]);
  const [protein, setProtein] = useState([150]);
  const [fiber, setFiber] = useState([25]);

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

  const handleSubmit = () => {
    const data: DietaryRestrictions = {
      allergies,
      dietaryThemes: themes,
      calories,
      protein,
      fiber
    };
    
    onSubmit(data);
    toast({
      title: "Preferences Saved!",
      description: "Your dietary restrictions and goals have been saved successfully.",
    });
  };

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

      <div className="text-center">
        <Button onClick={handleSubmit} variant="hero" size="xl" className="px-12">
          Generate My Meal Plan
        </Button>
      </div>
    </div>
  );
}