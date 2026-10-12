const dns = require('dns');
// Set Google DNS to ensure reliable MongoDB Atlas SRV resolution on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const Admin = require('./models/Admin');
const Product = require('./models/Product');
const CATALOG_BUNDLES = require('./models/catalogData');

const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Assets
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/wp-content', express.static(path.join(__dirname, 'wp-content')));
app.use('/wp-includes', express.static(path.join(__dirname, 'wp-includes')));
app.use('/_external', express.static(path.join(__dirname, '_external')));
app.use('/fonts.googleapis.com', express.static(path.join(__dirname, 'fonts.googleapis.com')));
app.use('/hugg-india.b-cdn.net', express.static(path.join(__dirname, 'hugg-india.b-cdn.net')));

// Fallback: If an asset under /wp-content or /wp-includes is requested, resolve from /images
app.use(['/wp-content', '/wp-includes'], (req, res, next) => {
  const filename = path.basename(req.path);
  const fallbackPath = path.join(__dirname, 'images', filename);
  if (fs.existsSync(fallbackPath)) {
    return res.sendFile(fallbackPath);
  }
  next();
});

// Handle direct navigation to explore-products or the folder-named path
app.get(['/explore-products', '/httpsgethugg.com#explore-products', '/httpsgethugg.com'], (req, res) => {
  res.redirect('/#explore-products');
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Frontend Page Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/order-success', (req, res) => {
  res.sendFile(path.join(__dirname, 'order-success.html'));
});

app.get('/buy-tumgard', (req, res) => {
  res.sendFile(path.join(__dirname, 'buy-tumgard.html'));
});

app.get('/buy-kalmegh-bitters', (req, res) => {
  res.sendFile(path.join(__dirname, 'buy-kalmegh-bitters.html'));
});

app.get('/buy-colcalm', (req, res) => {
  res.sendFile(path.join(__dirname, 'buy-colcalm.html'));
});

app.get('/buy-famfiber', (req, res) => {
  res.sendFile(path.join(__dirname, 'buy-famfiber.html'));
});

app.get('/buy-mango-leaf-tonic', (req, res) => {
  res.sendFile(path.join(__dirname, 'buy-mango-leaf-tonic.html'));
});

app.get('/track-order', (req, res) => {
  res.sendFile(path.join(__dirname, 'track-order.html'));
});

app.get('/about-us-2', (req, res) => {
  res.sendFile(path.join(__dirname, 'about-us-2.html'));
});

// Homepage (India's functional gut health brand homepage)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Seed default Admin & Complete Multi-Product Catalog
async function seedInitialData() {
  try {
    // 1. Seed Master Admin
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && defaultPassword) {
      const existingAdmin = await Admin.findOne({ email: adminEmail });
      if (!existingAdmin) {
        await Admin.create({
          email: adminEmail,
          password: defaultPassword,
          name: 'Talib Ansari',
          role: 'admin',
        });
        console.log(`[Seed] Created Master Admin: ${adminEmail}`);
      } else {
        console.log(`[Seed] Master Admin verified: ${adminEmail}`);
      }
    }

    // 2. Seed Full Hugg Product Catalog
    for (const b of CATALOG_BUNDLES) {
      await Product.findOneAndUpdate(
        { bundleId: b.bundleId },
        { $set: b },
        { upsert: true }
      );
    }
    console.log('[Seed] Complete Hugg multi-product catalog verified in database.');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
}

// Start Server and Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

app.listen(PORT, () => {
  console.log(`\n🚀 Hugg Store Multi-Page Server running at: http://localhost:${PORT}`);
  console.log(`👉 Main Homepage: http://localhost:${PORT}`);
  console.log(`👉 Tumgard: http://localhost:${PORT}/buy-tumgard`);
  console.log(`👉 Kalmegh Bitters: http://localhost:${PORT}/buy-kalmegh-bitters`);
  console.log(`👉 ColCalm: http://localhost:${PORT}/buy-colcalm`);
  console.log(`👉 FamFiber: http://localhost:${PORT}/buy-famfiber`);
  console.log(`👉 Mango Leaf Tonic: http://localhost:${PORT}/buy-mango-leaf-tonic`);
  console.log(`👉 Track Order: http://localhost:${PORT}/track-order`);
  console.log(`👉 Admin Panel: http://localhost:${PORT}/admin\n`);

  if (MONGO_URI) {
    mongoose
      .connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then(async () => {
        console.log('✅ Connected to MongoDB Atlas successfully.');
        await seedInitialData();
      })
      .catch((err) => {
        console.warn('⚠️  MongoDB Atlas Connection Warning:', err.message);
        console.warn('💡 Tip: Make sure your current IP address is whitelisted in MongoDB Atlas Network Access (or allow 0.0.0.0/0).');
        console.warn('🌐 Storefront pages and static routes remain fully functional.\n');
      });
  }
});

