import React from 'react';

const BookingDetails = ({ guestDetails }) => {
  return (
    <div>
      <h2>Guest Details</h2>
      <p>Full Name: {guestDetails.fullName}</p>
      <p>Email: {guestDetails.email}</p>
      <p>Phone Number: {guestDetails.phoneNumber}</p>
      {/* Other details */}
    </div>
  );
};

export default BookingDetails; 