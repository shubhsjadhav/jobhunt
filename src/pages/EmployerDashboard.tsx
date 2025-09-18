import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Plus, 
  Eye, 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Building2
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  is_remote: boolean;
  is_featured: boolean;
  status: string;
  view_count: number;
  created_at: string;
  hired_at?: string;
  hired_candidate?: string;
  application_count?: number;
}

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status: string;
  applied_at: string;
  job: {
    id: string;
    title: string;
  };
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [hiredCandidate, setHiredCandidate] = useState("");

  // Redirect if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  useEffect(() => {
    fetchEmployerData();
  }, [user]);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs posted by the current user
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch application counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);
          
          return { ...job, application_count: count || 0 };
        })
      );

      setJobs(jobsWithCounts);

      // Fetch applications for user's jobs
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("job_applications")
        .select(`
          *,
          job:jobs!inner(id, title, posted_by)
        `)
        .eq("job.posted_by", user.id)
        .order("applied_at", { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);

    } catch (error) {
      console.error("Error fetching employer data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsHired = async () => {
    if (!selectedJob || !hiredCandidate.trim()) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          status: "hired",
          hired_at: new Date().toISOString(),
          hired_candidate: hiredCandidate.trim(),
          is_active: false,
        })
        .eq("id", selectedJob.id);

      if (error) throw error;

      toast({
        title: "Job Marked as Hired",
        description: `${selectedJob.title} has been moved to hired jobs.`,
      });

      setHireDialogOpen(false);
      setSelectedJob(null);
      setHiredCandidate("");
      fetchEmployerData();
    } catch (error) {
      console.error("Error marking job as hired:", error);
      toast({
        title: "Error",
        description: "Failed to mark job as hired",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Job Deleted",
        description: `${jobTitle} has been deleted successfully.`,
      });

      fetchEmployerData();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
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

  const activeJobs = jobs.filter(job => job.status === "active");
  const hiredJobs = jobs.filter(job => job.status === "hired");
  const totalViews = jobs.reduce((sum, job) => sum + (job.view_count || 0), 0);
  const totalApplications = applications.length;

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
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                Employer Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your job postings and track applications
              </p>
            </div>
            <Button asChild className="btn-hero">
              <Link to="/post-job">
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{activeJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hired</p>
                    <p className="text-2xl font-bold">{hiredJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="active-jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active-jobs">Active Jobs ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({totalApplications})</TabsTrigger>
            <TabsTrigger value="hired-jobs">Hired ({hiredJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active-jobs" className="space-y-6">
            {activeJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No active jobs
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by posting your first job to attract candidates
                  </p>
                  <Button asChild className="btn-hero">
                    <Link to="/post-job">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="card-modern hover-lift">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          {job.company_logo ? (
                            <img
                              src={job.company_logo}
                              alt={\`${job.company_name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <CardDescription>{job.company_name}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {job.is_featured && (
                            <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant={job.is_remote ? "secondary" : "outline"}>
                            {job.is_remote ? "Remote" : "On-site"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{job.view_count || 0} views</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{job.application_count || 0} applications</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {getTimeAgo(job.created_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/jobs/${job.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJob(job);
                              setHireDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Hired
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id, job.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No applications yet
                  </h3>
                  <p className="text-muted-foreground">
                    Applications will appear here when candidates apply to your jobs
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <Card key={application.id} className="card-modern">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{application.applicant_name}</h3>
                          <p className="text-muted-foreground">{application.applicant_email}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied for: <Link to={`/jobs/${application.job.id}`} className="text-primary hover:underline">
                              {application.job.title}
                            </Link>
                          </p>
                          {application.cover_letter && (
                            <p className="text-sm text-muted-foreground mt-2">
                              "{application.cover_letter.substring(0, 150)}..."
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <Badge variant="outline">{application.status}</Badge>
                          <p className="text-sm text-muted-foreground">
                            {getTimeAgo(application.applied_at)}
                          </p>
                          {application.resume_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                                View Resume
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hired-jobs" className="space-y-6">
            {hiredJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No hired positions yet
                  </h3>
                  <p className="text-muted-foreground">
                    Jobs marked as hired will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {hiredJobs.map((job) => (
                  <Card key={job.id} className="card-modern">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-xl">{job.title}</h3>
                          <p className="text-muted-foreground">{job.company_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{job.location}</span>
                            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                          </div>
                          {job.hired_candidate && (
                            <p className="text-sm">
                              <span className="font-medium">Hired:</span> {job.hired_candidate}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Hired
                          </Badge>
                          {job.hired_at && (
                            <p className="text-sm text-muted-foreground">
                              {getTimeAgo(job.hired_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Mark as Hired Dialog */}
        <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Job as Hired</DialogTitle>
              <DialogDescription>
                Mark "{selectedJob?.title}" as hired and move it to your hired jobs list.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hired_candidate">Hired Candidate (Optional)</Label>
                <Input
                  id="hired_candidate"
                  value={hiredCandidate}
                  onChange={(e) => setHiredCandidate(e.target.value)}
                  placeholder="Enter candidate name or email"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHireDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAsHired}>
                Mark as Hired
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
}