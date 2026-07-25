const form = document.getElementById('loginForm');
  const usernameField = document.getElementById('usernameField');
  const passwordField = document.getElementById('passwordField');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePass = document.getElementById('togglePass');
  const eyeIcon = document.getElementById('eyeIcon');
 
  // Toggle password visibility
  togglePass.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePass.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
 
    if (isPassword) {
      // "eye" open icon
      eyeIcon.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>';
    } else {
      // "eye with slash" icon
      eyeIcon.innerHTML = '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-4 5.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    }
  });
 
  function clearError(fieldEl){
    fieldEl.classList.remove('has-error');
  }
 
  usernameInput.addEventListener('input', () => clearError(usernameField));
  passwordInput.addEventListener('input', () => clearError(passwordField));
 
  function isValidCredential(value){
    // simple check: non-empty, and if it looks like an email, must be valid-ish
    if (!value.trim()) return false;
    if (value.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return value.trim().length >= 3;
  }
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
 
    if (!isValidCredential(usernameInput.value)) {
      usernameField.classList.add('has-error');
      valid = false;
    } else {
      clearError(usernameField);
    }
 
    if (!passwordInput.value.trim()) {
      passwordField.classList.add('has-error');
      valid = false;
    } else {
      clearError(passwordField);
    }
 
    if (!valid) return;
 
    // Simulate a login request
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
 
    setTimeout(() => {
      loginBtn.disabled = false;
      loginBtn.textContent = 'login';
      alert('Login successful (demo only)');
    }, 1200);
  });
 
  function handleGoogleLogin(){
    alert('Continue with Google clicked (hook up your OAuth flow here)');
  }
 
  function handleFacebookLogin(){
    alert('Continue with Facebook clicked (hook up your OAuth flow here)');
  }
 
  function handleClose(){
    // Replace with real close/navigate logic
    console.log('Close clicked');
  }