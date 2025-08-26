import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Simple modal component
const Modal = ({ isOpen, onClose, title, children, isDark }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative rounded-lg shadow-lg p-6 max-w-md w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        onClick={e => e.stopPropagation()}
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
  const [journeyDate, setJourneyDate] = useState('');

  // Fetch bus and seats data
  useEffect(() => {
    const fetchBus = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/buses/${busId}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });

        setBus(response.data);
        setSeats(response.data.seats || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching bus details:', error);
        setError('Failed to load bus details. Please try again later.');
        toast.error('Failed to load bus details');
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [busId, token, navigate]);
  useEffect(() => {
    fetchUpdatedSeats();
    // Refresh seats every 30 seconds
    const intervalId = setInterval(() => {
      if (!loading) {
        fetchUpdatedSeats();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loading, busId]);
  const fetchUpdatedSeats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/buses/${busId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });
      // Update both bus and seats data
      setBus(response.data);
      setSeats(response.data.seats || []);
      
    } catch (error) {
      console.error('Error fetching updated seats:', error);
      toast.error('Failed to refresh seat data');
    }
  };
  // Handle seat click
  const onSeatClick = (seat) => {
    if (!token) {
      toast.error('Please login to book seats');
      navigate('/login');
      return;
    }

    if (!seat.is_booked || seat.status === 'cancelled') {
      setSelectedSeat(seat);
      setBookingModalOpen(true);
    }
  };

  // Confirm booking
const confirmBooking = async () => {
  if (!selectedSeat) {
    toast.error('Please select a seat first');
    return;
  }
  if (!journeyDate) {
    toast.error('Please select a journey date');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/booking/`,
      {
        bus: bus.id,
        seat: selectedSeat.id,
        journey_date: journeyDate, // API ko date bhejo
      },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      setBookingModalOpen(false);
      setSelectedSeat(null);
      setJourneyDate('');
      toast.success('Booking confirmed successfully!');
      await fetchUpdatedSeats();
    }
  } catch (error) {
    console.error('Booking error:', error);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Failed to confirm booking';

    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto p-6`}>
        <div
          className={`p-4 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
            }`}
        >
          <p className="font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-4 px-4 py-2 rounded ${isDark ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'
              } transition-colors duration-200`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className={`container mx-auto p-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        <p>No bus data available.</p>
      </div>
    );
  }

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
      <p className="mb-2">
        <strong>Name: </strong> {bus.bus_name}
      </p>
      <p className="mb-2">
        <strong>Number: </strong> {bus.number}
      </p>
      <p className="mb-2">
        <strong>Route: </strong> {bus.origin} → {bus.destination}
      </p>
      {/* Add this new section for features */}
      {bus.features && (
        <p className="mb-2">
          <strong>Features: </strong> {bus.features}
        </p>
      )}
    </div>
    <div>
      <p className="mb-2">
        <strong>Departure: </strong> {bus.start_time}
      </p>
      <p className="mb-2">
        <strong>Arrival: </strong> {bus.reach_time}
      </p>
      <p className="mb-2">
        <strong>Price: </strong> ₹{bus.price}
      </p>
    </div>
  </div>
</section>

      {/* Seat selection */}
      <section
        className={`p-6 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'
          }`}
      >
        <h2 className="text-2xl font-bold mb-6">Select Your Seat</h2>

        {/* Legend */}
        <div className="flex space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded ${isDark ? 'bg-green-600' : 'bg-green-400'
                }`}
            />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded ${isDark ? 'bg-red-700' : 'bg-red-400'
                }`}
            />
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded ${isDark ? 'bg-yellow-600' : 'bg-yellow-400'
                }`}
            />
            <span>Selected</span>
          </div>
        </div>

        {/* Seats grid */}
        <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
          {seats.map((seat) => {
            const isSelected = selectedSeat?.id === seat.id;
            const isAvailable = !seat.is_booked || seat.status === 'cancelled';

            return (
              <button
                key={seat.id}
                onClick={() => isAvailable ? onSeatClick(seat) : null}
                className={`p-3 rounded-md font-semibold transition-colors ${isSelected
                    ? isDark
                      ? 'bg-yellow-600 text-black'
                      : 'bg-yellow-300'
                    : isAvailable
                      ? isDark
                        ? 'bg-green-700 text-green-100 hover:bg-green-600'
                        : 'bg-green-300 hover:bg-green-400'
                      : isDark
                        ? 'bg-red-700 text-red-200 cursor-not-allowed'
                        : 'bg-red-300 text-red-900 cursor-not-allowed'
                  }`}
                disabled={!isAvailable}
                aria-label={`Seat ${seat.seat_number} ${isAvailable ? 'available' : 'booked'
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
        <div className={isDark ? 'text-gray-200' : 'text-gray-800'}>
          <p className="mb-4">
  <label className="block mb-2 font-semibold">Select Journey Date:</label>
  <input
    type="date"
    value={journeyDate}
    onChange={(e) => setJourneyDate(e.target.value)}
    className={`w-full p-2 border rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
    min={new Date().toISOString().split('T')[0]} // aaj ke baad ki date
  />
</p>

          <p className="mb-4">
            Are you sure you want to book seat{' '}
            <strong>{selectedSeat?.seat_number}</strong>?
          </p>
          <p className="mb-4">
            <strong>Price:</strong> ₹{bus?.price}
          </p>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setSelectedSeat(null);
              }}
              className={`px-4 py-2 rounded ${isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmBooking}
              disabled={!selectedSeat || loading}
              className={`px-4 py-2 rounded ${!selectedSeat || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </span>
              ) : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BusSeats;