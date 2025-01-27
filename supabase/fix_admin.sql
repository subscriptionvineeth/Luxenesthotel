-- First, make sure the is_admin column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admin users can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin users can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION preserve_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_admin = TRUE THEN
    NEW.is_admin := TRUE;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists and create it again
DROP TRIGGER IF EXISTS ensure_admin_status ON profiles;
CREATE TRIGGER ensure_admin_status
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION preserve_admin_status();

-- Set the admin user
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'subscriptionvineeth@gmail.com';

-- Verify admin status
SELECT id, email, is_admin 
FROM profiles 
WHERE email = 'subscriptionvineeth@gmail.com';
