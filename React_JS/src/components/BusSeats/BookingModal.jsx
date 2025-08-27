// components/BusSeats/BookingModal.jsx
import React from 'react';
import Modal from './Modal';

const BookingModal = ({ 
  bus, 
  selectedSeats = [], 
  journeyDate, 
  setJourneyDate, 
  confirmBooking, 
  setBookingModalOpen, 
  isDark, 
  loading,
  isOpen
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => setBookingModalOpen(false)}
    title="Confirm Booking"
    isDark={isDark}
  >
    <div className={isDark ? 'text-gray-200' : 'text-gray-800'}>
      
      {/* Journey Date */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select Journey Date:</label>
        <input
          type="date"
          value={journeyDate}
          onChange={(e) => setJourneyDate(e.target.value)}
          className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Selected Seats */}
      {selectedSeats.length > 0 ? (
        <>
          <p className="mb-2">
            You have selected the following seats:{" "}
            <strong>{selectedSeats.map(s => s.seat_number).join(', ')}</strong>
          </p>
          <p className="mb-4">
            <strong>Total Price:</strong> ₹{(bus?.price || 0) * selectedSeats.length}
          </p>
        </>
      ) : (
        <p className="mb-4 text-red-500">No seats selected.</p>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => setBookingModalOpen(false)}
          className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          Cancel
        </button>
        <button
          onClick={confirmBooking}
          disabled={!selectedSeats.length || loading}
          className={`px-4 py-2 rounded ${!selectedSeats.length || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
        >
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  </Modal>
);

export default BookingModal;
