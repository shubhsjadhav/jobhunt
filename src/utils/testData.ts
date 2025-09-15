import { supabase } from "@/integrations/supabase/client";

export const addSampleData = async () => {
  try {
    // Add sample companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .insert([
        {
          name: "TechCorp Solutions",
          description: "Leading technology consulting firm specializing in digital transformation",
          website: "https://techcorp.com",
          location: "San Francisco, CA",
          industry: "Technology",
          size: "500-1000",
          logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
        },
        {
          name: "GreenEnergy Inc",
          description: "Renewable energy company focused on sustainable solutions",
          website: "https://greenenergy.com",
          location: "Austin, TX",
          industry: "Energy",
          size: "100-500",
          logo_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop&crop=center"
        },
        {
          name: "FinanceFirst",
          description: "Premier financial services and investment firm",
          website: "https://financefirst.com",
          location: "New York, NY",
          industry: "Finance",
          size: "1000+",
          logo_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center"
        }
      ])
      .select();

    if (companiesError) {
      console.error("Error adding companies:", companiesError);
      return;
    }

    console.log("Companies added:", companies);

    // Add sample jobs
    if (companies && companies.length > 0) {
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .insert([
          {
            company_id: companies[0].id,
            title: "Senior Frontend Developer",
            description: "Join our dynamic team to build cutting-edge web applications using modern technologies.",
            requirements: ["5+ years React experience", "TypeScript proficiency", "Modern CSS frameworks"],
            benefits: ["Health insurance", "Remote work options", "401k matching"],
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
            company_id: companies[1].id,
            title: "Marketing Manager",
            description: "Lead our marketing initiatives to promote sustainable energy solutions.",
            requirements: ["3+ years marketing experience", "Digital marketing expertise"],
            benefits: ["Health insurance", "Flexible hours", "Stock options"],
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
            company_id: companies[2].id,
            title: "Data Scientist",
            description: "Analyze financial data to drive investment decisions and risk assessment.",
            requirements: ["Masters in Data Science", "Python/R proficiency", "Machine learning experience"],
            benefits: ["Competitive salary", "Bonus structure", "Health insurance"],
            salary_min: 100000,
            salary_max: 150000,
            location: "New York, NY",
            employment_type: "full-time",
            experience_level: "senior",
            skills_required: ["Python", "Machine Learning", "SQL", "Statistics"],
            is_remote: false,
            is_active: true
          }
        ])
        .select();

      if (jobsError) {
        console.error("Error adding jobs:", jobsError);
        return;
      }

      console.log("Jobs added:", jobs);
    }
  } catch (error) {
    console.error("Error adding sample data:", error);
  }
};

export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Database connection error:", error);
      return false;
    }

    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

