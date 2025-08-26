import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';
import { loadRazorpay } from '../utils/loadRazorpay';

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, amount, bookingId, isDark, fetchBookings, fetchBookingStats }) => {
  if (!isOpen) return null;

 const handlePayment = async () => {
  try {
    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Razorpay SDK load failed ❌");
      return;
    }

    // 1) Create order
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/payments/create-order/`,
      { amount }
    );

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "Bus Booking",
      description: `Booking #${bookingId}`,
      order_id: data.orderId,
      handler: async function (response) {
        try {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payments/verify/`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            booking_id: bookingId,
          });

          toast.success("Payment successful ✅");
          onClose();
          await Promise.all([fetchBookings(), fetchBookingStats()]);
        } catch (verifyError) {
          console.error("Payment verification failed:", verifyError);
          toast.error("Payment verification failed ❌");
        }
      },
      modal: {
        ondismiss: function() {
          toast.info("Payment cancelled");
        }
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment initiation failed:", err);
    toast.error("Payment failed ❌");
  }
};


  // Return the modal JSX
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Complete Payment
        </h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Booking ID: #{bookingId}
        </p>
        <p className={`mb-6 text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Amount: ₹{amount}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className={`px-4 py-2 ${isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handlePayment}
          >
            Pay Now
          </button>
        </div>
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
      console.log('Fetching stats for user:', userId);
      
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

      console.log('Received stats:', data);
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

  const handleCancelBooking = async (bookingId) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/bookings/${bookingId}/cancel/`,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          reason: 'Cancelled by user'
        }
      });

      // If successful, refresh the data
      await Promise.all([
        fetchBookings(),
        fetchBookingStats()
      ]);

      toast.success('Booking cancelled successfully');
      setConfirmDialog({ isOpen: false, bookingId: null });

    } catch (error) {
      console.error('Cancellation error details:', error.response || error);
      
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Failed to cancel booking';
      
      toast.error(errorMessage);
      setConfirmDialog({ isOpen: false, bookingId: null });
    }
  };

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
        fetchBookings={fetchBookings}
        fetchBookingStats={fetchBookingStats}
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
