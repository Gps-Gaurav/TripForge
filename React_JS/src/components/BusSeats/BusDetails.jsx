import React from 'react';

const BusDetails = ({
  bus,
  isDark,
  journeyDate,
  setJourneyDate,
  selectedSeats,
  openBooking,
}) => {
  if (!bus) return null;

  return (
    <section
      className={`mb-8 p-6 rounded-lg shadow ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">Bus & Booking Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 - Bus Info */}
        <div className="p-4 border rounded-lg shadow bg-opacity-70">
          <h3 className="text-lg font-semibold mb-4">Bus Info</h3>
          <p className="mb-2"><strong>Name:</strong> {bus.bus_name}</p>
          <p className="mb-2"><strong>Number:</strong> {bus.number}</p>
          <p className="mb-2"><strong>Route:</strong> {bus.origin} → {bus.destination}</p>
          {bus.features && (
            <p className="mb-2"><strong>Features:</strong> {bus.features}</p>
          )}
        </div>

        {/* Column 2 - Timing & Price */}
        <div className="p-4 border rounded-lg shadow bg-opacity-70">
          <h3 className="text-lg font-semibold mb-4">Timing & Price</h3>
          <p className="mb-2"><strong>Departure:</strong> {bus.start_time}</p>
          <p className="mb-2"><strong>Arrival:</strong> {bus.reach_time}</p>
          <p className="mb-2"><strong>Price:</strong> ₹{bus.price}</p>
        </div>

        {/* Column 3 - Booking Details */}
        <div className="p-4 border rounded-lg shadow bg-opacity-70">
          <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Journey Date Picker */}
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className={`px-3 py-2 rounded border focus:outline-none w-full md:w-auto ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            {/* Book Button */}
            <button
              onClick={openBooking}
              disabled={!selectedSeats.length}
              className={`px-6 py-2 rounded-lg font-medium transition w-full md:w-auto ${
                selectedSeats.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Book Selected Seats ({selectedSeats.length})
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusDetails;
