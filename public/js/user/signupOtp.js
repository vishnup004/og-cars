const form = document.getElementById('otpForm');
const otpField = document.getElementById('otpField');
const otpBoxes = Array.from(document.querySelectorAll('.otp-box'));
const otpHidden = document.getElementById('otpHidden');
const timerText = document.getElementById('timerText');
const timerValue = document.getElementById('timerValue');
const authStatus = document.getElementById('authStatus');
const verifyBtn = document.getElementById('verifyBtn');
const resendLink = document.getElementById('resendLink');

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_EXPIRY_SECONDS = 60; // 5 minutes, keep in sync with server-side OTP TTL

let resendTimer = null;
let otpExpiryTimer = null;
let isOtpExpired = false;
let isSubmitting = false;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Countdown for how long the OTP itself stays valid. Purely a UI cue —
// the server remains the source of truth for actual OTP expiry.
function startOtpExpiryCountdown(seconds) {
  let remaining = seconds;

  isOtpExpired = false;

  timerText.classList.remove('expiring');

  // Don't use timerText.textContent here because timerValue
  // is inside timerText and would be removed.
  timerValue.textContent = formatTime(remaining);

  otpBoxes.forEach((box) => {
    box.disabled = false;
  });

  clearInterval(otpExpiryTimer);

  otpExpiryTimer = setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      clearInterval(otpExpiryTimer);

      isOtpExpired = true;

      timerValue.textContent = '00:00';
      timerText.classList.add('expiring');

      otpBoxes.forEach((box) => {
        box.disabled = true;
      });

      return;
    }

    timerValue.textContent = formatTime(remaining);

    if (remaining <= 30) {
      timerText.classList.add('expiring');
    }
  }, 1000);
}

// Cooldown purely on the resend link's clickability/label. Does not touch
// form submission — the link submits the form natively when clicked and
// not disabled.
function startResendCooldown(seconds) {
  let remaining = seconds;
  resendLink.classList.add('is-disabled');
  resendLink.setAttribute('aria-disabled', 'true');
  resendLink.textContent = `Resend code (${remaining}s)`;

  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(resendTimer);
      resendLink.classList.remove('is-disabled');
      resendLink.removeAttribute('aria-disabled');
      resendLink.textContent = 'Resend code';
    } else {
      resendLink.textContent = `Resend code (${remaining}s)`;
    }
  }, 1000);
}

function clearError() {
  otpField.classList.remove('has-error');
}

function setError() {
  otpField.classList.add('has-error');
}

function getOtpValue() {
  return otpBoxes.map((box) => box.value.trim()).join('');
}

function syncHiddenField() {
  if (otpHidden) otpHidden.value = getOtpValue();
}

function isOtpComplete() {
  return /^\d{6}$/.test(getOtpValue());
}

function showStatus(message, type = 'error') {
  authStatus.textContent = message;
  authStatus.className = `auth-status ${type}`;
}

// Focus the first empty box instead of always box 0, so a user who's
// already filled in a few digits doesn't have to retype them.
function focusFirstEmptyBox() {
  const target = otpBoxes.find((box) => !box.value) || otpBoxes[0];
  target.focus();
}

function resetOtpBoxes() {
  otpBoxes.forEach((box) => { box.value = ''; });
  syncHiddenField();
}

// Auto-advance / backspace navigation between the 6 boxes. Numeric-only,
// single character each. Does not touch form submission behavior.
otpBoxes.forEach((box, index) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);
    clearError();
    showStatus('', '');
    syncHiddenField();

    if (box.value && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && index > 0) {
      otpBoxes[index - 1].focus();
    }
  });

  // Allows pasting a full 6-digit code into any box and having it spread
  // across all boxes.
  box.addEventListener('paste', (e) => {
    const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      e.preventDefault();
      pasted.split('').forEach((digit, i) => {
        if (otpBoxes[i]) otpBoxes[i].value = digit;
      });
      otpBoxes[otpBoxes.length - 1].focus();
      clearError();
      showStatus('', '');
      syncHiddenField();
    }
  });
});

// No fetch, no e.preventDefault() on a valid submission: if validation
// passes, the form submits natively to whatever action/method is set on
// <form id="otpForm">. If validation fails, we block only that invalid
// native submit so the browser doesn't send an incomplete payload.
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  syncHiddenField();

  if (isSubmitting) {
    
    return;
  }

  if (isOtpExpired) {
   
    setError();
    showStatus('This code has expired. Request a new one to continue.', 'error');
    return;
  }

  if (!isOtpComplete()) {
   
    setError();
    showStatus('Please enter the 6-digit code.', 'error');
    focusFirstEmptyBox();
    return;
  }

  clearError();
  showStatus('', '');
  isSubmitting = true;
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';

  try {
    const response = await fetch("/verify-otp", {
      method : "post",
      headers : {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        otp : otpHidden.value
      })
    })

    const data = await response.json();

    if(!data.success){
      showToast(data.message || "Invalid Otp")
      return 
    }

      window.location.href = data.redirect;
      return

  } catch (error) {
    console.error(error);

    showToast('Something went wrong. Please try again.');

    isSubmitting = false;
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify Code';
  }
  // Browser takes over from here and performs the real POST/navigation.
});

// Resend link is a real link acting as a form-submit trigger (via
// requestSubmit with a resend flag), so clicking it submits the form
// natively too — no fetch, no preventDefault here on a valid click.
// We only prevent the click while the cooldown is active, since a
// disabled <a> still needs JS to stop navigation during cooldown.
resendLink.addEventListener('click', (e) => {
  e.preventDefault();

  if (resendLink.classList.contains('is-disabled') || isSubmitting) {
    return;
  }

  clearError();
  showStatus('', '');
  resetOtpBoxes();
  otpBoxes[0].focus();

  isSubmitting = true;
  resendLink.classList.add('is-disabled');
  resendLink.setAttribute('aria-disabled', 'true');

  // Flag the resend intent for the server via a hidden input, then let
  // the browser perform the real native submit/navigation.
  let resendFlag = form.querySelector('input[name="resend"]');
  if (!resendFlag) {
    resendFlag = document.createElement('input');
    resendFlag.type = 'hidden';
    resendFlag.name = 'resend';
    form.appendChild(resendFlag);
  }
  resendFlag.value = '1';

  if (typeof form.requestSubmit === 'function') {
    form.requestSubmit(resendLink);
  } else {
    form.submit();
  }

  // Restart both countdowns optimistically; if the server round-trips
  // back to this same page (no full reload), these keep the UI honest.
  startResendCooldown(RESEND_COOLDOWN_SECONDS);
  startOtpExpiryCountdown(OTP_EXPIRY_SECONDS);
  isSubmitting = false;
});

// Kick off the initial expiry countdown on page load, since this page is
// only rendered after an OTP has already been sent server-side.
startOtpExpiryCountdown(OTP_EXPIRY_SECONDS);

// toast js
function showToast(message) {
  const toast = document.getElementById('toast');

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}