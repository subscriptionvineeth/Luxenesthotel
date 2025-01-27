import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  guest_details: {
    fullName: string;
    email: string;
    phone: string;
  };
  room?: {
    name: string;
    price: number;
    images: string[];
  };
}

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  createBooking: (bookingData: Omit<Booking, 'id' | 'status'>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBookings = async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms (
            name,
            price,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status'>) => {
    if (!user) throw new Error('User must be logged in to create a booking');

    try {
      setError(null);
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([
          {
            ...bookingData,
            status: 'confirmed',
            user_id: user.id
          }
        ]);

      if (insertError) throw insertError;

      await refreshBookings();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking');
      throw err;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!user) throw new Error('User must be logged in to cancel a booking');

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .match({ id: bookingId, user_id: user.id });

      if (updateError) throw updateError;

      await refreshBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
      throw err;
    }
  };

  useEffect(() => {
    refreshBookings();
  }, [user]);

  const value = {
    bookings,
    isLoading,
    error,
    createBooking,
    cancelBooking,
    refreshBookings
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
