import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Rooms</p>
          <h3 className="text-3xl font-bold">8</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Bookings</p>
          <h3 className="text-3xl font-bold">7</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Users</p>
          <h3 className="text-3xl font-bold">5</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-2">Total Revenue</p>
          <h3 className="text-3xl font-bold">₹130000</h3>
        </div>
      </div>
    </div>
  );
} 