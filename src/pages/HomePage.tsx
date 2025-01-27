import React from 'react';
import BookingForm from '../components/BookingForm';
import RoomCard from '../components/RoomCard';
import { rooms } from '../data/rooms';
import bannerImage from '../assets/banner.jpg';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div 
        className="relative h-[80vh] w-full bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
            url(${bannerImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-5xl md:text-6xl text-white font-serif text-center mb-4 tracking-tight">
            Experience Luxury in Rome
          </h1>
          <p className="text-xl text-white text-center mb-12 max-w-2xl">
            Your perfect stay at LuxeNest 
          </p>
          <div className="backdrop-blur-md bg-black/20 p-8 rounded-xl">
            <BookingForm isSearch={true} />
          </div>
        </div>
      </div>

      {/* Room Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif text-gray-900 text-center mb-4">Our Rooms</h2>
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

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-gray-900 text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🏛️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Prime Location</h3>
              <p className="text-gray-600">Steps away from Rome's historic attractions and vibrant culture</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Luxury Comfort</h3>
              <p className="text-gray-600">Elegantly furnished rooms with modern amenities and authentic Italian charm</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Exceptional Service</h3>
              <p className="text-gray-600">24/7 concierge service ensuring your stay exceeds expectations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}