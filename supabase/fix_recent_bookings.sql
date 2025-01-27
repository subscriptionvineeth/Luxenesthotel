-- First disable RLS
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;

-- Create simplified policies
CREATE POLICY "Enable read for users and admins"
ON bookings FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Enable insert for authenticated users"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users and admins"
ON bookings FOR UPDATE
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Enable delete for users and admins"
ON bookings FOR DELETE
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- Test query to make sure it works
SELECT 
    bookings.id,
    bookings.check_in,
    bookings.check_out,
    bookings.status,
    rooms.name as room_name,
    profiles.email as guest_email
FROM bookings
JOIN rooms ON bookings.room_id = rooms.id
JOIN profiles ON bookings.user_id = profiles.id
ORDER BY bookings.created_at DESC
LIMIT 5;
