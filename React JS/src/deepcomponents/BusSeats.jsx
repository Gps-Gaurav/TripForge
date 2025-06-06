import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Simple modal component
const Modal = ({ isOpen, onClose, title, children, isDark }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative rounded-lg shadow-lg p-6 max-w-md w-full ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        <button
          className="absolute top-3 right-3 text-xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const BusSeats = ({ token, isDark }) => {
  const { busId } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  

  // Fetch bus and seats data
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/buses/${busId}`);
        setBus(res.data);
        setSeats(res.data.seats || []);
      } catch (err) {
        setError('Failed to load bus details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, [busId]);

  // Handle seat click
  const onSeatClick = (seat) => {
    if (!token) {
      toast.error('Please login to book seats.');
      navigate('/login');
      return;
    }
    setSelectedSeat(seat);
    if (!seat.is_booked) {
     setBookingModalOpen(true);
    } 
  };

  // Confirm booking
  const confirmBooking = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/booking/',
        { seat: selectedSeat.id },
        { headers: { Authorization: `Token ${token}` } }
      );

      // Update local seat state
      setSeats((prev) =>
        prev.map((s) => (s.id === selectedSeat.id ? { ...s, is_booked: true } : s))
      );

      toast.success('Seat booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setBookingModalOpen(false);
      setSelectedSeat(null);
    }
  };


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div
        className={`p-4 max-w-4xl mx-auto rounded ${
          isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
        }`}
      >
        {error}
      </div>
    );

  return (
    <div className={`container mx-auto p-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
  
      {/* Bus Details */}
      <section
        className={`mb-8 p-6 rounded-lg shadow ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Bus Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Name: </strong> {bus.bus_name}
            </p>
            <p>
              <strong>Number: </strong> {bus.number}
            </p>
            <p>
              <strong>Route: </strong> {bus.origin} → {bus.destination}
            </p>
          </div>
          <div>
            <p>
              <strong>Departure: </strong> {bus.start_time}
            </p>
            <p>
              <strong>Arrival: </strong> {bus.reach_time}
            </p>
          </div>
        </div>
      </section>

      {/* Seat selection */}
      <section
        className={`p-6 rounded-lg shadow ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Select Your Seat</h2>

        {/* Legend */}
        <div className="flex space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded ${
                isDark ? 'bg-green-600' : 'bg-green-400'
              }`}
            />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded ${
                isDark ? 'bg-red-700' : 'bg-red-400'
              }`}
            />
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded ${
                isDark ? 'bg-yellow-600' : 'bg-yellow-400'
              }`}
            />
            <span>Selected</span>
          </div>
        </div>

        {/* Seats grid */}
        <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
          {seats.map((seat) => {
            const isSelected = selectedSeat?.id === seat.id;
            return (
              <button
                key={seat.id}
                onClick={() => onSeatClick(seat)}
                className={`p-3 rounded-md font-semibold transition-colors ${
                  isSelected
                    ? isDark
                      ? 'bg-yellow-600 text-black'
                      : 'bg-yellow-300'
                    : seat.is_booked
                    ? isDark
                      ? 'bg-red-700 text-red-200 cursor-not-allowed'
                      : 'bg-red-300 text-red-900 cursor-not-allowed'
                    : isDark
                    ? 'bg-green-700 text-green-100 hover:bg-green-600'
                    : 'bg-green-300 hover:bg-green-400'
                }`}
                disabled={seat.is_booked && !isSelected}
                aria-pressed={isSelected}
                aria-label={`Seat ${seat.seat_number} ${
                  seat.is_booked ? 'booked' : 'available'
                }`}
              >
                {seat.seat_number}
              </button>
            );
          })}
        </div>
      </section>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedSeat(null);
        }}
        title="Confirm Booking"
        isDark={isDark}
      >
        <p>
          Confirm booking seat{' '}
          <strong>{selectedSeat?.seat_number}</strong>?
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => {
              setBookingModalOpen(false);
              setSelectedSeat(null);
            }}
            className={`px-4 py-2 rounded ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={confirmBooking}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Confirm
          </button>
        </div>
      </Modal>

  

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDark ? 'dark' : 'light'}
        pauseOnHover
      />
    </div>
  );
};

export default BusSeats;
