import { Room } from '../types';

export const rooms: Room[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Single Room',
    type: 'Single Room',
    price: 10000,
    description: 'Perfect for solo travelers, our Single Room offers a comfortable retreat in the heart of Rome. Featuring a plush single bed, work desk, and modern amenities, these rooms provide everything needed for a memorable stay.',
    shortDescription: 'Comfortable single room for business or leisure',
    capacity: 1,
    size: 18,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Breakfast Included', 'Work Desk', 'Room Service', 'Flat-screen TV'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Deluxe Room',
    type: 'Deluxe Room',
    price: 15000,
    description: 'Experience comfort and elegance in our Deluxe Room. Each room features a luxurious queen-size bed, authentic furnishings, and modern amenities that complement the room\'s charm.',
    shortDescription: 'Elegant room with modern amenities',
    capacity: 2,
    size: 25,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Breakfast Included', 'Mini Bar', 'Room Service', 'Flat-screen TV'],
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Suite Room',
    type: 'Suite Room',
    price: 25000,
    description: 'Our Suite Room offers a perfect blend of space and luxury. With a separate living area and premium amenities, these suites provide an elevated stay experience.',
    shortDescription: 'Spacious suite with separate living area',
    capacity: 2,
    size: 35,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Breakfast Included', 'Mini Bar', 'Room Service', 'Flat-screen TV', 'Living Area', 'City View'],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Executive Suite',
    type: 'Executive Suite',
    price: 35000,
    description: 'Indulge in ultimate luxury in our Executive Suite. With stunning views, premium furnishings, and exclusive amenities, these suites offer an unforgettable stay. The spacious layout includes a separate living area and deluxe bathroom.',
    shortDescription: 'Premium suite with exclusive amenities',
    capacity: 3,
    size: 45,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Breakfast Included', 'Mini Bar', 'Room Service', 'Flat-screen TV', 'Private Balcony', 'Living Area', 'Luxury Bathroom', 'City View'],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1200'
    ]
  }
];