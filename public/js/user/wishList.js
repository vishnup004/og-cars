// ===========================================================
// OG_CARS | Wishlist Page — remove, move to cart, toast
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("wl-grid");
  const emptyEl = document.getElementById("wl-empty");
  const countEl = document.getElementById("wl-count");
  const navCartDot = document.getElementById("nav-cart-dot");

  if (!grid) return;

  // ---------- Toast (same behaviour as product page) ----------
  function showToast(message, type = "error", withCartLink = false) {
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
    text.textContent = message;

    toast.append(icon, text);

    if (withCartLink) {
      const action = document.createElement("a");
      action.className = "toast-action";
      action.href = "/mainCart";
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

  // ---------- Helpers ----------
  function updateCount() {
    const n = grid.querySelectorAll(".wl-card").length;

    if (countEl) {
      countEl.textContent = `${n} ${n === 1 ? "MACHINE" : "MACHINES"} RESERVED`;
    }

    if (n === 0) {
      grid.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
    }
  }

  function removeCard(card) {
    card.classList.add("removing");
    setTimeout(() => {
      card.remove();
      updateCount();
    }, 220);
  }

  async function refreshCartDot() {
    if (!navCartDot) return;
    try {
      const res = await fetch("/cart", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const count = (data.items || []).reduce(
        (sum, i) => sum + Number(i.quantity),
        0,
      );
      navCartDot.textContent = count > 0 ? count : "";
      navCartDot.style.display = count > 0 ? "" : "none";
    } catch (err) {
      console.warn("Could not refresh cart count:", err.message);
    }
  }

  // ---------- API calls ----------
  async function removeFromWishlist(productId) {
    const res = await fetch(`/wishlist/remove/${productId}`, {
      method: "DELETE",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.success !== false, data };
  }

  async function addToCart(productId) {
    const res = await fetch("/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.success, data };
  }

  // ---------- Click handling (event delegation) ----------
  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const card = btn.closest(".wl-card");
    if (!card) return;

    const productId = card.dataset.id;
    const action = btn.dataset.action;

    // ----- Remove -----
    if (action === "remove") {
      btn.disabled = true;
      try {
        const { ok, data } = await removeFromWishlist(productId);
        if (ok) {
          removeCard(card);
          showToast("Removed from wishlist", "info");
        } else {
          btn.disabled = false;
          showToast(data.message || "Could not remove item.", "error");
        }
      } catch (err) {
        btn.disabled = false;
        console.log("wishlist remove failed:", err);
        showToast("Something went wrong. Please try again.", "error");
      }
      return;
    }

    // ----- Move to cart -----
    if (action === "move") {
      if (btn.disabled) return;

      const label = btn.querySelector(".btn-inner");
      const originalHTML = label.innerHTML;

      btn.classList.add("loading");

      try {
        const { ok, data } = await addToCart(productId);

        if (ok) {
          // remove from wishlist after it is safely in the cart
          await removeFromWishlist(productId).catch(() => {});

          btn.classList.remove("loading");
          btn.classList.add("done");
          label.textContent = "ADDED ✓";

          showToast("Moved to cart", "success", true);
          refreshCartDot();

          setTimeout(() => removeCard(card), 700);
        } else {
          btn.classList.remove("loading");
          showToast(
            data.message || "Could not move to cart. Please try again.",
            "error",
            data.code === "CART_LIMIT",
          );
        }
      } catch (err) {
        btn.classList.remove("loading");
        label.innerHTML = originalHTML;
        console.log("move to cart failed:", err);
        showToast("Something went wrong. Please try again.", "error");
      }
    }
  });

  refreshCartDot();
});