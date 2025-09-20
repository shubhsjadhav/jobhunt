import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, CheckCircle, XCircle, Plus, Users, Briefcase, Building2, Loader2 } from "lucide-react";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  cover_letter?: string;
  jobs: {
    id: string;
    title: string;
    companies: {
      name: string;
    };
  };
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface Company {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    company_id: "",
    location: "",
    employment_type: "full-time",
    experience_level: "mid-level",
    salary_min: "",
    salary_max: "",
    skills_required: "",
    requirements: "",
    benefits: "",
    is_remote: false,
  });

  // Check admin authentication
  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) {
      navigate("/admin/auth");
      return;
    }
    
    fetchApplications();
    fetchCompanies();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            id,
            title,
            companies (
              name
            )
          ),
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application ${status} successfully`,
      });

      fetchApplications();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const skillsArray = jobFormData.skills_required
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const requirementsArray = jobFormData.requirements
        .split("\n")
        .map(req => req.trim())
        .filter(req => req.length > 0);

      const benefitsArray = jobFormData.benefits
        .split("\n")
        .map(benefit => benefit.trim())
        .filter(benefit => benefit.length > 0);

      const { error } = await supabase
        .from("jobs")
        .insert({
          title: jobFormData.title,
          description: jobFormData.description,
          company_id: jobFormData.company_id,
          location: jobFormData.location,
          employment_type: jobFormData.employment_type,
          experience_level: jobFormData.experience_level,
          salary_min: jobFormData.salary_min ? parseInt(jobFormData.salary_min) : null,
          salary_max: jobFormData.salary_max ? parseInt(jobFormData.salary_max) : null,
          skills_required: skillsArray,
          requirements: requirementsArray,
          benefits: benefitsArray,
          is_remote: jobFormData.is_remote,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Job Posted",
        description: "New job has been posted successfully",
      });

      setIsJobDialogOpen(false);
      setJobFormData({
        title: "",
        description: "",
        company_id: "",
        location: "",
        employment_type: "full-time",
        experience_level: "mid-level",
        salary_min: "",
        salary_max: "",
        skills_required: "",
        requirements: "",
        benefits: "",
        is_remote: false,
      });
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: "Failed to post job",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "reviewed":
        return "secondary";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Admin Panel...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary to-secondary p-2.5 rounded-xl">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-heading font-bold text-xl text-gradient-hero">Admin Panel</span>
              <span className="text-xs text-muted-foreground block -mt-1">JobHunt Management</span>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage job applications and post new opportunities
          </p>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">
              <Users className="h-4 w-4 mr-2" />
              Job Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="post-job">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>
                  Review and manage job applications from candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No applications yet
                    </h3>
                    <p className="text-muted-foreground">
                      Applications will appear here when candidates apply for jobs
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{application.profiles?.full_name}</div>
                                <div className="text-sm text-muted-foreground">{application.profiles?.email}</div>
                                {application.profiles?.phone && (
                                  <div className="text-sm text-muted-foreground">{application.profiles.phone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {application.jobs?.title}
                            </TableCell>
                            <TableCell>
                              {application.jobs?.companies?.name}
                            </TableCell>
                            <TableCell>
                              {new Date(application.applied_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(application.status)}>
                                {application.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {application.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApplicationStatus(application.id, "accepted")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleApplicationStatus(application.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Decline
                                    </Button>
                                  </>
                                )}
                                {application.status !== "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplicationStatus(application.id, "pending")}
                                  >
                                    Reset to Pending
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post-job" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post New Job</CardTitle>
                <CardDescription>
                  Create a new job posting for candidates to apply
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Select
                        value={jobFormData.company_id}
                        onValueChange={(value) => setJobFormData({ ...jobFormData, company_id: value })}
                        required
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label htmlFor="employment_type">Employment Type</Label>
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
                      <Label htmlFor="experience_level">Experience Level</Label>
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
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Minimum Salary</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={jobFormData.salary_min}
                        onChange={(e) => setJobFormData({ ...jobFormData, salary_min: e.target.value })}
                        placeholder="e.g., 80000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Maximum Salary</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={jobFormData.salary_max}
                        onChange={(e) => setJobFormData({ ...jobFormData, salary_max: e.target.value })}
                        placeholder="e.g., 120000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills_required">Required Skills</Label>
                    <Input
                      id="skills_required"
                      value={jobFormData.skills_required}
                      onChange={(e) => setJobFormData({ ...jobFormData, skills_required: e.target.value })}
                      placeholder="e.g., React, TypeScript, Node.js (comma separated)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={jobFormData.requirements}
                      onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                      placeholder="List job requirements (one per line)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits</Label>
                    <Textarea
                      id="benefits"
                      value={jobFormData.benefits}
                      onChange={(e) => setJobFormData({ ...jobFormData, benefits: e.target.value })}
                      placeholder="List job benefits (one per line)"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_remote"
                      checked={jobFormData.is_remote}
                      onChange={(e) => setJobFormData({ ...jobFormData, is_remote: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_remote">Remote work available</Label>
                  </div>

                  <Button type="submit" className="w-full btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}