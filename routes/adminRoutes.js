const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const localOrders = require('../models/orderStore');
const { protectAdmin } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'hugg_secret_jwt_key_2026_super_secure_talib';

// POST: Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const masterEmail = (process.env.ADMIN_EMAIL || 'admin@gethugg.com').toLowerCase().trim();
    const masterPassword = process.env.ADMIN_PASSWORD || 'HuggAdmin2026!';

    let admin = null;
    if (mongoose.connection.readyState === 1) {
      try {
        admin = await Admin.findOne({ email: email.toLowerCase().trim() });
      } catch (e) {
        admin = null;
      }
    }

    if (!admin && email.toLowerCase().trim() === masterEmail && password === masterPassword) {
      admin = {
        _id: 'master_admin_offline',
        email: masterEmail,
        name: 'Master Admin',
        role: 'admin',
      };
    } else if (admin) {
      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST: Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET: Current Admin Profile
router.get('/me', protectAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET: Dashboard Stats
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalOrders = await Order.countDocuments();
      const paidOrders = await Order.find({ paymentStatus: 'paid' });
      const codOrders = await Order.find({ paymentMethod: 'cod' });
      const deliveredOrders = await Order.find({ orderStatus: 'delivered' });
      const totalCustomers = await Customer.countDocuments();

      let totalRevenue = 0;
      for (const o of paidOrders) {
        totalRevenue += o.totalAmount || 0;
      }
      for (const o of codOrders) {
        if (o.paymentStatus === 'paid' || o.orderStatus === 'delivered') {
          totalRevenue += o.totalAmount || 0;
        }
      }

      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

      return res.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          paidOrdersCount: paidOrders.length,
          codOrdersCount: codOrders.length,
          deliveredCount: deliveredOrders.length,
          processingCount: await Order.countDocuments({ orderStatus: 'processing' }),
        },
        recentOrders,
      });
    }

    // Offline / local cache stats
    let totalRevenue = 0;
    for (const o of localOrders) {
      if (o.paymentStatus === 'paid' || o.orderStatus === 'delivered') {
        totalRevenue += o.totalAmount || 0;
      }
    }

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: localOrders.length,
        totalCustomers: localOrders.length,
        paidOrdersCount: localOrders.filter((o) => o.paymentStatus === 'paid').length,
        codOrdersCount: localOrders.filter((o) => o.paymentMethod === 'cod').length,
        deliveredCount: localOrders.filter((o) => o.orderStatus === 'delivered').length,
        processingCount: localOrders.filter((o) => o.orderStatus === 'processing').length,
      },
      recentOrders: localOrders.slice(-5).reverse(),
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET: All Orders (with filters & search)
router.get('/orders', protectAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (status && status !== 'all') {
        query.orderStatus = status;
      }

      if (paymentStatus && paymentStatus !== 'all') {
        query.paymentStatus = paymentStatus;
      }

      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.phone': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } },
          { 'customer.city': { $regex: search, $options: 'i' } },
        ];
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    }

    // Offline / local cache orders
    let filtered = [...localOrders];
    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.orderStatus === status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          (o.orderId && o.orderId.toLowerCase().includes(s)) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(s)) ||
          (o.customer?.phone && o.customer.phone.includes(s))
      );
    }

    return res.json({ success: true, count: filtered.length, orders: filtered.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PATCH: Update Order Status
router.patch('/orders/:id/status', protectAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const updateData = { updatedAt: new Date() };

    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET: All Customers
router.get('/customers', protectAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastOrderAt: -1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET: All Products
router.get('/products', protectAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ jarsCount: 1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT: Update Product
router.put('/products/:id', protectAdmin, async (req, res) => {
  try {
    const { price, originalPrice, inStock, badge, secondaryBadge } = req.body;
    const updateData = { updatedAt: new Date() };

    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (inStock !== undefined) updateData.inStock = Boolean(inStock);
    if (badge !== undefined) updateData.badge = badge;
    if (secondaryBadge !== undefined) updateData.secondaryBadge = secondaryBadge;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
