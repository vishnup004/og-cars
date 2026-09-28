const form = document.getElementById('resetForm');
const passwordField = document.getElementById('passwordField');

const passwordInput = document.getElementById('password');
const authStatus = document.getElementById('authStatus');
const updateBtn = document.getElementById('updateBtn');
const returnLink = document.getElementById('returnLink');

const MIN_LENGTH = 8;

const requirements = {
  length: { el: document.getElementById('req-length'), test: v => v.length >= MIN_LENGTH },
  upper:  { el: document.getElementById('req-upper'),  test: v => /[A-Z]/.test(v) },
  lower:  { el: document.getElementById('req-lower'),  test: v => /[a-z]/.test(v) },
  number: { el: document.getElementById('req-number'), test: v => /[0-9]/.test(v) },
  special:{ el: document.getElementById('req-special'),test: v => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'~`]/.test(v) },
};

function updateRequirements(value) {
  let allMet = true;
  Object.values(requirements).forEach(req => {
    const met = req.test(value);
    req.el.classList.toggle('met', met);
    if (!met) allMet = false;
  });
  return allMet;
}

const EYE_OPEN =
  '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>';
const EYE_CLOSED =
  '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-4 5.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';

document.querySelectorAll('.toggle-pass').forEach(btn => {
  const eyeIcon = btn.querySelector('.eye-icon') || btn.querySelector('svg');
  const targetId = btn.getAttribute('data-target');
  const targetInput = document.getElementById(targetId);
  if (!targetInput || !eyeIcon) return;

  btn.addEventListener('click', () => {
    const willShow = targetInput.type === 'password';
    targetInput.type = willShow ? 'text' : 'password';
    eyeIcon.innerHTML = willShow ? EYE_OPEN : EYE_CLOSED;
    btn.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
    btn.setAttribute('aria-pressed', String(willShow));
  });
});

function clearError(fieldEl) {
  fieldEl.classList.remove('has-error');
}

function setError(fieldEl) {
  fieldEl.classList.add('has-error');
}

passwordInput.addEventListener('input', () => {
  clearError(passwordField);
  updateRequirements(passwordInput.value);
});

// Initialize checklist state (all unmet) on page load
updateRequirements('');

function isValidAccessKey(value) {
  return updateRequirements(value);
}

function validateForm() {
  let valid = true;
  let message = '';

  if (!isValidAccessKey(passwordInput.value)) {
    setError(passwordField);
    valid = false;
    message = "Your password doesn't meet all the requirements yet — check the list below.";
  } else {
    clearError(passwordField);
  }

  return { valid, message };
}

function showStatus(message, type = 'error') {
  authStatus.textContent = message;
  authStatus.className = `auth-status ${type}`;
}

// No fetch, no unconditional preventDefault(): if validation passes, the
// form submits natively to whatever action/method is set on <form id="resetForm">
// (here: POST to /reset-password/:token with a hidden _method=PUT field).
// If validation fails, we block the native submit so the browser doesn't
// send an invalid payload.
form.addEventListener('submit', (e) => {
  const { valid, message } = validateForm();

  if (!valid) {
    e.preventDefault();
    showStatus(message, 'error');
    return;
  }

  showStatus('', '');
  updateBtn.disabled = true;
  updateBtn.textContent = 'Updating...';
  // Browser takes over from here and performs the real POST/navigation.
});

returnLink.addEventListener('click', () => {
  // Native <a href> navigation handles this; nothing to intercept.
  console.log('Return to login clicked');
});