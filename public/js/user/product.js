// ===========================================================
// HYPER_RC | Single Product Page — Gallery, Options, Cart
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Gallery ----------
  const mainImg = document.getElementById("pdp-main-img");
  const thumbRow = document.getElementById("pdp-thumb-row");

  const zoomContainer = document.getElementById("pdp-zoom-container");

  // ---------- Toast ----------
function showToast(message, type = "error", actionHTML = "") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const icons = { error: "error", success: "check_circle", info: "info" };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icon = document.createElement("span");
  icon.className = "material-symbols-outlined toast-icon";
  icon.textContent = icons[type] || "info";

  const text = document.createElement("span");
  text.className = "toast-text";
  text.textContent = message; // textContent = safe against XSS

  toast.append(icon, text);

  if (actionHTML) {
    const action = document.createElement("a");
    action.className = "toast-action";
    action.href = "/cart";
    action.textContent = "VIEW CART";
    toast.appendChild(action);
  }

  const close = document.createElement("button");
  close.className = "toast-close";
  close.setAttribute("aria-label", "Dismiss");
  close.innerHTML = '<span class="material-symbols-outlined">close</span>';
  close.addEventListener("click", () => dismiss());
  toast.appendChild(close);

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  const timer = setTimeout(dismiss, 4500);
  function dismiss() {
    clearTimeout(timer);
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }
}

if (zoomContainer && mainImg) {

  zoomContainer.addEventListener("mousemove", (event) => {

    const rect = zoomContainer.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;

    mainImg.style.transform = "scale(2)";
  });

  zoomContainer.addEventListener("mouseleave", () => {

    mainImg.style.transform = "scale(1)";
    mainImg.style.transformOrigin = "center center";

  });
}

  if (thumbRow && mainImg) {
    thumbRow.querySelectorAll(".pdp-thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbRow
          .querySelectorAll(".pdp-thumb")
          .forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");

        mainImg.style.opacity = "0";
        setTimeout(() => {
          mainImg.src = thumb.dataset.img;
          mainImg.style.opacity = "1";
        }, 120);
      });
    });
  }

  // ---------- Color Swatches ----------
  document.querySelectorAll(".pdp-color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document
        .querySelectorAll(".pdp-color-swatch")
        .forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");

      const variants = JSON.parse(document.querySelector(".pdp-color-row")?.dataset.variants || "[]");
      const allowedScales = variants
        .filter((variant) => variant.color === swatch.dataset.color)
        .map((variant) => variant.scale);
      const scaleButtons = document.querySelectorAll(".pdp-pill[data-scale]");
      scaleButtons.forEach((button) => {
        button.hidden = !allowedScales.includes(button.dataset.scale);
        button.classList.remove("active");
      });
      const firstAvailableScale = [...scaleButtons].find((button) => !button.hidden);
      firstAvailableScale?.classList.add("active");
    });
  });

  document.querySelector(".pdp-color-swatch.active")?.click();

  // ---------- Scale Pills ----------
  document.querySelectorAll(".pdp-pill[data-scale]").forEach((pill) => {
    pill.addEventListener("click", () => {
      document
        .querySelectorAll(".pdp-pill[data-scale]")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });

  // ---------- Quantity Stepper ----------
  const qtyInput = document.getElementById("pdp-qty-input");
  const qtyMinus = document.getElementById("pdp-qty-minus");
  const qtyPlus = document.getElementById("pdp-qty-plus");

  function getQty() {
    return Math.max(1, parseInt(qtyInput.value, 10) || 1);
  }

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener("click", () => {
      qtyInput.value = Math.max(1, getQty() - 1);
    });
    qtyPlus.addEventListener("click", () => {
      qtyInput.value = getQty() + 1;
    });
    qtyInput.addEventListener("change", () => {
      qtyInput.value = getQty();
    });
  }

  // ---------- Add to Cart / Buy Now ----------
  const addCartBtn = document.getElementById("pdp-add-cart");
  const buyNowBtn = document.getElementById("pdp-buy-now");
  const variantSelect = document.getElementById("pdp-variant-select");

  function getSelectedOptions() {
    const activeColor = document.querySelector(".pdp-color-swatch.active");
    const activeScale = document.querySelector(".pdp-pill.active");

    return {
      quantity: qtyInput ? getQty() : 1,
      color: activeColor ? activeColor.dataset.color : null,
      scale: activeScale ? activeScale.dataset.scale : null,
      variant: variantSelect ? variantSelect.value : null,
    };
  }

  if (addCartBtn) {
    addCartBtn.addEventListener("click", async () => {
      if (addCartBtn.disabled) return;
      const productId = addCartBtn.dataset.productId;
      const options = getSelectedOptions();

      try {
        addCartBtn.disabled = true;
        const response = await fetch("/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, ...options }),
        });
        
        const data = await response.json();
        console.log("cart/add response:", response.status, data);
        if (response.ok && data.success) {
          addCartBtn.classList.add("added");
          const label = addCartBtn.querySelector(".btn-inner");
          const original = label.textContent;
          label.textContent = "ADDED ✓";
          setTimeout(() => {
            label.textContent = original;
            addCartBtn.classList.remove("added");
          }, 1500);

          // Open the cart drawer (defined in cart.js) so the user
          // immediately sees what they just added.
          if (window.HyperRCCart) {
            window.HyperRCCart.open();
          }
        } else {
          showToast(
          data.message || "Could not add to cart. Please try again.",
          "error",
          data.code === "CART_LIMIT" ? "view-cart" : ""
        );
        }
      } catch (error) {
        console.log("add to cart failed:", error);
      } finally {
        addCartBtn.disabled = false;
      }
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      const productId = buyNowBtn.dataset.productId;
      const options = getSelectedOptions();
      window.location.href = `/checkout?productId=${encodeURIComponent(
        productId,
      )}&qty=${options.quantity}`;
    });
  }
});
