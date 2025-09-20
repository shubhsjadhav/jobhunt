import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Target, Zap } from "lucide-react";
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

interface Profile {
  skills: string[];
  experience_level: string;
  location?: string;
}

interface JobRecommendationsProps {
  userId: string;
  profile?: Profile;
}

export const JobRecommendations = ({ userId, profile }: JobRecommendationsProps) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (profile) {
      fetchRecommendations();
    }
  }, [userId, profile]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Fetch all active jobs
      const { data: jobs, error } = await supabase
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

      if (!jobs || !profile) {
        setRecommendations([]);
        return;
      }

      // Calculate match scores and filter recommendations
      const scoredJobs = jobs.map(job => ({
        job,
        score: calculateMatchScore(job, profile)
      }));

      // Sort by match score and take top recommendations
      const topRecommendations = scoredJobs
        .filter(({ score }) => score > 0.3) // Only show jobs with decent match
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(({ job, score }) => {
          setMatchScores(prev => ({ ...prev, [job.id]: score }));
          return job;
        });

      setRecommendations(topRecommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch job recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (job: Job, userProfile: Profile): number => {
    let score = 0;
    let factors = 0;

    // Skills match (40% weight)
    if (job.skills_required && userProfile.skills) {
      const jobSkills = job.skills_required.map(s => s.toLowerCase());
      const userSkills = userProfile.skills.map(s => s.toLowerCase());
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      const skillsScore = matchingSkills.length / Math.max(jobSkills.length, 1);
      score += skillsScore * 0.4;
      factors += 0.4;
    }

    // Experience level match (30% weight)
    if (job.experience_level && userProfile.experience_level) {
      const experienceLevels = ["entry", "mid-level", "senior", "executive"];
      const jobLevel = experienceLevels.indexOf(job.experience_level);
      const userLevel = experienceLevels.indexOf(userProfile.experience_level);
      
      if (jobLevel !== -1 && userLevel !== -1) {
        // Perfect match gets full score, adjacent levels get partial score
        const levelDiff = Math.abs(jobLevel - userLevel);
        const experienceScore = Math.max(0, 1 - (levelDiff * 0.3));
        score += experienceScore * 0.3;
        factors += 0.3;
      }
    }

    // Location preference (20% weight)
    if (job.location && userProfile.location) {
      const jobLocation = job.location.toLowerCase();
      const userLocation = userProfile.location.toLowerCase();
      
      if (job.is_remote) {
        score += 0.2; // Remote jobs always match location preference
      } else if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
        score += 0.2;
      }
      factors += 0.2;
    }

    // Recency bonus (10% weight)
    const jobDate = new Date(job.created_at);
    const daysSincePosted = (Date.now() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSincePosted / 30)); // Decay over 30 days
    score += recencyScore * 0.1;
    factors += 0.1;

    return factors > 0 ? score / factors : 0;
  };

  const getMatchPercentage = (jobId: string): number => {
    return Math.round((matchScores[jobId] || 0) * 100);
  };

  const getMatchLabel = (percentage: number): string => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Potential Match";
  };

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Job Recommendations</span>
          </CardTitle>
          <CardDescription>
            Complete your profile to get personalized job recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Add your skills and experience to see jobs that match your profile
          </p>
          <Button asChild>
            <Link to="/dashboard?tab=profile">Complete Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Job Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recommended for You</span>
          </CardTitle>
          <CardDescription>
            Jobs that match your skills and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No recommendations yet
              </h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find jobs that match your current profile. Try updating your skills or location.
              </p>
              <Button asChild variant="outline">
                <Link to="/jobs">Browse All Jobs</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((job) => (
                <div key={job.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge 
                      variant="secondary" 
                      className={`${getMatchColor(getMatchPercentage(job.id))} bg-white border shadow-sm`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {getMatchPercentage(job.id)}% match
                    </Badge>
                  </div>
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
          )}
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/jobs">
              View All Jobs
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};