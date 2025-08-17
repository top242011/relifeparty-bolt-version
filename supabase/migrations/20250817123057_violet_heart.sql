/*
  # Create motions table

  1. New Tables
    - `motions`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `proposer_id` (uuid, foreign key to personnel)
      - `meeting_id` (uuid, foreign key to meetings)
      - `voting_status` (text, required - Passed, Failed, Pending)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `motions` table
    - Add policy for authenticated users to manage motions
    - Add foreign key constraints
*/

CREATE TABLE IF NOT EXISTS motions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  proposer_id uuid NOT NULL REFERENCES personnel(id) ON DELETE RESTRICT,
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  voting_status text NOT NULL CHECK (voting_status IN ('Passed', 'Failed', 'Pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE motions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage motions"
  ON motions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_motions_meeting ON motions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_motions_proposer ON motions(proposer_id);
CREATE INDEX IF NOT EXISTS idx_motions_status ON motions(voting_status);