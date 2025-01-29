import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { format, addDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onBook: (bookingData: any) => Promise<void>;
}

interface BookingFormData {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export default function BookingModal({ isOpen, onClose, room, onBook }: BookingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    checkIn: new Date(),
    checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
    guests: 1,
    fullName: '',
    phoneNumber: '',
    email: '',
  });

  const calculateTotalPrice = () => {
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return room.price * nights;
  };

  const sendConfirmationEmail = async (bookingDetails: any) => {
    try {
      console.log('Sending email to:', user?.email);
      
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          guest_name: formData.fullName,
          room_name: room.name,
          check_in: format(formData.checkIn, 'MMM dd, yyyy'),
          check_out: format(formData.checkOut, 'MMM dd, yyyy'),
          guests: formData.guests,
          total_price: calculateTotalPrice().toLocaleString(),
          to_email: user?.email,
          reply_to: user?.email,
          email: user?.email,
        }
      );
      console.log('Confirmation email sent successfully to:', user?.email);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        toast.error('Please log in to book a room');
        return;
      }

      const bookingData = {
        check_in: formData.checkIn.toISOString(),
        check_out: formData.checkOut.toISOString(),
        guests: formData.guests,
        guest_name: formData.fullName,
        guest_email: user.email,
        phone_number: formData.phoneNumber,
        total_price: calculateTotalPrice(),
      };

      await onBook(bookingData);
    } catch (error: any) {
      console.error('Booking submission error:', error);
      toast.error(error.message || 'Failed to submit booking');
    }
  };

  const handleViewBookings = () => {
    navigate('/bookings');
    onClose();
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
              Booking Confirmed!
            </Dialog.Title>
            
            <p className="text-sm text-gray-500 mb-4">
              Your booking for {room.name} has been confirmed. You can view your booking details in the My Bookings section.
            </p>

            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleViewBookings}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
              >
                View My Bookings
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/rooms');
                }}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              >
                Browse More Rooms
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded bg-white p-6 w-full">
          <Dialog.Title className="text-xl font-semibold mb-4">Book {room.name}</Dialog.Title>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Guest Details</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                value={format(formData.checkIn, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, checkIn: new Date(e.target.value) })}
                className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                min={format(addDays(new Date(formData.checkIn), 1), 'yyyy-MM-dd')}
                value={format(formData.checkOut, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, checkOut: new Date(e.target.value) })}
                className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                max={room.capacity}
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum capacity: {room.capacity} guests
              </p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total Price:</span>
                <span className="text-xl font-semibold text-amber-600">
                  ₹{calculateTotalPrice().toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded hover:bg-amber-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
