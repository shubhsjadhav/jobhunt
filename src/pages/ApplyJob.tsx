import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Briefcase, Clock, DollarSign, Users, ExternalLink, Heart, Filter } from "lucide-react";

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

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: string;
}

export default function ApplyJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Search and filter states
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [experience, setExperience] = useState<string | undefined>(undefined);
  const [employmentType, setEmploymentType] = useState<string | undefined>(undefined);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [jobs, keyword, location, category, experience, employmentType, remoteOnly, salaryMin]);

  useEffect(() => {
    // Update URL params when search changes
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("location", location);
    setSearchParams(params);
  }, [keyword, location, setSearchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Keyword search
    if (keyword.trim()) {
      const query = keyword.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.companies.name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.skills_required?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (location.trim()) {
      const locationQuery = location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationQuery) ||
        job.companies.location.toLowerCase().includes(locationQuery)
      );
    }

    // Category filter (based on job title)
    if (category) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Experience level filter
    if (experience) {
      filtered = filtered.filter(job => job.experience_level === experience);
    }

    // Employment type filter
    if (employmentType) {
      filtered = filtered.filter(job => job.employment_type === employmentType);
    }

    // Remote only filter
    if (remoteOnly) {
      filtered = filtered.filter(job => job.is_remote);
    }

    // Salary filter
    if (salaryMin) {
      const minSalary = parseInt(salaryMin);
      filtered = filtered.filter(job => 
        job.salary_min && job.salary_min >= minSalary
      );
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if already applied
    const hasApplied = applications.some(app => app.job_id === jobId);
    if (hasApplied) {
      toast({
        title: "Already Applied",
        description: "You have already applied to this job",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          user_id: user.id,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your application has been sent successfully",
      });

      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error("Error applying to job:", error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast({
        title: "Job Unsaved",
        description: "Job removed from saved list",
      });
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast({
        title: "Job Saved",
        description: "Job added to your saved list",
      });
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
    )
  }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return \`${Math.floor(diffInDays / 7)} weeks ago`;
    return \`${Math.floor(diffInDays / 30)} months ago`;
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.job_id === jobId);
  };

  const clearFilters = () => {
    setKeyword("");
    setLocation("");
    setCategory(undefined);
    setExperience(undefined);
    setEmploymentType(undefined);
    setRemoteOnly(false);
    setSalaryMin("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header user={user} />

      {/* Hero Search */}
      <section className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="container py-10 md:py-14">
          <div className="max-w-4xl mx-auto text-center mb-6 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Find your dream job</h1>
            <p className="text-muted-foreground mt-2">Search through {jobs.length} job opportunities from top companies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <Label htmlFor="keyword" className="sr-only">Job title or skills</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="keyword" 
                  placeholder="Job title, skills, company" 
                  className="pl-9" 
                  value={keyword} 
                  onChange={(e) => setKeyword(e.target.value)} 
                />
              </div>
            </div>
            <div className="md:col-span-5">
              <Label htmlFor="location" className="sr-only">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="location" 
                  placeholder="Location" 
                  className="pl-9" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button className="w-full h-10 md:h-10">Search</Button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-card rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="full stack">Full Stack</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid-level">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employment Type</Label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Min Salary</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remote" 
                    checked={remoteOnly} 
                    onCheckedChange={(checked) => setRemoteOnly(Boolean(checked))} 
                  />
                  <Label htmlFor="remote">Remote only</Label>
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="container py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {filteredJobs.length === jobs.length ? "All Jobs" : "Search Results"}
            </h2>
            <p className="text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No jobs found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all available positions.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {job.companies.logo_url ? (
                          <img
                            src={job.companies.logo_url}
                            alt={\`${job.companies.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                              {job.title}
                            </h3>
                            {job.is_remote && (
                              <Badge variant="secondary">Remote</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {job.companies.name} • {job.location}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span className="capitalize">{job.employment_type.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="capitalize">{job.experience_level.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                            </div>
                            <span>{getTimeAgo(job.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.skills_required?.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills_required?.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills_required.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveJob(job.id)}
                        className={savedJobs.includes(job.id) ? "text-red-500" : ""}
                      >
                        <Heart className={\`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApply(job.id)}
                        disabled={hasApplied(job.id)}
                        className={hasApplied(job.id) ? "" : "btn-hero"}
                      >
                        {hasApplied(job.id) ? "Applied" : "Apply"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
}