import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { rooms } from '../data/rooms';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Find the room with the matching id
  const room = rooms.find(room => room.id === id);

  if (!room) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/rooms')}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            View All Rooms
          </button>
        </div>
      </div>
    );
  }

  const handleBook = async (bookingData: any) => {
    try {
      if (!user) {
        toast.error('Please log in to book a room');
        return;
      }

      const bookingPayload = {
        room_id: room.id,
        profile_id: user.id,
        guest_email: user.email,
        ...bookingData,
        status: 'confirmed'
      };

      console.log('Creating booking with payload:', bookingPayload);

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select();

      if (error) {
        console.error('Booking error:', error);
        throw error;
      }

      console.log('Booking created:', data);
      toast.success('Booking confirmed successfully!');
      setShowBookingModal(false);
      navigate('/my-bookings');
    } catch (err: any) {
      console.error('Error creating booking:', err);
      toast.error(err.message || 'Failed to create booking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-[60vh]">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[activeImage]}
                alt={`${room.name} - View ${activeImage + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            
            {/* Image Navigation Arrows */}
            {room.images && room.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev === 0 ? room.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev === room.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {room.images && room.images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {room.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                    activeImage === index ? 'ring-2 ring-amber-600' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt={`${room.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{room.name}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{room.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <span className="block text-amber-600 text-lg font-semibold">₹{room.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-600">per night</span>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <span className="block text-amber-600 text-lg font-semibold">{room.capacity}</span>
                  <span className="text-sm text-gray-600">guests</span>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <span className="block text-amber-600 text-lg font-semibold">{room.size}</span>
                  <span className="text-sm text-gray-600">sq.ft</span>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <span className="block text-amber-600 text-lg font-semibold">{room.amenities?.length || 0}</span>
                  <span className="text-sm text-gray-600">amenities</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {room.amenities?.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-amber-600">₹{room.price.toLocaleString()}</p>
                <p className="text-gray-600">per night</p>
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please log in to book a room');
                    return;
                  }
                  setShowBookingModal(true);
                }}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-xl hover:bg-amber-700 transition-colors duration-200 font-semibold"
              >
                Book Now
              </button>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Free cancellation up to 24 hours before check-in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        room={room}
        onBook={handleBook}
      />
    </div>
  );
}