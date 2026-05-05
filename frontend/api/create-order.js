import crypto from 'crypto';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount. Minimum amount is 100 paise (₹1)' 
      });
    }

    // Get credentials from environment
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ 
        error: 'Payment server configuration error' 
      });
    }

    // Create Razorpay order
    const orderData = {
      amount: amount,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to create order with Razorpay' 
      });
    }

    const order = await razorpayResponse.json();

    // Return order details
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
