/* ==========================================================================
   GETHUGG TUMGARD REPLICA JAVASCRIPT
   Accurately recreated for frontend evaluation assignment
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. VARIATION CONFIGURATION & LOGIC
     -------------------------------------------------------------------------- */
  const VARIATIONS = {
    '1': {
      code: 'GTG20',
      price: '1,399',
      emi: '466',
      cartId: '120493',
      name: '2 JARS (20 DAYS)'
    },
    '2': {
      code: 'GTG10',
      price: '699',
      emi: '233',
      cartId: '120491',
      name: '1 JAR (10 DAYS)'
    },
    '3': {
      code: 'GTG30',
      price: '2,397',
      emi: '799',
      cartId: '121375',
      name: '3 JARS (30 DAYS)'
    }
  };

  const CODE_TO_VALUE = {
    'GTG20': '1',
    'GCC20': '1',
    'GTG10': '2',
    'GCC10': '2',
    'GTG30': '3',
    'GCC30': '3'
  };

  function applyVariation(val, updateUrl = true) {
    const data = VARIATIONS[val] || VARIATIONS['1'];

    // Select the radio input
    const radio = document.querySelector(`input[name="productVariation"][value="${val}"]`);
    if (radio) {
      radio.checked = true;
    }

    // Update dynamic pricing in Add-to-Cart CTA button
    const priceElem = document.getElementById('product-1-price');
    if (priceElem) {
      priceElem.textContent = data.price;
    }

    // Update EMI price
    const emiElem = document.getElementById('product-1-emi-price');
    if (emiElem) {
      emiElem.textContent = data.emi;
    }

    // Update Cart link
    const linkElem = document.getElementById('product-1-link');
    if (linkElem) {
      linkElem.setAttribute('href', `/cart/?add-to-cart=${data.cartId}`);
    }

    // Update URL query parameter without reloading
    if (updateUrl && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('variation', data.code);
        window.history.replaceState({}, '', url);
      } catch (e) {}
    }
  }

  /* --------------------------------------------------------------------------
     2. DYNAMIC ESTIMATED DELIVERY DATE (Today + 5 Days)
     -------------------------------------------------------------------------- */
  function initEstimatedDelivery() {
    const dateElem = document.getElementById('estimated-Date');
    if (!dateElem) return;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
      'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];
    const day = ('0' + deliveryDate.getDate()).slice(-2);
    const month = monthNames[deliveryDate.getMonth()];

    dateElem.textContent = ` ${day} ${month}`;
  }

  /* --------------------------------------------------------------------------
     3. INTERACTIVE ACCORDIONS
     -------------------------------------------------------------------------- */
  function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.new-accordion-header');

    accordionHeaders.forEach(header => {
      header.addEventListener('click', function () {
        const parentItem = this.closest('.new-accordion-item');
        if (!parentItem) return;

        const isCurrentlyActive = parentItem.classList.contains('active');

        // Optional: Close other accordions in the same container
        const siblings = parentItem.parentElement.querySelectorAll('.new-accordion-item');
        siblings.forEach(sibling => {
          if (sibling !== parentItem) {
            sibling.classList.remove('active');
            const toggle = sibling.querySelector('.accordion-toggle');
            if (toggle) toggle.textContent = '+';
          }
        });

        // Toggle clicked accordion
        if (isCurrentlyActive) {
          parentItem.classList.remove('active');
          const toggle = parentItem.querySelector('.accordion-toggle');
          if (toggle) toggle.textContent = '+';
        } else {
          parentItem.classList.add('active');
          const toggle = parentItem.querySelector('.accordion-toggle');
          if (toggle) toggle.textContent = '−';
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. SCIENCE POPUP MODAL
     -------------------------------------------------------------------------- */
  function initSciencePopup() {
    const openBtn = document.getElementById('openCustomPopup');
    const popup = document.getElementById('customPopup');
    if (!popup) return;

    const closeBtn = popup.querySelector('.custom-popup-close');

    function openModal() {
      popup.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      popup.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    popup.addEventListener('click', function (e) {
      if (e.target === popup) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popup.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. TESTIMONIAL VIDEO SLIDER & AUDIO TOGGLE
     -------------------------------------------------------------------------- */
  function initTestimonials() {
    const section = document.querySelector('.testimonial-slider-section');
    if (!section) return;

    const videos = section.querySelectorAll('video');
    const slides = section.querySelectorAll('.testimonial-slide');
    const slider = section.querySelector('.testimonial-slider');
    const prevBtn = section.querySelector('.testimonial-nav-btn.prev');
    const nextBtn = section.querySelector('.testimonial-nav-btn.next');

    // Autoplay when visible via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            videos.forEach(v => {
              v.muted = true;
              v.setAttribute('playsinline', '');
              v.play().catch(() => {});
            });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      observer.observe(section);
    }

    // Toggle mute/unmute on video or mute icon click
    slides.forEach(slide => {
      const video = slide.querySelector('video');
      const muteBtn = slide.querySelector('.playing-muted');
      if (!video) return;

      function toggleSound(e) {
        e.stopPropagation();
        if (video.muted) {
          // Unmute this video, mute all other testimonial videos
          videos.forEach(v => { v.muted = true; });
          video.muted = false;
          video.play().catch(() => {});
          if (muteBtn) muteBtn.style.opacity = '0.35';
        } else {
          video.muted = true;
          if (muteBtn) muteBtn.style.opacity = '1';
        }
      }

      if (muteBtn) {
        muteBtn.addEventListener('click', toggleSound);
      }
      video.addEventListener('click', toggleSound);
    });

    // Navigation arrows logic (shift slides)
    let currentIndex = 2; // Center slide initially
    function updateSlideHighlights() {
      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.classList.add('active-center');
        } else {
          slide.classList.remove('active-center');
        }
      });
    }
    updateSlideHighlights();

    if (prevBtn && nextBtn && slider) {
      prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlideHighlights();
          slides[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      nextBtn.addEventListener('click', function () {
        if (currentIndex < slides.length - 1) {
          currentIndex++;
          updateSlideHighlights();
          slides[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     6. MOBILE GALLERY SLIDER
     -------------------------------------------------------------------------- */
  function initMobileGallery() {
    const slider = document.querySelector('.product-gallery-slider');
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.product-gallery-slide');
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');
    const dotsContainer = document.querySelector('.product-gallery-dots');

    if (!track || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Create dots if container exists
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `product-gallery-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.product-gallery-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      updateDots();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }

    // Touch swipe support
    let startX = 0;
    let endX = 0;

    slider.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', e => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     7. MOBILE HAMBURGER MENU
     -------------------------------------------------------------------------- */
  function initHamburgerMenu() {
    const openBtn = document.getElementById('hamburger-icon');
    const menu = document.getElementById('hamburger-nav-menu');
    const closeBtn = document.getElementById('hamburger-close');
    const backdrop = document.querySelector('.hamburger-backdrop');

    if (!menu) return;

    function openNav() {
      menu.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      menu.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (backdrop) backdrop.addEventListener('click', closeNav);
  }

  /* --------------------------------------------------------------------------
     8. ADD TO CART BUTTON CLICK FEEDBACK
     -------------------------------------------------------------------------- */
  function initAddToCartFeedback() {
    const btn = document.querySelector('.add-to-cart-btn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      // Prevent double trigger while loading
      if (btn.classList.contains('loading')) {
        e.preventDefault();
        return;
      }

      btn.classList.add('loading');

      // Visual feedback demonstration
      setTimeout(() => {
        btn.classList.remove('loading');
      }, 900);
    });
  }

  
  /* --------------------------------------------------------------------------
     10. CHECKOUT MODAL & RAZORPAY / COD INTEGRATION
     -------------------------------------------------------------------------- */
  const isColCalm = window.location.pathname.includes('colcalm') || document.title.toLowerCase().includes('colcalm');
  const BUNDLE_MAP = isColCalm ? {
    '1': { bundleId: 'colcalm-2-jars', title: 'ColCalm - 2 Jars (20 Days)', price: 1399, origPrice: 2397, badge: 'HALF COURSE', savings: 'Save ₹998', img: './images/colcalm-gallery-img-01-new.webp' },
    '2': { bundleId: 'colcalm-1-jar', title: 'ColCalm - 1 Jar (10 Days)', price: 699, origPrice: 799, badge: 'STARTER COURSE', savings: 'Save ₹100', img: './images/colcalm-gallery-img-01-new.webp' },
    '3': { bundleId: 'colcalm-3-jars', title: 'ColCalm - 3 Jars (30 Days)', price: 2397, origPrice: 4794, badge: 'FLAT 50% OFF', savings: 'Save ₹2,397', img: './images/colcalm-gallery-img-01-new.webp' }
  } : {
    '1': { bundleId: '2-jars', title: 'Tumgard - 2 Jars (20 Days)', price: 1399, origPrice: 2397, badge: 'HALF COURSE', savings: 'Save ₹998', img: './images/Rectangle 6211 (1).webp' },
    '2': { bundleId: '1-jar', title: 'Tumgard - 1 Jar (10 Days)', price: 699, origPrice: 799, badge: 'STARTER COURSE', savings: 'Save ₹100', img: './images/Rectangle 6211 (1).webp' },
    '3': { bundleId: '3-jars', title: 'Tumgard - 3 Jars (30 Days)', price: 2397, origPrice: 4794, badge: 'FLAT 50% OFF', savings: 'Save ₹2,397', img: './images/Rectangle 6211 (1).webp' }
  };

  let currentSelectedBundle = BUNDLE_MAP['1'];

  function openCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    // Determine currently checked variation
    const checkedRadio = document.querySelector('input[name="productVariation"]:checked');
    const val = checkedRadio ? checkedRadio.value : '1';
    currentSelectedBundle = BUNDLE_MAP[val] || BUNDLE_MAP['1'];
    let finalPrice = currentSelectedBundle.price;
    if (isCrossSellAdded) {
      finalPrice += 100;
    }

    // Update Checkout UI
    const titleEl = document.getElementById('checkoutItemTitle');
    const badgeEl = document.getElementById('checkoutItemBadge');
    const imgEl = document.getElementById('checkoutItemImg');
    const priceEl = document.getElementById('checkoutItemPrice');
    const origPriceEl = document.getElementById('checkoutItemOrigPrice');
    const savingsEl = document.getElementById('checkoutItemSavings');
    const subtotalEl = document.getElementById('breakdownSubtotal');
    const totalEl = document.getElementById('breakdownTotal');
    const submitBtnText = document.getElementById('submitBtnText');

    if (titleEl) titleEl.textContent = currentSelectedBundle.title;
    if (badgeEl) badgeEl.textContent = currentSelectedBundle.badge;
    if (imgEl && currentSelectedBundle.img) imgEl.src = currentSelectedBundle.img;
    if (priceEl) priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
    if (origPriceEl) origPriceEl.textContent = `₹${currentSelectedBundle.origPrice.toLocaleString('en-IN')}`;
    if (savingsEl) savingsEl.textContent = currentSelectedBundle.savings;
    if (subtotalEl) subtotalEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
    if (submitBtnText) submitBtnText.textContent = `Place Order - ₹${currentSelectedBundle.price.toLocaleString('en-IN')}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    const closeBtn = document.getElementById('closeCheckoutBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeCheckout);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCheckout();
    });

    // Wire all "Buy Now" buttons to open checkout
    const buyBtns = document.querySelectorAll('.product-btn, #stickyBuyBtn, a[href="#buy-now"]');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If it's science modal button, ignore
        if (btn.id === 'openCustomPopup' || btn.getAttribute('href') === '#science') return;
        e.preventDefault();
        openCheckout();
      });
    });

    // Payment Option toggles
    const rzpLabel = document.getElementById('payRazorpayLabel');
    const codLabel = document.getElementById('payCodLabel');
    const rzpRadio = document.querySelector('input[name="paymentMethod"][value="razorpay"]');
    const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]');

    if (rzpRadio && codRadio) {
      rzpRadio.addEventListener('change', () => {
        rzpLabel.classList.add('active');
        codLabel.classList.remove('active');
      });
      codRadio.addEventListener('change', () => {
        codLabel.classList.add('active');
        rzpLabel.classList.remove('active');
      });
    }

    // Pincode auto-lookup
    const pincodeInput = document.getElementById('custPincode');
    if (pincodeInput) {
      pincodeInput.addEventListener('input', async function () {
        const val = this.value.trim();
        if (val.length === 6) {
          try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
            const data = await res.json();
            if (data && data[0] && data[0].Status === 'Success') {
              const details = data[0].PostOffice[0];
              const cityInput = document.getElementById('custCity');
              const stateInput = document.getElementById('custState');
              if (cityInput && !cityInput.value) cityInput.value = details.District;
              if (stateInput && !stateInput.value) stateInput.value = details.State;
            }
          } catch (e) {}
        }
      });
    }

    // Form Submission Handler
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitOrderBtn');
      const submitText = document.getElementById('submitBtnText');
      const loader = submitBtn.querySelector('.checkout-loader');

      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const email = document.getElementById('custEmail').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      const pincode = document.getElementById('custPincode').value.trim();
      const city = document.getElementById('custCity').value.trim();
      const state = document.getElementById('custState').value.trim();

      if (!name || !phone || !email || !address || !pincode) {
        alert('Please fill in all required shipping fields.');
        return;
      }

      if (phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }

      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      const customer = { name, phone, email, address, pincode, city, state };

      // Set Loading State
      submitBtn.disabled = true;
      if (submitText) submitText.style.display = 'none';
      if (loader) loader.style.display = 'inline-block';

      try {
        if (paymentMethod === 'cod') {
          // Process Cash on Delivery
          const res = await fetch('/api/checkout/cod', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bundleId: currentSelectedBundle.bundleId, customer }),
          });
          const data = await res.json();
          if (data.success && data.orderId) {
            window.location.href = `/order-success?orderId=${data.orderId}`;
          } else {
            alert('Failed to place order: ' + (data.message || 'Unknown error'));
            resetButton();
          }
        } else {
          // Process Razorpay Online Payment
          const res = await fetch('/api/checkout/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bundleId: currentSelectedBundle.bundleId, customer }),
          });
          const orderData = await res.json();

          if (!orderData.success || !orderData.orderId) {
            alert('Payment initialization failed: ' + (orderData.message || 'Please try again'));
            resetButton();
            return;
          }

          // Launch Razorpay Checkout Popup
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Hugg Beverages',
            description: `${currentSelectedBundle.title} - Gut Health Care`,
            image: './images/cropped-Transparent_Logomark-2-32x32.png',
            order_id: orderData.orderId,
            handler: async function (response) {
              // Verify payment on backend
              try {
                const verifyRes = await fetch('/api/checkout/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    bundleId: currentSelectedBundle.bundleId,
                    customer,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success && verifyData.orderId) {
                  window.location.href = `/order-success?orderId=${verifyData.orderId}`;
                } else {
                  alert('Payment verification failed. Please contact support.');
                  resetButton();
                }
              } catch (err) {
                alert('Network error verifying payment.');
                resetButton();
              }
            },
            prefill: {
              name: customer.name,
              email: customer.email,
              contact: customer.phone,
            },
            theme: {
              color: '#0f172a',
            },
            modal: {
              ondismiss: function () {
                resetButton();
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            alert('Payment Failed: ' + response.error.description);
            resetButton();
          });
          rzp.open();
        }
      } catch (err) {
        console.error('Order error:', err);
        alert('Server communication error. Please try again.');
        resetButton();
      }

      function resetButton() {
        submitBtn.disabled = false;
        if (submitText) submitText.style.display = 'inline';
        if (loader) loader.style.display = 'none';
      }
    });
  }

  // Load Dynamic Prices from Backend
  async function loadBackendPrices() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        data.data.forEach(p => {
          if (p.bundleId === '1-jar' && BUNDLE_MAP['2']) {
            BUNDLE_MAP['2'].price = p.price;
            BUNDLE_MAP['2'].origPrice = p.originalPrice;
            VARIATIONS['2'].price = p.price.toLocaleString('en-IN');
          } else if (p.bundleId === '2-jars' && BUNDLE_MAP['1']) {
            BUNDLE_MAP['1'].price = p.price;
            BUNDLE_MAP['1'].origPrice = p.originalPrice;
            VARIATIONS['1'].price = p.price.toLocaleString('en-IN');
          } else if (p.bundleId === '3-jars' && BUNDLE_MAP['3']) {
            BUNDLE_MAP['3'].price = p.price;
            BUNDLE_MAP['3'].origPrice = p.originalPrice;
            VARIATIONS['3'].price = p.price.toLocaleString('en-IN');
          }
        });
        // Re-apply current selection
        const checked = document.querySelector('input[name="productVariation"]:checked');
        if (checked) applyVariation(checked.value, false);
      }
    } catch (e) {}
  }

  
  /* --------------------------------------------------------------------------
     11. GLOBAL ACCORDION TOGGLER (FOR FAQ & FOOTER)
     -------------------------------------------------------------------------- */
  window.toggleAccordion = function(header) {
    const item = header.closest('.new-accordion-item') || header.parentElement;
    if (!item) return;
    const content = item.querySelector('.new-accordion-content');
    const toggle = item.querySelector('.accordion-toggle');
    const isActive = item.classList.contains('active');

    // Close siblings in the same accordion container
    const container = item.parentElement;
    if (container) {
      container.querySelectorAll('.new-accordion-item, .footer-head').forEach(sib => {
        if (sib !== item) {
          sib.classList.remove('active');
          const sc = sib.querySelector('.new-accordion-content') || sib.nextElementSibling;
          if (sc && sc.classList && sc.classList.contains('new-accordion-content')) sc.style.display = 'none';
          const st = sib.querySelector('.accordion-toggle');
          if (st) st.textContent = '+';
        }
      });
    }

    if (isActive) {
      item.classList.remove('active');
      if (content) content.style.display = 'none';
      if (toggle) toggle.textContent = '+';
    } else {
      item.classList.add('active');
      if (content) content.style.display = 'block';
      if (toggle) toggle.textContent = '-';
    }
  };

  /* --------------------------------------------------------------------------
     12. GOES BEST WITH CROSS-SELL ITEM (₹100 POST MEAL JAM)
     -------------------------------------------------------------------------- */
  let isCrossSellAdded = false;

  function initCrossSell() {
    const box = document.querySelector('.recommended-product-box');
    if (!box) return;

    box.style.cursor = 'pointer';
    box.addEventListener('click', function () {
      isCrossSellAdded = !isCrossSellAdded;
      const plusIcon = box.querySelector('img[alt="Add cross-sell item"]') || box.querySelector('img:last-child');
      
      if (isCrossSellAdded) {
        box.style.borderColor = '#15803d';
        box.style.background = '#f0fdf4';
        if (plusIcon) plusIcon.src = './images/circle-checkmark.svg';
      } else {
        box.style.borderColor = '';
        box.style.background = '';
        if (plusIcon) plusIcon.src = './images/accordion-plus.svg';
      }

      // Re-apply variation to recalculate prices
      const checkedRadio = document.querySelector('input[name="productVariation"]:checked');
      if (checkedRadio) applyVariation(checkedRadio.value, false);
    });
  }

  /* --------------------------------------------------------------------------
     13. REPORTS SLIDER NAV BUTTONS
     -------------------------------------------------------------------------- */
  function initReportsSlider() {
    const slider = document.querySelector('.reports-slider');
    if (!slider) return;

    const track = slider.querySelector('.slick-track');
    const prevBtn = slider.querySelector('.slick-prev');
    const nextBtn = slider.querySelector('.slick-next');
    if (!track) return;

    let currentOffset = 0;
    const step = 220;
    const maxOffset = 1500;

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentOffset = Math.min(currentOffset + step, maxOffset);
        track.style.transition = 'transform 0.3s ease';
        track.style.transform = `translate3d(-${currentOffset}px, 0px, 0px)`;
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentOffset = Math.max(currentOffset - step, 0);
        track.style.transition = 'transform 0.3s ease';
        track.style.transform = `translate3d(-${currentOffset}px, 0px, 0px)`;
      });
    }
  }

  /* --------------------------------------------------------------------------
     9. DOCUMENT INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Radio change listeners
    const radios = document.querySelectorAll('input[name="productVariation"]');
    radios.forEach(radio => {
      radio.addEventListener('change', function () {
        applyVariation(this.value);
      });
    });

    // Also support clicking card directly
    const labels = document.querySelectorAll('.product-variation-radio-label');
    labels.forEach(label => {
      label.addEventListener('click', function () {
        const forId = this.getAttribute('for');
        const input = document.getElementById(forId);
        if (input && !input.checked) {
          input.checked = true;
          applyVariation(input.value);
        }
      });
    });

    // 2. Check initial URL query parameter
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVar = urlParams.get('variation');
      if (urlVar && CODE_TO_VALUE[urlVar]) {
        applyVariation(CODE_TO_VALUE[urlVar], false);
      } else {
        applyVariation('1', false);
      }
    } catch (e) {
      applyVariation('1', false);
    }

    function initHashNavigation() {
      function scrollToExplore() {
        if (window.location.hash === '#explore-products') {
          const el = document.getElementById('explore-products');
          if (el) {
            setTimeout(function() {
              el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      }
      scrollToExplore();
      window.addEventListener('hashchange', scrollToExplore);

      document.querySelectorAll('a[href="#explore-products"], a[href="/#explore-products"]').forEach(function(a) {
        a.addEventListener('click', function(e) {
          const el = document.getElementById('explore-products');
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', '#explore-products');
          }
        });
      });
    }

    // 3. Initialize all interactive widgets
    initEstimatedDelivery();
    initAccordions();
    initSciencePopup();
    initTestimonials();
    initMobileGallery();
    initHamburgerMenu();
    initAddToCartFeedback();
    initCheckout();
    initCrossSell();
    initReportsSlider();
    initHashNavigation();
    loadBackendPrices();
  });

})();
