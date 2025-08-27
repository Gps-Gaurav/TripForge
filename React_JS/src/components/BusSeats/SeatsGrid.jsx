import React from 'react';

const SeatsGrid = ({ seats, selectedSeats = [], onSeatClick, isDark }) => {
  return (
    <section className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6">Select Your Seat</h2>

      {/* Legend */}
      <div className="flex space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 rounded ${isDark ? 'bg-green-600' : 'bg-green-400'}`} />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 rounded ${isDark ? 'bg-red-700' : 'bg-red-400'}`} />
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 rounded ${isDark ? 'bg-yellow-600' : 'bg-yellow-400'}`} />
          <span>Selected</span>
        </div>
      </div>

      {/* Seats grid */}
      <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
        {seats.map((seat) => {
          const isSelected = selectedSeats.some((s) => s.id === seat.id);
          // booked = seat confirmed for journey date, cancelled seats considered available
          const isAvailable = !seat.is_booked || seat.status === 'cancelled';

          return (
            <button
              key={seat.id}
              onClick={() => isAvailable && onSeatClick(seat)}
              className={`p-3 rounded-md font-semibold transition-colors 
                ${isSelected
                  ? isDark
                    ? 'bg-yellow-600 text-black'
                    : 'bg-yellow-300 text-black'
                  : isAvailable
                  ? isDark
                    ? 'bg-green-700 text-green-100 hover:bg-green-600'
                    : 'bg-green-300 hover:bg-green-400'
                  : isDark
                    ? 'bg-red-700 text-red-200 cursor-not-allowed'
                    : 'bg-red-300 text-red-900 cursor-not-allowed'
                }`}
              disabled={!isAvailable}
              aria-label={`Seat ${seat.seat_number} ${isAvailable ? 'available' : 'booked'}`}
            >
              {seat.seat_number}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SeatsGrid;
