import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

const PaymentModal = ({ isOpen, onClose, amount, bookingId, isDark }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  if (!isOpen) return null;

  const handlePayment = (e) => {
    e.preventDefault();
    toast.success('Payment processed successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Payment Details
          </h3>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Amount to Pay: <span className="font-bold">₹{amount}</span>
          </p>
        </div>

        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg ${
                paymentMethod === 'upi'
                  ? isDark
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setPaymentMethod('upi')}
            >
              UPI
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg ${
                paymentMethod === 'card'
                  ? isDark
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              Debit Card
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
                    : 'border-gray-300 text-gray-900'
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
                      : 'border-gray-300 text-gray-900'
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
                        : 'border-gray-300 text-gray-900'
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
                    maxLength="3"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'border-gray-300 text-gray-900'
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
                      : 'border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg ${
                isDark
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } transition-colors duration-200`}
            >
              Pay ₹{amount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg p-6 max-w-sm w-full`}>
        <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            className={`px-4 py-2 ${isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'} font-medium`}
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

const UserBookings = ({ token, userId }) => {
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, bookingId: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, amount: 0, bookingId: null });
  const [currentDateTime, setCurrentDateTime] = useState('2025-06-06 14:07:06');
  const [username] = useState('Gps-Gaurav');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const formatted = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
      setCurrentDateTime(formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    fetch(`http://localhost:8000/api/user/${userId}/bookings/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Bookings Data:', data);
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [token, userId]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setBookings(bookings.filter(booking => booking.id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking');
    } finally {
      setConfirmDialog({ isOpen: false, bookingId: null });
    }
  };

  if (loading) return (
    <div className={`flex justify-center items-center min-h-screen ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-center">
      <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>Error: {error}</p>
    </div>
  );

  return (
    <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* DateTime and User Banner */}
      <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{currentDateTime} UTC</span>
          </div>
          <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{username}</span>
          </div>
        </div>
      </div>

      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Your Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className={`${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } rounded-lg shadow-md overflow-hidden transition-colors duration-200`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  {/* Left side - Bus Details */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {booking.bus ? booking.bus.bus_name : 'N/A'}
                    </h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Bus No: {booking.bus ? booking.bus.number : 'N/A'}
                    </p>
                  </div>

                  {/* Middle - Journey Details */}
                  <div className="flex-1">
                    <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{booking.origin} → {booking.destination}</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(booking.booking_time).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right side - Price, Seat, and Actions */}
                  <div className="flex-1 flex flex-col items-end space-y-4">
                    <div>
                      <span className={`${
                        isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      } text-sm font-semibold px-3 py-1 rounded`}>
                        Seat {booking.seat ? booking.seat.seat_number : 'N/A'}
                      </span>
                      <p className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mt-2`}>
                        ₹{booking.price}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded transition-colors ${
                          isDark
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        onClick={() => setPaymentModal({ 
                          isOpen: true, 
                          amount: booking.price, 
                          bookingId: booking.id 
                        })}
                      >
                        Pay Now
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id })}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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