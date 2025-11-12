-- =============================================
-- TCE Connect - Clubs Schema
-- =============================================

-- Table: clubs
-- Stores information about all clubs in TCE
CREATE TABLE IF NOT EXISTS clubs (
  club_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name TEXT NOT NULL,
  club_icon TEXT DEFAULT '🎯', -- Emoji or icon identifier
  description TEXT,
  club_type TEXT CHECK (club_type IN ('technical', 'cultural', 'sports', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: club_members
-- Stores membership information (which users are part of which clubs)
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(club_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'coordinator', 'president')),
  UNIQUE(club_id, user_id) -- Prevent duplicate memberships
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);

-- Row Level Security (RLS) Policies
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Anyone can read clubs (public information)
CREATE POLICY "Anyone can view clubs" ON clubs
  FOR SELECT USING (true);

-- Anyone can read club memberships (public information)
CREATE POLICY "Anyone can view club members" ON club_members
  FOR SELECT USING (true);

-- Only authenticated users can join clubs
CREATE POLICY "Authenticated users can join clubs" ON club_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own memberships
CREATE POLICY "Users can leave their clubs" ON club_members
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Sample Data (Optional - Run manually if needed)
-- =============================================

-- Insert sample clubs
INSERT INTO clubs (club_name, club_icon, description, club_type) VALUES
  ('AI Consortium', '🤖', 'Artificial Intelligence and Machine Learning enthusiasts', 'technical'),
  ('App Development Club', '📱', 'Mobile and web application development', 'technical'),
  ('Robotics Club', '🦾', 'Robotics and automation projects', 'technical'),
  ('Music Club', '🎵', 'Musical performances and events', 'cultural'),
  ('Dance Club', '💃', 'Various dance forms and performances', 'cultural'),
  ('Basketball Club', '🏀', 'Basketball training and tournaments', 'sports'),
  ('Cricket Club', '🏏', 'Cricket team and matches', 'sports'),
  ('Photography Club', '📷', 'Photography workshops and exhibitions', 'other'),
  ('Drama Club', '🎭', 'Theater and drama performances', 'cultural'),
  ('Coding Club', '💻', 'Competitive programming and hackathons', 'technical')
ON CONFLICT DO NOTHING;

-- Note: To link users to clubs, use the club_members table
-- Example:
-- INSERT INTO club_members (club_id, user_id) 
-- VALUES ('club-uuid', 'user-uuid');
