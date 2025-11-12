-- =============================================
-- TCE Connect - Registrations Table Migration
-- Add new columns for storing registration details
-- =============================================

-- Step 1: Add new columns (nullable first to avoid errors with existing data)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS reg_number TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS section TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Step 2: Populate existing registrations with data from profiles table
UPDATE registrations r
SET 
  full_name = COALESCE(p.full_name, 'N/A'),
  reg_number = COALESCE(p.reg_number, 'N/A'),
  year = COALESCE(p.year::TEXT, 'N/A'),
  department = COALESCE(p.department, 'N/A'),
  section = 'N/A',
  phone = COALESCE(p.phone, 'N/A')
FROM profiles p
WHERE r.user_id = p.user_id
  AND (r.full_name IS NULL OR r.reg_number IS NULL);

-- Step 3: Make columns NOT NULL (after populating existing data)
-- Note: Only run this after Step 2 completes successfully
ALTER TABLE registrations 
ALTER COLUMN full_name SET NOT NULL,
ALTER COLUMN reg_number SET NOT NULL,
ALTER COLUMN year SET NOT NULL,
ALTER COLUMN department SET NOT NULL,
ALTER COLUMN section SET NOT NULL,
ALTER COLUMN phone SET NOT NULL;

-- Verify the migration
SELECT 
  COUNT(*) as total_registrations,
  COUNT(full_name) as has_name,
  COUNT(phone) as has_phone
FROM registrations;
