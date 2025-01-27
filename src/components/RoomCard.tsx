import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from './BookingModal';
import LoginModal from './LoginModal';
import { supabase } from '../lib/supabase';
import { Wifi, Coffee, Wind, Car } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
}

const amenityIcons: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi className="h-4 w-4" />,
  'Breakfast Included': <Coffee className="h-4 w-4" />,
  'Air Conditioning': <Wind className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />
};

export default function RoomCard({ room }: RoomCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBookNow = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowBooking(true);
  };

  const handleBook = async (bookingData: any) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        ...bookingData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      navigate('/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price * 83);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 h-48">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
        <p className="mt-2 text-gray-600 line-clamp-2">{room.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-amber-600">
            {formatPrice(room.price)}/night
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
  );
}