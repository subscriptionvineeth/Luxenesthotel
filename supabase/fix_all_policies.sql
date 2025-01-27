-- Reset all policies for rooms table
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON rooms;
DROP POLICY IF EXISTS "Rooms are insertable by admins" ON rooms;
DROP POLICY IF EXISTS "Rooms are updatable by admins" ON rooms;
DROP POLICY IF EXISTS "Rooms are deletable by admins" ON rooms;

-- Create new policies for rooms
CREATE POLICY "Enable read access for all users" ON rooms
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for admin users" ON rooms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable update for admin users" ON rooms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable delete for admin users" ON rooms
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Reset all policies for bookings table
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Enable read for users and admins" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update for users and admins" ON bookings;
DROP POLICY IF EXISTS "Enable delete for users and admins" ON bookings;

-- Create new policies for bookings
CREATE POLICY "Enable read access for users and admins" ON bookings
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users and admins" ON bookings
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable delete for users and admins" ON bookings
    FOR DELETE USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Verify that the admin user exists and has proper permissions
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'subscriptionvineeth@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true;

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('rooms', 'bookings');
