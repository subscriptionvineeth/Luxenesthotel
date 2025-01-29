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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchStats();
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
        <p className="mt-2 text-3xl font-semibold text-gray-900">₹{stats.revenue}</p>
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
          </div>
        )}
        {activeTab === 'rooms' && <RoomManagement />}
        {activeTab === 'bookings' && <BookingManagement />}
      </div>
    </div>
  );
}
