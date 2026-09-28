const form = document.getElementById("otpForm");
const otpField = document.getElementById("otpField");
const otpBoxes = Array.from(document.querySelectorAll(".otp-box"));
const otpHidden = document.getElementById("otpHidden");

const timerText = document.getElementById("timerText");
const timerValue = document.getElementById("timerValue");

const verifyBtn = document.getElementById("verifyBtn");
const resendLink = document.getElementById("resendLink");

const OTP_EXPIRY_SECONDS = 5 * 60;

let otpExpiryTimer = null;

let isOtpExpired = false;
let isSubmitting = false;

/* =========================
   TOAST
========================= */

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("show");

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

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
  timerValue.textContent = formatTime(remaining);

  otpBoxes.forEach((box) => {
    box.disabled = false;
  });

  otpExpiryTimer = setInterval(() => {
    remaining--;

    if (remaining <= 0) {
      clearInterval(otpExpiryTimer);
      otpExpiryTimer = null;

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
   FOCUS HELPERS
========================= */

function focusFirstEmptyBox() {
  const target = otpBoxes.find((box) => !box.value) || otpBoxes[0];
  target.focus();
}

function resetOtpBoxes() {
  otpBoxes.forEach((box) => {
    box.value = "";
  });

  syncHiddenField();
}

/* =========================
   OTP INPUT HANDLING
========================= */

otpBoxes.forEach((box, index) => {
  // Select existing content on focus so typing replaces it
  box.addEventListener("focus", () => box.select());

  box.addEventListener("input", () => {
    box.value = box.value.replace(/\D/g, "").slice(0, 1);

    clearError();
    syncHiddenField();

    // Auto-advance to next box
    if (box.value && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && index > 0) {
      otpBoxes[index - 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpBoxes[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < otpBoxes.length - 1) {
      e.preventDefault();
      otpBoxes[index + 1].focus();
    }
  });

  box.addEventListener("paste", (e) => {
    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "");

    if (pasted.length === 6) {
      e.preventDefault();

      pasted.split("").forEach((digit, i) => {
        otpBoxes[i].value = digit;
      });

      otpBoxes[5].focus();

      clearError();
      syncHiddenField();
    }
  });
});

/* =========================
   VERIFY OTP
========================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  syncHiddenField();

  if (isSubmitting) return;

  if (isOtpExpired) {
    setError();
    showToast("OTP has expired. Please request a new one.");
    return;
  }

  if (!isOtpComplete()) {
    setError();
    showToast("Please enter the 6-digit code.");
    focusFirstEmptyBox();
    return;
  }

  clearError();

  isSubmitting = true;
  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verifying...";

  try {
    const response = await fetch("/verify-otp2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otp: otpHidden.value,
      }),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = data.redirect;
      return;
    }

    // Wrong OTP / expired OTP
    isSubmitting = false;
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify Code";

    setError();
    showToast(data.message);
  } catch (error) {
    console.error("Verify OTP error:", error);

    isSubmitting = false;
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify Code";

    showToast("Something went wrong. Please try again.");
  }
});

/* =========================
   RESEND OTP
========================= */

// The resend button lives in its own <form>, so the browser submits it
// natively and the page reloads (which restarts the expiry timer).
// The button is always enabled; we only clear the current input here.
resendLink.addEventListener("click", () => {
  clearError();
  resetOtpBoxes();
});

/* =========================
   INIT
========================= */

startOtpExpiryCountdown(OTP_EXPIRY_SECONDS);
otpBoxes[0].focus();