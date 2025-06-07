import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, amount, bookingId, isDark }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      // Add payment processing logic here
      toast.success('Payment processed successfully!');
      onClose();
    } catch (error) {
      toast.error('Payment failed: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Payment Details
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Amount to Pay: <span className="font-bold">₹{amount}</span>
          </p>
        </div>

        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg ${
                paymentMethod === 'upi'
                  ? 'bg-indigo-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setPaymentMethod('upi')}
            >
              UPI
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg ${
                paymentMethod === 'card'
                  ? 'bg-indigo-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              Card
            </button>
          </div>
        </div>

        <form onSubmit={handlePayment}>
          {paymentMethod === 'upi' ? (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (value.length > 2) {
                        setExpiryDate(`${value.slice(0, 2)}/${value.slice(2)}`);
                      } else {
                        setExpiryDate(value);
                      }
                    }}
                    placeholder="MM/YY"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Card Holder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Pay ₹{amount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Confirm Cancellation
        </h3>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            className={`px-4 py-2 ${isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={onClose}
          >
            Keep Booking
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// Main UserBookings Component
const UserBookings = ({ token, userId }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, bookingId: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, amount: 0, bookingId: null });
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);


  const fetchBookingStats = async () => {
    try {
      console.log('Fetching stats for user:', userId); // Debug log
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/${userId}/booking-stats/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking stats');
      }

      console.log('Received stats:', data); // Debug log
      setBookingStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching booking stats:', err);
      setError(err.message || 'Failed to load booking statistics');
      setBookingStats(null);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/${userId}/bookings/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
      setBookings([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBookings(),
          fetchBookingStats()
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchData();
    }
  }, [token, userId]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (!token || !userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Please login to view your bookings
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`text-center p-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Cancelled by user'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel booking');
      }

      await Promise.all([
        fetchBookings(),
        fetchBookingStats()
      ]);
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setConfirmDialog({ isOpen: false, bookingId: null });
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Booking Stats */}
      {bookingStats && (
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Booking Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Bookings</p>
              <p className="text-xl font-bold">{bookingStats.total_bookings}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Bookings</p>
              <p className="text-xl font-bold text-green-500">{bookingStats.active_bookings}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cancelled Bookings</p>
              <p className="text-xl font-bold text-red-500">{bookingStats.cancelled_bookings}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Past Bookings</p>
              <p className="text-xl font-bold text-blue-500">{bookingStats.past_bookings}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        Your Bookings
      </h2>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}
            >
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
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Seat: {booking.seat.seat_number}
                  </p>
                  <p className={`${
                    booking.status === 'cancelled' ? 'text-red-500' : 
                    booking.status === 'confirmed' ? 'text-green-500' : 
                    'text-yellow-500'
                  }`}>
                    Status: {booking.status_display}
                  </p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Booking Time: {new Date(booking.booking_time).toLocaleString()}
                  </p>
                  {booking.cancelled_at && (
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Cancelled At: {new Date(booking.cancelled_at).toLocaleString()}
                    </p>
                  )}
                  {booking.cancellation_reason && (
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Cancellation Reason: {booking.cancellation_reason}
                    </p>
                  )}
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Amount: ₹{booking.price}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {booking.can_cancel && (
                    <>
                      <button
                        onClick={() => setPaymentModal({
                          isOpen: true,
                          amount: booking.price,
                          bookingId: booking.id
                        })}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Pay Now
                      </button>
                      <button
                        onClick={() => setConfirmDialog({
                          isOpen: true,
                          bookingId: booking.id
                        })}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, amount: 0, bookingId: null })}
        amount={paymentModal.amount}
        bookingId={paymentModal.bookingId}
        isDark={isDark}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, bookingId: null })}
        onConfirm={() => handleCancelBooking(confirmDialog.bookingId)}
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        isDark={isDark}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

export default UserBookings;