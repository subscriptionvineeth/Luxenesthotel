-- Disable RLS temporarily
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users to own bookings" ON bookings;
DROP POLICY IF EXISTS "Enable insert access for users to own bookings" ON bookings;
DROP POLICY IF EXISTS "Enable update access for users to own bookings" ON bookings;
DROP POLICY IF EXISTS "Enable delete access for users to own bookings" ON bookings;
DROP POLICY IF EXISTS "Admin users can read all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin users can update all bookings" ON bookings;

-- Create new policies
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Users can create own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';
