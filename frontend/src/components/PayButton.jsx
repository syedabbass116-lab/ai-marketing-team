import { useState } from 'react';

export default function PayButton({ amount, name, description }) {
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Failed to load Razorpay. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const orderRes = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 }),
      });
      
      if (!orderRes.ok) throw new Error("Order creation failed");
      const { order_id, amount: orderAmount, currency } = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        order_id,
        name: name || "Payment",
        description: description || "",
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verifyRes.json();
            if (result.success) {
              alert(`Payment successful! ID: ${result.payment_id}`);
            } else {
              alert("Payment verification failed.");
            }
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        alert(`Payment failed: ${r.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
}
