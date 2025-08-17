/*
  # Create committees table

  1. New Tables
    - `committees`
      - `id` (uuid, primary key)
      - `name` (text, unique, required)
      - `description` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `committees` table
    - Add policy for authenticated users to manage committees
*/

CREATE TABLE IF NOT EXISTS committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage committees"
  ON committees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);