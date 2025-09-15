-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  skills TEXT[],
  experience_level TEXT DEFAULT 'entry',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  experience_level TEXT NOT NULL DEFAULT 'mid-level',
  skills_required TEXT[],
  is_remote BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for companies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);

-- Create policies for jobs
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);

-- Create policies for applications
CREATE POLICY "Users can view their own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample companies
INSERT INTO public.companies (name, description, website, location, industry, size) VALUES
('TechCorp Solutions', 'Leading technology consulting firm specializing in digital transformation', 'https://techcorp.com', 'San Francisco, CA', 'Technology', '500-1000'),
('GreenEnergy Inc', 'Renewable energy company focused on sustainable solutions', 'https://greenenergy.com', 'Austin, TX', 'Energy', '100-500'),
('FinanceFirst', 'Premier financial services and investment firm', 'https://financefirst.com', 'New York, NY', 'Finance', '1000+'),
('HealthTech Innovations', 'Healthcare technology startup revolutionizing patient care', 'https://healthtech.com', 'Boston, MA', 'Healthcare', '50-100'),
('DataDriven Analytics', 'Advanced analytics and machine learning solutions', 'https://datadriven.com', 'Seattle, WA', 'Technology', '100-500');

-- Insert sample jobs
INSERT INTO public.jobs (company_id, title, description, requirements, benefits, salary_min, salary_max, location, employment_type, experience_level, skills_required, is_remote) VALUES
((SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'), 'Senior Frontend Developer', 'Join our dynamic team to build cutting-edge web applications using modern technologies. You will work on challenging projects that impact millions of users worldwide.', ARRAY['5+ years React experience', 'TypeScript proficiency', 'Modern CSS frameworks', 'Git version control'], ARRAY['Health insurance', 'Remote work options', '401k matching', 'Professional development budget'], 90000, 130000, 'San Francisco, CA', 'full-time', 'senior', ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'], true),
((SELECT id FROM public.companies WHERE name = 'GreenEnergy Inc'), 'Marketing Manager', 'Lead our marketing initiatives to promote sustainable energy solutions. Drive campaigns that make a real environmental impact.', ARRAY['3+ years marketing experience', 'Digital marketing expertise', 'Campaign management', 'Analytics tools'], ARRAY['Health insurance', 'Flexible hours', 'Stock options', 'Green commute benefits'], 65000, 85000, 'Austin, TX', 'full-time', 'mid-level', ARRAY['Marketing', 'Digital Marketing', 'Analytics'], false),
((SELECT id FROM public.companies WHERE name = 'FinanceFirst'), 'Data Scientist', 'Analyze financial data to drive investment decisions and risk assessment. Work with large datasets and cutting-edge ML models.', ARRAY['Masters in Data Science or related field', 'Python/R proficiency', 'Machine learning experience', 'Financial domain knowledge'], ARRAY['Competitive salary', 'Bonus structure', 'Health insurance', 'Learning stipend'], 100000, 150000, 'New York, NY', 'full-time', 'senior', ARRAY['Python', 'Machine Learning', 'SQL', 'Statistics'], false),
((SELECT id FROM public.companies WHERE name = 'HealthTech Innovations'), 'UX Designer', 'Design intuitive healthcare applications that improve patient outcomes. Collaborate with medical professionals and developers.', ARRAY['3+ years UX design experience', 'Healthcare domain knowledge preferred', 'Figma/Sketch proficiency', 'User research skills'], ARRAY['Health insurance', 'Remote work', 'Design conference budget', 'Wellness programs'], 70000, 95000, 'Boston, MA', 'full-time', 'mid-level', ARRAY['UX Design', 'Figma', 'User Research'], true),
((SELECT id FROM public.companies WHERE name = 'DataDriven Analytics'), 'Junior Backend Developer', 'Start your career building scalable backend systems for data processing and analytics platforms.', ARRAY['Computer Science degree or bootcamp', 'Basic programming skills', 'Database knowledge', 'Eagerness to learn'], ARRAY['Mentorship program', 'Health insurance', 'Flexible hours', 'Learning budget'], 55000, 75000, 'Seattle, WA', 'full-time', 'entry', ARRAY['Python', 'SQL', 'APIs'], false);