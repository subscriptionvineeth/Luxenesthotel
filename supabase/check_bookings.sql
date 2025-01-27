-- Check table structure
\d bookings;

-- Check if there are any bookings
SELECT COUNT(*) FROM bookings;

-- Check a sample booking
SELECT 
    b.*,
    r.name as room_name,
    p.email as guest_email
FROM bookings b
LEFT JOIN rooms r ON b.room_id = r.id
LEFT JOIN profiles p ON b.user_id = p.id
LIMIT 1;

-- Check if the admin user exists and has proper permissions
SELECT id, email, is_admin 
FROM profiles 
WHERE email = 'subscriptionvineeth@gmail.com';

-- Check if RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    hasindexes, 
    hasrules, 
    hastriggers, 
    rowsecurity
FROM pg_tables
WHERE tablename = 'bookings';
