// components/BusSeats/BusDetails.jsx
import React from 'react';

const BusDetails = ({ bus, isDark }) => (
  <section className={`mb-8 p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
    <h2 className="text-2xl font-bold mb-4">Bus Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="mb-2"><strong>Name:</strong> {bus.bus_name}</p>
        <p className="mb-2"><strong>Number:</strong> {bus.number}</p>
        <p className="mb-2"><strong>Route:</strong> {bus.origin} → {bus.destination}</p>
        {bus.features && <p className="mb-2"><strong>Features:</strong> {bus.features}</p>}
      </div>
      <div>
        <p className="mb-2"><strong>Departure:</strong> {bus.start_time}</p>
        <p className="mb-2"><strong>Arrival:</strong> {bus.reach_time}</p>
        <p className="mb-2"><strong>Price:</strong> ₹{bus.price}</p>
      </div>
    </div>
  </section>
);

export default BusDetails;
