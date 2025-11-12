-- =============================================
-- TCE Connect - Registrations Schema
-- =============================================

-- Table: registrations
-- Stores user registrations for events
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  reg_number TEXT NOT NULL,
  year TEXT NOT NULL,
  department TEXT NOT NULL,
  section TEXT NOT NULL,
  phone TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- Prevent duplicate registrations for the same event
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations(registered_at);

-- Row Level Security (RLS) Policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view their own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can register for events (create their own registrations)
CREATE POLICY "Users can register for events" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Event managers can view registrations for their events
CREATE POLICY "Event managers can view registrations for their events" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.event_id = registrations.event_id
      AND events.manager_id = auth.uid()
    )
  );

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel their own registrations" ON registrations
  FOR DELETE USING (auth.uid() = user_id);
