import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/JobCard";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addSampleData, checkConnection } from "@/utils/testData";
import { DebugPanel } from "@/components/DebugPanel";
import { 
  Search, 
  TrendingUp, 
  Users, 
  Briefcase, 
  ChevronRight, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Zap,
  Globe,
  Building2,
  Heart,
  Award,
  Rocket
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  skills_required: string[];
  is_remote: boolean;
  created_at: string;
  companies: {
    id: string;
    name: string;
    logo_url?: string;
    location: string;
  };
}

const Index = () => {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isAddingData, setIsAddingData] = useState(false);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      console.log("Fetching featured jobs...");
      
      // First check if we have any jobs
      const { data: existingJobs } = await supabase
        .from("jobs")
        .select("id")
        .limit(1);
      
      if (!existingJobs || existingJobs.length === 0) {
        console.log("No jobs found, adding sample data...");
        await addSampleData();
      }
      
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            location
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Featured jobs data:", data);
      setFeaturedJobs(data || []);
    } catch (error) {
      console.error("Error fetching featured jobs:", error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchLocation) params.set("location", searchLocation);
    
    window.location.href = `/jobs?${params.toString()}`;
  };

  const handleAddSampleData = async () => {
    setIsAddingData(true);
    try {
      await checkConnection();
      await addSampleData();
      // Refresh the featured jobs
      await fetchFeaturedJobs();
    } catch (error) {
      console.error("Error adding sample data:", error);
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-purple-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-slide-up">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit px-4 py-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Trusted by 50,000+ professionals
                  </Badge>
                  <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight">
                    Find Your
                    <span className="text-gradient-hero block">Dream Job</span>
                    Today
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                    Connect with top companies and discover opportunities that match your skills, 
                    passion, and career ambitions. Your next adventure starts here.
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="card-glass p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="Job title, skills, or company"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-base input-modern"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="City, state, or remote"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-12 h-14 text-base input-modern"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="w-full h-14 text-lg btn-hero"
                  >
                    <Search className="mr-3 h-5 w-5" />
                    Search Jobs
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">10K+</div>
                    <div className="text-sm text-muted-foreground">Active Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">5K+</div>
                    <div className="text-sm text-muted-foreground">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">95%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Visual */}
              <div className="relative animate-slide-in-right">
                <div className="relative">
                  {/* Main Card */}
                  <div className="card-glass p-8 space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Senior Developer</h3>
                        <p className="text-muted-foreground">TechCorp Inc.</p>
                      </div>
                      <Badge className="ml-auto">Remote</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>San Francisco, CA</span>
                        <Clock className="h-4 w-4 ml-4" />
                        <span>Full-time</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>$120k - $180k</span>
                        <Award className="h-4 w-4 ml-4" />
                        <span>Senior Level</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full btn-gradient">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute -top-4 -right-4 card-modern p-4 w-32 animate-float">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">2.5k+</div>
                        <div className="text-xs text-muted-foreground">Hired</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 card-modern p-4 w-36 animate-float" style={{animationDelay: '1s'}}>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">+15%</div>
                        <div className="text-xs text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Why Choose JobHunt?
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Everything you need to
              <span className="text-gradient block">land your dream job</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with human expertise to create 
              the most effective job search experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Smart Matching",
                description: "AI-powered job recommendations based on your skills, experience, and preferences.",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Globe,
                title: "Global Opportunities",
                description: "Access to remote and on-site positions from companies worldwide.",
                color: "from-blue-400 to-cyan-500"
              },
              {
                icon: Building2,
                title: "Top Companies",
                description: "Connect with Fortune 500 companies and innovative startups.",
                color: "from-purple-400 to-pink-500"
              },
              {
                icon: Heart,
                title: "Personalized Experience",
                description: "Tailored job alerts and recommendations just for you.",
                color: "from-red-400 to-pink-500"
              },
              {
                icon: Award,
                title: "Career Guidance",
                description: "Expert advice and resources to advance your career.",
                color: "from-green-400 to-emerald-500"
              },
              {
                icon: Rocket,
                title: "Fast Results",
                description: "Get hired faster with our streamlined application process.",
                color: "from-indigo-400 to-purple-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="card-modern hover-lift group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Featured Opportunities
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Hand-picked jobs from
              <span className="text-gradient block">top companies</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover amazing opportunities from companies that are actively hiring and looking for talent like you.
            </p>
            <Button variant="outline" size="lg" asChild className="hover:bg-accent/50">
              <Link to="/jobs">
                View All Jobs
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <div key={job.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <JobCard
                  job={{
                    id: job.id,
                    title: job.title,
                    company: {
                      name: job.companies.name,
                      logo_url: job.companies.logo_url,
                      location: job.companies.location,
                    },
                    location: job.location,
                    employment_type: job.employment_type,
                    experience_level: job.experience_level,
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    skills_required: job.skills_required,
                    is_remote: job.is_remote,
                    created_at: job.created_at,
                  }}
                />
              </div>
            ))}
          </div>

          {featuredJobs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No featured jobs yet</h3>
              <p className="text-muted-foreground mb-8">Check back soon for amazing opportunities!</p>
              <Button size="lg" asChild className="btn-hero">
                <Link to="/jobs">Browse All Jobs</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-purple-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-glass p-12 space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Your Journey Today
                </Badge>
                <h2 className="font-heading text-4xl md:text-6xl font-bold">
                  Ready to land your
                  <span className="text-gradient-hero block">dream job?</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Join over 50,000 professionals who have found their perfect career match. 
                  Create your profile, set your preferences, and let opportunities find you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="btn-hero px-8 py-6 text-lg">
                  <Link to="/auth">
                    <Star className="mr-3 h-6 w-6" />
                    Find Jobs Now
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="px-8 py-6 text-lg hover:bg-accent/50">
                  <Link to="/jobs">
                    <Search className="mr-3 h-5 w-5" />
                    Browse Jobs
                  </Link>
                </Button>
              </div>

              <div className="pt-8 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gradient">100%</div>
                    <div className="text-sm text-muted-foreground">Free to use</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gradient">24/7</div>
                    <div className="text-sm text-muted-foreground">Job search</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gradient">5 min</div>
                    <div className="text-sm text-muted-foreground">Apply time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Debug Panel - Only show for admin */}
      {user?.email === "shubhz12@gmail.com" && (
        <div className="fixed bottom-4 right-4">
          <Button 
            variant="secondary" 
            onClick={handleAddSampleData}
            disabled={isAddingData}
          >
            {isAddingData ? "Adding Data..." : "Add Sample Data"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
