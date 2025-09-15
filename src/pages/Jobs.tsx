import { useState, useEffect } from "react";
import { SearchFilters, SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { JobCard } from "@/components/JobCard";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    isRemote: null,
    skills: [],
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log("Fetching jobs...");
      
      // First, let's add some sample data if none exists
      const { data: existingJobs } = await supabase
        .from("jobs")
        .select("id")
        .limit(1);
      
      if (!existingJobs || existingJobs.length === 0) {
        console.log("No jobs found, adding sample data...");
        await addSampleJobs();
      }
      
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
      console.log("Jobs data:", data);
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleJobs = async () => {
    try {
      // First get companies to link jobs to them
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name")
        .limit(5);
      
      if (!companies || companies.length === 0) {
        console.log("No companies found, cannot add jobs");
        return;
      }

      const { error } = await supabase
        .from("jobs")
        .insert([
          {
            company_id: companies[0].id,
            title: "Senior Frontend Developer",
            description: "Join our dynamic team to build cutting-edge web applications using modern technologies. You will work on challenging projects that impact millions of users worldwide.",
            requirements: ["5+ years React experience", "TypeScript proficiency", "Modern CSS frameworks", "Git version control"],
            benefits: ["Health insurance", "Remote work options", "401k matching", "Professional development budget"],
            salary_min: 90000,
            salary_max: 130000,
            location: "San Francisco, CA",
            employment_type: "full-time",
            experience_level: "senior",
            skills_required: ["React", "TypeScript", "CSS", "JavaScript"],
            is_remote: true,
            is_active: true
          },
          {
            company_id: companies[1]?.id || companies[0].id,
            title: "Marketing Manager",
            description: "Lead our marketing initiatives to promote sustainable energy solutions. Drive campaigns that make a real environmental impact.",
            requirements: ["3+ years marketing experience", "Digital marketing expertise", "Campaign management", "Analytics tools"],
            benefits: ["Health insurance", "Flexible hours", "Stock options", "Green commute benefits"],
            salary_min: 65000,
            salary_max: 85000,
            location: "Austin, TX",
            employment_type: "full-time",
            experience_level: "mid-level",
            skills_required: ["Marketing", "Digital Marketing", "Analytics"],
            is_remote: false,
            is_active: true
          },
          {
            company_id: companies[2]?.id || companies[0].id,
            title: "Data Scientist",
            description: "Analyze financial data to drive investment decisions and risk assessment. Work with large datasets and cutting-edge ML models.",
            requirements: ["Masters in Data Science or related field", "Python/R proficiency", "Machine learning experience", "Financial domain knowledge"],
            benefits: ["Competitive salary", "Bonus structure", "Health insurance", "Learning stipend"],
            salary_min: 100000,
            salary_max: 150000,
            location: "New York, NY",
            employment_type: "full-time",
            experience_level: "senior",
            skills_required: ["Python", "Machine Learning", "SQL", "Statistics"],
            is_remote: false,
            is_active: true
          },
          {
            company_id: companies[3]?.id || companies[0].id,
            title: "UX Designer",
            description: "Design intuitive healthcare applications that improve patient outcomes. Collaborate with medical professionals and developers.",
            requirements: ["3+ years UX design experience", "Healthcare domain knowledge preferred", "Figma/Sketch proficiency", "User research skills"],
            benefits: ["Health insurance", "Remote work", "Design conference budget", "Wellness programs"],
            salary_min: 70000,
            salary_max: 95000,
            location: "Boston, MA",
            employment_type: "full-time",
            experience_level: "mid-level",
            skills_required: ["UX Design", "Figma", "User Research"],
            is_remote: true,
            is_active: true
          },
          {
            company_id: companies[4]?.id || companies[0].id,
            title: "Junior Backend Developer",
            description: "Start your career building scalable backend systems for data processing and analytics platforms.",
            requirements: ["Computer Science degree or bootcamp", "Basic programming skills", "Database knowledge", "Eagerness to learn"],
            benefits: ["Mentorship program", "Health insurance", "Flexible hours", "Learning budget"],
            salary_min: 55000,
            salary_max: 75000,
            location: "Seattle, WA",
            employment_type: "full-time",
            experience_level: "entry",
            skills_required: ["Python", "SQL", "APIs"],
            is_remote: false,
            is_active: true
          }
        ]);
      
      if (error) throw error;
      console.log("Sample jobs added successfully");
    } catch (error) {
      console.error("Error adding sample jobs:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Query filter (title, company name, description)
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.companies.name.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(location)
      );
    }

    // Employment type filter
    if (filters.employmentType) {
      filtered = filtered.filter(
        (job) => job.employment_type === filters.employmentType
      );
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter(
        (job) => job.experience_level === filters.experienceLevel
      );
    }

    // Remote work filter
    if (filters.isRemote !== null) {
      filtered = filtered.filter((job) => job.is_remote === filters.isRemote);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter((job) =>
        filters.skills.some((skill) =>
          job.skills_required.some((jobSkill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFilteredJobs(filtered);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container py-8">
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Jobs...</h2>
            <p className="text-muted-foreground">Finding the best opportunities for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-muted-foreground">
            Discover {jobs.length} job opportunities from top companies
          </p>
        </div>

        <SearchFilters
          onFiltersChange={handleFiltersChange}
          className="mb-8"
        />

        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
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

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters to find more opportunities.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}