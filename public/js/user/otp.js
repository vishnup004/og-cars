
const form = document.getElementById("otpForm");
const otpField = document.getElementById("otpField");
const otpBoxes = Array.from(document.querySelectorAll(".otp-box"));
const otpHidden = document.getElementById("otpHidden");

const timerText = document.getElementById("timerText");
const timerValue = document.getElementById("timerValue");

const authStatus = document.getElementById("authStatus");
const verifyBtn = document.getElementById("verifyBtn");

// IMPORTANT: your HTML says resendLink
const resendLink = document.getElementById("resendLink");

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_EXPIRY_SECONDS = 5 * 60;

let resendTimer = null;
let otpExpiryTimer = null;

let isOtpExpired = false;
let isSubmitting = false;

/* =========================
   FORMAT TIMER
========================= */

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");

  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

/* =========================
   OTP EXPIRY TIMER
========================= */

function startOtpExpiryCountdown(seconds) {
  clearInterval(otpExpiryTimer);

  let remaining = seconds;

  isOtpExpired = false;

  timerText.classList.remove("expiring");

  // Make sure the text is correct
  // WITHOUT destroying timerValue span
  timerValue.textContent = formatTime(remaining);

  otpBoxes.forEach((box) => {
    box.disabled = false; 
  });

  otpExpiryTimer = setInterval(() => {
    remaining--;

    console.log("OTP timer:", remaining);

    if (remaining <= 0) {
      clearInterval(otpExpiryTimer);

      isOtpExpired = true;

      timerValue.textContent = "00:00";

      timerText.classList.add("expiring");

      otpBoxes.forEach((box) => {
        box.disabled = true;
      });

      return;
    }

    timerValue.textContent = formatTime(remaining);

    if (remaining <= 30) {
      timerText.classList.add("expiring");
    }
  }, 1000);
}

/* =========================
   RESEND TIMER
========================= */

function startResendCooldown(seconds) {
  clearInterval(resendTimer);

  let remaining = seconds;

  resendLink.classList.add("is-disabled");
  resendLink.setAttribute("aria-disabled", "true");

  resendLink.textContent = `Resend code (${remaining}s)`;

  resendTimer = setInterval(() => {
    remaining--;

    if (remaining <= 0) {
      clearInterval(resendTimer);

      resendLink.classList.remove("is-disabled");
      resendLink.removeAttribute("aria-disabled");

      resendLink.textContent = "Resend code";

      return;
    }

    resendLink.textContent = `Resend code (${remaining}s)`;
  }, 1000);
}

/* =========================
   ERROR HANDLING
========================= */

function clearError() {
  otpField.classList.remove("has-error");
}

function setError() {
  otpField.classList.add("has-error");
}

/* =========================
   OTP VALUE
========================= */

function getOtpValue() {
  return otpBoxes.map((box) => box.value.trim()).join("");
}

function syncHiddenField() {
  if (otpHidden) {
    otpHidden.value = getOtpValue();
  }
}

function isOtpComplete() {
  return /^\d{6}$/.test(getOtpValue());
}

/* =========================
   STATUS MESSAGE
========================= */

function showStatus(message, type = "") {
  authStatus.textContent = message;

  authStatus.className = `auth-status ${type}`;
}

/* =========================
   FOCUS EMPTY BOX
========================= */

function focusFirstEmptyBox() {
  const target = otpBoxes.find((box) => !box.value) || otpBoxes[0];

  target.focus();
}

/* =========================
   RESET OTP BOXES
========================= */

function resetOtpBoxes() {
  otpBoxes.forEach((box) => {
    box.value = "";
  });

  syncHiddenField();
}

/* =========================
   OTP INPUT
========================= */

otpBoxes.forEach((box, index) => {

  box.addEventListener("input", () => {

    box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);

    clearError();
    syncHiddenField();

    // Automatically move to next box
    if (box.value && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });

  box.addEventListener("keydown", (e) => {

    // Backspace → previous box
    if (e.key === "Backspace" && !box.value && index > 0) {
      otpBoxes[index - 1].focus();
    }

  });

  box.addEventListener("paste", (e) => {

    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .trim();

    if (/^\d{6}$/.test(pasted)) {

      e.preventDefault();

      pasted.split("").forEach((digit, i) => {
        if (otpBoxes[i]) {
          otpBoxes[i].value = digit;
        }
      });

      clearError();
      syncHiddenField();

      otpBoxes[5].focus();
    }
  });

});

/* =========================
   VERIFY OTP
========================= */

form.addEventListener("submit", (e) => {
  syncHiddenField();

  if (isSubmitting) {
    e.preventDefault();
    return;
  }

  if (isOtpExpired) {
    e.preventDefault();

    setError();

    showStatus("This code has expired. Request a new one.", "error");

    return;
  }

  if (!isOtpComplete()) {
    e.preventDefault();

    setError();

    showStatus("Please enter the 6-digit code.", "error");

    focusFirstEmptyBox();

    return;
  }

  clearError();

 
  isSubmitting = true;

  verifyBtn.disabled = true;

  verifyBtn.textContent = "Verifying...";
});

/* =========================
   RESEND OTP
========================= */

resendLink.addEventListener("click", (e) => {
  e.preventDefault();

  if (resendLink.classList.contains("is-disabled") || isSubmitting) {
    return;
  }

  clearError();

  showStatus("");

  resetOtpBoxes();

  otpBoxes[0].focus();

  isSubmitting = true;

  resendLink.classList.add("is-disabled");

  resendLink.setAttribute("aria-disabled", "true");

  /*
       IMPORTANT:

       This is a separate form in your HTML.

       So don't use the OTP form here.
    */

  const resendForm = resendLink.closest("form");

  if (resendForm) {
    resendForm.submit();
  }

  /*
       These lines normally won't matter because
       the browser navigates to the resend route.
    */

  startResendCooldown(RESEND_COOLDOWN_SECONDS);

  startOtpExpiryCountdown(OTP_EXPIRY_SECONDS);
});

/* =========================
   START TIMER
========================= */

console.log("OTP page JavaScript loaded");

startOtpExpiryCountdown(OTP_EXPIRY_SECONDS);
