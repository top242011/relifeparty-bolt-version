/*
  # Create meeting attendance table

  1. New Tables
    - `meeting_attendance`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings)
      - `personnel_id` (uuid, foreign key to personnel)
      - `attended` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `meeting_attendance` table
    - Add policy for authenticated users to manage attendance
    - Add foreign key constraints and unique constraint
*/

CREATE TABLE IF NOT EXISTS meeting_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  personnel_id uuid NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  attended boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(meeting_id, personnel_id)
);

ALTER TABLE meeting_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage attendance"
  ON meeting_attendance
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON meeting_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_attendance_personnel ON meeting_attendance(personnel_id);