const form = document.getElementById('forgotForm');
const emailField = document.getElementById('emailField');
const emailInput = document.getElementById('email');
const authStatus = document.getElementById('authStatus');
const recoveryBtn = document.getElementById('recoveryBtn');
const backToLogin = document.getElementById('backToLogin');
 
function clearError(fieldEl){
  fieldEl.classList.remove('has-error');
}
 
emailInput.addEventListener('input', () => clearError(emailField));
 
function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
 
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
 
  if (!isValidEmail(emailInput.value)) {
    emailField.classList.add('has-error');
    valid = false;
  } else {
    clearError(emailField);
  }
 
  if (!valid) return;
 
  recoveryBtn.disabled = true;
  recoveryBtn.textContent = 'Sending...';
  authStatus.textContent = '';
  authStatus.className = 'auth-status';
 
  setTimeout(() => {
    recoveryBtn.disabled = false;
    recoveryBtn.innerHTML = 'Send Recovery Code <span aria-hidden="true">⚡</span>';
    authStatus.textContent = 'Recovery code sent to your email (demo only)';
    authStatus.className = 'auth-status active';
  }, 1200);
});
 
backToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  // Hook up navigation to your login page here
  console.log('Back to Login clicked');
});
 