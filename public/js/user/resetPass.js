const form = document.getElementById('resetForm');
const passwordField = document.getElementById('passwordField');
const confirmField = document.getElementById('confirmField');
 
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const authStatus = document.getElementById('authStatus');
 
const formError = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');
const updateBtn = document.getElementById('updateBtn');
const returnLink = document.getElementById('returnLink');
 
const MIN_LENGTH = 8;
 
// Toggle password visibility for both access-key fields
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
 
function hideFormError(){
  formError.classList.remove('visible');
}
 
function showFormError(message){
  formErrorText.textContent = message;
  formError.classList.add('visible');
}
 
passwordInput.addEventListener('input', () => {
  clearError(passwordField);
  hideFormError();
});
 
confirmInput.addEventListener('input', () => {
  clearError(confirmField);
  hideFormError();
});
 
function isValidAccessKey(value){
  return value.trim().length >= MIN_LENGTH;
}
 
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
 
  if (!isValidAccessKey(passwordInput.value)) {
    passwordField.classList.add('has-error');
    showFormError(`Access key must be at least ${MIN_LENGTH} characters`);
    valid = false;
  } else {
    clearError(passwordField);
  }
 
  if (valid && (confirmInput.value !== passwordInput.value || !confirmInput.value.trim())) {
    confirmField.classList.add('has-error');
    showFormError('Passwords do not match');
    valid = false;
  } else if (valid) {
    clearError(confirmField);
    hideFormError();
  }
 
  if (!valid) return;
 
  updateBtn.disabled = true;
  updateBtn.textContent = 'Updating...';
  authStatus.textContent = '';
  authStatus.className = 'auth-status';
 
  setTimeout(() => {
    updateBtn.disabled = false;
    updateBtn.innerHTML = 'Update Credentials <span aria-hidden="true">⚡</span>';
    authStatus.textContent = 'Credentials updated successfully (demo only)';
    authStatus.className = 'auth-status active';
  }, 1200);
});
 
returnLink.addEventListener('click', (e) => {
  e.preventDefault();
  // Hook up navigation back to the login / command center page here
  console.log('Return to Command Center clicked');
});