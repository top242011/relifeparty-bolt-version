/*
  # Create meetings table

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `date` (date, required)
      - `main_topic` (text, required)
      - `scope` (text, required - General Assembly or specific campus)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `meetings` table
    - Add policy for authenticated users to manage meetings
*/

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  main_topic text NOT NULL,
  scope text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage meetings"
  ON meetings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_scope ON meetings(scope);