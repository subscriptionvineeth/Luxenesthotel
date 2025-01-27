import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'hotel-booking-auth',
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  }
});

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const session = await getCurrentSession();
    return session?.user ?? null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// User related functions
export const signUpUser = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: name,
        });

      if (profileError) throw profileError;
    }

    return data;
  } catch (error) {
    console.error('Error in signUpUser:', error);
    throw error;
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Update profile last login
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error in signInUser:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error in signOutUser:', error);
    throw error;
  }
};

// Booking related functions
export const createBooking = async (bookingData: {
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  guestDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    specialRequests?: string;
  };
}) => {
  try {
    const { error } = await supabase.from('bookings').insert({
      user_id: bookingData.userId,
      room_id: bookingData.roomId,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      guests: bookingData.guests,
      total_price: bookingData.totalPrice,
      guest_details: bookingData.guestDetails,
      status: 'confirmed',
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (
          name,
          description,
          price,
          images
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) throw error;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Room related functions
export const getRooms = async () => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('price');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
};

export const checkRoomAvailability = async (
  roomId: string,
  checkIn: string,
  checkOut: string
) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('room_id', roomId)
      .eq('status', 'confirmed')
      .or(`check_in.gte.${checkIn},check_out.lte.${checkOut}`);

    if (error) throw error;
    return data.length === 0; // Room is available if no bookings found
  } catch (error) {
    console.error('Error checking room availability:', error);
    throw error;
  }
};

// Room type interface
export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  amenities: string[];
  images: string[];
}

// Booking type interface
export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  guestDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    specialRequests?: string;
  };
  room?: Room;
  created_at: string;
}
