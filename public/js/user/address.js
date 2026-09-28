document.addEventListener('DOMContentLoaded', () => {

  // ===== Add / Edit Address Modal =====
  const addressModalOverlay = document.getElementById('addressModalOverlay');
  const addAddressBtn = document.getElementById('addAddressBtn');
  const addressModalCloseBtn = document.getElementById('addressModalCloseBtn');
  const addressModalCancelBtn = document.getElementById('addressModalCancelBtn');
  const addressForm = document.getElementById('addressForm');
  const addressModalTitle = document.getElementById('addressModalTitle');
  const addressModalError = document.getElementById('addressModalError');
  const addressIdInput = document.getElementById('addressId');

  function clearFieldErrors() {
    if (!addressForm) return;
    addressForm.querySelectorAll('.field-error-msg').forEach(el => (el.textContent = ''));
    addressForm.querySelectorAll('input').forEach(el => (el.style.borderColor = ''));
  }

  function openAddressModal(mode, data) {
    addressModalError.textContent = '';
    clearFieldErrors();
    if (mode === 'edit' && data) {
      addressModalTitle.textContent = 'EDIT ADDRESS';
      addressIdInput.value = data.id || '';
      document.getElementById('addrFullName').value = data.fullName || '';
      document.getElementById('addrPhone').value = data.phoneNumber || '';
      document.getElementById('addrLine1').value = data.addressLine || '';
      document.getElementById('district').value = data.district || '';
      document.getElementById('addrCity').value = data.city || '';
      document.getElementById('addrState').value = data.state || '';
      document.getElementById('addrPincode').value = data.pincode || '';
      document.getElementById('addrLabel').value = data.label || '';
    } else {
      addressModalTitle.textContent = 'ADD NEW ADDRESS';
      addressForm.reset();
      addressIdInput.value = '';
    }
    addressModalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    document.getElementById('addrFullName').focus();
  }

  function closeAddressModal() {
    addressModalOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => openAddressModal('add'));
  }
  if (addressModalCloseBtn) addressModalCloseBtn.addEventListener('click', closeAddressModal);
  if (addressModalCancelBtn) addressModalCancelBtn.addEventListener('click', closeAddressModal);

  if (addressModalOverlay) {
    addressModalOverlay.addEventListener('click', (e) => {
      if (e.target === addressModalOverlay) closeAddressModal();
    });
  }

  const addrPhoneInput = document.getElementById('addrPhone');
  if (addrPhoneInput) {
    addrPhoneInput.addEventListener('input', () => {
      addrPhoneInput.value = addrPhoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }
  const addrPincodeInput = document.getElementById('addrPincode');
  if (addrPincodeInput) {
    addrPincodeInput.addEventListener('input', () => {
      addrPincodeInput.value = addrPincodeInput.value.replace(/\D/g, '').slice(0, 6);
    });
  }

  // ===== Edit buttons: read data from the card, open modal pre-filled =====
  document.querySelectorAll('[data-edit-address]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.address-card');
      if (!card) return;
      const data = {
        id: card.dataset.addressId,
        fullName: card.dataset.name,
        phoneNumber: card.dataset.phoneNumber,
        addressLine: card.dataset.addressLine,
        district: card.dataset.district,
        city: card.dataset.city,
        state: card.dataset.state,
        pincode: card.dataset.pincode,
        label: card.dataset.label,
      };
      openAddressModal('edit', data);
    });
  });

  // ===== Delete Address Modal =====
  const deleteModalOverlay = document.getElementById('deleteModalOverlay');
  const deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn');
  const deleteModalCancelBtn = document.getElementById('deleteModalCancelBtn');
  const deleteAddressId = document.getElementById('deleteAddressId');

  function openDeleteModal(id) {
    deleteAddressId.value = id;
    deleteModalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeDeleteModal() {
    deleteModalOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-delete-address]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openDeleteModal(btn.dataset.deleteAddress);
    });
  });

  if (deleteModalCloseBtn) deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
  if (deleteModalCancelBtn) deleteModalCancelBtn.addEventListener('click', closeDeleteModal);
  if (deleteModalOverlay) {
    deleteModalOverlay.addEventListener('click', (e) => {
      if (e.target === deleteModalOverlay) closeDeleteModal();
    });
  }

  // ===== Escape key closes whichever modal is open =====
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (addressModalOverlay && addressModalOverlay.classList.contains('show')) closeAddressModal();
    if (deleteModalOverlay && deleteModalOverlay.classList.contains('show')) closeDeleteModal();
  });

  // ===== Set as default =====
  document.querySelectorAll('[data-set-default]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.setDefault;
      fetch('/profile/address/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: id })
      })
        .then((res) => {
          if (res.ok) {
            window.location.reload();
          } else {
            alert('Could not set default address. Please try again.');
          }
        })
        .catch(() => alert('Network error. Please try again.'));
    });
  });

  // =========================================================
  // FIELD VALIDATION
  // Each field: a "required" message (shown when empty) and
  // a "pattern" message (shown when filled but invalid).
  // =========================================================
  const validators = {
    name: {
      test: v => /^[A-Za-z\s]{3,50}$/.test(v.trim()),
      required: 'Full name is required',
      msg: 'Enter a valid name (letters only, min 3 characters)'
    },
    phone: {
      test: v => /^[6-9]\d{9}$/.test(v.trim()),
      required: 'Phone number is required',
      msg: 'Enter a valid 10-digit mobile number'
    },
    addressLine: {
      test: v => v.trim().length >= 5,
      required: 'Address line is required',
      msg: 'Address must be at least 5 characters'
    },
    district: {
      test: v => /^[A-Za-z\s]{2,30}$/.test(v.trim()),
      required: 'District is required',
      msg: 'Enter a valid district (letters only)'
    },
    city: {
      test: v => /^[A-Za-z\s]{2,30}$/.test(v.trim()),
      required: 'City is required',
      msg: 'Enter a valid city (letters only)'
    },
    state: {
      test: v => /^[A-Za-z\s]{2,30}$/.test(v.trim()),
      required: 'State is required',
      msg: 'Enter a valid state (letters only)'
    },
    pincode: {
      test: v => /^\d{6}$/.test(v.trim()),
      required: 'Pincode is required',
      msg: 'Pincode must be exactly 6 digits'
    },
    label: {
      test: v => v.trim().length >= 2 && v.trim().length <= 20,
      required: 'Label is required',
      msg: 'Label must be 2-20 characters'
    }
  };

  function getFieldError(el) {
    let err = el.parentElement.querySelector('.field-error-msg');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error-msg';
      el.parentElement.appendChild(err);
    }
    return err;
  }

  function validateInput(el) {
    const rule = validators[el.name];
    if (!rule) return true;

    const errEl = getFieldError(el);
    const value = el.value.trim();

    if (value.length === 0) {
      el.classList.add('field-invalid');
      errEl.textContent = rule.required;
      return false;
    }

    if (!rule.test(value)) {
      el.classList.add('field-invalid');
      errEl.textContent = rule.msg;
      return false;
    }

    el.classList.remove('field-invalid');
    errEl.textContent = '';
    return true;
  }

  if (addressForm) {
    // live validation as user types/leaves field
    Object.keys(validators).forEach(fieldName => {
      const el = addressForm.querySelector(`[name="${fieldName}"]`);
      if (el) {
        el.addEventListener('blur', () => validateInput(el));
        el.addEventListener('input', () => {
          // only re-validate live once the field has already been marked invalid
          if (el.classList.contains('field-invalid')) validateInput(el);
        });
      }
    });

    // validate everything on submit; only block if something's invalid
    addressForm.addEventListener('submit', (e) => {
      let isValid = true;
      let firstInvalidEl = null;

      Object.keys(validators).forEach(fieldName => {
        const el = addressForm.querySelector(`[name="${fieldName}"]`);
        if (el) {
          const fieldValid = validateInput(el);
          if (!fieldValid) {
            isValid = false;
            if (!firstInvalidEl) firstInvalidEl = el;
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
        addressModalError.textContent = 'Please fix the errors above before saving.';
        if (firstInvalidEl) firstInvalidEl.focus();
      } else {
        addressModalError.textContent = '';
      }
      // if isValid, do nothing else — form submits normally via its existing action/method
    });
  }

  // ===== Logout Modal (same as profile page) =====
    const logoutModalOverlay = document.getElementById('logoutModalOverlay');
    const logoutModalCloseBtn = document.getElementById('logoutModalCloseBtn');
    const logoutModalCancelBtn = document.getElementById('logoutModalCancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    function openLogoutModal() {
      logoutModalOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function closeLogoutModal() {
      logoutModalOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openLogoutModal();
      });
    }

    if (logoutModalCloseBtn) logoutModalCloseBtn.addEventListener('click', closeLogoutModal);
    if (logoutModalCancelBtn) logoutModalCancelBtn.addEventListener('click', closeLogoutModal);

    if (logoutModalOverlay) {
      logoutModalOverlay.addEventListener('click', (e) => {
        if (e.target === logoutModalOverlay) closeLogoutModal();
      });
    }

});