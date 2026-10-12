const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const localOrders = require('../models/orderStore');

// GET single order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      try {
        order = await Order.findOne({ orderId });
      } catch (e) {
        order = null;
      }
    }

    if (!order) {
      order = localOrders.find((o) => o.orderId === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

