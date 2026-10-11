const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Helper to generate unique order ID
function generateOrderId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `HUGG-${randomNum}`;
}

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET Razorpay Public Key
router.get('/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST: Create Razorpay Order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { bundleId, customer } = req.body;
    if (!bundleId) {
      return res.status(400).json({ success: false, message: 'Bundle selection is required' });
    }

    const product = await Product.findOne({ bundleId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product bundle not found' });
    }

    const amountInPaise = Math.round(product.price * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        bundleId: product.bundleId,
        bundleTitle: product.title,
        customerName: customer ? customer.name : '',
        customerPhone: customer ? customer.phone : '',
      },
    });

    res.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      product: {
        bundleId: product.bundleId,
        title: product.title,
        price: product.price,
      },
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ success: false, message: 'Failed to initialize payment', error: err.message });
  }
});

// POST: Verify Razorpay Payment & Place Order
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bundleId,
      customer,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification details missing' });
    }

    // Verify HMAC SHA256 Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    const product = await Product.findOne({ bundleId }) || {
      bundleId: bundleId || '2-jars',
      title: '2 Jars (20 Days)',
      jarsCount: 2,
      price: 1399,
    };

    const newOrderId = generateOrderId();

    // Create Order in DB
    const newOrder = await Order.create({
      orderId: newOrderId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        pincode: customer.pincode,
        city: customer.city || '',
        state: customer.state || '',
      },
      items: [
        {
          bundleId: product.bundleId,
          title: product.title,
          jarsCount: product.jarsCount,
          quantity: 1,
          price: product.price,
        },
      ],
      subtotal: product.price,
      shippingFee: 0,
      totalAmount: product.price,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      orderStatus: 'processing',
    });

    // Update or Create Customer
    await Customer.findOneAndUpdate(
      { email: customer.email.toLowerCase() },
      {
        $set: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          pincode: customer.pincode,
          city: customer.city || '',
          state: customer.state || '',
          lastOrderAt: new Date(),
        },
        $inc: {
          ordersCount: 1,
          totalSpent: product.price,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: newOrder.orderId,
      order: newOrder,
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ success: false, message: 'Internal server error while saving order', error: err.message });
  }
});

// POST: Cash on Delivery (COD) Order
router.post('/cod', async (req, res) => {
  try {
    const { bundleId, customer } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide all delivery details' });
    }

    const product = await Product.findOne({ bundleId }) || {
      bundleId: bundleId || '2-jars',
      title: '2 Jars (20 Days)',
      jarsCount: 2,
      price: 1399,
    };

    const newOrderId = generateOrderId();

    const newOrder = await Order.create({
      orderId: newOrderId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        pincode: customer.pincode,
        city: customer.city || '',
        state: customer.state || '',
      },
      items: [
        {
          bundleId: product.bundleId,
          title: product.title,
          jarsCount: product.jarsCount,
          quantity: 1,
          price: product.price,
        },
      ],
      subtotal: product.price,
      shippingFee: 0,
      totalAmount: product.price,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'processing',
    });

    // Upsert Customer
    await Customer.findOneAndUpdate(
      { email: customer.email.toLowerCase() },
      {
        $set: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          pincode: customer.pincode,
          city: customer.city || '',
          state: customer.state || '',
          lastOrderAt: new Date(),
        },
        $inc: {
          ordersCount: 1,
          totalSpent: product.price,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'COD Order placed successfully',
      orderId: newOrder.orderId,
      order: newOrder,
    });
  } catch (err) {
    console.error('Error creating COD order:', err);
    res.status(500).json({ success: false, message: 'Internal server error while saving order', error: err.message });
  }
});

module.exports = router;
