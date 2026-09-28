        // ===========================================================
        // HYPER_RC | Shopping Cart Drawer — open/close, render, totals
        // ===========================================================
        // Expects a backend with:
        //   GET  /cart          -> { items: [...], subtotal, total }
        //   POST /cart/update   -> { productId, quantity }
        //   POST /cart/remove   -> { productId }
        // Adjust the endpoint paths/shape in the fetch calls below to match your API.

        document.addEventListener("DOMContentLoaded", () => {
        const overlay = document.getElementById("cart-overlay");
        const drawer = document.getElementById("cart-drawer");
        const closeBtn = document.getElementById("cart-close");
        // const trigger = document.querySelector(".icon-btn-cart");

        const itemsList = document.getElementById("cart-items");
        const emptyState = document.getElementById("cart-empty");
        const upsellSection = document.getElementById("cart-upsell");
        const upsellTrack = document.getElementById("cart-upsell-track");
        const upsellPrev = document.getElementById("cart-upsell-prev");
        const upsellNext = document.getElementById("cart-upsell-next");
        const itemCountEl = document.getElementById("cart-item-count");
        const subtotalEl = document.getElementById("cart-subtotal");
        const totalEl = document.getElementById("cart-total");
        const checkoutBtn = document.getElementById("cart-checkout");
        const cartDot = document.querySelector(".cart-dot");

        const MAX_QTY = 5;
        
        let cartState = { items: [], subtotal: 0, total: 0, upsell: [] };

        // ---------- Currency ----------
        function formatINR(amount) {
            return "₹" + Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            });
        }

        // ---------- Open / Close ----------
        function openCart() {
            overlay.classList.add("active");
            drawer.classList.add("open");
            drawer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            loadCart();
        }

        function closeCart() {
            overlay.classList.remove("active");
            drawer.classList.remove("open");
            drawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }

        // if (trigger) trigger.addEventListener("click", openCart);
        if (closeBtn) closeBtn.addEventListener("click", closeCart);
        if (overlay) overlay.addEventListener("click", closeCart);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
        });

        // ---------- Render ----------
        function renderItems() {
            itemsList.innerHTML = "";

            if (!cartState.items.length) {
            itemsList.hidden = true;
            emptyState.hidden = false;
            itemCountEl.textContent = "0 items";
            return;
            }

            itemsList.hidden = false;
            emptyState.hidden = true;

            const count = cartState.items.reduce((sum, i) => sum + i.quantity, 0);
            itemCountEl.textContent = `${count} item${count !== 1 ? "s" : ""}`;

            cartState.items.forEach((item) => {
            const li = document.createElement("li");
            li.className = "cart-item";
            li.dataset.itemId = item._id;

            li.innerHTML = `
                <div class="cart-item-media">
                <img src="${item.image}" alt="${item.productName}">
                </div>
                <div class="cart-item-info">
                <p class="cart-item-name">${item.productName}</p>
                
                <div class="cart-item-price-row">
                    <span class="cart-item-price">${formatINR(item.price)}</span>
                    ${
                    item.oldPrice
                        ? `<span class="cart-item-price-old">${formatINR(item.oldPrice)}</span>`
                        : ""
                    }
                </div>
                </div>
                <div class="cart-item-actions">
                <button class="cart-item-remove" aria-label="Remove ${item.productName}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
                <div class="cart-item-qty">
                    <button class="cart-item-qty-btn cart-item-qty-minus" aria-label="Decrease quantity">−</button>
                    <span class="cart-item-qty-value">${item.quantity}</span>
                    <button class="cart-item-qty-btn cart-item-qty-plus" aria-label="Increase quantity">+</button>
                </div>
                </div>
            `;

            itemsList.appendChild(li);
            });

            bindItemEvents();
        }

        function renderUpsell() {
            upsellTrack.innerHTML = "";

            if (!cartState.upsell || !cartState.upsell.length) {
            upsellSection.hidden = true;
            return;
            } 

            upsellSection.hidden = false;

            cartState.upsell.forEach((product) => {
            const card = document.createElement("div");
            card.className = "cart-upsell-card";
            card.innerHTML = `
                <div class="cart-upsell-media">
                <img src="${product.image}" alt="${product.productName}">
                </div>
                <div class="cart-upsell-info">
                <p class="cart-upsell-name">${product.productName}</p>
                <p class="cart-upsell-price">${formatINR(product.price)}</p>
                </div>
                <button class="cart-upsell-add" data-product-id="${product.productId}" aria-label="Add ${product.productName} to cart">
                <span class="material-symbols-outlined">add</span>
                </button>
            `;
            upsellTrack.appendChild(card);
            });

            upsellTrack.querySelectorAll(".cart-upsell-add").forEach((btn) => {
            btn.addEventListener("click", () => addUpsellItem(btn.dataset.productId));
            });
        }

        function renderTotals() {
            subtotalEl.textContent = formatINR(cartState.subtotal);
            totalEl.textContent = formatINR(cartState.total);
            checkoutBtn.disabled = cartState.items.length === 0;
            checkoutBtn.classList.toggle("is-disabled", cartState.items.length === 0);
        }

        function renderCartDot() {
            if (!cartDot) return;
            const count = cartState.items.reduce((sum, i) => sum + i.quantity, 0);
            cartDot.hidden = count === 0;
        }

        function renderAll() {
            renderItems();
            renderUpsell();
            renderTotals();
            renderCartDot();
        }

        // ---------- Item interactions ----------
        function bindItemEvents() {

    const totalQuantity = cartState.items.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    itemsList.querySelectorAll(".cart-item").forEach((row) => {

        const itemId = row.dataset.itemId;

        const minus = row.querySelector(
            ".cart-item-qty-minus"
        );

        const plus = row.querySelector(
            ".cart-item-qty-plus"
        );

        const remove = row.querySelector(
            ".cart-item-remove"
        );

        minus.addEventListener("click", () => {
            changeQty(itemId, -1);
        });

        plus.addEventListener("click", () => {
            changeQty(itemId, 1);
        });

        remove.addEventListener("click", () => {
            removeItem(itemId);
        });

        // Disable + button when total reaches 5
        plus.disabled = totalQuantity >= MAX_QTY;
    });
}

        function changeQty(itemId, delta) {

    const item = cartState.items.find(
        (i) => i._id === itemId
    );

    if (!item) return;

    const newQty = Number(item.quantity) + delta;

    // Quantity cannot be less than 1
    if (newQty < 1) {
        removeItem(itemId);
        return;
    }

    // Calculate current total cart quantity
    const currentTotal = cartState.items.reduce(
        (sum, i) => sum + Number(i.quantity),
        0
    );

    // Only check when increasing
    if (delta > 0 && currentTotal >= MAX_QTY) {

        showCartLimitToast(
            `You can add maximum ${MAX_QTY} items to your cart.`
        );

        return;
    }

    // Update frontend state
    item.quantity = newQty;

    recalcTotals();
    renderAll();

    // Send to backend
    syncUpdate(itemId, newQty);
}

        function removeItem(itemId) {
            cartState.items = cartState.items.filter((i) => i._id !== itemId);
            recalcTotals();
            renderAll();
            syncRemove(itemId);
        }

        function addUpsellItem(productId) {

    const product = cartState.upsell.find(
        (p) => p.productId === productId
    );

    if (!product) return;

    // Calculate total quantity
    const currentTotal = cartState.items.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    // Check maximum
    if (currentTotal >= MAX_QTY) {

        showCartLimitToast(
            `You can add maximum ${MAX_QTY} items to your cart.`
        );

        return;
    }

    const existing = cartState.items.find(
        (item) => item.productId === productId
    );

    if (existing) {

        existing.quantity += 1;

    } else {

        cartState.items.push({
            productId: product.productId,
            name: product.productName,
            image: product.image,
            price: product.price,
            quantity: 1
        });
    }

    recalcTotals();
    renderAll();

    syncUpdate(
        productId,
        existing ? existing.quantity : 1
    );
}

        function recalcTotals() {
            cartState.subtotal = cartState.items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0,
            );
            cartState.total = cartState.subtotal;
        }

        // ---------- Upsell scroll nav ----------
        if (upsellPrev && upsellNext) {
            upsellPrev.addEventListener("click", () => {
            upsellTrack.scrollBy({ left: -upsellTrack.clientWidth, behavior: "smooth" });
            });
            upsellNext.addEventListener("click", () => {
            upsellTrack.scrollBy({ left: upsellTrack.clientWidth, behavior: "smooth" });
            });
        }

        // ---------- Checkout ----------
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
            if (!cartState.items.length) return;
            window.location.href = "/checkout";
            });
        }

        // ---------- Backend sync ----------
        async function loadCart() {
            try {
                console.log("/cart")
            const res = await fetch("/cart", { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error("Failed to load cart");
            const data = await res.json();
            console.log("geting data on backend :", data);

            cartState = {
                items: data.items || [],
                subtotal: data.totalAmount ?? 0,
                total: data.totalAmount ?? data.totalAmount ?? 0,
                upsell: data.upsell || [],
            };

            renderAll();
            } catch (err) {
            console.log("cart load failed:", err);
            renderAll(); // render whatever local state we have
            }
        }

        async function syncUpdate(itemId, quantity) {
            try {

                console.log("/cartDrawer/update")
            const res = await fetch("/cartDrawer/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, quantity }),
            });
            
            const data = await res.json();

            if (!data.success) {

                showCartLimitToast(data.message);

                // Get actual database state again
                loadCart();

                return;
            }} catch (err) {
            console.log("cart update failed:", err);
            loadCart();
            }
        }

    

function showCartLimitToast(message) {
    // wire this to whatever toast/notification system you're using
    console.log("Cart limit:", message);
}

        async function syncRemove(itemId) {
            try {
                console.log("/cartDrawer")
            const res = await fetch("/cartDrawer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });
            if (!res.ok || !(await res.json()).success) throw new Error("Cart removal was rejected");
            } catch (err) {
            console.log("cart remove failed:", err);
            loadCart();
            }
        }

        // Expose openCart globally in case other scripts (e.g. product.js add-to-cart) want to open the drawer after adding
        window.HyperRCCart = { open: openCart, close: closeCart, reload: loadCart };
        });
