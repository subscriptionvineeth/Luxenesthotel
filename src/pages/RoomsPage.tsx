import React from 'react';
import { Link } from 'react-router-dom';
import { rooms } from '../data/rooms';

export default function RoomsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif text-gray-900 text-center mb-4">Our Rooms</h1>
      <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
        Discover our carefully curated selection of rooms, each designed to provide you with the ultimate comfort and luxury
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={room.images[0]}
              alt={room.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{room.name}</h3>
              <p className="text-gray-600 mb-4">{room.shortDescription}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-amber-600">
                  ₹{room.price.toLocaleString()}/night
                </span>
                <Link
                  to={`/rooms/${room.id}`}
                  className="inline-flex items-center px-4 py-2 border border-amber-600 text-sm font-medium rounded-md text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}