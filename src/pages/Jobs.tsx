import { useState, useEffect } from "react";
import { EnhancedSearchFilters, SearchFilters as SearchFiltersType } from "@/components/EnhancedSearchFilters";
import { EnhancedJobCard } from "@/components/EnhancedJobCard";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  skills_required: string[];
  is_remote: boolean;
  is_featured: boolean;
  view_count?: number;
  created_at: string;
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
    salaryMin: 0,
    salaryMax: 200000,
    skills: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 12;

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters, currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log("Fetching jobs...");
      
      // Use the search function for better performance and ranking
      const { data, error } = await supabase.rpc('search_jobs', {
        search_query: null,
        location_filter: null,
        employment_type_filter: null,
        experience_level_filter: null,
        salary_min_filter: null,
        salary_max_filter: null,
        is_remote_filter: null,
        limit_count: 100,
        offset_count: 0
      });

      if (error) throw error;
      console.log("Jobs data:", data);
      setJobs(data || []);
      setTotalJobs(data?.length || 0);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Fallback to regular query if RPC fails
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .eq("status", "active")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
        setTotalJobs(data?.length || 0);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (searchFilters: SearchFiltersType) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('search_jobs', {
        search_query: searchFilters.query || null,
        location_filter: searchFilters.location || null,
        employment_type_filter: searchFilters.employmentType || null,
        experience_level_filter: searchFilters.experienceLevel || null,
        salary_min_filter: searchFilters.salaryMin > 0 ? searchFilters.salaryMin : null,
        salary_max_filter: searchFilters.salaryMax < 200000 ? searchFilters.salaryMax : null,
        is_remote_filter: searchFilters.isRemote,
        limit_count: jobsPerPage,
        offset_count: (currentPage - 1) * jobsPerPage
      });

      if (error) throw error;
      setFilteredJobs(data || []);
      setTotalJobs(data?.length || 0);
    } catch (error) {
      console.error("Error searching jobs:", error);
      // Fallback to client-side filtering
      applyFilters();
    } finally {
      setLoading(false);
    }
  };
        .eq("is_active", true)
        .order("created_at", { ascending: false });


  const applyFilters = () => {
    let filtered = [...jobs];

    // Query filter (title, company name, description)
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name.toLowerCase().includes(query) ||
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

    // Salary filter
    if (filters.salaryMin > 0) {
      filtered = filtered.filter((job) => 
        job.salary_max ? job.salary_max >= filters.salaryMin : true
      );
    }
    
    if (filters.salaryMax < 200000) {
      filtered = filtered.filter((job) => 
        job.salary_min ? job.salary_min <= filters.salaryMax : true
      );
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
    setCurrentPage(1);
    
    // Use server-side search if available
    if (newFilters.query || newFilters.location || newFilters.employmentType || 
        newFilters.experienceLevel || newFilters.isRemote !== null ||
        newFilters.salaryMin > 0 || newFilters.salaryMax < 200000 ||
        newFilters.skills.length > 0) {
      searchJobs(newFilters);
    } else {
      applyFilters();
    }
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
            Discover {totalJobs} job opportunities from top companies
          </p>
        </div>

        <EnhancedSearchFilters
          onFiltersChange={handleFiltersChange}
          className="mb-8"
        />

        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredJobs.length} of {totalJobs} jobs
          </p>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sorted by relevance</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <EnhancedJobCard
              key={job.id}
              job={job}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalJobs > jobsPerPage && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalJobs / jobsPerPage)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalJobs / jobsPerPage)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

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