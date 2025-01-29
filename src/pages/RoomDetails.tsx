import React, { useState } from 'react';
import BookingModal from '../components/BookingModal';

const RoomDetails = () => {
  const [roomDetails, setRoomDetails] = useState({ /* room details */ });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBooking = (guestDetails) => {
    console.log('Booking details:', guestDetails);
    // Here you can handle the booking logic, including saving the email
  };

  return (
    <div>
      <h1>{roomDetails.name}</h1>
      <p>Price: ₹{roomDetails.price}</p>
      {/* Other room details */}
      <button onClick={() => setIsModalOpen(true)}>Book Now</button>
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        room={roomDetails} 
        onBook={handleBooking} 
      />
    </div>
  );
};

export default RoomDetails; 