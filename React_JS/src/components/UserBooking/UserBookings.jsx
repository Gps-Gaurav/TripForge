// src/components/UserBookings.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import PaymentModal from '../PaymentModal';
import ConfirmationDialog from './ConfirmationDialog';
import BookingCard from './BookingCard';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const UserBookings = ({ token, userId }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);

  const [paymentModal, setPaymentModal] = useState({ isOpen: false, amount: 0, bookingId: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, bookingId: null });

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}/bookings/`, { headers: { Authorization: `Token ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load bookings');
    }
  };

  const fetchBookingStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}/booking-stats/`, { headers: { Authorization: `Token ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
      setBookingStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load stats');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try { await Promise.all([fetchBookings(), fetchBookingStats()]); } 
      finally { setLoading(false); }
    };
    if (token && userId) fetchData();
  }, [token, userId]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bookings/${bookingId}/cancel/`, { reason: 'Cancelled by user' }, { headers: { Authorization: `Token ${token}` } });
      toast.success('Booking cancelled successfully');
      await Promise.all([fetchBookings(), fetchBookingStats()]);
      setConfirmDialog({ isOpen: false, bookingId: null });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || 'Failed to cancel booking');
      setConfirmDialog({ isOpen: false, bookingId: null });
    }
  };

  const handlePay = (booking) => setPaymentModal({ isOpen: true, amount: booking.price, bookingId: booking.id });
  const handleCancel = (booking) => setConfirmDialog({ isOpen: true, bookingId: booking.id });

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  if (!token || !userId) return <div className="flex justify-center items-center min-h-screen"><p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Please login to view your bookings</p></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen"><p className="text-red-600">{error}</p></div>;

  return (
    <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      {bookingStats && <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded mb-6 shadow-md`}>
        <h3 className="text-lg font-semibold mb-4">Booking Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>Total: {bookingStats.total_bookings}</div>
          <div className="text-green-500">Active: {bookingStats.active_bookings}</div>
          <div className="text-red-500">Cancelled: {bookingStats.cancelled_bookings}</div>
          <div className="text-blue-500">Past: {bookingStats.past_bookings}</div>
        </div>
      </div>}

      <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>
      {bookings.length === 0 ? <p>No bookings found.</p> :
        <div className="space-y-4">
          {bookings.map(b => <BookingCard key={b.id} booking={b} isDark={isDark} onPay={handlePay} onCancel={handleCancel} />)}
        </div>
      }

      <PaymentModal {...paymentModal} onClose={() => setPaymentModal({ isOpen: false, amount: 0, bookingId: null })} fetchBookings={fetchBookings} fetchBookingStats={fetchBookingStats} isDark={isDark} />
      <ConfirmationDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, bookingId: null })} onConfirm={() => handleCancelBooking(confirmDialog.bookingId)} message="Are you sure you want to cancel this booking?" isDark={isDark} />
      <ToastContainer position="top-right" autoClose={3000} theme={isDark ? "dark" : "light"} />
    </div>
  );
};

export default UserBookings;
