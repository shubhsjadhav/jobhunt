import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase, 
  CheckCircle, 
  ArrowLeft,
  ExternalLink,
  Heart,
  Share2
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
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
    description?: string;
    website?: string;
    logo_url?: string;
    location: string;
    industry?: string;
    size?: string;
  };
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      if (user) {
        checkApplicationStatus();
      }
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            description,
            website,
            logo_url,
            location,
            industry,
            size
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("user_id", user.id)
        .single();

      if (data) {
        setHasApplied(true);
      }
    } catch (error) {
      // No application found, which is fine
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: id,
          user_id: user.id,
          cover_letter: coverLetter.trim() || null,
          status: "pending",
        });

      if (error) throw error;

      setHasApplied(true);
      setShowApplicationDialog(false);
      setCoverLetter("");
      
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Job not found</h1>
          <Button onClick={() => navigate("/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/jobs")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {job.companies.logo_url ? (
                      <img
                        src={job.companies.logo_url}
                        alt={`${job.companies.name} logo`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl">{job.title}</CardTitle>
                      <CardDescription className="text-lg">{job.companies.name}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{job.employment_type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                  <Badge variant={job.is_remote ? "secondary" : "outline"}>
                    {job.is_remote ? "Remote" : "On-site"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card>
              <CardContent className="pt-6">
                {hasApplied ? (
                  <Button disabled className="w-full" variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Already Applied
                  </Button>
                ) : (
                  <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="hero" size="lg">
                        Apply for this Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application to {job.companies.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                          <Textarea
                            id="cover-letter"
                            placeholder="Tell the employer why you're a great fit for this role..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={5}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleApply}
                            disabled={applying}
                            className="flex-1"
                            variant="hero"
                          >
                            {applying ? "Submitting..." : "Submit Application"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowApplicationDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.companies.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.companies.description && (
                  <p className="text-sm text-muted-foreground">
                    {job.companies.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {job.companies.industry && (
                    <div>
                      <span className="font-medium">Industry:</span>
                      <span className="ml-2 text-muted-foreground">{job.companies.industry}</span>
                    </div>
                  )}
                  {job.companies.size && (
                    <div>
                      <span className="font-medium">Company Size:</span>
                      <span className="ml-2 text-muted-foreground">{job.companies.size} employees</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Location:</span>
                    <span className="ml-2 text-muted-foreground">{job.companies.location}</span>
                  </div>
                </div>

                {job.companies.website && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={job.companies.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Company Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Job Meta */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Experience Level:</span>
                  <span className="ml-2 text-muted-foreground capitalize">
                    {job.experience_level.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Posted:</span>
                  <span className="ml-2 text-muted-foreground">{getTimeAgo(job.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}