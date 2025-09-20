import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProfileForm } from "@/components/ProfileForm";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import { JobRecommendations } from "@/components/JobRecommendations";
import { SavedJobs } from "@/components/SavedJobs";
import { CompanyManagement } from "@/components/CompanyManagement";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User, Briefcase, Clock, CheckCircle, Building2 } from "lucide-react";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  cover_letter?: string;
  jobs: {
    id: string;
    title: string;
    company_id: string;
    location: string;
    employment_type: string;
    companies: {
      name: string;
      logo_url?: string;
    };
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience_level: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      const { data: applicationsData, error: appsError } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            id,
            title,
            company_id,
            location,
            employment_type,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("applied_at", { ascending: false });

      if (appsError) throw appsError;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      setApplications(applicationsData || []);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <User className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container py-8">
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Welcome back, 
              <span className="text-gradient-hero block">{profile?.full_name || "Job Seeker"}!</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your job applications, profile, and discover new opportunities
            </p>
          </div>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <ApplicationTracker userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <JobRecommendations userId={user?.id || ""} profile={profile} />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <SavedJobs userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileForm 
              userId={user?.id || ""} 
              onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
            />
            {/* <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your profile helps employers find you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <p className="text-muted-foreground">{profile?.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="text-muted-foreground">{profile?.email || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <p className="text-muted-foreground">{profile?.phone || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <p className="text-muted-foreground">{profile?.location || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Experience Level</label>
                    <p className="text-muted-foreground capitalize">
                      {profile?.experience_level?.replace('-', ' ') || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No skills added</p>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  Edit Profile
                </Button>
              </CardContent>
            </Card> */}
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <CompanyManagement userId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}