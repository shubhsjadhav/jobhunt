import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Briefcase, 
  Calendar,
  TrendingUp,
  FileText,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

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
      logo_url?: string;
    };
  };
}

interface ApplicationTrackerProps {
  userId: string;
}

export const ApplicationTracker = ({ userId }: ApplicationTrackerProps) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            id,
            title,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq("user_id", userId)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(app => app.status === "pending").length || 0;
      const reviewed = data?.filter(app => app.status === "reviewed").length || 0;
      const accepted = data?.filter(app => app.status === "accepted").length || 0;
      const rejected = data?.filter(app => app.status === "rejected").length || 0;

      setStats({ total, pending, reviewed, accepted, rejected });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <Eye className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSuccessRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.accepted / stats.total) * 100);
  };

  const filterApplications = (status?: string) => {
    if (!status) return applications;
    return applications.filter(app => app.status === status);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Reviewed</p>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Accepted</p>
                <p className="text-2xl font-bold">{stats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{getSuccessRate()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate Progress */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Success Rate</CardTitle>
            <CardDescription>
              {stats.accepted} accepted out of {stats.total} applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getSuccessRate()} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>
            Track the status of your job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed ({stats.reviewed})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-6">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No applications yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start applying to jobs to see them here
                  </p>
                  <Button asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {application.jobs.companies.logo_url ? (
                              <img
                                src={application.jobs.companies.logo_url}
                                alt={`${application.jobs.companies.name} logo`}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{application.jobs.title}</h3>
                              <p className="text-muted-foreground">{application.jobs.companies.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Applied on {formatDate(application.applied_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusColor(application.status)} className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span className="capitalize">{application.status}</span>
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/jobs/${application.jobs.id}`}>
                                View Job
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {["pending", "reviewed", "accepted", "rejected"].map((status) => (
              <TabsContent key={status} value={status} className="space-y-4 mt-6">
                <div className="space-y-4">
                  {filterApplications(status).map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {application.jobs.companies.logo_url ? (
                              <img
                                src={application.jobs.companies.logo_url}
                                alt={`${application.jobs.companies.name} logo`}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{application.jobs.title}</h3>
                              <p className="text-muted-foreground">{application.jobs.companies.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Applied on {formatDate(application.applied_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusColor(application.status)} className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span className="capitalize">{application.status}</span>
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/jobs/${application.jobs.id}`}>
                                View Job
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};