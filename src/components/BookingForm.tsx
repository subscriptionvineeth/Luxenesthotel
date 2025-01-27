import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

interface BookingFormProps {
  onBook?: () => void;
  isSearch?: boolean;
}

export default function BookingForm({ onBook, isSearch = false }: BookingFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Set default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    guests: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If this is a booking form (not search), require authentication
    if (!isSearch) {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      if (onBook) {
        onBook();
      }
    } else {
      // For search, no authentication required
      navigate('/rooms', { 
        state: { 
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: parseInt(formData.guests)
        }
      });
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (onBook) {
      onBook();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-40">
          <label className="block text-white text-sm mb-1">Check In</label>
          <input
            type="date"
            value={formData.checkIn}
            min={formatDate(today)}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            className="w-full px-3 py-2 rounded bg-white/90 text-gray-900"
          />
        </div>

        <div className="w-full md:w-40">
          <label className="block text-white text-sm mb-1">Check Out</label>
          <input
            type="date"
            value={formData.checkOut}
            min={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            className="w-full px-3 py-2 rounded bg-white/90 text-gray-900"
          />
        </div>

        <div className="w-full md:w-32">
          <label className="block text-white text-sm mb-1">Guests</label>
          <select
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
            className="w-full px-3 py-2 rounded bg-white/90 text-gray-900"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
        >
          {onBook ? 'Book Now' : 'Search Rooms'}
        </button>
      </form>
      
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}