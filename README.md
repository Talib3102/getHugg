# Tumgard Full-Stack E-Commerce Website & Admin Portal - Hugg

A complete, pixel-perfect, production-ready full-stack e-commerce replica of the Hugg Tumgard landing page ([gethugg.com/buy-tumgard/](https://gethugg.com/buy-tumgard/)), integrated with **MongoDB Atlas**, **Razorpay Payment Gateway**, dynamic checkout, and a password-protected **Admin Management Portal**.

---

## 📸 Visual Verification & Screenshots

| View | Screenshot | Description |
| :--- | :--- | :--- |
| **Complete Storefront** | [`full_storefront_screenshot.png`](./full_storefront_screenshot.png) | All sections: Hero, Video Testimonials, Science, NABL Lab Reports, 500+ Reviews, How To Use, Moneyback Guarantee, FAQ, & Footers. |
| **Interactive Checkout Drawer** | [`checkout_drawer_screenshot.png`](./checkout_drawer_screenshot.png) | High-converting slide-over checkout with auto-pincode lookup, UPI / Razorpay options, and Cash on Delivery (COD). |
| **Order Confirmation & Tracking** | [`order_success_screenshot.png`](./order_success_screenshot.png) | Live order confirmation with unique Order ID (`#HUGG-XXXXXX`), live order tracker, and order breakdown. |
| **Admin Login Screen** | [`admin_login_screenshot.png`](./admin_login_screenshot.png) | Secure administrative authentication screen for store management. |
| **Admin Operations Dashboard** | [`admin_dashboard_screenshot.png`](./admin_dashboard_screenshot.png) | Real-time sales metrics, customer CRM database, order status fulfillment manager, and dynamic pricing editor. |
| **Desktop First Section** | [`replica_screenshot.png`](./replica_screenshot.png) | Initial hero, 3 course bundle selector, and video carousel. |
| **Mobile View (390px)** | [`mobile_screenshot.png`](./mobile_screenshot.png) | Touch-optimized mobile layout with swipeable gallery and accordions. |
| **Science Modal Popup** | [`popup_screenshot.png`](./popup_screenshot.png) | Interactive polyphenol breakdown modal dialog. |

---

## 🔐 Configuration & Environment Variables

Configure your credentials in `.env` (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.0aur7yu.mongodb.net/hugg_store
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_EMAIL=admin@gethugg.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### Admin Portal
- **URL**: `http://localhost:5000/admin`
- Configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env` file.

### Database
- **Provider**: MongoDB Atlas (`hugg_store`)

### Payment Gateway
- **Provider**: Razorpay
- **Modes**: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, + Cash on Delivery (COD).

---

## 🚀 Full-Stack Feature Highlights

### 1. Storefront (100% Exact Sections Replicated)
1. **Announcement Bar & Navigation Header**: Rotating deals, review badges, and cart counter.
2. **Interactive Course Selector**:
   - 1 Jar (10 Days) - ₹699
   - 2 Jars (20 Days) - ₹1,399 *(Default, Best Results)*
   - 3 Jars (30 Days) - ₹2,397 *(Flat 50% Off, Best Value)*
3. **Dynamic Estimated Delivery Date**: Computes live delivery schedule (*Current Date + 5 days*).
4. **Video Testimonial Carousel**: 5 streaming CDN videos with Hindi customer quotes, intersection-observer autoplay, and audio mute/unmute.
5. **NABL Lab Testing Section**: 5 certified safety tests with viewable/downloadable NABL test reports ([`documents/26013019137-TUMGARD.pdf`](./documents/26013019137-TUMGARD.pdf)).
6. **Customer Reviews Section**: 500+ customer reviews with verified purchase tags.
7. **How To Use & Dosage Routine**: 3-step usage guidance.
8. **100% Moneyback Guarantee**: Trust badge and warranty terms.
9. **Patient Lab Reports Slider**: Before/after blood test records.
10. **Why Choose Matrix**: Problem vs solution comparison chart.
11. **Comprehensive FAQ Section**: Full accordion for customer questions.
12. **Sticky Floating Buy Bar**: Slides in on scroll with dynamic course price.

### 2. High-Converting Checkout Flow
- **Drawer / Modal Experience**: Clean slide-over checkout preserving user session context.
- **Auto-Pincode Detection**: Automatically queries Postal API to populate City & State when 6 digits are typed.
- **Razorpay Integration**: Opens official Razorpay modal for UPI, Cards, and NetBanking; automatically verifies cryptographic HMAC SHA256 signatures on the backend.
- **Cash on Delivery (COD)**: 1-click alternative for cash customers.
- **Automated Order Creation**: Orders are immediately saved into MongoDB Atlas and tied to the customer CRM.

### 3. Store Admin Portal (`/admin`)
- **Executive Dashboard**:
  - Live revenue calculation (₹)
  - Total order counts & pending fulfillment alerts
  - Customer database tally
- **Order Fulfillment Manager**:
  - Search by Order ID, customer name, phone, or city
  - Filter by order status (*Processing*, *Shipped*, *Delivered*, *Cancelled*) or payment mode (*Razorpay*, *COD*)
  - 1-Click order status updates
- **Customer CRM**:
  - View all buyer profiles, phone numbers, delivery addresses, total spend, and purchase history.
- **Product & Pricing Editor**:
  - Update prices and badges directly in the dashboard; changes propagate instantly to the live storefront without code changes.

---

## 🛠️ API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/products` | `GET` | List active course bundles and pricing |
| `/api/checkout/create-razorpay-order` | `POST` | Create order in Razorpay & receive order ID |
| `/api/checkout/verify-payment` | `POST` | Verify HMAC SHA256 signature & persist order |
| `/api/checkout/cod` | `POST` | Create Cash on Delivery order in MongoDB |
| `/api/orders/:orderId` | `GET` | Retrieve order details for live tracking |
| `/api/admin/login` | `POST` | Admin authentication with JWT token |
| `/api/admin/me` | `GET` | Verify admin session |
| `/api/admin/stats` | `GET` | Dashboard sales and customer analytics |
| `/api/admin/orders` | `GET` | Filterable list of all store orders |
| `/api/admin/orders/:id/status` | `PATCH` | Update order fulfillment status |
| `/api/admin/customers` | `GET` | Full customer CRM database |
| `/api/admin/products/:id` | `PUT` | Update course pricing and badges |

---

## 💻 Running the Server

### 1. Start the Server
```bash
npm start
# or
node server.js
```

### 2. Open in Browser
- **Live Storefront**: [http://localhost:5000](http://localhost:5000)
- **Admin Portal**: [http://localhost:5000/admin](http://localhost:5000/admin)
- **Sample Order Confirmation**: [http://localhost:5000/order-success?orderId=HUGG-971244](http://localhost:5000/order-success?orderId=HUGG-971244)
