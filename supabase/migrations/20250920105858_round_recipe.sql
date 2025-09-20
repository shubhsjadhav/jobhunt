/*
  # Create saved jobs table

  1. New Tables
    - `saved_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (uuid, references jobs)
      - `saved_at` (timestamp)
  
  2. Security
    - Enable RLS on `saved_jobs` table
    - Add policy for users to manage their own saved jobs
*/

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved jobs"
  ON saved_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON saved_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved jobs"
  ON saved_jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle saved jobs table creation
CREATE OR REPLACE FUNCTION create_saved_jobs_table()
RETURNS void AS $$
BEGIN
  -- This function is just a placeholder for the RPC call
  -- The actual table creation is handled above
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;