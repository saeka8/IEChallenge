// scripts.js — minimal JS to reproduce the EmailModal behavior from Index.tsx
(function () {
  // Helpers
  function qs(selector, root = document) { return root.querySelector(selector); }
  function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }

  const modal = qs('#email-modal');
  const modalBackdrop = qs('[data-modal-backdrop]');
  const openButtons = qsa('[data-open-modal]');
  const closeButtons = qsa('[data-close-modal]');
  const emailForm = qs('#email-form');
  const emailInput = qs('#email-input');
  const messageEl = qs('#email-form-message');

  function isOpen() {
    return modal && modal.getAttribute('aria-hidden') === 'false';
  }

  function openModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    // focus the input
    setTimeout(() => { emailInput && emailInput.focus(); }, 50);
    // trap focus minimally
    document.addEventListener('keydown', handleKeyDown);
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.removeEventListener('keydown', handleKeyDown);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  // Attach open handlers
  openButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

  // Attach close handlers
  closeButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  }));

  // Clicking backdrop closes modal
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => closeModal());
  }

  // Form submit
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = (emailInput && emailInput.value || '').trim();
      if (!validateEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      // Get URL from config
      const GOOGLE_SCRIPT_URL = window.CONFIG?.GOOGLE_SCRIPT_URL || '';
      
      if (!GOOGLE_SCRIPT_URL) {
        showMessage('Configuration error. Please contact support.', 'error');
        return;
      }
      
      // Show loading message
      showMessage('Submitting...', 'info');
      
      // Send to Google Sheets
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'email': email
        })
      })
      .then(() => {
        showMessage('Thanks! You will be notified about pre-orders.', 'success');
        
        // Track email submission in Google Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'email_signup', {
            'event_category': 'engagement',
            'event_label': 'Email Form Submission'
          });
        }
        
        emailForm.reset();
        setTimeout(() => closeModal(), 1500);
      })
      .catch((error) => {
        console.error('Error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
      });
    });
  }

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'message ' + (type || '');
  }

  function validateEmail(email) {
    // simple email regex
    return /\S+@\S+\.\S+/.test(email);
  }

  // Expose for debugging
  window.leafsoap = {
    openModal,
    closeModal,
    isOpen
  };
})();

// Shop Now button handler
document.addEventListener('DOMContentLoaded', function() {
  const shopModal = document.querySelector('#shop-modal');
  const shopModalBackdrop = document.querySelector('[data-shop-modal-backdrop]');
  const closeShopButtons = document.querySelectorAll('[data-close-shop-modal]');
  
  function openShopModal() {
    if (!shopModal) return;
    shopModal.setAttribute('aria-hidden', 'false');
    shopModal.classList.add('is-open');
  }
  
  function closeShopModal() {
    if (!shopModal) return;
    shopModal.setAttribute('aria-hidden', 'true');
    shopModal.classList.remove('is-open');
  }
  
  // Attach close handlers
  closeShopButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    closeShopModal();
  }));
  
  // Clicking backdrop closes modal
  if (shopModalBackdrop) {
    shopModalBackdrop.addEventListener('click', () => closeShopModal());
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shopModal.getAttribute('aria-hidden') === 'false') {
      closeShopModal();
    }
  });
  
  // Find all Shop Now buttons
  const shopButtons = document.querySelectorAll('a[href="#"], button');
  
  shopButtons.forEach(button => {
    const buttonText = button.textContent.trim().toLowerCase();
    if (buttonText.includes('shop now')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Track Shop Now click in Google Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'shop_now_click', {
            'event_category': 'engagement',
            'event_label': 'Shop Now Button'
          });
        }
        
        openShopModal();
      });
    }
  });
});
