import { useState, useEffect } from "react";
import { SearchFilters, SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { JobCard } from "@/components/JobCard";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Briefcase, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
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
  }, [jobs, filters, sortBy]);

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

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "salary-high":
        filtered.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      case "salary-low":
        filtered.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredJobs(filtered);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header user={user} />
        <div className="container py-8">
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Jobs...</h2>
            <p className="text-gray-600">Finding the best opportunities for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header user={user} />
      
      <main className="container py-8">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-6 px-6 py-3 bg-blue-50 text-blue-700 border-blue-200">
            <Briefcase className="w-4 h-4 mr-2" />
            Career Opportunities
          </Badge>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream
            <span className="text-gradient-hero block">Job Today</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover {jobs.length} job opportunities from top companies. 
            Your next career move is just a click away.
          </p>
        </div>

        {/* Filters Toggle for Mobile */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-professional"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 input-professional">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className={`mb-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <SearchFilters
            onFiltersChange={handleFiltersChange}
            className="card-professional shadow-professional"
          />
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Positions
            </h2>
            <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
              {filteredJobs.length} of {jobs.length} jobs
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, index) => (
            <div key={job.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
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

        {filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Briefcase className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No jobs found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search filters to find more opportunities, or browse all available positions.
            </p>
            <Button 
              onClick={() => {
                setFilters({
                  query: "",
                  location: "",
                  employmentType: "",
                  experienceLevel: "",
                  isRemote: null,
                  skills: [],
                });
              }}
              className="btn-hero"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}