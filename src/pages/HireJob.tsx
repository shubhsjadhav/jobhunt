import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, PlusCircle, Users, Search, Sparkles, Edit, Trash2, Eye } from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_min?: number;
  salary_max?: number;
  location: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  is_remote: boolean;
  is_active: boolean;
  created_at: string;
  companies: Company;
}

interface JobFormData {
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_min: string;
  salary_max: string;
  location: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  is_remote: boolean;
}

export default function HireJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  const [jobFormData, setJobFormData] = useState<JobFormData>({
    company_id: "",
    title: "",
    description: "",
    requirements: [],
    benefits: [],
    salary_min: "",
    salary_max: "",
    location: "",
    employment_type: "full-time",
    experience_level: "mid-level",
    skills_required: [],
    is_remote: false,
  });

  const [requirementInput, setRequirementInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchExperience, setSearchExperience] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCompanies(), fetchJobs()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            description,
            logo_url,
            location,
            industry,
            size,
            website
          )
        `)
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
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobFormData.company_id) {
      toast({
        title: "Error",
        description: "Please select a company",
        variant: "destructive",
      });
      return;
    }

    try {
      const jobData = {
        company_id: jobFormData.company_id,
        title: jobFormData.title,
        description: jobFormData.description,
        requirements: jobFormData.requirements,
        benefits: jobFormData.benefits,
        salary_min: jobFormData.salary_min ? parseInt(jobFormData.salary_min) : null,
        salary_max: jobFormData.salary_max ? parseInt(jobFormData.salary_max) : null,
        location: jobFormData.location,
        employment_type: jobFormData.employment_type,
        experience_level: jobFormData.experience_level,
        skills_required: jobFormData.skills_required,
        is_remote: jobFormData.is_remote,
        is_active: true,
      };

      if (editingJob) {
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", editingJob.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(jobData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job posted successfully",
        });
      }

      setIsJobDialogOpen(false);
      setEditingJob(null);
      resetJobForm();
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobFormData({
      company_id: job.companies.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      salary_min: job.salary_min?.toString() || "",
      salary_max: job.salary_max?.toString() || "",
      location: job.location,
      employment_type: job.employment_type,
      experience_level: job.experience_level,
      skills_required: job.skills_required || [],
      is_remote: job.is_remote,
    });
    setIsJobDialogOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully",
      });

      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const resetJobForm = () => {
    setJobFormData({
      company_id: "",
      title: "",
      description: "",
      requirements: [],
      benefits: [],
      salary_min: "",
      salary_max: "",
      location: "",
      employment_type: "full-time",
      experience_level: "mid-level",
      skills_required: [],
      is_remote: false,
    });
    setRequirementInput("");
    setBenefitInput("");
    setSkillInput("");
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !jobFormData.requirements.includes(requirementInput.trim())) {
      setJobFormData({
        ...jobFormData,
        requirements: [...jobFormData.requirements, requirementInput.trim()]
      });
      setRequirementInput("");
    }
  };

  const removeRequirement = (requirement: string) => {
    setJobFormData({
      ...jobFormData,
      requirements: jobFormData.requirements.filter(r => r !== requirement)
    });
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !jobFormData.benefits.includes(benefitInput.trim())) {
      setJobFormData({
        ...jobFormData,
        benefits: [...jobFormData.benefits, benefitInput.trim()]
      });
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setJobFormData({
      ...jobFormData,
      benefits: jobFormData.benefits.filter(b => b !== benefit)
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !jobFormData.skills_required.includes(skillInput.trim())) {
      setJobFormData({
        ...jobFormData,
        skills_required: [...jobFormData.skills_required, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setJobFormData({
      ...jobFormData,
      skills_required: jobFormData.skills_required.filter(s => s !== skill)
    });
  };

  const openCreateJobDialog = () => {
    setEditingJob(null);
    resetJobForm();
    setIsJobDialogOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesQuery = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companies.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !searchLocation || 
      job.location.toLowerCase().includes(searchLocation.toLowerCase());
    
    const matchesExperience = !searchExperience || 
      job.experience_level === searchExperience;

    return matchesQuery && matchesLocation && matchesExperience;
  });

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

      {/* Hero Section */}
      <section className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="container py-12 md:py-16 grid gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Hire smarter with JobHunt Connect
            </div>
            <h1 className="mt-3 text-2xl md:text-4xl font-bold">Find and hire top talent fast</h1>
            <p className="text-muted-foreground mt-2">Post jobs, manage applications, and search candidates — your complete hiring solution.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="btn-hero" onClick={openCreateJobDialog}>
                <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
              </Button>
              <Button variant="outline">Talk to sales</Button>
            </div>
          </div>

          {/* Candidate Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <Label htmlFor="search-query" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-query" 
                  placeholder="Job title, company, or keywords" 
                  className="pl-9" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <Label htmlFor="search-location" className="sr-only">Location</Label>
              <Input 
                id="search-location" 
                placeholder="Location" 
                value={searchLocation} 
                onChange={(e) => setSearchLocation(e.target.value)} 
              />
            </div>
            <div className="md:col-span-2">
              <Select value={searchExperience} onValueChange={setSearchExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid-level">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Button className="w-full h-10">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Management Section */}
      <section className="container py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Your Job Postings</h2>
            <p className="text-muted-foreground">Manage your active job listings</p>
          </div>
          <Button onClick={openCreateJobDialog} className="btn-hero">
            <PlusCircle className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No jobs found
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0 
                  ? "Create your first job posting to start hiring" 
                  : "Try adjusting your search filters"
                }
              </p>
              <Button onClick={openCreateJobDialog} className="btn-hero">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {job.companies.logo_url ? (
                        <img
                          src={job.companies.logo_url}
                          alt={`${job.companies.name} logo`}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>{job.companies.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{job.location}</span>
                      {job.is_remote && <Badge variant="secondary">Remote</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.skills_required?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills_required?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills_required.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Job Creation/Edit Dialog */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job" : "Post New Job"}
            </DialogTitle>
            <DialogDescription>
              {editingJob 
                ? "Update your job posting details" 
                : "Create a new job posting to attract top talent"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJobSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select 
                  value={jobFormData.company_id} 
                  onValueChange={(value) => setJobFormData({ ...jobFormData, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={jobFormData.description}
                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={jobFormData.location}
                  onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Remote Work</Label>
                <Select 
                  value={jobFormData.is_remote.toString()} 
                  onValueChange={(value) => setJobFormData({ ...jobFormData, is_remote: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">On-site</SelectItem>
                    <SelectItem value="true">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select 
                  value={jobFormData.employment_type} 
                  onValueChange={(value) => setJobFormData({ ...jobFormData, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select 
                  value={jobFormData.experience_level} 
                  onValueChange={(value) => setJobFormData({ ...jobFormData, experience_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid-level">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-range">Salary Range</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={jobFormData.salary_min}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary_min: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={jobFormData.salary_max}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary_max: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a requirement"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobFormData.requirements.map((requirement) => (
                  <Badge
                    key={requirement}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeRequirement(requirement)}
                  >
                    {requirement} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label>Benefits</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a benefit"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobFormData.benefits.map((benefit) => (
                  <Badge
                    key={benefit}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeBenefit(benefit)}
                  >
                    {benefit} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobFormData.skills_required.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-hero">
                {editingJob ? "Update Job" : "Post Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer-like CTA */}
      <section className="border-t bg-background">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
            <div>
              <div className="font-semibold">Ready to hire?</div>
              <p className="text-sm text-muted-foreground">Create your first job posting now.</p>
            </div>
          </div>
          <Button className="btn-hero" onClick={openCreateJobDialog}>
            <PlusCircle className="h-4 w-4 mr-2" /> Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}