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
  Rocket,
  Play,
  Shield,
  Lightbulb
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-slide-up">
                <div className="space-y-6">
                  <Badge variant="secondary" className="w-fit px-6 py-3 text-sm font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Trusted by 50,000+ professionals
                  </Badge>
                  <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight text-gray-900">
                    Find Your
                    <span className="text-gradient-hero block">Dream Career</span>
                    Today
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                    Connect with top companies and discover opportunities that match your skills, 
                    passion, and career ambitions. Your next adventure starts here.
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="card-professional p-8 space-y-6 shadow-professional-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Job title, skills, or company"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-base input-professional focus-professional"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="City, state, or remote"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-12 h-14 text-base input-professional focus-professional"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="w-full h-14 text-lg btn-hero shadow-lg hover:shadow-xl"
                  >
                    <Search className="mr-3 h-5 w-5" />
                    Search Jobs
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-8 pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">10K+</div>
                    <div className="text-sm text-gray-500 font-medium">Active Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">5K+</div>
                    <div className="text-sm text-gray-500 font-medium">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">95%</div>
                    <div className="text-sm text-gray-500 font-medium">Success Rate</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" asChild className="btn-hero px-8 py-4 text-lg shadow-lg">
                    <Link to="/jobs">
                      <Briefcase className="mr-3 h-5 w-5" />
                      Browse Jobs
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg btn-professional hover-professional">
                    <Link to="/companies">
                      <Building2 className="mr-3 h-5 w-5" />
                      Explore Companies
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Content - Hero Visual */}
              <div className="relative animate-slide-in-right">
                <div className="relative">
                  {/* Main Card */}
                  <div className="card-professional p-8 space-y-6 shadow-professional-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <Briefcase className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-gray-900">Senior Developer</h3>
                        <p className="text-gray-600">TechCorp Inc.</p>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200">Remote</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>San Francisco, CA</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Full-time</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>$120k - $180k</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>Senior Level</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full btn-hero shadow-md">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute -top-4 -right-4 card-professional p-4 w-36 animate-float shadow-professional">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">2.5k+</div>
                        <div className="text-xs text-gray-500">Hired</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 card-professional p-4 w-40 animate-float shadow-professional" style={{animationDelay: '1s'}}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">+15%</div>
                        <div className="text-xs text-gray-500">Growth</div>
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
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-6 py-3 bg-blue-50 text-blue-700 border-blue-200">
              <Target className="w-4 h-4 mr-2" />
              Why Choose JobHunt?
            </Badge>
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-8 text-gray-900">
              Everything you need to
              <span className="text-gradient block">land your dream job</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
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
                color: "from-yellow-400 to-orange-500",
                bgColor: "bg-yellow-50",
                textColor: "text-yellow-700"
              },
              {
                icon: Globe,
                title: "Global Opportunities",
                description: "Access to remote and on-site positions from companies worldwide.",
                color: "from-blue-400 to-cyan-500",
                bgColor: "bg-blue-50",
                textColor: "text-blue-700"
              },
              {
                icon: Building2,
                title: "Top Companies",
                description: "Connect with Fortune 500 companies and innovative startups.",
                color: "from-purple-400 to-pink-500",
                bgColor: "bg-purple-50",
                textColor: "text-purple-700"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security measures.",
                color: "from-green-400 to-emerald-500",
                bgColor: "bg-green-50",
                textColor: "text-green-700"
              },
              {
                icon: Lightbulb,
                title: "Career Guidance",
                description: "Expert advice and resources to advance your career.",
                color: "from-indigo-400 to-purple-500",
                bgColor: "bg-indigo-50",
                textColor: "text-indigo-700"
              },
              {
                icon: Rocket,
                title: "Fast Results",
                description: "Get hired faster with our streamlined application process.",
                color: "from-red-400 to-pink-500",
                bgColor: "bg-red-50",
                textColor: "text-red-700"
              }
            ].map((feature, index) => (
              <Card key={index} className="card-professional hover-professional group border-0 shadow-professional">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.textColor}`} />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-6 py-3 bg-blue-50 text-blue-700 border-blue-200">
              <Star className="w-4 h-4 mr-2" />
              Featured Opportunities
            </Badge>
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-8 text-gray-900">
              Hand-picked jobs from
              <span className="text-gradient block">top companies</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
              Discover amazing opportunities from companies that are actively hiring and looking for talent like you.
            </p>
            <Button variant="outline" size="lg" asChild className="btn-professional hover-professional px-8 py-4 text-lg">
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
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Briefcase className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No featured jobs yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Check back soon for amazing opportunities!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="btn-hero px-8 py-4">
                  <Link to="/jobs">Browse All Jobs</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleAddSampleData}
                  disabled={isAddingData}
                  className="btn-professional hover-professional px-8 py-4"
                >
                  {isAddingData ? "Adding Data..." : "Add Sample Data"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50"></div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="card-professional p-16 space-y-10 shadow-professional-xl">
              <div className="space-y-6">
                <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold bg-blue-50 text-blue-700 border-blue-200">
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Your Journey Today
                </Badge>
                <h2 className="font-heading text-4xl md:text-6xl font-bold text-gray-900">
                  Ready to land your
                  <span className="text-gradient-hero block">dream job?</span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                  Join over 50,000 professionals who have found their perfect career match. 
                  Create your profile, set your preferences, and let opportunities find you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" asChild className="btn-hero px-10 py-6 text-lg shadow-lg">
                  <Link to="/auth">
                    <Star className="mr-3 h-6 w-6" />
                    Get Started Free
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="px-10 py-6 text-lg btn-professional hover-professional">
                  <Link to="/jobs">
                    <Search className="mr-3 h-5 w-5" />
                    Browse Jobs
                  </Link>
                </Button>
              </div>

              <div className="pt-10 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-gradient">100%</div>
                    <div className="text-sm text-gray-500 font-medium">Free to use</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-gradient">24/7</div>
                    <div className="text-sm text-gray-500 font-medium">Job matching</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-gradient">5 min</div>
                    <div className="text-sm text-gray-500 font-medium">Setup time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <DebugPanel />
    </div>
  );
};

export default Index;