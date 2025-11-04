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
      // Simulate a network request
      showMessage('Thanks! You will be notified about pre-orders.', 'success');
      emailForm.reset();
      setTimeout(() => closeModal(), 1200);
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
