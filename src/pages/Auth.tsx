import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { Utensils, ChevronDown } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Terms & Conditions required",
        description: "Please accept the Terms & Conditions to continue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        // Check if user was automatically signed in (email confirmation disabled)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          toast({
            title: "Account created!",
            description: "You've been signed up and logged in successfully.",
          });
          window.location.href = '/';
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Utensils className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to The Gentle Plate</h1>
          <p className="text-muted-foreground mt-2">Your personalized meal planning companion</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name (Optional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            I accept the{' '}
                            <CollapsibleTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-sm underline">
                                Terms & Conditions and Liability Waiver
                                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${termsOpen ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </Label>
                        </div>
                      </div>
                      
                      <CollapsibleContent className="border rounded-lg p-4 bg-muted/30 max-h-64 overflow-y-auto text-xs space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">Terms & Conditions and Liability Waiver</h4>
                          <p className="mb-3">By using this app, you agree to the following:</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold">No Medical or Nutrition Advice</h5>
                          <p>This app is for informational and planning purposes only. It is not intended to diagnose, treat, cure, or prevent any disease or health condition. It is not a substitute for advice from a licensed medical professional, registered dietitian, or nutritionist. Always consult your healthcare provider before starting any new diet or making changes to your existing nutrition plan.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold">User Responsibility</h5>
                          <p>You are solely responsible for the dietary choices you make. While the app allows you to input dietary restrictions, allergies, and goals, you must ensure that the recommended meal plans are safe and appropriate for your individual health needs. This includes checking ingredient lists and labels for allergens or sensitivities.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold">No Liability</h5>
                          <p>By using this app, you agree that the creator(s), developers, and any affiliates of this app are not liable for any health issues, allergic reactions, nutritional deficiencies, or other outcomes that may arise from following meal plans generated by the app.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold">Data Accuracy</h5>
                          <p>The accuracy of nutrition data (e.g., calorie, fiber, or protein estimates) is based on publicly available sources and best estimates. These values may not be exact, and you acknowledge that slight discrepancies may occur.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold">Not for Medical Conditions</h5>
                          <p>This app is not designed for individuals with complex medical conditions, eating disorders, or those requiring medically supervised diets. If this applies to you, do not rely on this app for dietary planning.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold">Changes and Updates</h5>
                          <p>The app may be updated from time to time to improve functionality or correct errors. The terms may also be updated, and continued use constitutes acceptance of the revised terms.</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">By creating an account or using the app, you acknowledge that you have read, understood, and agreed to these terms. If you do not agree, please do not use the app.</p>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !acceptedTerms}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}