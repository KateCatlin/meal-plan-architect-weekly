import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Blog post content data
const blogPostsContent = {
  1: {
    title: "The Complete Guide to the Low-Histamine Diet for MCAS",
    description: "Everything you need to know about managing Mast Cell Activation Syndrome through diet, including safe foods, meal planning tips, and common triggers to avoid.",
    category: "Ultimate Guide",
    tags: ["Low-Histamine", "MCAS", "Ultimate Guide"],
    readTime: "12 min read",
    publishDate: "2024-01-15",
    image: "photo-1490818387583-1baba5e638af",
    content: `
**Disclaimer:** This guide is intended for informational purposes only and does not replace professional medical advice. Always consult your healthcare provider before making significant changes to your diet or lifestyle.

# The Complete Guide to the Low-Histamine Diet for MCAS

Managing Mast Cell Activation Syndrome (MCAS) through diet can feel overwhelming, but with the right knowledge and approach, you can create a sustainable eating plan that supports your health and reduces symptoms.

## What is MCAS?

Mast Cell Activation Syndrome is a condition where mast cells become overactive, releasing excessive amounts of inflammatory mediators like histamine. This can lead to a wide range of symptoms including:

- Digestive issues (nausea, cramping, diarrhea)
- Skin reactions (flushing, hives, itching)
- Respiratory symptoms (congestion, difficulty breathing)
- Cardiovascular symptoms (rapid heart rate, blood pressure changes)
- Neurological symptoms (brain fog, headaches, anxiety)

## The Low-Histamine Diet Basics

### High-Histamine Foods to Avoid

**Fermented Foods:**
- Aged cheeses
- Fermented vegetables (sauerkraut, kimchi)
- Kombucha and kefir
- Wine and beer
- Aged meats and fish

**Aged and Processed Foods:**
- Deli meats
- Canned fish (tuna, sardines)
- Aged vinegars
- Chocolate
- Nuts (especially walnuts and cashews)

**Fresh Foods That Are High in Histamine:**
- Spinach
- Tomatoes
- Avocados
- Eggplant
- Strawberries
- Citrus fruits

### Histamine-Releasing Foods

Some foods don't contain histamine but can trigger your body to release it:
- Shellfish
- Egg whites
- Papaya
- Pineapple
- Bananas (especially overripe)
- Alcohol

### Safe Low-Histamine Foods

**Proteins:**
- Fresh meat (consumed within 24 hours of cooking)
- Fresh fish (consumed immediately after cooking)
- Eggs (yolks are generally better tolerated than whites)

**Vegetables:**
- Broccoli, cauliflower, Brussels sprouts
- Carrots, sweet potatoes
- Zucchini, cucumber
- Lettuce, arugula
- Onions, garlic

**Fruits:**
- Apples, pears
- Blueberries, blackberries
- Mango
- Peaches

**Grains:**
- Rice (white and brown)
- Quinoa
- Millet
- Oats

## Meal Planning Strategies

### 1. Freshness is Key
- Cook proteins fresh and consume within 24 hours
- Avoid leftovers when possible
- Freeze portions immediately after cooking if you must store them

### 2. Batch Prep Smart
- Prepare base ingredients (rice, quinoa) in small batches
- Pre-chop vegetables and store properly
- Make fresh sauces and dressings in small quantities

### 3. Simple Cooking Methods
- Steam, boil, or sauté with minimal ingredients
- Avoid complex spice blends
- Use fresh herbs like basil, oregano, and thyme

## Sample 3-Day Meal Plan

### Day 1
**Breakfast:** Rice porridge with fresh blueberries and a drizzle of honey
**Lunch:** Grilled chicken breast with steamed broccoli and quinoa
**Dinner:** Fresh salmon with roasted carrots and millet
**Snacks:** Apple slices, rice cakes

### Day 2
**Breakfast:** Scrambled egg yolks with sautéed zucchini
**Lunch:** Turkey and cucumber lettuce wraps
**Dinner:** Beef stir-fry with fresh vegetables over rice
**Snacks:** Pear slices, plain rice cakes

### Day 3
**Breakfast:** Quinoa breakfast bowl with fresh mango
**Lunch:** Chicken soup with carrots, celery, and rice
**Dinner:** Fresh white fish with steamed cauliflower
**Snacks:** Fresh berries, homemade rice crackers

## Kitchen Tips for Success

### Essential Equipment
- Good quality freezer for storing fresh proteins
- Steamer basket for gentle cooking
- Glass storage containers to avoid plastic chemicals

### Safe Seasonings
- Sea salt
- Fresh garlic and onion
- Fresh herbs (basil, oregano, thyme, rosemary)
- Ginger (fresh)
- Turmeric (fresh or dried)

## Managing Flare-Ups

When symptoms increase:
1. Return to your safest foods only
2. Keep a detailed food diary
3. Consider working with a healthcare provider familiar with MCAS
4. Stay hydrated and rest

## The Bottom Line

The low-histamine diet for MCAS is highly individual. What works for one person may not work for another. Start with the safest foods and gradually test new additions while monitoring your symptoms.

Remember, this is a therapeutic diet meant to help you identify triggers and manage symptoms. Work with healthcare providers who understand MCAS to ensure you're meeting all your nutritional needs while following this approach.

*Ready to put this into practice? Our meal planner can help you create personalized low-histamine meal plans that take the guesswork out of MCAS-friendly eating.*
    `
  },
  2: {
    title: "10 Safe and Easy Low-FODMAP Snack Ideas",
    description: "Quick, portable snacks that won't trigger IBS symptoms. Perfect for busy days when you need convenient, gut-friendly options.",
    category: "Problem-Solving",
    tags: ["Low-FODMAP", "IBS", "Snacks"],
    readTime: "5 min read",
    publishDate: "2024-01-10",
    image: "photo-1465146344425-f00d5f5c8f07",
    content: `
# 10 Safe and Easy Low-FODMAP Snack Ideas

Living with IBS and following a low-FODMAP diet doesn't mean giving up on convenient, tasty snacks. Here are 10 portable, satisfying options that won't trigger symptoms.

## Why Low-FODMAP Snacking Matters

When you have IBS, maintaining stable blood sugar and avoiding trigger foods is crucial. Having safe snacks readily available prevents you from reaching for foods that might cause symptoms when hunger strikes.

## 10 IBS-Friendly Snack Ideas

### 1. Rice Cakes with Peanut Butter
**Serving:** 2 rice cakes with 2 tbsp natural peanut butter
- **Why it works:** Rice is naturally low-FODMAP, and peanut butter (in moderation) provides protein and healthy fats
- **Prep tip:** Buy individual peanut butter packets for on-the-go convenience

### 2. Carrot Sticks with Hummus
**Serving:** 1 cup baby carrots with 2 tbsp hummus
- **Why it works:** Carrots are low-FODMAP, and small amounts of chickpea-based hummus are well-tolerated
- **Prep tip:** Pre-cut carrots and portion hummus into small containers

### 3. Lactose-Free Greek Yogurt with Berries
**Serving:** 1/2 cup yogurt with 1/4 cup blueberries or strawberries
- **Why it works:** Lactose-free dairy is safe, and these berries are low-FODMAP in small portions
- **Prep tip:** Buy individual yogurt cups and pre-portion berries

### 4. Banana with Almond Butter
**Serving:** 1 small unripe banana with 1 tbsp almond butter
- **Why it works:** Unripe bananas are lower in FODMAPs than ripe ones
- **Prep tip:** Choose bananas that are still slightly green

### 5. Hard-Boiled Eggs with Salt
**Serving:** 2 hard-boiled eggs
- **Why it works:** Eggs are naturally FODMAP-free and provide complete protein
- **Prep tip:** Boil a dozen eggs at the start of the week

### 6. Gluten-Free Crackers with Aged Cheese
**Serving:** 5-6 crackers with 1 oz aged cheddar
- **Why it works:** Aged cheeses are lower in lactose, and many gluten-free crackers are FODMAP-friendly
- **Prep tip:** Check cracker ingredients for garlic and onion

### 7. Homemade Trail Mix
**Serving:** 1/4 cup mix of peanuts, pumpkin seeds, and dark chocolate chips
- **Why it works:** These ingredients are all low-FODMAP in small portions
- **Prep tip:** Make large batches and portion into small bags

### 8. Kiwi Fruit Slices
**Serving:** 1 medium kiwi, sliced
- **Why it works:** Kiwi is low-FODMAP and rich in digestive enzymes
- **Prep tip:** Buy kiwis slightly firm and let them ripen at home

### 9. Corn Tortilla with Turkey
**Serving:** 1 small corn tortilla with 2 oz sliced turkey
- **Why it works:** Corn is naturally gluten-free and low-FODMAP
- **Prep tip:** Check turkey ingredients to avoid garlic and onion

### 10. Orange Slices with Walnuts
**Serving:** 1 medium orange with 10 walnut halves
- **Why it works:** Oranges are low-FODMAP and walnuts provide healthy omega-3s
- **Prep tip:** Pre-portion walnuts to avoid overeating

## Snacking Success Tips

### Portion Control
- Stick to recommended serving sizes
- Pre-portion snacks to avoid accidentally eating trigger amounts
- Use small containers or bags for easy grab-and-go options

### Timing Matters
- Space snacks 2-3 hours apart
- Don't skip meals, as this can lead to overeating trigger foods later
- Have a snack ready before you feel extremely hungry

### Prep Strategies
- **Sunday prep:** Wash, cut, and portion fruits and vegetables
- **Batch cooking:** Hard-boil eggs, make trail mix, portion nuts
- **Emergency kit:** Keep shelf-stable options in your car, desk, or bag

## Foods to Avoid While Snacking

- **High-FODMAP fruits:** Apples, pears, stone fruits in large amounts
- **Onion and garlic:** Check all packaged snacks for these ingredients
- **Cashews and pistachios:** Higher in FODMAPs than other nuts
- **Dried fruits:** Often high in FODMAPs and added sugars
- **Wheat-based crackers:** Unless certified gluten-free

## Building Your Snack Rotation

Start with 3-4 snacks from this list that appeal to you most. Test them individually to ensure they work well with your system, then gradually add more variety.

Keep a snack diary for the first few weeks to track which options make you feel your best and are most convenient for your lifestyle.

*Ready to plan complete low-FODMAP meals? Our meal planner takes the guesswork out of IBS-friendly eating with personalized meal plans and shopping lists.*
    `
  },
  3: {
    title: "How to Meal Prep for a POTS-Friendly Week",
    description: "Strategic meal preparation tips for managing Postural Orthostatic Tachycardia Syndrome, including high-sodium recipes and energy-conserving cooking methods.",
    category: "Problem-Solving",
    tags: ["POTS", "Meal Prep", "High-Sodium"],
    readTime: "8 min read",
    publishDate: "2024-01-08",
    image: "photo-1523712999610-f77fbcfc3843",
    content: `
# How to Meal Prep for a POTS-Friendly Week

Living with Postural Orthostatic Tachycardia Syndrome (POTS) means managing fatigue, blood pressure fluctuations, and the need for higher sodium intake. Strategic meal prep can help you maintain consistent nutrition while conserving precious energy.

## Understanding POTS Nutritional Needs

### Key Dietary Requirements
- **High sodium intake:** 3-10 grams per day (as recommended by your doctor)
- **Adequate fluid intake:** 2-3 liters daily
- **Stable blood sugar:** Regular meals to prevent blood sugar dips
- **Easy-to-digest foods:** To avoid digestive stress that can worsen symptoms

### Energy Conservation Principles
- Minimize standing time in the kitchen
- Use one-pot meals when possible
- Prep while seated when feasible
- Cook in large batches to reduce cooking frequency

## POTS-Friendly Meal Prep Strategy

### The 2-Hour Sunday Prep Session

**Hour 1: Batch Cooking Basics**
- Start rice or quinoa in a rice cooker
- Put a whole chicken or roast in the oven
- Chop vegetables while sitting at the counter

**Hour 2: Assembly and Storage**
- Shred cooked protein
- Portion out grains
- Assemble grab-and-go snacks
- Prepare electrolyte drinks

## High-Sodium Recipe Collection

### Savory Breakfast: Salt-Boosted Scrambled Eggs
**Ingredients:**
- 6 eggs
- 1/4 cup milk
- 1/2 tsp sea salt
- 2 tbsp butter
- 2 tbsp everything bagel seasoning

**Method:**
1. Whisk eggs with milk and salt
2. Cook low and slow, stirring frequently
3. Top with everything bagel seasoning for extra sodium
4. Portion into 3 containers for easy reheating

**Sodium content:** ~800mg per serving

### Lunch: Chicken and Rice Power Bowls
**Ingredients (makes 4 servings):**
- 2 cups cooked chicken, shredded
- 2 cups cooked brown rice
- 1 can black beans, drained and rinsed
- 1 cup roasted sweet potato cubes
- Pickle spears
- Salted sunflower seeds

**Assembly:**
- Layer rice, chicken, beans, and sweet potato in containers
- Add pickle spears and sunflower seeds before eating
- Drizzle with salty tahini dressing (recipe below)

**Sodium content:** ~1,200mg per serving

### Dinner: One-Pot Salty Pasta Primavera
**Ingredients (makes 6 servings):**
- 1 lb whole wheat pasta
- 3 cups chicken broth (high-sodium)
- 2 cups mixed vegetables (zucchini, bell peppers, broccoli)
- 1/2 cup sun-dried tomatoes
- 1/4 cup olives
- 2 tbsp olive oil
- 2 tsp garlic salt
- 1/2 cup parmesan cheese

**Method:**
1. Cook pasta in salted water according to package directions
2. Sauté vegetables in olive oil with garlic salt
3. Combine pasta, vegetables, sun-dried tomatoes, and olives
4. Add parmesan and additional salt to taste
5. Portion into containers with extra cheese on the side

**Sodium content:** ~900mg per serving

## Energy-Saving Kitchen Hacks

### Prep While Seated
- Use a rolling cart to bring ingredients to a comfortable seated workspace
- Invest in ergonomic tools that require less grip strength
- Pre-cut vegetables while watching TV or listening to podcasts

### Smart Storage Solutions
- Use clear containers so you can see contents without searching
- Label everything with contents and sodium content
- Store frequently used items at waist height to minimize reaching

### Batch Cooking Essentials
- **Grains:** Cook large batches of rice, quinoa, or pasta
- **Proteins:** Slow cook or roast large portions to shred and portion
- **Sauces:** Make salty dressings and sauces in bulk

## Sample POTS Meal Prep Schedule

### Sunday (2-3 hours total with breaks)
- **9 AM:** Start slow cooker with chicken and broth
- **10 AM:** Rest break
- **11 AM:** Cook grains in rice cooker, prep vegetables
- **12 PM:** Lunch break
- **1 PM:** Assemble meal containers, portion snacks
- **2 PM:** Clean up and rest

### Mid-Week Refresh (30 minutes Wednesday)
- Prepare fresh salads
- Mix new electrolyte drinks
- Reheat and re-portion any needed meals

## Essential POTS Snacks to Prep

### Salted Nut Mix
**Ingredients:**
- 2 cups mixed nuts
- 2 tbsp sea salt
- 1 tsp garlic powder

**Method:**
1. Toss nuts with salt and garlic powder
2. Roast at 350°F for 10 minutes
3. Cool and portion into small bags

### Pickle Roll-Ups
**Ingredients:**
- Deli turkey or ham
- Cream cheese
- Dill pickle spears

**Assembly:**
- Spread cream cheese on meat
- Wrap around pickle
- Secure with toothpick
- Store in refrigerator

### Electrolyte Popsicles
**Ingredients:**
- 2 cups coconut water
- 1 cup fruit juice
- 1/2 tsp sea salt
- Fresh fruit pieces

**Method:**
1. Mix liquids and salt until dissolved
2. Add fruit to popsicle molds
3. Pour liquid mixture over fruit
4. Freeze for 4+ hours

## Managing Prep Day Fatigue

### Before You Start
- Ensure you're well-hydrated
- Have salty snacks on hand
- Plan for breaks every 30-45 minutes
- Set up a comfortable seated workspace

### During Prep
- Use compression garments if helpful
- Keep electrolyte drinks nearby
- Take breaks before you feel tired
- Ask for help with heavy lifting

### After Prep
- Elevate legs and rest for at least 30 minutes
- Have a high-sodium snack and fluids
- Don't plan other activities for the rest of the day

## Troubleshooting Common Issues

### "I can't stand long enough to cook"
- Use bar stools or tall chairs in the kitchen
- Prep ingredients while seated at the dining table
- Use countertop appliances (slow cooker, rice cooker, electric pressure cooker)

### "I forget to eat regularly"
- Set phone alarms for meal times
- Pre-portion everything so meals are grab-and-go
- Keep emergency snacks in multiple locations

### "My sodium needs vary day to day"
- Keep salt packets or seasoning blends on hand
- Prepare unsalted base recipes and add salt as needed
- Track your symptoms and sodium intake to find patterns

*Ready to create personalized POTS-friendly meal plans? Our meal planner can help you meet your specific sodium and nutritional needs while minimizing kitchen time.*
    `
  },
  4: {
    title: "Anti-Inflammatory Turmeric Rice Bowl",
    description: "A gentle, nourishing rice bowl packed with anti-inflammatory ingredients. Perfect for those managing chronic conditions.",
    category: "Recipe",
    tags: ["Anti-Inflammatory", "Gluten-Free", "Recipe"],
    readTime: "3 min read",
    publishDate: "2024-01-05",
    image: "photo-1500673922987-e212871fec22",
    content: `
# Anti-Inflammatory Turmeric Rice Bowl

This vibrant, healing bowl combines the anti-inflammatory power of turmeric with gentle, easily digestible ingredients. Perfect for anyone managing chronic conditions or simply wanting to nourish their body with healing foods.

## Why This Recipe Works

### Anti-Inflammatory Powerhouses
- **Turmeric:** Contains curcumin, a potent anti-inflammatory compound
- **Ginger:** Soothes digestion and reduces inflammation
- **Leafy greens:** Rich in antioxidants and nutrients
- **Healthy fats:** From olive oil and optional avocado, help with nutrient absorption

### Gentle on Sensitive Systems
- Easy to digest
- Naturally gluten-free
- Can be made low-FODMAP with simple substitutions
- Mild flavors that won't overwhelm sensitive palates

## Ingredients (Serves 2)

### For the Turmeric Rice:
- 1 cup jasmine or basmati rice
- 2 cups low-sodium vegetable broth
- 1 tsp ground turmeric
- 1/2 tsp ground ginger
- 1/4 tsp sea salt
- 1 tbsp olive oil

### For the Bowl:
- 2 cups baby spinach or arugula
- 1 medium cucumber, diced
- 1 cup cherry tomatoes, halved (omit for low-histamine)
- 1/2 avocado, sliced (omit for low-histamine)
- 2 tbsp pumpkin seeds
- Fresh herbs (cilantro, parsley, or mint)

### For the Dressing:
- 3 tbsp olive oil
- 2 tbsp lemon juice (or lime juice)
- 1 tsp honey or maple syrup
- 1/2 tsp ground turmeric
- 1/4 tsp ground ginger
- Salt and pepper to taste

## Instructions

### Prepare the Turmeric Rice:
1. Rinse rice under cold water until water runs clear
2. In a medium saucepan, combine rice, broth, turmeric, ginger, salt, and olive oil
3. Bring to a boil, then reduce heat to low, cover, and simmer for 15-18 minutes
4. Remove from heat and let stand 5 minutes, then fluff with a fork
5. Let cool slightly before assembling bowls

### Make the Dressing:
1. In a small bowl, whisk together olive oil, lemon juice, honey, turmeric, and ginger
2. Season with salt and pepper to taste
3. Set aside (can be made up to 3 days ahead)

### Assemble the Bowls:
1. Divide turmeric rice between two bowls
2. Top with fresh greens, cucumber, tomatoes (if using), and avocado (if using)
3. Sprinkle with pumpkin seeds and fresh herbs
4. Drizzle with dressing just before serving

## Customization Options

### For Low-FODMAP Diets:
- Use garlic-infused olive oil in the dressing
- Omit avocado and tomatoes
- Add bell peppers or carrots instead

### For Low-Histamine Diets:
- Omit tomatoes and avocado
- Add fresh herbs like basil or oregano
- Include steamed broccoli or zucchini

### For Extra Protein:
- Add grilled chicken or fish
- Include hard-boiled eggs
- Sprinkle with hemp seeds or additional pumpkin seeds

### For POTS-Friendly:
- Add extra salt to the rice cooking water
- Include olives for additional sodium
- Use pickled vegetables as a topping

## Meal Prep Tips

### Make-Ahead Instructions:
- Cook turmeric rice up to 4 days ahead
- Prepare dressing up to 1 week ahead
- Wash and chop vegetables 2-3 days ahead

### Storage:
- Store rice and toppings separately
- Keep dressing in a small jar in the refrigerator
- Assemble bowls just before eating for best texture

### Batch Cooking:
- Double or triple the rice recipe for multiple meals
- Roast a large batch of vegetables on Sunday for the week
- Make a large jar of dressing to use throughout the week

## Nutritional Benefits

### Per Serving (approximate):
- **Calories:** 420
- **Protein:** 8g
- **Carbohydrates:** 52g
- **Fiber:** 6g
- **Healthy fats:** 18g

### Key Nutrients:
- **Curcumin:** From turmeric, powerful anti-inflammatory
- **Vitamin K:** From leafy greens, supports bone health
- **Folate:** From greens and rice, supports cellular function
- **Magnesium:** From pumpkin seeds, supports muscle and nerve function

## Serving Suggestions

### As a Main Meal:
- Serve with herbal tea or coconut water
- Add a side of fermented vegetables (if tolerated)
- Include a small portion of lean protein

### As a Side Dish:
- Pairs well with grilled fish or chicken
- Complements roasted vegetables
- Works alongside soup for a light dinner

## Recipe Variations

### Golden Breakfast Bowl:
- Use the same turmeric rice as a base
- Top with sliced banana, berries, and a drizzle of honey
- Add coconut flakes and chopped nuts

### Warm Weather Version:
- Serve the rice at room temperature
- Add fresh cucumber and mint
- Use a lighter citrus dressing

### Comfort Food Version:
- Serve the rice warm
- Add roasted root vegetables
- Include warming spices like cinnamon

*Looking for more healing recipes like this? Our meal planner creates personalized anti-inflammatory meal plans tailored to your specific health needs and dietary restrictions.*
    `
  },
  5: {
    title: "Navigating Holidays with Celiac Disease",
    description: "Practical strategies for enjoying holiday gatherings while maintaining a strict gluten-free diet. Includes conversation starters and backup meal ideas.",
    category: "Problem-Solving",
    tags: ["Celiac", "Gluten-Free", "Holiday Tips"],
    readTime: "7 min read",
    publishDate: "2024-01-03",
    image: "photo-1618160702438-9b02ab6515c9",
    content: `
# Navigating Holidays with Celiac Disease

The holidays should be about connection and joy, not stress and worry about food safety. With the right planning and communication strategies, you can fully participate in holiday celebrations while keeping your gluten-free diet intact.

## Pre-Holiday Planning Essentials

### Know Your Host
**For Close Family/Friends:**
- Have an honest conversation about your needs well in advance
- Offer to bring dishes that you know are safe
- Share your favorite gluten-free recipes
- Explain cross-contamination concerns clearly

**For Casual Acquaintances:**
- Eat a substantial meal before attending
- Bring a gluten-free dish to share
- Don't expect the host to accommodate your needs
- Focus on socializing rather than the food

### Essential Pre-Party Checklist
- [ ] Contact host 1-2 weeks in advance
- [ ] Offer to bring 2-3 dishes you can eat
- [ ] Research nearby restaurants with gluten-free options
- [ ] Pack emergency snacks
- [ ] Bring your own beverages if needed
- [ ] Prepare polite responses to food-related questions

## Communication Scripts That Work

### When Accepting an Invitation:
*"I'm so excited to celebrate with you! I have celiac disease, which means I need to eat strictly gluten-free. I'd love to bring a few dishes that I can eat - is there anything specific you'd like me to contribute?"*

### When Explaining Your Needs:
*"I have celiac disease, which is different from a gluten sensitivity. Even tiny amounts of gluten can make me very sick for weeks. I really appreciate you thinking of me, and I'm happy to bring my own food so I can focus on enjoying time with everyone."*

### When Declining Unsafe Food:
*"Thank you so much for offering! I have to be really careful about cross-contamination, so I brought some things I know are safe. This looks delicious though!"*

### When People Don't Understand:
*"I know it seems restrictive, but it's actually an autoimmune condition. Think of it like a severe allergy - I can't have even a tiny bit. But I'm just happy to be here with everyone!"*

## Safe Holiday Dishes to Bring

### Appetizers That Wow

**Stuffed Mushrooms (Serves 8)**
- 24 large mushroom caps
- 1 lb Italian sausage (check gluten-free)
- 8 oz cream cheese
- 1/2 cup parmesan cheese
- 2 cloves garlic, minced
- Fresh herbs

*Remove stems, stuff with sausage mixture, bake 20 minutes. Universally loved!*

**Cranberry Goat Cheese Dip**
- 8 oz goat cheese
- 1/2 cup dried cranberries
- 1/4 cup chopped pecans
- 2 tbsp honey
- Serve with gluten-free crackers and apple slices

### Main Dishes Everyone Will Love

**Herb-Crusted Salmon (Serves 6)**
- 2 lbs salmon fillet
- 1/4 cup olive oil
- 2 tbsp fresh dill
- 2 tbsp fresh parsley
- 2 cloves garlic
- Lemon zest and juice
- Salt and pepper

*Mix herbs with olive oil, spread on salmon, bake 15 minutes. Simple and elegant.*

**Maple Glazed Root Vegetables**
- 3 lbs mixed root vegetables (carrots, parsnips, sweet potatoes)
- 1/4 cup maple syrup
- 3 tbsp olive oil
- 2 tsp fresh rosemary
- Salt and pepper

*Roast at 425°F for 30-40 minutes. Naturally gluten-free and crowd-pleasing.*

### Desserts That Don't Compromise

**Flourless Chocolate Torte**
- 8 oz dark chocolate (check gluten-free)
- 1/2 cup butter
- 3/4 cup sugar
- 4 large eggs
- 1/4 cup cocoa powder
- Pinch of salt

*Rich, decadent, and nobody will know it's gluten-free.*

**Peppermint Bark**
- 12 oz gluten-free dark chocolate
- 12 oz white chocolate
- 1/2 cup crushed candy canes (check gluten-free)

*Easy to make ahead and perfect for gift-giving.*

## Cross-Contamination Prevention

### Kitchen Safety Tips
- Arrive early to help with food prep if comfortable
- Use separate cutting boards and utensils
- Keep your dishes covered and labeled
- Designate a "gluten-free zone" in the kitchen

### Serving Strategies
- Serve your dishes first before gluten-containing foods
- Use separate serving utensils for each dish
- Keep gluten-free items on a separate table if possible
- Watch for shared condiments and spreaders

## Emergency Backup Plans

### Always Have These Ready:
- Protein bars or crackers in your purse/car
- Contact info for nearby gluten-free restaurants
- A polite exit strategy if you start feeling unwell
- Medications or supplements you might need

### If You Get "Glutened":
- Don't panic or make a scene
- Quietly excuse yourself if needed
- Focus on supportive care (rest, hydration)
- Follow up with your doctor if symptoms are severe

## Special Holiday Situations

### Office Parties
- Eat beforehand
- Bring a substantial dish to share
- Focus on networking, not the food
- Suggest restaurants for future gatherings

### Kids' Holiday Events
- Pack safe alternatives that look similar to what others are eating
- Communicate with teachers/organizers in advance
- Bring enough to share with your child's friends
- Have a plan for classroom treats

### Traveling for Holidays
- Research gluten-free restaurants at your destination
- Pack non-perishable safe foods
- Bring a cooler if driving
- Consider staying somewhere with a kitchen

### Religious/Cultural Celebrations
- Research traditional dishes that are naturally gluten-free
- Speak with religious leaders about accommodation needs
- Offer to help prepare safe versions of traditional foods
- Focus on the spiritual/cultural meaning beyond the food

## Building Long-Term Relationships

### Educate with Kindness
- Share resources about celiac disease
- Offer to teach gluten-free cooking techniques
- Bring copies of your favorite recipes to share
- Thank hosts genuinely for their efforts

### Create New Traditions
- Host your own gluten-free holiday gatherings
- Start a tradition of potluck-style celebrations
- Focus on activities beyond food
- Share the joy of safe, delicious gluten-free foods

## Sample Holiday Menu Planning

### Thanksgiving Contributions:
- Herb-roasted turkey breast (check seasoning)
- Gluten-free stuffing made with GF bread
- Mashed sweet potatoes with marshmallows
- Green bean almondine
- Pumpkin pie with GF crust

### Christmas Party Dishes:
- Bacon-wrapped scallops
- Caprese skewers
- Chocolate-dipped strawberries
- Sparkling cranberry punch

Remember: The goal is to enjoy the celebration and connect with loved ones. With proper planning and communication, you can do this safely while maintaining your health and holiday spirit.

*Ready to plan safe, delicious meals for every occasion? Our meal planner helps you create gluten-free meal plans that make everyday cooking - and special occasions - stress-free.*
    `
  },
  6: {
    title: "Gentle Green Smoothie Bowl",
    description: "A low-histamine, easily digestible smoothie bowl that's perfect for sensitive stomachs and provides steady energy.",
    category: "Recipe",
    tags: ["Low-Histamine", "Smoothie", "Recipe"],
    readTime: "2 min read",
    publishDate: "2024-01-01",
    image: "photo-1465146344425-f00d5f5c8f07",
    content: `
# Gentle Green Smoothie Bowl

This nourishing smoothie bowl is designed for sensitive digestive systems while still providing essential nutrients and sustained energy. Perfect for those following low-histamine, anti-inflammatory, or gentle healing diets.

## Why This Recipe is Special

### Gentle on Sensitive Systems
- Uses low-histamine fruits and vegetables
- Easy to digest ingredients
- No common trigger foods
- Naturally cooling and soothing

### Nutritional Powerhouse
- Rich in folate from leafy greens
- Provides sustained energy from healthy fats
- High in antioxidants and anti-inflammatory compounds
- Good source of fiber for gut health

## Ingredients (Serves 1)

### For the Smoothie Base:
- 1 small frozen banana (not overripe)
- 1/2 cup fresh or frozen mango chunks
- 1 cup baby spinach (fresh)
- 1/2 cucumber, peeled and chopped
- 1 cup coconut milk (canned, full-fat)
- 1 tbsp coconut oil or MCT oil
- 1/2 tsp fresh ginger, grated (optional)
- 1 tbsp honey or maple syrup (to taste)

### For the Toppings:
- 2 tbsp coconut flakes (unsweetened)
- 1 tbsp pumpkin seeds
- 1/4 cup fresh blueberries
- 1 tbsp chia seeds
- Fresh mint leaves
- Drizzle of coconut butter (optional)

## Instructions

### Make the Smoothie:
1. Start with the liquid - pour coconut milk into blender first
2. Add coconut oil, honey, and ginger (if using)
3. Add spinach and cucumber - these blend easier when added early
4. Top with frozen banana and mango
5. Blend on high for 60-90 seconds until completely smooth
6. Pour into a chilled bowl

### Add the Toppings:
1. Arrange toppings in sections for visual appeal
2. Start with larger items (coconut flakes, berries)
3. Sprinkle smaller seeds on top
4. Garnish with fresh mint
5. Drizzle with coconut butter if desired

## Customization Options

### For Different Dietary Needs:

**Ultra Low-Histamine:**
- Replace banana with additional mango
- Use only coconut milk, no other additions
- Skip the honey and rely on fruit sweetness
- Add ice cubes for thickness instead of frozen fruit

**For Extra Anti-Inflammatory Power:**
- Add 1/4 tsp turmeric powder
- Include 1 tbsp fresh ginger
- Add a handful of fresh herbs (mint, basil)
- Include 1 tsp omega-3 rich flax oil

**For POTS Support:**
- Add a pinch of sea salt
- Include electrolyte powder (check ingredients)
- Add extra coconut water
- Include 1 tbsp almond butter for sustained energy

**For Gut Healing:**
- Add 1 tbsp collagen powder
- Include 1 tsp L-glutamine powder
- Add probiotic powder (if tolerated)
- Include bone broth ice cubes for extra nutrition

## Prep and Storage Tips

### Make-Ahead Options:
- Pre-portion smoothie ingredients in freezer bags
- Wash and prep toppings for the week
- Make coconut butter in advance
- Prepare chia seeds by soaking overnight

### Storage Guidelines:
- Best consumed immediately for optimal nutrition
- Can be stored in refrigerator for up to 24 hours
- Toppings stay fresh for 3-5 days when stored separately
- Freeze smoothie base portions for up to 3 months

## Troubleshooting Common Issues

### "My smoothie is too thin"
- Add more frozen fruit
- Include ice cubes
- Use less liquid
- Add 1/4 avocado for creaminess (if histamine-tolerant)

### "It's too sweet/not sweet enough"
- Adjust with small amounts of honey or stevia
- Use riper or less ripe fruit
- Add a pinch of sea salt to balance sweetness
- Include more cucumber for a less sweet profile

### "I can't taste the greens but want more nutrition"
- Start with baby spinach (mildest flavor)
- Gradually increase the amount over time
- Try romaine lettuce as an alternative
- Add fresh herbs like mint or basil for flavor

### "It's not filling enough"
- Add healthy fats (coconut oil, nuts, seeds)
- Include protein powder (check for histamine tolerance)
- Add more fiber with chia or flax seeds
- Make sure you're eating, not just drinking - the bowl format helps with satiety

## Nutritional Information

### Per Serving (approximate):
- **Calories:** 380
- **Protein:** 6g
- **Carbohydrates:** 35g
- **Fiber:** 8g
- **Healthy fats:** 24g

### Key Nutrients:
- **Folate:** Essential for cellular function and energy
- **Potassium:** Supports heart and muscle function
- **Vitamin C:** Immune support and collagen production
- **Magnesium:** Muscle relaxation and sleep support
- **MCTs:** Quick energy and brain fuel

## Best Times to Enjoy

### Morning Energizer:
- Perfect breakfast for gentle morning nutrition
- Provides sustained energy without blood sugar spikes
- Easy to digest when stomach is sensitive

### Post-Workout Recovery:
- Replenishes glycogen stores
- Provides anti-inflammatory compounds
- Easy to consume when appetite is low

### Afternoon Pick-Me-Up:
- Satisfying snack that won't interfere with dinner
- Provides steady energy without caffeine
- Cooling and refreshing on warm days

## Recipe Variations

### Tropical Version:
- Use pineapple instead of mango (check histamine tolerance)
- Add coconut water
- Include lime zest
- Top with toasted coconut

### Berry Antioxidant Bowl:
- Replace mango with mixed berries
- Add acai powder (if available and tolerated)
- Include goji berries as topping
- Add a handful of fresh basil

### Protein Power Bowl:
- Add vanilla protein powder (check ingredients)
- Include almond butter
- Add hemp hearts
- Top with sliced almonds

*Looking for more gentle, nourishing recipes? Our meal planner creates personalized smoothie and meal plans designed specifically for sensitive systems and healing diets.*
    `
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
                onClick={() => navigate('/blog')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">The Gentle Plate</span>
              </div>
            </div>
            {user && (
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Meal Planner
              </Button>
            )}
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Image */}
        <div className="aspect-video overflow-hidden rounded-lg mb-8">
          <img
            src={`https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=1200&h=675`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="default">{post.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              The Gentle Plate Team
            </div>
            <time className="text-sm text-muted-foreground">
              {new Date(post.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {post.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Article
              </Button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-line leading-relaxed">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{paragraph.slice(4)}</h3>;
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={index} className="font-semibold mb-2">{paragraph.slice(2, -2)}</p>;
              }
              if (paragraph.startsWith('- ')) {
                // Handle bold text within list items
                const content = paragraph.slice(2);
                const processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <li key={index} className="mb-1" dangerouslySetInnerHTML={{ __html: processedContent }} />;
              }
              if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                return <p key={index} className="italic text-muted-foreground mb-4">{paragraph.slice(1, -1)}</p>;
              }
              if (paragraph.trim() === '') {
                return <br key={index} />;
              }
              // Handle bold text within regular paragraphs
              const processedContent = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedContent }} />;
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Put This Into Practice?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create personalized meal plans that incorporate these evidence-based strategies for your specific health needs.
          </p>
          <Button asChild size="lg">
            <Link to={user ? "/" : "/auth"}>
              {user ? "Create Your Meal Plan" : "Start Free Meal Planner"}
            </Link>
          </Button>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Continue Reading</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Button asChild variant="outline" className="h-auto p-6 text-left">
              <Link to="/blog">
                <div>
                  <h4 className="font-semibold mb-2">Browse All Articles</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover more evidence-based guides, recipes, and tips for managing chronic conditions through nutrition.
                  </p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-6 text-left">
              <Link to={user ? "/" : "/auth"}>
                <div>
                  <h4 className="font-semibold mb-2">Get Your Meal Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Transform these insights into personalized meal plans tailored to your specific dietary needs.
                  </p>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;