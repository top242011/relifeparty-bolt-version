/*
  # Create personnel table

  1. New Tables
    - `personnel`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `party_position` (text, required)
      - `student_council_position` (text, optional)
      - `bio` (text, required)
      - `campus` (text, required)
      - `faculty` (text, required)
      - `year` (integer, required)
      - `gender` (text, required)
      - `profile_image_url` (text, optional)
      - `committee_id` (uuid, foreign key to committees)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `personnel` table
    - Add policy for authenticated users to manage personnel
    - Add foreign key constraint to committees table
*/

CREATE TABLE IF NOT EXISTS personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  party_position text NOT NULL,
  student_council_position text,
  bio text NOT NULL,
  campus text NOT NULL,
  faculty text NOT NULL,
  year integer NOT NULL CHECK (year > 0),
  gender text NOT NULL,
  profile_image_url text,
  committee_id uuid REFERENCES committees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage personnel"
  ON personnel
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_personnel_campus ON personnel(campus);
CREATE INDEX IF NOT EXISTS idx_personnel_committee ON personnel(committee_id);
CREATE INDEX IF NOT EXISTS idx_personnel_party_position ON personnel(party_position);