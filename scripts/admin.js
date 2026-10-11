// Admin Dashboard Controller
let authToken = localStorage.getItem('hugg_admin_token') || null;

const loginScreen = document.getElementById('loginScreen');
const adminApp = document.getElementById('adminApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Navigation links
const navLinks = document.querySelectorAll('.nav-link');
const views = {
  dashboard: document.getElementById('viewDashboard'),
  orders: document.getElementById('viewOrders'),
  customers: document.getElementById('viewCustomers'),
  products: document.getElementById('viewProducts'),
};

const viewTitles = {
  dashboard: { title: 'Store Overview', subtitle: 'Live sales and operational analytics' },
  orders: { title: 'Orders Management', subtitle: 'Search, track, and update fulfillment status' },
  customers: { title: 'Customer Database', subtitle: 'Customer contact information and order history' },
  products: { title: 'Products & Pricing', subtitle: 'Update course pricing, discount tags, and stock' },
};

// Check Auth on load
async function checkAuth() {
  if (!authToken) {
    showLogin();
    return;
  }
  try {
    const res = await fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (data.success && data.admin) {
      showDashboard(data.admin);
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = 'flex';
  adminApp.style.display = 'none';
}

function showDashboard(admin) {
  loginScreen.style.display = 'none';
  adminApp.style.display = 'flex';
  document.getElementById('adminNameDisplay').textContent = admin.name || 'Talib Ansari';
  document.getElementById('adminEmailDisplay').textContent = admin.email || 'TalibAnsari@gmail.com';

  loadDashboardStats();
  loadOrders();
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      authToken = data.token;
      localStorage.setItem('hugg_admin_token', authToken);
      showDashboard(data.admin);
    } else {
      loginError.textContent = data.message || 'Invalid email or password';
      loginError.style.display = 'block';
    }
  } catch (err) {
    loginError.textContent = 'Server error. Please try again.';
    loginError.style.display = 'block';
  }
});

// Handle Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  authToken = null;
  localStorage.removeItem('hugg_admin_token');
  await fetch('/api/admin/logout', { method: 'POST' });
  showLogin();
});

// View Switching
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetView = link.getAttribute('data-view');
    switchView(targetView);
  });
});

document.getElementById('seeAllOrdersLink').addEventListener('click', (e) => {
  e.preventDefault();
  switchView('orders');
});

function switchView(viewName) {
  navLinks.forEach((l) => l.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
  if (activeLink) activeLink.classList.add('active');

  Object.keys(views).forEach((k) => {
    if (views[k]) views[k].classList.remove('active');
  });

  if (views[viewName]) {
    views[viewName].classList.add('active');
    document.getElementById('currentViewTitle').textContent = viewTitles[viewName].title;
    document.getElementById('currentViewSubtitle').textContent = viewTitles[viewName].subtitle;
  }

  if (viewName === 'dashboard') loadDashboardStats();
  if (viewName === 'orders') loadOrders();
  if (viewName === 'customers') loadCustomers();
  if (viewName === 'products') loadProducts();
}

// 1. Load Dashboard Stats
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (data.success) {
      const stats = data.stats;
      document.getElementById('statRevenue').textContent = `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`;
      document.getElementById('statOrders').textContent = stats.totalOrders || 0;
      document.getElementById('statCustomers').textContent = stats.totalCustomers || 0;
      document.getElementById('statPending').textContent = stats.processingCount || 0;

      // Render Recent Orders
      const tbody = document.getElementById('recentOrdersTableBody');
      if (data.recentOrders && data.recentOrders.length > 0) {
        tbody.innerHTML = data.recentOrders
          .map((o) => {
            const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });
            const payBadge = o.paymentStatus === 'paid' ? 'paid' : 'pending';
            const statusBadge = o.orderStatus;
            return `
              <tr>
                <td><strong>#${o.orderId}</strong></td>
                <td>${o.customer ? o.customer.name : 'Unknown'}</td>
                <td>${o.customer ? o.customer.phone : '-'}</td>
                <td><strong>₹${o.totalAmount}</strong></td>
                <td><span class="badge ${payBadge}">${o.paymentMethod.toUpperCase()} (${o.paymentStatus.toUpperCase()})</span></td>
                <td><span class="badge ${statusBadge}">${o.orderStatus.toUpperCase()}</span></td>
                <td>${dateStr}</td>
              </tr>
            `;
          })
          .join('');
      } else {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color:#64748b;">No orders placed yet. Place an order on the storefront to test!</td></tr>`;
      }
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// 2. Load Orders Table
async function loadOrders() {
  const search = document.getElementById('orderSearchInput').value.trim();
  const status = document.getElementById('orderStatusFilter').value;
  const paymentStatus = document.getElementById('paymentFilter').value;

  try {
    let url = `/api/admin/orders?status=${status}&paymentStatus=${paymentStatus}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    const tbody = document.getElementById('allOrdersTableBody');

    if (data.success && data.orders && data.orders.length > 0) {
      tbody.innerHTML = data.orders
        .map((o) => {
          const itemText = o.items && o.items.length > 0 ? o.items[0].title : 'Tumgard';
          const fullAddress = o.customer
            ? `${o.customer.address}, ${o.customer.city} (${o.customer.pincode})`
            : '-';
          return `
            <tr>
              <td><strong>#${o.orderId}</strong></td>
              <td>
                <strong>${o.customer.name}</strong><br>
                <span style="font-size:12px; color:#64748b;">${o.customer.phone}</span><br>
                <span style="font-size:11px; color:#94a3b8;">${o.customer.email}</span>
              </td>
              <td style="max-width:200px; font-size:13px;">${fullAddress}</td>
              <td>${itemText}</td>
              <td><strong>₹${o.totalAmount}</strong></td>
              <td>
                <span class="badge ${o.paymentStatus === 'paid' ? 'paid' : 'pending'}">
                  ${o.paymentMethod.toUpperCase()} (${o.paymentStatus.toUpperCase()})
                </span>
              </td>
              <td><span class="badge ${o.orderStatus}">${o.orderStatus.toUpperCase()}</span></td>
              <td>
                <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)">
                  <option value="processing" ${o.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
                  <option value="shipped" ${o.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="delivered" ${o.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="cancelled" ${o.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </td>
            </tr>
          `;
        })
        .join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color:#64748b;">No matching orders found.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading orders:', err);
  }
}

// Update Order Status Handler
window.updateOrderStatus = async function (orderDocId, newStatus) {
  try {
    const res = await fetch(`/api/admin/orders/${orderDocId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ orderStatus: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      loadOrders();
      loadDashboardStats();
    } else {
      alert('Failed to update status: ' + data.message);
    }
  } catch (err) {
    alert('Error updating status');
  }
};

// Filters listeners
document.getElementById('orderSearchInput').addEventListener('input', debounce(loadOrders, 300));
document.getElementById('orderStatusFilter').addEventListener('change', loadOrders);
document.getElementById('paymentFilter').addEventListener('change', loadOrders);
document.getElementById('refreshBtn').addEventListener('click', () => {
  loadDashboardStats();
  loadOrders();
  loadCustomers();
  loadProducts();
});

// 3. Load Customers
async function loadCustomers() {
  try {
    const res = await fetch('/api/admin/customers', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    const tbody = document.getElementById('customersTableBody');

    if (data.success && data.customers && data.customers.length > 0) {
      tbody.innerHTML = data.customers
        .map((c) => {
          const lastDate = new Date(c.lastOrderAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>
                <span>📞 ${c.phone}</span><br>
                <span style="font-size:12px; color:#64748b;">✉️ ${c.email}</span>
              </td>
              <td>${c.city || '-'}, ${c.state || '-'}</td>
              <td><strong>${c.ordersCount}</strong> order(s)</td>
              <td><strong style="color:#15803d;">₹${(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
              <td>${lastDate}</td>
            </tr>
          `;
        })
        .join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color:#64748b;">No customers registered yet.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading customers:', err);
  }
}

// 4. Load Products & Pricing
async function loadProducts() {
  try {
    const res = await fetch('/api/admin/products', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    const grid = document.getElementById('productsGridContainer');

    if (data.success && data.products) {
      grid.innerHTML = data.products
        .map(
          (p) => `
          <div class="product-admin-card" id="card-${p._id}">
            <h4>${p.title}</h4>
            <div class="prod-form-group">
              <label>Selling Price (₹)</label>
              <input type="number" id="price-${p._id}" value="${p.price}">
            </div>
            <div class="prod-form-group">
              <label>Original / Struck Price (₹)</label>
              <input type="number" id="origPrice-${p._id}" value="${p.originalPrice}">
            </div>
            <div class="prod-form-group">
              <label>Primary Badge</label>
              <input type="text" id="badge-${p._id}" value="${p.badge || ''}">
            </div>
            <div class="prod-form-group">
              <label>Secondary Badge</label>
              <input type="text" id="secBadge-${p._id}" value="${p.secondaryBadge || ''}">
            </div>
            <button type="button" class="btn-save-prod" onclick="saveProductPrice('${p._id}')">
              Save Pricing Changes
            </button>
          </div>
        `
        )
        .join('');
    }
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

window.saveProductPrice = async function (prodId) {
  const price = document.getElementById(`price-${prodId}`).value;
  const originalPrice = document.getElementById(`origPrice-${prodId}`).value;
  const badge = document.getElementById(`badge-${prodId}`).value;
  const secondaryBadge = document.getElementById(`secBadge-${prodId}`).value;

  try {
    const res = await fetch(`/api/admin/products/${prodId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ price, originalPrice, badge, secondaryBadge }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Product pricing updated successfully! Live store will now reflect the new prices.');
    } else {
      alert('Failed to update product: ' + data.message);
    }
  } catch (err) {
    alert('Error updating product');
  }
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initial start
checkAuth();
