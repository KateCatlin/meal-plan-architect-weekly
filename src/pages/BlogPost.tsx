import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DOMPurify from 'dompurify';

// Import the new images
import mcasDietGuide from "@/assets/mcas-diet-guide.jpg";
import lowFodmapSnacks from "@/assets/low-fodmap-snacks.jpg";
import saltPotsFriendly from "@/assets/salt-pots-friendly.jpg";
import turmericAntiInflammatory from "@/assets/turmeric-anti-inflammatory.jpg";
import celiacHolidayDining from "@/assets/celiac-holiday-dining.jpg";
import greenSmoothieBowl from "@/assets/green-smoothie-bowl.jpg";
import mcasDiningOut from "@/assets/mcas-dining-out.jpg";
import ibsTriggerGuide from "@/assets/ibs-trigger-guide.jpg";
import energyBoostingBreakfast from "@/assets/energy-boosting-breakfast.jpg";
import readingFoodLabels from "@/assets/reading-food-labels.jpg";
import mealPrepHacks from "@/assets/meal-prep-hacks.jpg";
import gutHealingSmoothie from "@/assets/gut-healing-smoothie.jpg";
import emergencySnackKit from "@/assets/emergency-snack-kit.jpg";
import gutRebuildingFoods from "@/assets/gut-rebuilding-foods.jpg";
import onePotMeals from "@/assets/one-pot-meals.jpg";
import allergiesVsSensitivities from "@/assets/allergies-vs-sensitivities.jpg";
import safeKitchenSetup from "@/assets/safe-kitchen-setup.jpg";
import gentleHydration from "@/assets/gentle-hydration.jpg";
import pcosNutritionGuide from "@/assets/pcos-nutrition-guide.jpg";
import pmddMoodNutrition from "@/assets/pmdd-mood-nutrition.jpg";

const blogPostsContent = {
  1: {
    title: "The Complete Guide to the Low-Histamine Diet for MCAS",
    description: "Everything you need to know about managing Mast Cell Activation Syndrome through diet, including safe foods, meal planning tips, and common triggers to avoid.",
    category: "Ultimate Guide",
    tags: ["Low-Histamine", "MCAS", "Ultimate Guide"],
    readTime: "12 min read",
    publishDate: "2024-01-15",
    image: mcasDietGuide,
  },
  2: {
    title: "10 Safe and Easy Low-FODMAP Snack Ideas",
    description: "Quick, portable snacks that won't trigger IBS symptoms. Perfect for busy days when you need convenient, gut-friendly options.",
    category: "Problem-Solving",
    tags: ["Low-FODMAP", "IBS", "Snacks"],
    readTime: "5 min read",
    publishDate: "2024-01-10",
    image: lowFodmapSnacks,
  },
  3: {
    title: "How to Meal Prep for a POTS-Friendly Week",
    description: "Strategic meal preparation tips for managing Postural Orthostatic Tachycardia Syndrome, including high-sodium recipes and energy-conserving cooking methods.",
    category: "Problem-Solving",
    tags: ["POTS", "Meal Prep", "High-Sodium"],
    readTime: "8 min read",
    publishDate: "2024-01-08",
    image: saltPotsFriendly,
  },
  4: {
    title: "The Anti-Inflammatory Power of Turmeric: Recipe Ideas",
    description: "Discover how to incorporate this golden spice into your daily routine with delicious, inflammation-fighting recipes that support overall health.",
    category: "Inspiration",
    tags: ["Anti-Inflammatory", "Turmeric", "Recipes"],
    readTime: "6 min read",
    publishDate: "2024-01-05",
    image: turmericAntiInflammatory,
  },
  5: {
    title: "Navigating Holiday Dining with Celiac Disease",
    description: "Practical strategies for enjoying festive meals while staying gluten-free, including communication tips and safe recipe swaps.",
    category: "Problem-Solving",
    tags: ["Celiac", "Holiday", "Gluten-Free"],
    readTime: "7 min read",
    publishDate: "2024-01-03",
    image: celiacHolidayDining,
  },
  6: {
    title: "Building the Perfect Green Smoothie Bowl",
    description: "Create nutrient-packed smoothie bowls that taste amazing and provide sustained energy. Includes topping ideas and customization tips.",
    category: "Inspiration",
    tags: ["Smoothie Bowl", "Nutrients", "Energy"],
    readTime: "4 min read",
    publishDate: "2024-01-01",
    image: greenSmoothieBowl,
  },
  7: {
    title: "Dining Out Safely with MCAS: A Complete Guide",
    description: "Expert tips for navigating restaurants and social dining when you have Mast Cell Activation Syndrome, including what questions to ask and how to prepare.",
    category: "Problem-Solving",
    tags: ["MCAS", "Dining Out", "Safety"],
    readTime: "9 min read",
    publishDate: "2023-12-28",
    image: mcasDiningOut,
  },
  8: {
    title: "Understanding Your IBS Triggers: A Detective's Guide",
    description: "Learn how to identify and track your personal IBS triggers with systematic approaches and proven elimination strategies.",
    category: "Ultimate Guide",
    tags: ["IBS", "Triggers", "Elimination Diet"],
    readTime: "11 min read",
    publishDate: "2023-12-25",
    image: ibsTriggerGuide,
  },
  9: {
    title: "5 Energy-Boosting Breakfast Ideas for Chronic Fatigue",
    description: "Start your day with nutrient-dense breakfast recipes designed to provide sustained energy and support your body's healing process.",
    category: "Inspiration",
    tags: ["Chronic Fatigue", "Breakfast", "Energy"],
    readTime: "6 min read",
    publishDate: "2024-01-20",
    image: energyBoostingBreakfast,
  },
  10: {
    title: "Reading Food Labels: A Guide for Sensitive Stomachs",
    description: "Master the art of food label reading to avoid hidden triggers and make safe choices for your digestive health.",
    category: "Ultimate Guide",
    tags: ["Food Labels", "Hidden Ingredients", "Safety"],
    readTime: "8 min read",
    publishDate: "2024-01-18",
    image: readingFoodLabels,
  },
  11: {
    title: "Meal Prep Hacks for the Chronically Ill",
    description: "Time and energy-saving meal prep strategies specifically designed for people managing chronic illness and limited spoons.",
    category: "Problem-Solving",
    tags: ["Meal Prep", "Chronic Illness", "Spoon Theory"],
    readTime: "7 min read",
    publishDate: "2024-01-16",
    image: mealPrepHacks,
  },
  12: {
    title: "Gut-Healing Smoothie Recipes for IBD",
    description: "Gentle, nutrient-rich smoothie recipes designed to soothe inflammation and support healing in inflammatory bowel disease.",
    category: "Inspiration",
    tags: ["IBD", "Gut Health", "Smoothies"],
    readTime: "5 min read",
    publishDate: "2024-01-14",
    image: gutHealingSmoothie,
  },
  13: {
    title: "Building an Emergency Snack Kit",
    description: "Create a portable collection of safe, shelf-stable snacks for unexpected flare-ups, travel, and emergency situations.",
    category: "Problem-Solving",
    tags: ["Emergency Kit", "Travel", "Snacks"],
    readTime: "6 min read",
    publishDate: "2024-01-12",
    image: emergencySnackKit,
  },
  14: {
    title: "Rebuilding Your Gut After Antibiotics",
    description: "A comprehensive guide to restoring gut health and microbiome balance following antibiotic treatment.",
    category: "Ultimate Guide",
    tags: ["Gut Health", "Antibiotics", "Recovery"],
    readTime: "10 min read",
    publishDate: "2024-01-09",
    image: gutRebuildingFoods,
  },
  15: {
    title: "One-Pot Meals for Energy Conservation",
    description: "Delicious, nutritious meals that require minimal prep and cleanup - perfect for managing fatigue while eating well.",
    category: "Inspiration",
    tags: ["One-Pot", "Fatigue", "Easy Cooking"],
    readTime: "6 min read",
    publishDate: "2024-01-07",
    image: onePotMeals,
  },
  16: {
    title: "The Science Behind Food Allergies vs. Sensitivities",
    description: "Understanding the difference between allergies, intolerances, and sensitivities to better manage your symptoms.",
    category: "Ultimate Guide",
    tags: ["Allergies", "Sensitivities", "Science"],
    readTime: "9 min read",
    publishDate: "2024-01-04",
    image: allergiesVsSensitivities,
  },
  17: {
    title: "Creating a Safe Kitchen Setup",
    description: "Essential tips for organizing your kitchen to prevent cross-contamination and make cooking safer with food allergies.",
    category: "Problem-Solving",
    tags: ["Kitchen Safety", "Cross-Contamination", "Organization"],
    readTime: "7 min read",
    publishDate: "2024-01-02",
    image: safeKitchenSetup,
  },
  18: {
    title: "Gentle Hydration for Sensitive Systems",
    description: "Learn how to stay properly hydrated when water alone isn't enough, with recipes for gentle electrolyte solutions.",
    category: "Problem-Solving",
    tags: ["Hydration", "Electrolytes", "Gentle"],
    readTime: "5 min read",
    publishDate: "2023-12-30",
    image: gentleHydration,
  },
  19: {
    title: "PCOS-Friendly Nutrition: Balancing Hormones Through Food",
    description: "Evidence-based nutrition strategies to support hormone balance, manage insulin resistance, and reduce PCOS symptoms naturally.",
    category: "Ultimate Guide",
    tags: ["PCOS", "Hormones", "Insulin Resistance"],
    readTime: "10 min read",
    publishDate: "2024-01-22",
    image: pcosNutritionGuide,
  },
  20: {
    title: "Eating for Emotional Balance: A PMDD Nutrition Guide",
    description: "Nutritional strategies to support mood stability and reduce the severity of PMDD symptoms through targeted eating approaches.",
    category: "Ultimate Guide",
    tags: ["PMDD", "Mood", "Emotional Health"],
    readTime: "9 min read",
    publishDate: "2024-01-21",
    image: pmddMoodNutrition,
  }
};

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const postId = id ? parseInt(id) : null;
  const post = postId && blogPostsContent[postId as keyof typeof blogPostsContent] ? blogPostsContent[postId as keyof typeof blogPostsContent] : null;
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const otherPosts = Object.entries(blogPostsContent)
    .filter(([key]) => key !== id)
    .slice(0, 2)
    .map(([key, value]) => ({ id: key, ...value }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2 text-primary">
                <ChefHat className="h-5 w-5" />
                <span className="font-semibold">The Gentle Plate</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Image */}
        <div className="aspect-video rounded-xl overflow-hidden mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>The Gentle Plate Team</span>
              </div>
              <span>{post.publishDate}</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {/* Blog content based on ID */}
          {id === "19" && (
            <div>
              <p><strong>Disclaimer:</strong> This guide is intended for informational purposes only and does not replace professional medical advice. Always consult your healthcare provider before making significant changes to your diet or lifestyle.</p>

              <h2>Understanding PCOS and Nutrition</h2>
              <p>Polycystic Ovary Syndrome (PCOS) affects up to 20% of women of reproductive age, making it one of the most common hormonal disorders. While PCOS presents differently for each woman, nutrition plays a crucial role in managing symptoms and supporting overall health.</p>

              <p>PCOS is characterized by insulin resistance, elevated androgen levels, and chronic inflammation - all of which can be positively influenced through targeted dietary approaches.</p>

              <h3>How PCOS Affects Your Body</h3>
              <p>The hormonal imbalances in PCOS create a cascade of effects:</p>
              <ul>
                <li>Insulin resistance leading to weight gain and difficulty losing weight</li>
                <li>Increased cravings for carbohydrates</li>
                <li>Higher risk of type 2 diabetes</li>
                <li>Elevated androgen levels causing acne and excess hair growth</li>
              </ul>

              <h3>Key Nutritional Strategies for PCOS</h3>
              
              <h4>1. Focus on Blood Sugar Stability</h4>
              <p><strong>Choose complex carbohydrates:</strong> Quinoa, brown rice, sweet potatoes, and legumes provide steady energy without blood sugar spikes.</p>
              <p><strong>Pair carbs with protein and healthy fats:</strong> This combination slows digestion and helps maintain stable blood sugar levels.</p>
              <p><strong>Eat regular meals:</strong> Don't skip meals, as this can cause blood sugar swings that worsen insulin resistance.</p>

              <h4>2. Embrace Anti-Inflammatory Foods</h4>
              <p>Chronic inflammation is common in PCOS and can worsen symptoms. Include:</p>
              <ul>
                <li><strong>Fatty fish:</strong> Salmon, sardines, and mackerel provide omega-3 fatty acids</li>
                <li><strong>Berries:</strong> Blueberries, strawberries, and raspberries are rich in antioxidants</li>
                <li><strong>Leafy greens:</strong> Spinach, kale, and arugula support overall health</li>
                <li><strong>Nuts and seeds:</strong> Walnuts, flaxseeds, and chia seeds provide healthy fats</li>
                <li><strong>Turmeric and ginger:</strong> Natural anti-inflammatory spices</li>
              </ul>

              <h4>3. Support Hormone Balance</h4>
              <p><strong>Spearmint tea:</strong> Studies suggest it may help reduce elevated androgen levels.</p>
              <p><strong>Cinnamon:</strong> May help improve insulin sensitivity when used regularly.</p>
              <p><strong>Inositol-rich foods:</strong> Oranges, cantaloupe, and beans contain this insulin-sensitizing compound.</p>

              <h3>Sample Day of PCOS-Friendly Eating</h3>
              <p><strong>Breakfast:</strong> Greek yogurt with berries, ground flaxseed, and a sprinkle of cinnamon</p>
              <p><strong>Lunch:</strong> Quinoa salad with grilled chicken, avocado, leafy greens, and olive oil dressing</p>
              <p><strong>Snack:</strong> Apple slices with almond butter</p>
              <p><strong>Dinner:</strong> Baked salmon with roasted sweet potato and steamed broccoli</p>
              <p><strong>Evening:</strong> Cup of spearmint tea</p>

              <h3>Foods to Limit</h3>
              <ul>
                <li><strong>Refined carbohydrates:</strong> White bread, pastries, sugary cereals</li>
                <li><strong>Processed foods:</strong> Packaged snacks, fast food, processed meats</li>
                <li><strong>Added sugars:</strong> Sodas, candy, sweetened beverages</li>
                <li><strong>Trans fats:</strong> Margarine, fried foods, commercial baked goods</li>
              </ul>

              <h3>Lifestyle Tips Beyond Diet</h3>
              <p><strong>Stay hydrated:</strong> Aim for 8-10 glasses of water daily to support metabolism.</p>
              <p><strong>Manage stress:</strong> Chronic stress can worsen insulin resistance and hormone imbalances.</p>
              <p><strong>Prioritize sleep:</strong> Poor sleep affects hormones that regulate hunger and blood sugar.</p>
              <p><strong>Consider supplements:</strong> Speak with your healthcare provider about inositol, vitamin D, and omega-3 supplements.</p>

              <h3>Working with Healthcare Providers</h3>
              <p>While nutrition plays a crucial role in managing PCOS, it's important to work with a healthcare team that may include your gynecologist, endocrinologist, and registered dietitian. They can help you create a comprehensive treatment plan that addresses your individual needs.</p>

              <p>Remember, managing PCOS is a journey, not a destination. Small, consistent changes in your eating patterns can lead to significant improvements in how you feel and your long-term health outcomes.</p>
            </div>
          )}

          {id === "20" && (
            <div>
              <p><strong>Disclaimer:</strong> This guide is intended for informational purposes only and does not replace professional medical advice. Always consult your healthcare provider before making significant changes to your diet or lifestyle.</p>

              <h2>Understanding PMDD and Its Impact</h2>
              <p>Premenstrual Dysphoric Disorder (PMDD) affects 3-8% of women of reproductive age, causing severe mood changes, anxiety, and physical symptoms in the weeks leading up to menstruation. Unlike typical PMS, PMDD significantly interferes with daily life, relationships, and work performance.</p>

              <p>While PMDD is a complex condition requiring professional treatment, targeted nutrition strategies can provide meaningful support for mood stability and symptom management.</p>

              <h3>How Nutrition Affects PMDD</h3>
              <p>The hormonal fluctuations during the luteal phase (post-ovulation to menstruation) affect neurotransmitter production, blood sugar stability, and inflammation levels - all of which influence mood and emotional well-being.</p>

              <h3>Key Nutritional Strategies for PMDD</h3>

              <h4>1. Stabilize Blood Sugar Throughout Your Cycle</h4>
              <p><strong>Complex carbohydrates:</strong> Oats, quinoa, brown rice, and sweet potatoes help maintain steady blood sugar.</p>
              <p><strong>Protein at every meal:</strong> Include lean proteins like fish, poultry, legumes, and eggs to support neurotransmitter production.</p>
              <p><strong>Healthy fats:</strong> Omega-3 fatty acids from fish, walnuts, and flaxseeds support brain health and reduce inflammation.</p>

              <h4>2. Support Serotonin Production</h4>
              <p>Low serotonin levels are linked to PMDD symptoms. Support natural production with:</p>
              <ul>
                <li><strong>Tryptophan-rich foods:</strong> Turkey, chicken, fish, eggs, and pumpkin seeds</li>
                <li><strong>Complex carbohydrates:</strong> Help tryptophan cross the blood-brain barrier</li>
                <li><strong>B-vitamins:</strong> Found in leafy greens, legumes, and whole grains</li>
              </ul>

              <h4>3. Manage Inflammation</h4>
              <p>Chronic inflammation can worsen PMDD symptoms. Include anti-inflammatory foods:</p>
              <ul>
                <li><strong>Fatty fish:</strong> Salmon, sardines, and mackerel 2-3 times per week</li>
                <li><strong>Berries:</strong> Rich in antioxidants that combat inflammation</li>
                <li><strong>Leafy greens:</strong> Spinach, kale, and Swiss chard provide folate and magnesium</li>
                <li><strong>Turmeric and ginger:</strong> Natural anti-inflammatory compounds</li>
              </ul>

              <h3>Key Nutrients for PMDD Support</h3>

              <h4>Magnesium</h4>
              <p>Helps with mood regulation and reduces anxiety. Found in:</p>
              <ul>
                <li>Dark leafy greens</li>
                <li>Pumpkin seeds and almonds</li>
                <li>Dark chocolate (85% cacao or higher)</li>
                <li>Avocados</li>
              </ul>

              <h4>Calcium and Vitamin D</h4>
              <p>May help reduce the severity of mood symptoms. Sources include:</p>
              <ul>
                <li>Fortified plant milks</li>
                <li>Leafy greens</li>
                <li>Canned sardines with bones</li>
                <li>Safe sun exposure for vitamin D</li>
              </ul>

              <h4>B-Complex Vitamins</h4>
              <p>Essential for neurotransmitter production and energy metabolism:</p>
              <ul>
                <li>Whole grains and legumes</li>
                <li>Nutritional yeast</li>
                <li>Eggs and poultry</li>
                <li>Leafy green vegetables</li>
              </ul>

              <h3>Meal Timing for Mood Stability</h3>
              <p><strong>Eat regular meals:</strong> Skipping meals can cause blood sugar drops that worsen mood swings.</p>
              <p><strong>Include protein at each meal:</strong> This helps maintain steady energy and neurotransmitter production.</p>
              <p><strong>Don't go to bed hungry:</strong> A small snack with protein and complex carbs can prevent middle-of-the-night wake-ups.</p>

              <h3>Hydration and PMDD</h3>
              <p>Dehydration can worsen irritability and fatigue. Aim for:</p>
              <ul>
                <li>8-10 glasses of water daily</li>
                <li>Herbal teas like chamomile or passionflower for calming effects</li>
                <li>Limit caffeine, especially in the luteal phase, as it can increase anxiety</li>
              </ul>

              <h3>Foods to Limit During PMDD Weeks</h3>
              <ul>
                <li><strong>Refined sugar:</strong> Can cause energy crashes and mood swings</li>
                <li><strong>Excessive caffeine:</strong> May increase anxiety and disrupt sleep</li>
                <li><strong>Alcohol:</strong> Can worsen depression and interfere with sleep quality</li>
                <li><strong>High-sodium processed foods:</strong> Can increase bloating and irritability</li>
              </ul>

              <h3>Sample PMDD-Supportive Day</h3>
              <p><strong>Breakfast:</strong> Oatmeal with ground flaxseed, walnuts, and berries</p>
              <p><strong>Lunch:</strong> Quinoa bowl with roasted vegetables, chickpeas, and tahini dressing</p>
              <p><strong>Snack:</strong> Apple slices with almond butter and a sprinkle of cinnamon</p>
              <p><strong>Dinner:</strong> Baked salmon with sweet potato and steamed broccoli</p>
              <p><strong>Evening:</strong> Chamomile tea with a small piece of dark chocolate</p>

              <h3>Beyond Nutrition: Holistic PMDD Support</h3>
              <p><strong>Track your symptoms:</strong> Use a mood diary to identify patterns and triggers.</p>
              <p><strong>Prioritize sleep:</strong> Aim for 7-9 hours of quality sleep, especially in the luteal phase.</p>
              <p><strong>Gentle movement:</strong> Yoga, walking, or swimming can help regulate mood.</p>
              <p><strong>Stress management:</strong> Meditation, deep breathing, or journaling can provide relief.</p>

              <h3>When to Seek Professional Help</h3>
              <p>While nutrition can be incredibly supportive, PMDD is a serious condition that often requires professional treatment. Consider speaking with a healthcare provider if:</p>
              <ul>
                <li>Symptoms significantly interfere with work, school, or relationships</li>
                <li>You experience thoughts of self-harm</li>
                <li>Symptoms don't improve with lifestyle changes</li>
                <li>You need support developing a comprehensive treatment plan</li>
              </ul>

              <p>Remember, you're not alone in this journey. With the right combination of nutrition, lifestyle support, and professional care when needed, it's possible to find relief and reclaim your quality of life.</p>
            </div>
          )}

          {/* Default content for other blog posts */}
          {![ "19", "20"].includes(id || "") && (
            <div>
              <p>This blog post is currently being developed. Check back soon for the full content!</p>
            </div>
          )}
        </div>

        {/* Continue Reading Section */}
        <div className="border-t pt-8">
          <h3 className="text-2xl font-bold mb-6">Continue Reading</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {otherPosts.map((otherPost) => (
              <Link
                key={otherPost.id}
                to={`/blog/${otherPost.id}`}
                className="group block p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={otherPost.image}
                    alt={otherPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <Badge variant="secondary" className="mb-2">
                  {otherPost.category}
                </Badge>
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {otherPost.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {otherPost.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{otherPost.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
