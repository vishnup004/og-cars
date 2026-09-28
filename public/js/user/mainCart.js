// ===========================================================
// OG_CARS | Cart Page — items, totals, suggestions
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {
  // ---------- Element refs ----------
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const tableHead = document.querySelector(".cart-table-head");
  const subtotalEl = document.getElementById("summary-subtotal");
  const shippingEl = document.getElementById("summary-shipping");
  const totalEl = document.getElementById("summary-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const navCartDot = document.getElementById("nav-cart-dot");
  const suggestGrid = document.getElementById("suggest-grid");

  const FREE_SHIPPING_ABOVE = 0; // set e.g. 5000 to charge shipping below that
  const SHIPPING_FEE = 0;
  const MAX_QTY = 5;

  function getTotalQuantity() {
  return cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );
}

  // ---------- Helpers ----------
  const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  const escapeHTML = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);

  // ---------- State ----------
  let cart = [];

  const DEMO_CART = [
    {
      _id: "demo-1",
      productId: "demo-p1",
      productName: "MJX 14210 V3 1/14 Hyper Go 4WD RTR",
      description: "Brushless High Speed RC Car | Indie",
      image: "",
      price: 24999,
      quantity: 1,
    },
    {
      _id: "demo-2",
      productId: "demo-p2",
      productName: "Turbo Racing C75 RTR 1/76",
      description: "2.4G RWD Mini Desktop Sports Car | Black",
      image: "",
      price: 12999,
      quantity: 1,
    },
  ];

  // ---------- Load cart ----------
  async function loadCart() {
    try {
      const res = await fetch("/cart", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cart = data.items || [];
  } catch (err) {
      console.warn("Cart API unavailable:", err.message);
      cart = [];
    }
    renderCart();
  }

  // ---------- Render cart rows ----------
  function renderCart() {
    itemsEl.innerHTML = "";

    const isEmpty = cart.length === 0;
    emptyEl.hidden = !isEmpty;
    itemsEl.hidden = isEmpty;
    if (tableHead) tableHead.hidden = isEmpty;

    const totalQuantity = getTotalQuantity();

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.dataset.id = item._id;

      row.innerHTML = `
        <div class="cart-product">
          <div class="cart-thumb">
            <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.productName)}">
          </div>
          <div class="cart-info">
            <h3 class="cart-name">
              <a href="/product/${escapeHTML(item.productId)}">${escapeHTML(item.productName)}</a>
            </h3>
            ${item.description ? `<p class="cart-desc">${escapeHTML(item.description)}</p>` : ""}
          </div>
        </div>

        <div class="cart-price">
          ${formatINR(item.price)}
        </div>

        <div class="qty-wrap">
          <div class="qty-control" role="group" aria-label="Quantity">
    <button class="qty-btn" data-action="decrease" aria-label="Decrease quantity"
            ${item.quantity <= 1 ? "disabled" : ""}>
      <span class="material-symbols-outlined">remove</span>
    </button>
    <span class="qty-value" aria-live="polite">${item.quantity}</span>
    <button class="qty-btn" data-action="increase" aria-label="Increase quantity"
            ${totalQuantity >= MAX_QTY ? "disabled" : ""}>
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>
        </div>

        <div class="cart-line-total">${formatINR(item.price * item.quantity)}</div>

        <button class="cart-remove" data-action="remove" aria-label="Remove ${escapeHTML(item.productName)} from cart">
          <span class="material-symbols-outlined">close</span>
        </button>
      `;

      // Hide broken images gracefully
      const img = row.querySelector("img");
      img.addEventListener("error", () => (img.style.visibility = "hidden"));

      itemsEl.appendChild(row);
    });

    updateSummary();
  }

  // ---------- Totals ----------
  function updateSummary() {
    const subtotal = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    subtotalEl.textContent = formatINR(subtotal);
    shippingEl.textContent = shipping === 0 ? "Free" : formatINR(shipping);
    totalEl.textContent = formatINR(total);

    // Nav cart dot shows total quantity
    const count = getTotalQuantity();
    if (navCartDot) {
      navCartDot.textContent = count > 0 ? count : "";
      navCartDot.style.display = count > 0 ? "" : "none";
    }

    // Disable checkout on empty cart
    checkoutBtn.classList.toggle("disabled", cart.length === 0);
    checkoutBtn.setAttribute("aria-disabled", cart.length === 0);
  }

  // ---------- Server sync ----------
  async function syncRemove(id) {
    try {
      console.log("main cart page")
      await fetch(`/cart/remove/${id}`, {
        method: "DELETE",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
    } catch (err) {
      console.warn("Could not sync removal:", err.message);
    }
  }

  async function syncQuantity(id, quantity) {
  try {
    const res = await fetch(`/cart/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.warn("Could not sync quantity:", err.message);
    return false;
  }
}

  // ---------- Row actions (event delegation) ----------
 itemsEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const row = btn.closest(".cart-row");
  const id = row.dataset.id;
  const action = btn.dataset.action;
  const item = cart.find((i) => i._id === id);
  if (!item) return;

  // ----- Remove -----
  if (action === "remove") {
    row.classList.add("removing");
    setTimeout(() => {
      cart = cart.filter((i) => i._id !== id);
      syncRemove(id);
      renderCart();
    }, 220);
    return;
  }

  // ----- Increase / Decrease -----
  if (action === "increase" || action === "decrease") {

  const previous = Number(item.quantity);

  const next =
    action === "increase"
      ? previous + 1
      : previous - 1;

  // Quantity cannot become less than 1
  if (next < 1) return;

  // Total cart quantity cannot exceed 5
  if (
    action === "increase" &&
    getTotalQuantity() >= MAX_QTY
  ) {
    return;
  }

  // Optimistic update
  item.quantity = next;

  renderCart();

  const ok = await syncQuantity(id, next);

  if (!ok) {
    item.quantity = previous;
    renderCart();
  }
}
});

  // ---------- Suggested products ----------
  // const DEMO_SUGGESTIONS = [
  //   { _id: "s1", productName: "FCX24 Smasher V2 - Monster RC Truck", price: 15990, images: [""] },
  //   { _id: "s2", productName: "2025 Yikong YK4106 PRO 1:10 RC Car", price: 41300, images: [""] },
  //   { _id: "s3", productName: "Rock Crawler 1:18 4WD RTR", price: 8990, images: [""] },
  // ];

  function buildProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.name = product.productName || "";
    card.dataset.price = product.price || 0;
    card.dataset.category = product.category || "";

    card.innerHTML = `
      <div class="product-media">
        <img
          class="product-img"
          src="${escapeHTML(product.images[0] || "")}"
          alt="${escapeHTML(product.productName || "Product")}"
        >
      </div>

      <div class="product-body cat-product-body">
        <h3 class="product-name cat-product-name">
          ${escapeHTML(product.productName || "")}
        </h3>

        <div class="price-row">
          <span class="price">${formatINR(product.price)}</span>
        </div>

        <a class="btn btn-view-details" href="/product/${escapeHTML(product._id)}">
          VIEW DETAILS
        </a>
      </div>
    `;
    return card;
  }

  async function loadSuggestions() {
    let products = [];
    try {
      const res = await fetch("/cart/suggestions", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      products = data.products || [];
    } catch (err) {
      console.warn("Suggestions API unavailable, using demo data:", err.message);
      products = DEMO_SUGGESTIONS;
    }

    // Skip anything already in the cart (compare against productId, not the line _id)
    const inCart = new Set(cart.map((i) => String(i.productId)));
    products = products.filter((p) => !inCart.has(String(p._id))).slice(0, 3);

    suggestGrid.innerHTML = "";
    if (products.length === 0) {
      suggestGrid.closest(".cart-suggest").hidden = true;
      return;
    }
    products.forEach((p) => suggestGrid.appendChild(buildProductCard(p)));
  }

  // ---------- Init ----------
  loadCart().then(loadSuggestions);
});
