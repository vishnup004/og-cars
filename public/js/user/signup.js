const form = document.getElementById('signupForm');
  const nameField = document.getElementById('nameField');
  const emailField = document.getElementById('emailField');
  const passwordField = document.getElementById('passwordField');
  const confirmField = document.getElementById('confirmField');
 
  const nameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const authStatus = document.getElementById('authStatus');
 
  // Toggle password visibility for both password fields
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      const eyeIcon = btn.querySelector('.eye-icon');
      const isPassword = targetInput.type === 'password';
      targetInput.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
 
      if (isPassword) {
        eyeIcon.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>';
      } else {
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-4 5.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      }
    });
  });
 
  function clearError(fieldEl){
    fieldEl.classList.remove('has-error');
  }
 
  nameInput.addEventListener('input', () => clearError(nameField));
  emailInput.addEventListener('input', () => clearError(emailField));
  passwordInput.addEventListener('input', () => clearError(passwordField));
  confirmInput.addEventListener('input', () => clearError(confirmField));
 
  function isValidCredential(value){
    if (!value.trim()) return false;
    if (value.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return value.trim().length >= 3;
  }
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
 
    if (!nameInput.value.trim()) {
      nameField.classList.add('has-error');
      valid = false;
    } else {
      clearError(nameField);
    }
 
    if (!isValidCredential(emailInput.value)) {
      emailField.classList.add('has-error');
      valid = false;
    } else {
      clearError(emailField);
    }
 
    if (!passwordInput.value.trim()) {
      passwordField.classList.add('has-error');
      valid = false;
    } else {
      clearError(passwordField);
    }
 
    if (confirmInput.value !== passwordInput.value || !confirmInput.value.trim()) {
      confirmField.classList.add('has-error');
      valid = false;
    } else {
      clearError(confirmField);
    }
 
    if (!valid) return;
 
    const signupBtn = document.getElementById('signupBtn');
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';
    authStatus.textContent = '';
    authStatus.className = 'auth-status';
 
    setTimeout(() => {
      signupBtn.disabled = false;
      signupBtn.textContent = 'sign up';
      authStatus.textContent = 'Account created successfully (demo only)';
      authStatus.className = 'auth-status active';
    }, 1200);
  });
 
  function handleGoogleLogin(){
    alert('Continue with Google clicked (hook up your OAuth flow here)');
  }
 
  function handleFacebookLogin(){
    alert('Continue with Facebook clicked (hook up your OAuth flow here)');
  }
 
  function handleClose(){
    console.log('Close clicked');
  }