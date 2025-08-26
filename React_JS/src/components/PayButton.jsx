// components/PayButton.jsx
import axios from "axios";
import { loadRazorpay } from "../utils/loadRazorpay";

export default function PayButton({ amount = 1 }) { // rupees
  const startPayment = async () => {
    const ok = await loadRazorpay();
    if (!ok) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    // 1) create order from backend
    const { data } = await axios.post("http://localhost:8000/api/payments/create-order/", {
      amount, // rupees
    });

    const options = {
      key: data.key, // from backend
      amount: data.amount, // paise
      currency: data.currency,
      name: "Your App",
      description: "Test payment",
      order_id: data.orderId,
      // UPI + Cards dono Checkout me aa jayenge automatically
      handler: async function (response) {
        // 2) verify on backend
        await axios.post("http://localhost:8000/api/payments/verify/", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        alert("Payment successful ✅");
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      notes: { purpose: "demo" },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);

    // failure listener
    rzp.on("payment.failed", function (resp) {
      console.error(resp.error);
      alert("Payment failed ❌");
    });

    rzp.open();
  };

  return (
    <button onClick={startPayment}>
      Pay ₹{amount}
    </button>
  );
}
