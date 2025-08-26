// src/components/PaymentModal.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadRazorpay } from '../utils/loadRazorpay';

const PaymentModal = ({ isOpen, onClose, amount, bookingId, fetchBookings, fetchBookingStats, isDark }) => {
  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      const ok = await loadRazorpay();
      if (!ok) return toast.error("Razorpay SDK load failed ❌");

      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payments/create-order/`, { amount });

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
          } catch {
            toast.error("Payment verification failed ❌");
          }
        },
        modal: { ondismiss: () => toast.info("Payment cancelled") },
        theme: { color: "#3399cc" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      toast.error("Payment failed ❌");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Complete Payment</h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Booking ID: #{bookingId}</p>
        <p className={`mb-6 text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Amount: ₹{amount}</p>
        <div className="flex justify-end space-x-4">
          <button className={`px-4 py-2 ${isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`} onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handlePayment}>Pay Now</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
