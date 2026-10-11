const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  bundleId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  jarsCount: {
    type: Number,
    required: true,
  },
  daysCount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  badge: {
    type: String,
    default: '',
  },
  secondaryBadge: {
    type: String,
    default: '',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
