import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Bookmark, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

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

interface SavedJob {
  id: string;
  job_id: string;
  saved_at: string;
  jobs: Job;
}

interface SavedJobsProps {
  userId: string;
}

export const SavedJobs = ({ userId }: SavedJobsProps) => {
  const { toast } = useToast();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, [userId]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      
      // First, create the saved_jobs table if it doesn't exist
      await createSavedJobsTable();
      
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(`
          *,
          jobs (
            *,
            companies (
              id,
              name,
              logo_url,
              location
            )
          )
        `)
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });

      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch saved jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSavedJobsTable = async () => {
    try {
      // Check if table exists by trying to select from it
      const { error } = await supabase
        .from("saved_jobs")
        .select("id")
        .limit(1);

      // If table doesn't exist, create it
      if (error && error.code === "42P01") {
        const { error: createError } = await supabase.rpc('create_saved_jobs_table');
        if (createError) {
          console.log("Table creation handled by migration");
        }
      }
    } catch (error) {
      console.log("Saved jobs table handling:", error);
    }
  };

  const removeSavedJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", savedJobId);

      if (error) throw error;

      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));
      
      toast({
        title: "Success",
        description: "Job removed from saved list",
      });
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast({
        title: "Error",
        description: "Failed to remove saved job",
        variant: "destructive",
      });
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bookmark className="h-5 w-5" />
          <span>Saved Jobs</span>
        </CardTitle>
        <CardDescription>
          Jobs you've saved for later ({savedJobs.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {savedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No saved jobs yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Save jobs you're interested in to view them later
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {savedJobs.map((savedJob) => (
              <div key={savedJob.id} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSavedJob(savedJob.id)}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <JobCard
                  job={{
                    id: savedJob.jobs.id,
                    title: savedJob.jobs.title,
                    company: {
                      name: savedJob.jobs.companies.name,
                      logo_url: savedJob.jobs.companies.logo_url,
                      location: savedJob.jobs.companies.location,
                    },
                    location: savedJob.jobs.location,
                    employment_type: savedJob.jobs.employment_type,
                    experience_level: savedJob.jobs.experience_level,
                    salary_min: savedJob.jobs.salary_min,
                    salary_max: savedJob.jobs.salary_max,
                    skills_required: savedJob.jobs.skills_required,
                    is_remote: savedJob.jobs.is_remote,
                    created_at: savedJob.jobs.created_at,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};