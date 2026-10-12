const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const CATALOG_BUNDLES = require('../models/catalogData');

// Get all products
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({}).sort({ jarsCount: 1 });
      if (products && products.length > 0) {
        return res.json({ success: true, count: products.length, data: products });
      }
    }
    // Fallback to static catalog when DB is connecting, offline, or empty
    return res.json({ success: true, count: CATALOG_BUNDLES.length, data: CATALOG_BUNDLES });
  } catch (err) {
    // Return static catalog even on DB error
    return res.json({ success: true, count: CATALOG_BUNDLES.length, data: CATALOG_BUNDLES, note: 'Serving fallback catalog' });
  }
});

module.exports = router;

