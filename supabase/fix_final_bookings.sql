-- Disable RLS temporarily
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for users and admins" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update for users and admins" ON bookings;
DROP POLICY IF EXISTS "Enable delete for users and admins" ON bookings;

-- Create simplified policies for bookings
CREATE POLICY "Enable read access for all authenticated users" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for admin users" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable delete for admin users" ON bookings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Verify admin user
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'subscriptionvineeth@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true;

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'bookings';
