const form = document.getElementById('otpForm');
const otpRow = document.getElementById('otpRow');
const otpInputs = Array.from(document.querySelectorAll('.otp-input'));
const otpError = document.getElementById('otpError');
const progressFill = document.getElementById('progressFill');
const timer = document.getElementById('timer');
const timeLeft = document.getElementById('timeLeft');
const verifyBtn = document.getElementById('verifyBtn');
const authStatus = document.getElementById('authStatus');
const resendLink = document.getElementById('resendLink');
const changeEmail = document.getElementById('changeEmail');
 
const TOTAL_SECONDS = 58;
const DEMO_CODE = '123456';
 
let secondsRemaining = TOTAL_SECONDS;
let countdownId = null;
 
function clearOtpError(){
  otpRow.classList.remove('has-error');
  otpError.classList.remove('visible');
}
 
function formatTime(seconds){
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}
 
function startCountdown(){
  clearInterval(countdownId);
  secondsRemaining = TOTAL_SECONDS;
  timer.classList.remove('expired');
  resendLink.classList.add('disabled');
  timeLeft.textContent = formatTime(secondsRemaining);
  progressFill.style.width = '100%';
 
  countdownId = setInterval(() => {
    secondsRemaining -= 1;
 
    if (secondsRemaining <= 0) {
      secondsRemaining = 0;
      clearInterval(countdownId);
      timer.classList.add('expired');
      resendLink.classList.remove('disabled');
    }
 
    timeLeft.textContent = formatTime(secondsRemaining);
    progressFill.style.width = `${(secondsRemaining / TOTAL_SECONDS) * 100}%`;
  }, 1000);
}
 
// Auto-advance, backspace navigation, and paste support for OTP boxes
otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    clearOtpError();
 
    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
 
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
 
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
    if (!pasted) return;
 
    pasted.split('').slice(0, otpInputs.length).forEach((char, i) => {
      otpInputs[i].value = char;
    });
 
    const nextIndex = Math.min(pasted.length, otpInputs.length - 1);
    otpInputs[nextIndex].focus();
    clearOtpError();
  });
});
 
function getOtpValue(){
  return otpInputs.map(input => input.value).join('');
}
 
form.addEventListener('submit', (e) => {
  e.preventDefault();
 
  const code = getOtpValue();
 
  if (code.length !== 6) {
    otpRow.classList.add('has-error');
    otpError.classList.add('visible');
    return;
  }
 
  if (secondsRemaining <= 0) {
    otpRow.classList.add('has-error');
    otpError.textContent = '⚠ Signal expired. Please request a new code.';
    otpError.classList.add('visible');
    return;
  }
 
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';
  authStatus.textContent = '';
  authStatus.className = 'auth-status';
 
  setTimeout(() => {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify Signal';
 
    if (code === DEMO_CODE) {
      clearOtpError();
      authStatus.textContent = 'Telemetry verified successfully (demo only)';
      authStatus.className = 'auth-status active';
    } else {
      otpRow.classList.add('has-error');
      otpError.textContent = '⚠ Invalid code. Please re-sync telemetry.';
      otpError.classList.add('visible');
      authStatus.textContent = 'Verification failed (demo only)';
      authStatus.className = 'auth-status error';
    }
  }, 1200);
});
 
resendLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (resendLink.classList.contains('disabled')) return;
 
  otpInputs.forEach(input => (input.value = ''));
  clearOtpError();
  otpInputs[0].focus();
 
  authStatus.textContent = 'New code sent (demo only)';
  authStatus.className = 'auth-status active';
 
  startCountdown();
});
 
changeEmail.addEventListener('click', (e) => {
  e.preventDefault();
  // Hook up navigation back to the forgot-password email step here
  console.log('Change email address clicked');
});
 
startCountdown();
otpInputs[0].focus();