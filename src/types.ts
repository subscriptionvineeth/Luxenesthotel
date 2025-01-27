export interface Room {
  id: string;
  name: string;
  type: 'Single Room' | 'Double Room' | 'Deluxe Room';
  price: number;
  description: string;
  shortDescription: string;
  capacity: number;
  size: number;
  amenities: string[];
  images: string[];
}

export interface BookingFormData {
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export interface User {
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Booking {
  id: string;
  profile_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  phone_number: string;
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  cancelBooking: (bookingId: string) => void;
  getBookingsByUser: (userId: string) => Booking[];
}