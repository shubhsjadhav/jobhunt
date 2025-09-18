/*
  # Job Board Enhancements

  1. New Tables
    - `job_applications` - Track job applications with detailed info
    - `job_views` - Track job view metrics
    - `job_tags` - Separate table for job tags/skills
    - `saved_jobs` - Allow users to save jobs for later
    
  2. Enhanced Tables
    - Add fields to existing `jobs` table for better functionality
    - Add fields to `companies` table for enhanced profiles
    
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
    
  4. Functions
    - Search function with ranking
    - View tracking function
*/

-- Add missing fields to jobs table
DO $$
BEGIN
  -- Add company_logo field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'company_logo'
  ) THEN
    ALTER TABLE jobs ADD COLUMN company_logo TEXT;
  END IF;
  
  -- Add company_name field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE jobs ADD COLUMN company_name TEXT;
  END IF;
  
  -- Add status field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'status'
  ) THEN
    ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  -- Add hired_at field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'hired_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN hired_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add hired_candidate field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'hired_candidate'
  ) THEN
    ALTER TABLE jobs ADD COLUMN hired_candidate TEXT;
  END IF;
  
  -- Add view_count field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE jobs ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add is_featured field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE jobs ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  
  -- Add posted_by field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'posted_by'
  ) THEN
    ALTER TABLE jobs ADD COLUMN posted_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create job_applications table (enhanced version of applications)
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(job_id, applicant_email)
);

-- Create job_views table for analytics
CREATE TABLE IF NOT EXISTS job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_tags table for better tag management
CREATE TABLE IF NOT EXISTS job_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, tag_name)
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS on new tables
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Policies for job_applications
CREATE POLICY "Anyone can create job applications" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view applications for their jobs" ON job_applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.posted_by = auth.uid()
  )
  OR auth.uid() = user_id
);

-- Policies for job_views
CREATE POLICY "Anyone can create job views" ON job_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own job views" ON job_views FOR SELECT USING (auth.uid() = user_id);

-- Policies for job_tags
CREATE POLICY "Anyone can view job tags" ON job_tags FOR SELECT USING (true);
CREATE POLICY "Job owners can manage tags" ON job_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_tags.job_id 
    AND jobs.posted_by = auth.uid()
  )
);

-- Policies for saved_jobs
CREATE POLICY "Users can manage their saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Update jobs table policies to include posted_by
DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Users can update their own jobs" ON jobs FOR UPDATE USING (auth.uid() = posted_by);

-- Function to increment job view count
CREATE OR REPLACE FUNCTION increment_job_views(job_id UUID, user_ip INET DEFAULT NULL, user_agent_string TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Insert view record
  INSERT INTO job_views (job_id, user_id, ip_address, user_agent)
  VALUES (job_id, auth.uid(), user_ip, user_agent_string);
  
  -- Increment view count on job
  UPDATE jobs SET view_count = view_count + 1 WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for advanced job search with ranking
CREATE OR REPLACE FUNCTION search_jobs(
  search_query TEXT DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  employment_type_filter TEXT DEFAULT NULL,
  experience_level_filter TEXT DEFAULT NULL,
  salary_min_filter INTEGER DEFAULT NULL,
  salary_max_filter INTEGER DEFAULT NULL,
  is_remote_filter BOOLEAN DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company_name TEXT,
  company_logo TEXT,
  location TEXT,
  employment_type TEXT,
  experience_level TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  is_remote BOOLEAN,
  is_featured BOOLEAN,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    COALESCE(j.company_name, c.name) as company_name,
    COALESCE(j.company_logo, c.logo_url) as company_logo,
    j.location,
    j.employment_type,
    j.experience_level,
    j.salary_min,
    j.salary_max,
    j.is_remote,
    j.is_featured,
    j.view_count,
    j.created_at,
    CASE 
      WHEN search_query IS NULL THEN 1.0
      ELSE (
        -- Title match gets highest weight
        (CASE WHEN j.title ILIKE '%' || search_query || '%' THEN 3.0 ELSE 0.0 END) +
        -- Company name match gets high weight
        (CASE WHEN COALESCE(j.company_name, c.name) ILIKE '%' || search_query || '%' THEN 2.0 ELSE 0.0 END) +
        -- Description match gets medium weight
        (CASE WHEN j.description ILIKE '%' || search_query || '%' THEN 1.0 ELSE 0.0 END) +
        -- Skills match gets medium weight
        (CASE WHEN EXISTS(SELECT 1 FROM unnest(j.skills_required) skill WHERE skill ILIKE '%' || search_query || '%') THEN 1.5 ELSE 0.0 END) +
        -- Featured jobs get bonus
        (CASE WHEN j.is_featured THEN 0.5 ELSE 0.0 END)
      )
    END as search_rank
  FROM jobs j
  LEFT JOIN companies c ON j.company_id = c.id
  WHERE j.is_active = true
    AND j.status = 'active'
    AND (search_query IS NULL OR (
      j.title ILIKE '%' || search_query || '%' OR
      COALESCE(j.company_name, c.name) ILIKE '%' || search_query || '%' OR
      j.description ILIKE '%' || search_query || '%' OR
      EXISTS(SELECT 1 FROM unnest(j.skills_required) skill WHERE skill ILIKE '%' || search_query || '%')
    ))
    AND (location_filter IS NULL OR j.location ILIKE '%' || location_filter || '%')
    AND (employment_type_filter IS NULL OR j.employment_type = employment_type_filter)
    AND (experience_level_filter IS NULL OR j.experience_level = experience_level_filter)
    AND (salary_min_filter IS NULL OR j.salary_max >= salary_min_filter)
    AND (salary_max_filter IS NULL OR j.salary_min <= salary_max_filter)
    AND (is_remote_filter IS NULL OR j.is_remote = is_remote_filter)
  ORDER BY 
    j.is_featured DESC,
    search_rank DESC,
    j.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample job data with enhanced fields
DO $$
DECLARE
  company_ids UUID[];
  job_id UUID;
BEGIN
  -- Get existing company IDs
  SELECT ARRAY(SELECT id FROM companies LIMIT 5) INTO company_ids;
  
  -- Only insert if we have companies and no jobs exist yet
  IF array_length(company_ids, 1) > 0 AND NOT EXISTS(SELECT 1 FROM jobs LIMIT 1) THEN
    
    -- Insert enhanced sample jobs
    INSERT INTO jobs (
      company_id, title, company_name, description, requirements, benefits, 
      salary_min, salary_max, location, employment_type, experience_level, 
      skills_required, is_remote, is_active, status, company_logo, is_featured
    ) VALUES
    (company_ids[1], 'Senior Full Stack Developer', 'TechCorp Solutions', 
     'We are seeking a talented Senior Full Stack Developer to join our innovative team. You will be responsible for developing and maintaining web applications using modern technologies including React, Node.js, and cloud services. This role offers the opportunity to work on cutting-edge projects that serve millions of users globally.',
     ARRAY['5+ years full-stack development', 'React and Node.js expertise', 'Cloud platform experience (AWS/GCP)', 'Database design and optimization', 'Agile development methodologies'],
     ARRAY['Competitive salary and equity', 'Comprehensive health insurance', 'Flexible work arrangements', 'Professional development budget', 'Modern tech stack'],
     120000, 160000, 'San Francisco, CA', 'full-time', 'senior',
     ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'], true, true, 'active',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center', true),
     
    (company_ids[2], 'Digital Marketing Specialist', 'GreenEnergy Inc',
     'Join our mission to promote sustainable energy solutions through innovative digital marketing strategies. You will lead campaigns across multiple channels, analyze performance metrics, and help grow our brand presence in the renewable energy sector.',
     ARRAY['3+ years digital marketing experience', 'Google Ads and Facebook Ads certification', 'Content marketing expertise', 'Analytics and reporting skills', 'SEO/SEM knowledge'],
     ARRAY['Health and dental insurance', 'Remote work flexibility', 'Stock options', 'Green transportation allowance', 'Team retreats'],
     65000, 85000, 'Austin, TX', 'full-time', 'mid-level',
     ARRAY['Digital Marketing', 'Google Ads', 'Content Marketing', 'SEO', 'Analytics'], false, true, 'active',
     'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[3], 'Senior Data Scientist', 'FinanceFirst',
     'Lead data science initiatives in the financial services sector. Develop predictive models, perform advanced analytics, and provide insights that drive strategic business decisions. Work with large-scale financial datasets and cutting-edge ML technologies.',
     ARRAY['PhD or Masters in Data Science/Statistics', 'Python and R proficiency', 'Machine learning and deep learning', 'Financial modeling experience', 'Big data technologies (Spark, Hadoop)'],
     ARRAY['Competitive compensation package', 'Annual performance bonus', 'Premium health benefits', 'Retirement planning', 'Conference attendance'],
     130000, 180000, 'New York, NY', 'full-time', 'senior',
     ARRAY['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Financial Modeling'], false, true, 'active',
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center', true),
     
    (company_ids[4], 'Product Designer', 'HealthTech Innovations',
     'Design user-centered healthcare applications that improve patient outcomes and streamline medical workflows. Collaborate with medical professionals, engineers, and researchers to create intuitive digital health solutions.',
     ARRAY['4+ years product design experience', 'Healthcare/medical domain knowledge', 'Figma and design systems expertise', 'User research and testing', 'Accessibility standards (WCAG)'],
     ARRAY['Health insurance and wellness programs', 'Remote-first culture', 'Design conference budget', 'Mental health support', 'Flexible PTO'],
     80000, 110000, 'Boston, MA', 'full-time', 'mid-level',
     ARRAY['Product Design', 'Figma', 'User Research', 'Healthcare', 'Accessibility'], true, true, 'active',
     'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[5], 'Backend Engineer', 'DataDriven Analytics',
     'Build and maintain scalable backend systems for our analytics platform. Work with microservices architecture, handle large-scale data processing, and ensure high availability and performance.',
     ARRAY['3+ years backend development', 'Microservices architecture', 'Database optimization', 'API design and development', 'Cloud infrastructure knowledge'],
     ARRAY['Competitive salary', 'Stock options', 'Health benefits', 'Learning and development', 'Flexible work schedule'],
     85000, 115000, 'Seattle, WA', 'full-time', 'mid-level',
     ARRAY['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'], false, true, 'active',
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[1], 'Frontend Developer', 'TechCorp Solutions',
     'Create beautiful and responsive user interfaces for our web applications. Work closely with designers and backend developers to deliver exceptional user experiences.',
     ARRAY['2+ years frontend development', 'React and modern JavaScript', 'CSS and responsive design', 'Version control (Git)', 'Testing frameworks'],
     ARRAY['Health insurance', 'Professional development', 'Flexible hours', 'Modern equipment', 'Team events'],
     70000, 95000, 'San Francisco, CA', 'full-time', 'mid-level',
     ARRAY['React', 'JavaScript', 'CSS', 'HTML', 'Git'], true, true, 'active',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[2], 'Content Marketing Manager', 'GreenEnergy Inc',
     'Lead our content marketing strategy to educate audiences about renewable energy solutions. Create compelling content across blogs, social media, and marketing campaigns.',
     ARRAY['3+ years content marketing', 'Excellent writing skills', 'SEO knowledge', 'Social media management', 'Content strategy development'],
     ARRAY['Remote work options', 'Health benefits', 'Professional development', 'Sustainability initiatives', 'Flexible PTO'],
     60000, 80000, 'Austin, TX', 'full-time', 'mid-level',
     ARRAY['Content Marketing', 'SEO', 'Social Media', 'Writing', 'Strategy'], true, true, 'active',
     'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[3], 'Junior Financial Analyst', 'FinanceFirst',
     'Start your career in financial analysis with our dynamic team. Analyze market trends, prepare financial reports, and support investment decision-making processes.',
     ARRAY['Bachelor degree in Finance/Economics', 'Excel proficiency', 'Financial modeling basics', 'Analytical thinking', 'Attention to detail'],
     ARRAY['Mentorship program', 'Health insurance', 'Career development', 'Performance bonuses', 'Professional certifications'],
     55000, 70000, 'New York, NY', 'full-time', 'entry',
     ARRAY['Excel', 'Financial Analysis', 'Modeling', 'Research', 'Reporting'], false, true, 'active',
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[4], 'Mobile App Developer', 'HealthTech Innovations',
     'Develop mobile applications for iOS and Android that help patients manage their health. Work on innovative features that make healthcare more accessible and user-friendly.',
     ARRAY['2+ years mobile development', 'React Native or Flutter', 'iOS and Android platforms', 'API integration', 'Healthcare compliance knowledge'],
     ARRAY['Health and wellness benefits', 'Remote work flexibility', 'Technology stipend', 'Conference attendance', 'Stock options'],
     75000, 100000, 'Boston, MA', 'full-time', 'mid-level',
     ARRAY['React Native', 'iOS', 'Android', 'JavaScript', 'Healthcare'], true, true, 'active',
     'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center', false),
     
    (company_ids[5], 'DevOps Engineer', 'DataDriven Analytics',
     'Manage and optimize our cloud infrastructure and deployment pipelines. Ensure high availability, scalability, and security of our analytics platform.',
     ARRAY['3+ years DevOps experience', 'AWS/GCP/Azure expertise', 'Docker and Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
     ARRAY['Competitive salary', 'Health benefits', 'Remote work options', 'Professional certifications', 'On-call compensation'],
     90000, 125000, 'Seattle, WA', 'full-time', 'senior',
     ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'], false, true, 'active',
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center', false);
     
    -- Insert job tags for better searchability
    FOR job_id IN SELECT id FROM jobs LOOP
      INSERT INTO job_tags (job_id, tag_name)
      SELECT job_id, unnest(skills_required) FROM jobs WHERE id = job_id;
    END LOOP;
    
  END IF;
END $$;