import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, Search, Clock, User, ArrowLeft, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Import the new images
import mcasDietGuide from "@/assets/mcas-diet-guide.jpg";
import lowFodmapSnacks from "@/assets/low-fodmap-snacks.jpg";
import saltPotsFriendly from "@/assets/salt-pots-friendly.jpg";
import turmericAntiInflammatory from "@/assets/turmeric-anti-inflammatory.jpg";
import celiacHolidayDining from "@/assets/celiac-holiday-dining.jpg";
import greenSmoothieBowl from "@/assets/green-smoothie-bowl.jpg";
import mcasDiningOut from "@/assets/mcas-dining-out.jpg";

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The Complete Guide to the Low-Histamine Diet for MCAS",
    description: "Everything you need to know about managing Mast Cell Activation Syndrome through diet, including safe foods, meal planning tips, and common triggers to avoid.",
    category: "Ultimate Guide",
    tags: ["Low-Histamine", "MCAS", "Ultimate Guide"],
    readTime: "12 min read",
    publishDate: "2024-01-15",
    image: mcasDietGuide,
    featured: true
  },
  {
    id: 2,
    title: "10 Safe and Easy Low-FODMAP Snack Ideas",
    description: "Quick, portable snacks that won't trigger IBS symptoms. Perfect for busy days when you need convenient, gut-friendly options.",
    category: "Problem-Solving",
    tags: ["Low-FODMAP", "IBS", "Snacks"],
    readTime: "5 min read",
    publishDate: "2024-01-10",
    image: lowFodmapSnacks
  },
  {
    id: 3,
    title: "How to Meal Prep for a POTS-Friendly Week",
    description: "Strategic meal preparation tips for managing Postural Orthostatic Tachycardia Syndrome, including high-sodium recipes and energy-conserving cooking methods.",
    category: "Problem-Solving",
    tags: ["POTS", "Meal Prep", "High-Sodium"],
    readTime: "8 min read",
    publishDate: "2024-01-08",
    image: saltPotsFriendly
  },
  {
    id: 4,
    title: "Anti-Inflammatory Turmeric Rice Bowl",
    description: "A gentle, nourishing rice bowl packed with anti-inflammatory ingredients. Perfect for those managing chronic conditions.",
    category: "Recipe",
    tags: ["Anti-Inflammatory", "Gluten-Free", "Recipe"],
    readTime: "3 min read",
    publishDate: "2024-01-05",
    image: turmericAntiInflammatory
  },
  {
    id: 5,
    title: "Navigating Holidays with Celiac Disease",
    description: "Practical strategies for enjoying holiday gatherings while maintaining a strict gluten-free diet. Includes conversation starters and backup meal ideas.",
    category: "Problem-Solving",
    tags: ["Celiac", "Gluten-Free", "Holiday Tips"],
    readTime: "7 min read",
    publishDate: "2024-01-03",
    image: celiacHolidayDining
  },
  {
    id: 6,
    title: "Gentle Green Smoothie Bowl",
    description: "A low-histamine, easily digestible smoothie bowl that's perfect for sensitive stomachs and provides steady energy.",
    category: "Recipe",
    tags: ["Low-Histamine", "Smoothie", "Recipe"],
    readTime: "2 min read",
    publishDate: "2024-01-01",
    image: greenSmoothieBowl
  },
    {
      id: 7,
      title: "Dining Without Fear: 8 Practical Tips for Eating Out with MCAS",
      description: "Empowering those with MCAS to enjoy restaurants and social events by providing practical advice, safe low-histamine menu options, and key questions to ask your server.",
    category: "Problem-Solving",
    tags: ["MCAS", "Dining Out", "Low-Histamine", "Restaurant Guide", "Social Situations"],
    readTime: "6 min read",
    publishDate: "2024-01-20",
    image: mcasDiningOut
  }
];

const categories = ["All", "Ultimate Guide", "Problem-Solving", "Recipe"];
const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => post.tags.includes(tag));
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesTags && matchesSearch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">The Gentle Plate Blog</span>
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

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Nourishing Knowledge for Chronic Conditions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based guides, recipes, and practical tips for managing your health through gentle nutrition.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Tag Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by condition or diet:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "All" && searchQuery === "" && selectedTags.length === 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Featured Article</h2>
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="md:flex">
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">{featuredPost.category}</Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                    <Link to={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {featuredPost.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild>
                    <Link to={`/blog/${featuredPost.id}`}>Read Full Guide</Link>
                  </Button>
                </div>
                <div className="md:w-1/3">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {regularPosts.map(post => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4 leading-relaxed">
                  {post.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link to={`/blog/${post.id}`}>Read Article</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedTags([]);
                setSearchQuery("");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Create Your Personalized Meal Plan?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Put these insights into action with a meal plan tailored specifically to your health needs and dietary restrictions.
          </p>
          <Button asChild size="lg">
            <Link to={user ? "/" : "/auth"}>
              {user ? "Go to Meal Planner" : "Start Free Meal Planner"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Blog;