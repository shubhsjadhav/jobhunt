import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { CompanyCard } from "@/components/CompanyCard";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, MapPin, Users, Globe, Building2, Briefcase, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  created_at: string;
}

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

const Company: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // State for company listing
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // State for individual company view
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Fetch companies for listing
  useEffect(() => {
    if (!id) {
      fetchCompanies();
    }
  }, [id]);

  // Fetch individual company data
  useEffect(() => {
    if (id) {
      fetchCompanyDetails(id);
    }
  }, [id]);

  // Apply filters for company listing
  useEffect(() => {
    if (!id) {
      applyFilters();
    }
  }, [companies, searchQuery, industryFilter, sizeFilter, locationFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log("Fetching companies...");
      
      // First, let's add some sample data if none exists
      const { data: existingCompanies } = await supabase
        .from("companies")
        .select("id")
        .limit(1);
      
      if (!existingCompanies || existingCompanies.length === 0) {
        console.log("No companies found, adding sample data...");
        await addSampleCompanies();
      }
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Companies data:", data);
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleCompanies = async () => {
    try {
      const { error } = await supabase
        .from("companies")
        .insert([
          {
            name: "TechCorp Solutions",
            description: "Leading technology consulting firm specializing in digital transformation",
            website: "https://techcorp.com",
            location: "San Francisco, CA",
            industry: "Technology",
            size: "500-1000",
            logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
          },
          {
            name: "GreenEnergy Inc",
            description: "Renewable energy company focused on sustainable solutions",
            website: "https://greenenergy.com",
            location: "Austin, TX",
            industry: "Energy",
            size: "100-500",
            logo_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop&crop=center"
          },
          {
            name: "FinanceFirst",
            description: "Premier financial services and investment firm",
            website: "https://financefirst.com",
            location: "New York, NY",
            industry: "Finance",
            size: "1000+",
            logo_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center"
          },
          {
            name: "HealthTech Innovations",
            description: "Healthcare technology startup revolutionizing patient care",
            website: "https://healthtech.com",
            location: "Boston, MA",
            industry: "Healthcare",
            size: "50-100",
            logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center"
          },
          {
            name: "DataDriven Analytics",
            description: "Advanced analytics and machine learning solutions",
            website: "https://datadriven.com",
            location: "Seattle, WA",
            industry: "Technology",
            size: "100-500",
            logo_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center"
          }
        ]);
      
      if (error) throw error;
      console.log("Sample companies added successfully");
    } catch (error) {
      console.error("Error adding sample companies:", error);
    }
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      setCompanyLoading(true);
      
      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch company jobs
      const { data: jobsData, error: jobsError } = await supabase
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
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setCompanyJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setCompanyLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          (company.description && company.description.toLowerCase().includes(query)) ||
          (company.industry && company.industry.toLowerCase().includes(query))
      );
    }

    // Industry filter
    if (industryFilter) {
      filtered = filtered.filter((company) => company.industry === industryFilter);
    }

    // Size filter
    if (sizeFilter) {
      filtered = filtered.filter((company) => company.size === sizeFilter);
    }

    // Location filter
    if (locationFilter.trim()) {
      const location = locationFilter.toLowerCase();
      filtered = filtered.filter((company) =>
        company.location && company.location.toLowerCase().includes(location)
      );
    }

    setFilteredCompanies(filtered);
  };

  const getUniqueValues = (key: keyof Company) => {
    return Array.from(new Set(companies.map(company => company[key]).filter(Boolean)));
  };

  // Individual company view
  if (id) {
    if (companyLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Header user={user} />
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      );
    }

    if (!company) {
      return (
        <div className="min-h-screen bg-background">
          <Header user={user} />
          <div className="container py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-2">Company not found</h1>
              <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist.</p>
              <Button asChild>
                <Link to="/companies">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Companies
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        
        <main className="container py-8">
          {/* Company Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/companies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Link>
            </Button>
            
            <div className="flex items-start space-x-6">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{company.name}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                  {company.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {company.industry && (
                    <Badge variant="outline">{company.industry}</Badge>
                  )}
                  {company.size && (
                    <Badge variant="secondary">{company.size}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Company Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">
                Jobs ({companyJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {company.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Active Jobs</p>
                        <p className="text-2xl font-bold">{companyJobs.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Company Size</p>
                        <p className="text-2xl font-bold">{company.size || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Founded</p>
                        <p className="text-2xl font-bold">
                          {new Date(company.created_at).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Open Positions</h2>
                <p className="text-muted-foreground">
                  {companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {companyJobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {companyJobs.map((job) => (
                    <JobCard
                      key={job.id}
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No open positions
                  </h3>
                  <p className="text-muted-foreground">
                    This company doesn't have any active job postings at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Company listing view
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container py-8">
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Companies...</h2>
            <p className="text-muted-foreground">Setting up your company directory</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container py-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Building2 className="w-4 h-4 mr-2" />
            Explore Opportunities
          </Badge>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing
            <span className="text-gradient-hero block">Companies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore {companies.length} companies and find your next opportunity. 
            Connect with top employers and discover where your career can take you.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card-glass p-8 mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search companies, industries, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base input-modern"
              />
            </div>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full md:w-56 h-14 input-modern">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                {getUniqueValues("industry").map((industry) => (
                  <SelectItem key={industry as string} value={industry as string}>
                    {industry as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-full md:w-56 h-14 input-modern">
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sizes</SelectItem>
                {getUniqueValues("size").map((size) => (
                  <SelectItem key={size as string} value={size as string}>
                    {size as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-12 h-14 text-base input-modern"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setIndustryFilter("");
                setSizeFilter("");
                setLocationFilter("");
              }}
              className="h-14 px-8 hover:bg-accent/50"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-foreground">
              Companies
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredCompanies.length} of {companies.length}
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company, index) => (
            <div key={company.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <CompanyCard 
                company={{
                  ...company,
                  job_count: 0 // We'll fetch this separately if needed
                }} 
              />
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              No companies found
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Try adjusting your search filters or browse all companies to discover amazing opportunities.
            </p>
            <Button size="lg" asChild className="btn-hero">
              <Link to="/companies">
                <Building2 className="mr-3 h-5 w-5" />
                Browse All Companies
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Company;
