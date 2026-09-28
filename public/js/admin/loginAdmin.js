const form = document.getElementById('loginForm');
const usernameField = document.getElementById('usernameField');
const passwordField = document.getElementById('passwordField');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePass = document.getElementById('togglePass');
const eyeIcon = document.getElementById('eyeIcon');
const loginBtn = document.getElementById('loginBtn');

// --- Toggle password visibility ---
togglePass.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePass.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

  eyeIcon.innerHTML = isPassword
    ? '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>'
    : '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-4 5.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
});

// --- Error helpers ---
function setError(fieldEl, message){
  fieldEl.classList.add('has-error');
  const msgEl = fieldEl.querySelector('.error-msg');
  if (msgEl) msgEl.textContent = message;
}

function clearError(fieldEl){
  fieldEl.classList.remove('has-error');
}

usernameInput.addEventListener('input', () => clearError(usernameField));
passwordInput.addEventListener('input', () => clearError(passwordField));

// --- Validation ---
function validateUsername(value){
  const v = value.trim();
  if (!v) return 'Please enter your email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address';
  return null;
}

function validatePassword(value){
  if (!value.trim()) return 'Please enter your password';
  return null;
}

// --- Submit handler: only blocks submission on invalid input ---
form.addEventListener('submit', (e) => {
  const usernameError = validateUsername(usernameInput.value);
  const passwordError = validatePassword(passwordInput.value);

  if (usernameError) setError(usernameField, usernameError);
  else clearError(usernameField);

  if (passwordError) setError(passwordField, passwordError);
  else clearError(passwordField);

  if (usernameError || passwordError) {
    e.preventDefault(); // only block when invalid
    (usernameError ? usernameInput : passwordInput).focus();
    return;
  }

  // Valid — let the browser submit the form natively to form.action ("/admin/login")
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
});

function handleClose(){
  window.location.href = '/';
}