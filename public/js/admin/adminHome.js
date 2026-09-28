/* ===== DEMO DATA ===== */
const STATS = [
  { label: "Total vehicles", value: "312", delta: "+8.4%", up: true, icon: "🚗" },
  { label: "Orders today", value: "27", delta: "+14.1%", up: true, icon: "🛒" },
  { label: "Revenue (MTD)", value: "$1.84M", delta: "+5.6%", up: true, icon: "৳" },
  { label: "Active users", value: "4,208", delta: "-1.2%", up: false, icon: "◫" },
];

const ORDERS = [
  { id: "#OG-1042", vehicle: "Toyota Fortuner 2023", customer: "Riya Sharma", amount: "$38,200", status: "delivered" },
  { id: "#OG-1041", vehicle: "Hyundai Creta 2024", customer: "Karan Mehta", amount: "$21,500", status: "processing" },
  { id: "#OG-1040", vehicle: "Kia Seltos 2022", customer: "Neha Verma", amount: "$18,900", status: "cancelled" },
  { id: "#OG-1039", vehicle: "Mahindra XUV700", customer: "Aman Gupta", amount: "$24,300", status: "delivered" },
  { id: "#OG-1038", vehicle: "Honda City 2023", customer: "Sara Khan", amount: "$16,750", status: "processing" },
];

const PRODUCTS = [
  { name: "Toyota Fortuner 2023", meta: "SUV · Diesel · 12 units left", price: "$38,200", icon: "🚙" },
  { name: "Hyundai Creta 2024", meta: "SUV · Petrol · 8 units left", price: "$21,500", icon: "🚗" },
  { name: "Kia Seltos 2022", meta: "SUV · Petrol · 3 units left", price: "$18,900", icon: "🚗" },
  { name: "Mahindra XUV700", meta: "SUV · Diesel · 6 units left", price: "$24,300", icon: "🚙" },
];

const ACTIVITY = [
  { text: "<b>Riya Sharma</b> placed an order for Toyota Fortuner", time: "6 min ago", color: "var(--ok)" },
  { text: "<b>New offer</b> \"Festive Discount\" was published", time: "22 min ago", color: "var(--accent-bright)" },
  { text: "<b>Karan Mehta</b> updated coupon SUMMER25", time: "48 min ago", color: "var(--warn)" },
  { text: "<b>Order #OG-1040</b> was cancelled", time: "1 hr ago", color: "var(--danger)" },
  { text: "<b>Neha Verma</b> registered as a new user", time: "2 hr ago", color: "var(--ok)" },
];

/* ===== HELPERS ===== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ===== RENDER ===== */
function renderStats() {
  document.getElementById("statsGrid").innerHTML = STATS.map(s => `
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">${s.label}</span>
        <span class="stat-icon">${s.icon}</span>
      </div>
      <span class="stat-value">${s.value}</span>
      <span class="stat-delta ${s.up ? "delta-up" : "delta-down"}">
        ${s.up ? "▲" : "▼"} ${s.delta} vs last period
      </span>
    </div>
  `).join("");
}

function renderOrders() {
  document.getElementById("ordersTableBody").innerHTML = ORDERS.map(o => `
    <tr>
      <td class="cell-strong">${o.id}</td>
      <td class="cell-dim">${o.vehicle}</td>
      <td class="cell-dim">${o.customer}</td>
      <td class="cell-dim">${o.amount}</td>
      <td><span class="badge badge-${o.status}">${o.status}</span></td>
    </tr>
  `).join("");
}

function renderProducts() {
  document.getElementById("productList").innerHTML = PRODUCTS.map(p => `
    <li class="product-item">
      <div class="product-thumb">${p.icon}</div>
      <div class="product-body">
        <p class="product-name">${p.name}</p>
        <p class="product-meta">${p.meta}</p>
      </div>
      <span class="product-price">${p.price}</span>
    </li>
  `).join("");
}

function renderActivity() {
  document.getElementById("activityList").innerHTML = ACTIVITY.map(a => `
    <li class="activity-item">
      <span class="activity-dot" style="background:${a.color}"></span>
      <div class="activity-body">
        <p class="activity-text">${a.text}</p>
        <p class="activity-time">${a.time}</p>
      </div>
    </li>
  `).join("");
}

function renderDate() {
  const el = document.getElementById("dateLabel");
  const now = new Date();
  el.textContent = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
}

/* ===== NAV ===== */
function initNav() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      showToast(`This is a demo — "${link.textContent.trim()}" page isn't built yet.`);
      if (window.innerWidth <= 760) document.getElementById("sidebar").classList.remove("open");
    });
  });
}

/* ===== SIDEBAR TOGGLE ===== */
function initSidebarToggle() {
  const btn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  btn.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 760) return;
    if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });
}

/* ===== QUICK ACTIONS ===== */
function initQuickActions() {
  document.querySelectorAll(".qa-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const map = {
        "add-product": "Add vehicle form would open here.",
        "new-offer": "New offer editor would open here.",
        "new-coupon": "New coupon form would open here.",
        "add-user": "Add user form would open here.",
      };
      showToast(map[btn.dataset.action] || "Action triggered.");
    });
  });
}

/* ===== MISC BUTTONS ===== */
function initButtons() {
  document.getElementById("notifBtn").addEventListener("click", () => {
    showToast("You have 3 unread notifications.");
  });
  document.getElementById("viewAllOrders").addEventListener("click", () => {
    showToast("Full orders list would open here.");
  });
  document.getElementById("viewAllProducts").addEventListener("click", () => {
    showToast("Full vehicle inventory would open here.");
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderDate();
  renderStats();
  renderOrders();
  renderProducts();
  renderActivity();
  initNav();
  initSidebarToggle();
  initQuickActions();
  initButtons();
});