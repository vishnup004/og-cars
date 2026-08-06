console.log("singup page loaded")
const form = document.getElementById('otpForm');
const otpField = document.getElementById('otpField');
const otpBoxes = Array.from(document.querySelectorAll('.otp-box'));
const verifyBtn = document.getElementById('verifyBtn');
const authStatus = document.getElementById('authStatus');
const resendLink = document.getElementById('resendLink');
const timerText = document.getElementById('timerText');
const timerValue = document.getElementById('timerValue');

const CODE_TTL_SECONDS = 5 * 60; // 5 minutes, keep in sync with backend
const RESEND_COOLDOWN_SECONDS = 30;

let expiryInterval = null;
let resendCooldownInterval = null;

function clearError(){
  otpField.classList.remove('has-error');
}

function getOtpValue(){
  return otpBoxes.map(box => box.value).join('');
}

// Move focus forward/back as digits are entered, allow paste of full code
otpBoxes.forEach((box, index) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);
    clearError();
    if (box.value && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && index > 0) {
      otpBoxes[index - 1].focus();
    }
  });

  box.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
    if (!pasted) return;
    pasted.split('').slice(0, otpBoxes.length).forEach((digit, i) => {
      otpBoxes[i].value = digit;
    });
    const nextEmpty = otpBoxes.findIndex(b => !b.value);
    (nextEmpty === -1 ? otpBoxes[otpBoxes.length - 1] : otpBoxes[nextEmpty]).focus();
    clearError();
  });
});

function startExpiryTimer(seconds){
  clearInterval(expiryInterval);
  let remaining = seconds;
  timerText.classList.remove('expired');
  updateTimerDisplay(remaining);

  expiryInterval = setInterval(() => {
    remaining -= 1;
    updateTimerDisplay(remaining);
    if (remaining <= 0) {
      clearInterval(expiryInterval);
      timerText.classList.add('expired');
      timerValue.parentElement.firstChild.textContent = 'Code expired. ';
      verifyBtn.disabled = true;
    }
  }, 1000);
}

function updateTimerDisplay(seconds){
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  timerValue.textContent = `${m}:${s}`;
}

function startResendCooldown(){
  let remaining = RESEND_COOLDOWN_SECONDS;
  resendLink.style.pointerEvents = 'none';
  resendLink.style.opacity = '0.5';
  resendLink.textContent = `Resend code (${remaining}s)`;

  clearInterval(resendCooldownInterval);
  resendCooldownInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(resendCooldownInterval);
      resendLink.style.pointerEvents = 'auto';
      resendLink.style.opacity = '1';
      resendLink.textContent = 'Resend code';
    } else {
      resendLink.textContent = `Resend code (${remaining}s)`;
    }
  }, 1000);
}

// Resend is now a real <form id="resendForm"> that posts natively to
// /resend-otp (see HTML note below). We only run cosmetic/local state
// here (clearing boxes, restarting timers) right before the browser
// takes over and submits. No fetch, no preventDefault.
const resendForm = document.getElementById('resendForm');
if (resendForm) {
  resendForm.addEventListener('submit', () => {
    otpBoxes.forEach(box => box.value = '');
    verifyBtn.disabled = false;
    startResendCooldown();
    // Browser now submits resendForm natively to /resend-otp.
    // The server should redirect back to this same OTP page with a
    // fresh code + fresh CODE_TTL, which re-runs this script and calls
    // startExpiryTimer(CODE_TTL_SECONDS) again on load.
  });
}

form.addEventListener('submit', (e) => {
  const code = getOtpValue();

  if (code.length !== otpBoxes.length) {
    e.preventDefault();
    otpField.classList.add('has-error');
    return;
  } else {
    clearError();
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';
  authStatus.textContent = '';
  authStatus.className = 'auth-status';
  // Browser takes over from here and performs the real POST to
  // whatever action/method is set on <form id="otpForm">
  // (e.g. action="/verify-otp" method="POST").
});

function handleClose(){
  console.log('Close clicked');
}

// Kick things off
startExpiryTimer(CODE_TTL_SECONDS);
otpBoxes[0].focus();




const resendBtn = document.getElementById("resendLin");

resendBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try{
    const respond = await fetch("/forget-password/resend", {
      method : "POST"
    })
  }catch(error){
    console.log("this error from resendBtn : ", error)
  }
})