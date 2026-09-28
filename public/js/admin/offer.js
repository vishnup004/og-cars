/* =====================================================================
   OFFER MANAGEMENT (admin)
   Same structure as category.js: one init function per feature, all
   called from DOMContentLoaded, each one verifying its elements first.

   Backend routes this file expects (change the constants below if yours
   are named differently):
     GET    /admin/offer/search?search=&applyTo=&page=   -> { success, offers, totalCount, totalPage, currentPage, limit }
     POST   /admin/offer/add                             -> { success, message, field? }
     PUT    /admin/offer/edit/:id                        -> { success, message, field? }
     DELETE /admin/offer/delete/:id                      -> { success, message }
     PATCH  /admin/offer/activate/:id                    -> { success, message }
     PATCH  /admin/offer/deactivate/:id                  -> { success, message }
   ===================================================================== */

const ROUTES = {
  search: "/admin/offer/search",
  add: "/admin/offer/add",
  edit: (id) => `/admin/offer/edit/${id}`,
  remove: (id) => `/admin/offer/delete/${id}`,
  activate: (id) => `/admin/offer/activate/${id}`,
  deactivate: (id) => `/admin/offer/deactivate/${id}`,
};

/* ===== SHARED HELPERS ===== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "No expiry";
  const d = new Date(value);
  if (isNaN(d)) return "No expiry";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d) ? "" : d.toISOString().slice(0, 10);
}

/* Work out the display state of an offer from its dates + on/off flag.
   Expired and scheduled win over the toggle, because a toggled-on offer
   that has already ended is still expired. */
function getOfferState(offer) {
  const now = new Date();
  const start = offer.startDate ? new Date(offer.startDate) : null;
  const end = offer.endDate ? new Date(offer.endDate) : null;

  if (end && end < now) return "expired";
  if (start && start > now) return "scheduled";
  return offer.status ? "active" : "inactive";
}

const STATE_LABELS = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  inactive: "Inactive",
};

/* ===== SEARCH + TYPE FILTER + PAGINATION (AJAX) ===== */
let currentSearchState = { search: "", applyTo: "", page: 1 };

function initSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const pageInput = document.getElementById("pageInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const searchBtn = document.getElementById("searchSubmitBtn");
  const typeFilter = document.getElementById("typeFilter");
  const offerList = document.getElementById("offerList");

  if (!searchInput || !pageInput || !typeFilter || !offerList) {
    console.warn("[offer search] Missing elements — search is disabled.");
    return;
  }

  async function runSearch(page = 1) {
    currentSearchState = {
      search: searchInput.value.trim(),
      applyTo: typeFilter.value,
      page,
    };
    pageInput.value = String(page);

    const params = new URLSearchParams({
      search: currentSearchState.search,
      applyTo: currentSearchState.applyTo,
      page: String(page),
    });

    try {
      offerList.style.opacity = "0.5";
      offerList.style.pointerEvents = "none";

      const response = await fetch(`${ROUTES.search}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Search failed");
      }

      renderOffers(data.offers);
      renderPagination(data);
    } catch (error) {
      console.error("Offer search error:", error);
      showToast(error.message || "Something went wrong.");
    } finally {
      offerList.style.opacity = "1";
      offerList.style.pointerEvents = "auto";
    }
  }

  // A fresh search or filter change always starts on page 1.
  searchBtn?.addEventListener("click", () => runSearch(1));
  typeFilter.addEventListener("change", () => runSearch(1));

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(1);
    }
  });

  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    runSearch(1);
  });

  // Pagination links are delegated so they keep working after re-render.
  document.addEventListener("click", (e) => {
    const link = e.target.closest("#paginationControls .page-btn");
    if (!link) return;
    e.preventDefault();
    if (link.classList.contains("disabled") || link.classList.contains("active")) return;

    const page = Number(link.dataset.page);
    if (page) runSearch(page);
  });

  // Exposed so add / edit / delete can refresh the list in place.
  window.refreshOffers = () => runSearch(currentSearchState.page || 1);
}

function renderOffers(offers) {
  const offerList = document.getElementById("offerList");
  offerList.innerHTML = "";

  if (!offers || offers.length === 0) {
    offerList.innerHTML = `<div class="empty-row">No offers found. Try a different search or filter.</div>`;
    return;
  }

  offers.forEach((offer) => {
    const state = getOfferState(offer);
    const targetName =
      offer.applyTo === "product"
        ? offer.product?.name || "Product"
        : offer.category?.name || "Category";
    const targetId =
      offer.applyTo === "product"
        ? offer.product?._id || offer.product || ""
        : offer.category?._id || offer.category || "";
    const discountLabel =
      offer.discountType === "percentage"
        ? `${offer.discountValue}%`
        : `₹${offer.discountValue}`;

    const row = document.createElement("div");
    row.className = "offer-row";
    row.dataset.offerId = offer._id;

    row.innerHTML = `
      <div class="col-name">
        <span class="offer-name">${escapeHtml(offer.name)}</span>
        <span class="offer-desc">${escapeHtml(offer.description || "")}</span>
      </div>

      <div class="col-apply">
        <span class="tag tag-${escapeHtml(offer.applyTo)}">${escapeHtml(offer.applyTo)}</span>
        <span class="target-name">${escapeHtml(targetName)}</span>
      </div>

      <div class="col-discount">
        <span class="discount-value">${escapeHtml(discountLabel)}</span>
        <span class="discount-type">${offer.discountType === "percentage" ? "Percentage" : "Fixed amount"}</span>
      </div>

      <div class="col-status">
        <span class="status-badge status-${state}" data-status-id="${offer._id}">${STATE_LABELS[state]}</span>
      </div>

      <div class="col-expiry">${formatDate(offer.endDate)}</div>

      <div class="col-actions actions-cell">
        <button class="icon-btn edit-btn" title="Edit"
          data-id="${offer._id}"
          data-name="${escapeHtml(offer.name)}"
          data-description="${escapeHtml(offer.description || "")}"
          data-apply-to="${escapeHtml(offer.applyTo)}"
          data-target="${escapeHtml(targetId)}"
          data-discount-type="${escapeHtml(offer.discountType)}"
          data-discount-value="${escapeHtml(offer.discountValue)}"
          data-start="${toDateInputValue(offer.startDate)}"
          data-end="${toDateInputValue(offer.endDate)}">✏️</button>

        <button class="icon-btn delete-btn" title="Delete"
          data-id="${offer._id}"
          data-name="${escapeHtml(offer.name)}">🗑️</button>

        ${
          offer.status
            ? `<button class="block-btn" title="Deactivate offer" data-id="${offer._id}"></button>`
            : `<button class="unblock-btn" title="Activate offer" data-id="${offer._id}"></button>`
        }
      </div>`;

    offerList.appendChild(row);
  });
}

function renderPagination({ totalCount = 0, totalPage = 1, currentPage = 1, limit = 10 }) {
  const info = document.getElementById("paginationInfo");
  const controls = document.getElementById("paginationControls");
  if (!info || !controls) return;

  const from = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalCount);
  info.textContent = `Showing ${from}–${to} of ${totalCount} offers`;

  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPage, currentPage + 1);

  let html = `<a class="page-btn ${currentPage <= 1 ? "disabled" : ""}" href="#" data-page="${prev}">‹</a>`;
  for (let i = 1; i <= totalPage; i++) {
    html += `<a class="page-btn ${i === currentPage ? "active" : ""}" href="#" data-page="${i}">${i}</a>`;
  }
  html += `<a class="page-btn ${currentPage >= totalPage ? "disabled" : ""}" href="#" data-page="${next}">›</a>`;

  controls.innerHTML = html;
}

/* ===== SIDEBAR TOGGLE ===== */
function initSidebarToggle() {
  const btn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;

  btn.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 760) return;
    if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });
}

/* ===== ACTIVE SIDEBAR LINK ===== */
function initActiveSidebar() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath === currentPath) link.classList.add("active");
  });
}

/* ===== ACTIVATE / DEACTIVATE TOGGLE ===== */
function initToggle() {
  document.addEventListener("click", async (e) => {
    const button = e.target.closest(".block-btn, .unblock-btn");
    if (!button) return;

    const offerId = button.dataset.id;
    if (!offerId) {
      showToast("Offer ID is missing.");
      return;
    }

    // block-btn = currently on, unblock-btn = currently off
    const isCurrentlyOn = button.classList.contains("block-btn");
    const url = isCurrentlyOn ? ROUTES.deactivate(offerId) : ROUTES.activate(offerId);

    try {
      button.disabled = true;

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update offer");
      }

      // Update the toggle in place
      button.classList.toggle("block-btn", !isCurrentlyOn);
      button.classList.toggle("unblock-btn", isCurrentlyOn);
      button.title = isCurrentlyOn ? "Activate offer" : "Deactivate offer";

      // Recompute the badge. Dates can still override the toggle
      // (an expired offer stays "Expired" even when switched on), so
      // ask the server for the fresh row when it sends one back.
      const row = button.closest(".offer-row");
      const badge = row?.querySelector(".status-badge");
      if (badge) {
        const state = data.offer
          ? getOfferState(data.offer)
          : badge.classList.contains("status-expired")
            ? "expired"
            : badge.classList.contains("status-scheduled")
              ? "scheduled"
              : isCurrentlyOn
                ? "inactive"
                : "active";

        badge.className = `status-badge status-${state}`;
        badge.textContent = STATE_LABELS[state];
      }

      showToast(isCurrentlyOn ? "Offer deactivated." : "Offer activated.");
    } catch (error) {
      console.error("Toggle error:", error);
      showToast(error.message || "Something went wrong.");
    } finally {
      button.disabled = false;
    }
  });
}

/* ===== DELETE ===== */
function initDeleteButtons() {
  const overlay = document.getElementById("deleteModalOverlay");
  const closeBtn = document.getElementById("closeDeleteModalBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const idInput = document.getElementById("deleteOfferId");
  const nameEl = document.getElementById("deleteOfferName");

  if (!overlay || !closeBtn || !cancelBtn || !confirmBtn || !idInput || !nameEl) {
    console.warn("[offer delete] Missing delete modal elements.");
    return;
  }

  function closeDeleteModal() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    idInput.value = "";
    nameEl.textContent = "";
  }

  document.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    if (!deleteBtn) return;

    idInput.value = deleteBtn.dataset.id;
    nameEl.textContent = deleteBtn.dataset.name || "";
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  });

  closeBtn.addEventListener("click", closeDeleteModal);
  cancelBtn.addEventListener("click", closeDeleteModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDeleteModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) closeDeleteModal();
  });

  confirmBtn.addEventListener("click", async () => {
    const offerId = idInput.value;
    if (!offerId) {
      showToast("Offer ID is missing.");
      return;
    }

    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Deleting...";

      const response = await fetch(ROUTES.remove(offerId), { method: "DELETE" });
      const data = await response.json();

      if (data.success) {
        closeDeleteModal();
        showToast("Offer deleted.");
        window.refreshOffers?.();
      } else {
        showToast(data.message || "Failed to delete offer.");
      }
    } catch (error) {
      console.error("Delete offer error:", error);
      showToast("Something went wrong.");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Delete";
    }
  });
}

/* ===== CREATE / EDIT MODAL ===== */
function initOfferModal() {
  const overlay = document.getElementById("offerModalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const openAddBtn = document.getElementById("openAddModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelModalBtn");
  const form = document.getElementById("offerForm");
  const saveBtn = document.getElementById("saveOfferBtn");

  const idInput = document.getElementById("offerId");
  const nameInput = document.getElementById("offerName");
  const descInput = document.getElementById("offerDescription");
  const applyToSelect = document.getElementById("applyTo");
//   const targetSelect = document.getElementById("targetSelect");
//   const targetLabel = document.getElementById("targetLabel");
  const discountTypeSelect = document.getElementById("discountType");
  const discountValueInput = document.getElementById("discountValue");
  const discountValueLabel = document.getElementById("discountValueLabel");
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");

  const errorEls = {
    name: document.getElementById("nameError"),
    description: document.getElementById("descriptionError"),
    applyTo: document.getElementById("applyToError"),
    target: document.getElementById("targetError"),
    discountType: document.getElementById("discountTypeError"),
    discountValue: document.getElementById("discountValueError"),
    startDate: document.getElementById("startDateError"),
    endDate: document.getElementById("endDateError"),
  };

  const required = {
    offerModalOverlay: overlay,
    modalTitle,
    openAddModalBtn: openAddBtn,
    closeModalBtn: closeBtn,
    cancelModalBtn: cancelBtn,
    offerForm: form,
    saveOfferBtn: saveBtn,
    offerId: idInput,
    offerName: nameInput,
    offerDescription: descInput,
    applyTo: applyToSelect,
    // targetSelect,
    discountType: discountTypeSelect,
    discountValue: discountValueInput,
    startDate: startInput,
    endDate: endInput,
  };

  const missing = Object.entries(required)
    .filter(([, el]) => !el)
    .map(([id]) => id);

  if (missing.length) {
    console.warn(
      "[offer modal] Could not initialize — missing elements:",
      missing.join(", "),
    );
    return;
  }

  function clearErrors() {
    Object.values(errorEls).forEach((el) => el && (el.textContent = ""));
  }

  /* Show only the options that belong to the chosen "Apply to" value. */
//   function syncTargetOptions(selectedValue = "") {
//     const group = applyToSelect.value;
//     targetLabel.textContent = group === "product" ? "Product" : "Category";

//     Array.from(targetSelect.options).forEach((opt) => {
//       if (!opt.value) {
//         opt.textContent = `Select a ${group}`;
//         return;
//       }
//       const match = opt.dataset.group === group;
//       opt.hidden = !match;
//       opt.disabled = !match;
//     });

//     targetSelect.value = selectedValue;
//   }

  function syncDiscountLabel() {
    const isPercent = discountTypeSelect.value === "percentage";
    discountValueLabel.textContent = isPercent ? "Discount (%)" : "Discount (₹)";
    discountValueInput.placeholder = isPercent ? "e.g. 20" : "e.g. 500";
    if (isPercent) discountValueInput.max = "90";
    else discountValueInput.removeAttribute("max");
  }

  function resetForm() {
  form.reset();
  idInput.value = "";
  clearErrors();
  syncDiscountLabel();
}

  function openModal(mode, data) {
    clearErrors();

    if (mode === "edit" && data) {
      modalTitle.textContent = "Edit Offer";
      idInput.value = data.id;
      nameInput.value = data.name || "";
      descInput.value = data.description || "";
      applyToSelect.value = data.applyTo || "product";
      
      discountTypeSelect.value = data.discountType || "percentage";
      syncDiscountLabel();
      discountValueInput.value = data.discountValue || "";
      startInput.value = data.start || "";
      endInput.value = data.end || "";
    } else {
      modalTitle.textContent = "Create Offer";
      resetForm();
    }

    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(resetForm, 180);
  }

  openAddBtn.addEventListener("click", () => openModal("add"));
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) closeModal();
  });

//   applyToSelect.addEventListener("change", () => syncTargetOptions(""));
  discountTypeSelect.addEventListener("change", syncDiscountLabel);

  // Delegated so rows added by AJAX still open the edit modal.
  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (!editBtn) return;

    openModal("edit", {
      id: editBtn.dataset.id,
      name: editBtn.dataset.name,
      description: editBtn.dataset.description,
      applyTo: editBtn.dataset.applyTo,
      target: editBtn.dataset.target,
      discountType: editBtn.dataset.discountType,
      discountValue: editBtn.dataset.discountValue,
      start: editBtn.dataset.start,
      end: editBtn.dataset.end,
    });
  });

  function validateForm() {
    clearErrors();
    let valid = true;
    const fail = (key, msg) => {
      if (errorEls[key]) errorEls[key].textContent = msg;
      valid = false;
    };

    const name = nameInput.value.trim();
    if (!name) fail("name", "Offer name is required.");
    else if (name.length < 3) fail("name", "Name must be at least 3 characters.");

    if (descInput.value.trim().length > 200) {
      fail("description", "Description must be under 200 characters.");
    }

    // if (!targetSelect.value) {
    //   fail("target", `Select a ${applyToSelect.value}.`);
    // }

    const value = Number(discountValueInput.value);
    if (!discountValueInput.value) {
      fail("discountValue", "Discount value is required.");
    } else if (!Number.isFinite(value) || value <= 0) {
      fail("discountValue", "Enter a value greater than 0.");
    } else if (discountTypeSelect.value === "percentage" && value > 90) {
      fail("discountValue", "Percentage cannot be more than 90.");
    }

    if (!startInput.value) fail("startDate", "Start date is required.");
    if (!endInput.value) fail("endDate", "Expiry date is required.");

    if (startInput.value && endInput.value) {
      if (new Date(endInput.value) < new Date(startInput.value)) {
        fail("endDate", "Expiry date must be on or after the start date.");
      }
    }

    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isEdit = !!idInput.value;
    const url = isEdit ? ROUTES.edit(idInput.value) : ROUTES.add;

    // JSON body (no file upload on offers, so FormData isn't needed).
    const payload = {
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      applyTo: applyToSelect.value,
      discountType: discountTypeSelect.value,
      discountValue: Number(discountValueInput.value),
      startDate: startInput.value,
      endDate: endInput.value,
    };

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        showToast(isEdit ? "Offer updated." : "Offer created.");
        closeModal();
        window.refreshOffers?.();
      } else if (data.field && errorEls[data.field]) {
        errorEls[data.field].textContent = data.message;
      } else {
        showToast(data.message || "Failed to save offer.");
      }
    } catch (error) {
      console.error("Save offer error:", error);
      showToast("Something went wrong.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Offer";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSearchAndFilter();
  initSidebarToggle();
  initActiveSidebar();
  initToggle();
  initDeleteButtons();
  initOfferModal();
});