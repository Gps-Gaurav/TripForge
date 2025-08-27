// src/components/BookingCard.jsx
import React from 'react';

const BookingCard = ({ booking, isDark, onPay, onCancel }) => {
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {booking.bus.bus_name}
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Bus Number: {booking.bus.number}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Route: {booking.origin} → {booking.destination}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Time: {booking.bus.start_time} → {booking.bus.reach_time}
          </p>

          {/* ✅ Multiple seats support */}
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Seats:{" "}
            {booking.seats && booking.seats.length > 0
              ? booking.seats.map(seat => seat.seat_number).join(", ")
              : booking.seat?.seat_number}
          </p>

          <p
            className={`${
              booking.status === "cancelled"
                ? "text-red-500"
                : booking.status === "confirmed"
                ? "text-green-500"
                : "text-yellow-500"
            }`}
          >
            Status: {booking.status_display}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Booking Time: {new Date(booking.booking_time).toLocaleString()}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Amount: ₹{booking.price}
          </p>
        </div>

        <div className="flex space-x-2">
          {booking.can_cancel && (
            <>
              <button
                onClick={() => onPay(booking)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Pay Now
              </button>
              <button
                onClick={() => onCancel(booking)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
