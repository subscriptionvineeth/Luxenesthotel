import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import RoomManagement from '../../components/admin/RoomManagement';
import BookingManagement from '../../components/admin/BookingManagement';

interface Stats {
  totalRooms: number;
  totalBookings: number;
  totalUsers: number;
  revenue: number;
}

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  status: string;
}

interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  status: string;
  room: Room;
  profile: { email: string };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const [roomsData, bookingsData, usersData] = await Promise.all([
        supabase.from('rooms').select('count'),
        supabase.from('bookings').select('count'),
        supabase.from('profiles').select('count'),
      ]);

      const revenueData = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'confirmed');

      const revenue = revenueData.data?.reduce((acc, booking) => acc + (booking.total_price || 0), 0) || 0;

      setStats({
        totalRooms: roomsData.data?.[0]?.count || 0,
        totalBookings: bookingsData.data?.[0]?.count || 0,
        totalUsers: usersData.data?.[0]?.count || 0,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    }
  };

  const fetchRecentBookings = async () => {
    try {
      // console.log('Fetching recent bookings...');
      
      // First get bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      if (!bookingsData || bookingsData.length === 0) {
        setRecentBookings([]);
        return;
      }

      // Get room details
      const roomIds = [...new Set(bookingsData.map(b => b.room_id))];
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .in('id', roomIds);

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        throw roomsError;
      }

      // Create room lookup
      const roomsMap = (roomsData || []).reduce((acc, room) => ({
        ...acc,
        [room.id]: room
      }), {});

      // Get user profiles
      const userIds = [...new Set(bookingsData.map(b => b.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create profiles lookup
      const profilesMap = (profilesData || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile
      }), {});

      // Format the data
      const formattedBookings = bookingsData.map(booking => {
        const room = roomsMap[booking.room_id] || {};
        const profile = profilesMap[booking.user_id] || {};

        return {
          id: booking.id,
          room_id: booking.room_id,
          user_id: booking.user_id,
          check_in: booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'Not set',
          check_out: booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'Not set',
          status: booking.status || 'pending',
          room: {
            id: room.id || '',
            name: room.name || 'Unknown Room',
            price: room.price || 0,
            capacity: room.capacity || 0,
            status: room.status || 'unknown'
          },
          profile: {
            email: profile.email || 'Unknown Email'
          }
        };
      });

      setRecentBookings(formattedBookings);
    } catch (error) {
      console.error('Error in fetchRecentBookings:', error);
      toast.error('Failed to load recent bookings');
    } finally {
      setLoading(false);
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Rooms</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalRooms}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalBookings}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">${stats.revenue}</p>
      </div>
    </div>
  );

  const renderRecentBookings = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.room?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.profile?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.check_in}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.check_out}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'dashboard'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'rooms'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'bookings'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bookings
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            {renderStats()}
            {renderRecentBookings()}
          </div>
        )}
        {activeTab === 'rooms' && <RoomManagement />}
        {activeTab === 'bookings' && <BookingManagement />}
      </div>
    </div>
  );
}
