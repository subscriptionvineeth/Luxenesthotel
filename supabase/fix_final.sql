-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Admin users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;

-- Delete any existing profile for the admin user to start fresh
DELETE FROM profiles WHERE email = 'subscriptionvineeth@gmail.com';

-- Create a fresh profile for the admin user
INSERT INTO profiles (id, email, full_name, is_admin)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
    true
FROM auth.users 
WHERE email = 'subscriptionvineeth@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true;

-- Create simple policies
CREATE POLICY "Enable read for all users"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Enable insert for users"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify the changes
SELECT * FROM profiles WHERE email = 'subscriptionvineeth@gmail.com';
