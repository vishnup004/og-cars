function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* Reset page number to 1 whenever the user edits the search box by hand,
   so a fresh search always starts on page 1. */
function initSearchField() {
  const searchInput = document.getElementById("searchInput");
  const pageInput = document.getElementById("pageInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const searchBtn = document.getElementById("searchSubmitBtn");
  const categoryList = document.getElementById("categoryList");

  if (!searchInput || !pageInput || !categoryList) {
    console.warn("Search elements are missing.");
    return;
  }

  /* Reset page when user changes search */
  searchInput.addEventListener("input", () => {
    pageInput.value = "1";
  });

  /* Search button */
  searchBtn?.addEventListener("click", () => {
    searchCategories();
  });

  /* Press Enter to search */
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      searchCategories();
    }
  });

  /* Clear search */
  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    pageInput.value = "1";

    searchCategories();
  });

  async function searchCategories() {
    const search = searchInput.value.trim();

    const page = pageInput.value || "1";

    try {
      categoryList.style.opacity = "0.5";
      categoryList.style.pointerEvents = "none";

      const response = await fetch(
        `/admin/categories/search?search=${encodeURIComponent(search)}&page=${page}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Search failed");
      }

      renderCategories(data.categories);
    } catch (error) {
      console.error("Search error:", error);

      showToast(error.message || "Something went wrong.");
    } finally {
      categoryList.style.opacity = "1";
      categoryList.style.pointerEvents = "auto";
    }
  }

  function renderCategories(categories) {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";

    if (!categories || categories.length === 0) {
      categoryList.innerHTML = `<div class="empty-row"> No categories found. </div>`;
      return;
    }

    categories.forEach((cat) => {
      const row = document.createElement("div");

      row.className = "category-row";

      row.innerHTML = `<div class="cat-cell"> <img class="cat-thumb" src="${escapeHtml(cat.image || "")}" alt="${escapeHtml(cat.name || "")}"> 
      <div>
              <span class="cat-name">
                  ${escapeHtml(cat.name || "")}
              </span>

              <span class="cell-desc">
                  ${escapeHtml(cat.discription || "")}
              </span>
          </div>
      </div>


      <div class="row-products">
          <span class="row-products-label">
              Products
          </span>
          <span class="row-products-count">
              24
          </span>
      </div>

      <span class="status-badge ${cat.status === "active" ? "active" : "blocked"}" data-status-id="${cat._id}"> ${cat.status === "active" ? "Listed" : "Unlisted"} </span>

      <div class="actions-cell">

          <button
              class="icon-btn edit-btn"
              title="Edit"
              data-id="${cat._id}"
              data-name="${escapeHtml(cat.name || "")}"
              data-description="${escapeHtml(cat.discription || "")}"
              data-image="${escapeHtml(cat.image || "")}"
          >
              ✏️
          </button>


          <button
              class="icon-btn delete-btn"
              title="Delete"
              data-id="${cat._id}"
              data-name="${escapeHtml(cat.name || "")}">🗑️</button>
          ${cat.status === "active" ? `<button class="block-btn" title="Unlist category" data-id="${cat._id}"></button>` : `<button class="unblock-btn" title="List category" data-id="${cat._id}" ></button>`}
      </div>`;
      categoryList.appendChild(row);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
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

function initStatusToast() {
  const params = new URLSearchParams(window.location.search);
  const updated = params.get("updated");
  if (updated === "listed") showToast("Category listed.");
  if (updated === "unlisted") showToast("Category unlisted.");
  if (updated === "created") showToast("Category created.");
  if (updated === "edited") showToast("Category updated.");
}

/* ===== LIST / UNLIST ===== */
/* ===== LIST / UNLIST ===== */
function initListUnlist() {
  document.addEventListener("click", async (e) => {
    const button = e.target.closest(".block-btn, .unblock-btn");

    if (!button) return;

    const categoryId = button.dataset.id;

    if (!categoryId) {
      showToast("Category ID is missing.");
      return;
    }

    // block-btn = currently Listed
    // unblock-btn = currently Unlisted
    const isCurrentlyListed = button.classList.contains("block-btn");

    const action = isCurrentlyListed ? "unlist" : "list";

    try {
      button.disabled = true;

      const response = await fetch(`/admin/category/${action}/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update category");
      }

      /*
       * ==============================
       * UPDATE UI WITHOUT RELOADING
       * ==============================
       */

      const row = button.closest(".category-row");

      if (action === "unlist") {
        // Change button from block-btn -> unblock-btn
        button.classList.remove("block-btn");
        button.classList.add("unblock-btn");

        button.title = "List category";

        // Change status badge
        const statusBadge = row?.querySelector(".status-badge");

        if (statusBadge) {
          statusBadge.classList.remove("status-active");
          statusBadge.classList.add("status-blocked");
          statusBadge.textContent = "Unlisted";
        }

        showToast("Category unlisted.");
      } else {
        // Change button from unblock-btn -> block-btn
        button.classList.remove("unblock-btn");
        button.classList.add("block-btn");

        button.title = "Unlist category";

        // Change status badge
        const statusBadge = row?.querySelector(".status-badge");

        if (statusBadge) {
          statusBadge.classList.remove("status-blocked");
          statusBadge.classList.add("status-active");
          statusBadge.textContent = "Listed";
        }

        showToast("Category listed.");
      }
    } catch (error) {
      console.error("List/unlist error:", error);

      showToast(error.message || "Something went wrong.");
    } finally {
      button.disabled = false;
    }
  });
}

/* ===== DELETE (placeholder) ===== */
function initDeleteButtons() {
  const deleteModal = document.getElementById("deleteModalOverlay");
  const closeDeleteBtn = document.getElementById("closeDeleteModalBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  const deleteCategoryId = document.getElementById("deleteCategoryId");
  const deleteCategoryName = document.getElementById("deleteCategoryName");

  if (
    !deleteModal ||
    !closeDeleteBtn ||
    !cancelDeleteBtn ||
    !confirmDeleteBtn ||
    !deleteCategoryId
  ) {
    console.warn("Delete modal elements are missing.");
    return;
  }

  // Open delete modal
  document.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");

    if (!deleteBtn) return;

    const categoryId = deleteBtn.dataset.id;
    const categoryName = deleteBtn.dataset.name;

    deleteCategoryId.value = categoryId;
    deleteCategoryName.textContent = categoryName || "";

    deleteModal.classList.add("show");

    document.body.style.overflow = "hidden";
  });

  // Close modal
  function closeDeleteModal() {
    deleteModal.classList.remove("show");

    document.body.style.overflow = "";

    deleteCategoryId.value = "";
    deleteCategoryName.textContent = "";
  }

  closeDeleteBtn.addEventListener("click", closeDeleteModal);

  cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  // Click outside modal
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Confirm delete
  confirmDeleteBtn.addEventListener("click", async () => {
    const categoryId = deleteCategoryId.value;

    if (!categoryId) {
      showToast("Category ID is missing.");
      return;
    }

    try {
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = "Deleting...";

      const response = await fetch(`/admin/category/delete/${categoryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        closeDeleteModal();

        showToast("Category deleted.");

        setTimeout(() => {
          window.location.reload();
        }, 700);
      } else {
        showToast(data.message || "Failed to delete category.");
      }
    } catch (error) {
      console.error("Delete category error:", error);

      showToast("Something went wrong.");
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = "Delete";
    }
  });
}

/* ===== ADD / EDIT MODAL =====
   Rebuilt with defensive checks: every required element is verified up
   front, and a clear console.warn tells you exactly which id is missing
   from the DOM instead of the modal just silently doing nothing. */
function initCategoryModal() {
  const overlay = document.getElementById("categoryModalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const openAddBtn = document.getElementById("openAddModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelModalBtn");
  const form = document.getElementById("categoryForm");
  const saveBtn = document.getElementById("saveCategoryBtn");

  const categoryIdInput = document.getElementById("categoryId");
  const nameInput = document.getElementById("categoryName");
  const descriptionInput = document.getElementById("categoryDescription");
  const imageInput = document.getElementById("categoryImage");
  const imagePreview = document.getElementById("imagePreview");

  const nameError = document.getElementById("nameError");
  const descriptionError = document.getElementById("descriptionError");
  const imageError = document.getElementById("imageError");

  const required = {
    categoryModalOverlay: overlay,
    modalTitle,
    openAddModalBtn: openAddBtn,
    closeModalBtn: closeBtn,
    cancelModalBtn: cancelBtn,
    categoryForm: form,
    saveCategoryBtn: saveBtn,
    categoryId: categoryIdInput,
    categoryName: nameInput,
    categoryDescription: descriptionInput,
    categoryImage: imageInput,
    imagePreview,
    nameError,
    descriptionError,
    imageError,
  };

  const missing = Object.entries(required)
    .filter(([, el]) => !el)
    .map(([id]) => id);

  if (missing.length) {
    console.warn(
      "[category modal] Could not initialize — missing elements in the DOM:",
      missing.join(", "),
      "\nCheck that category.ejs matches these ids exactly and that this script runs after the modal markup is rendered.",
    );
    return;
  }

  function clearErrors() {
    nameError.textContent = "";
    descriptionError.textContent = "";
    imageError.textContent = "";
  }

  function resetForm() {
    form.reset();
    categoryIdInput.value = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";
    clearErrors();
  }

  function openModal(mode, data) {
    clearErrors();

    if (mode === "edit" && data) {
      modalTitle.textContent = "Edit Category";
      categoryIdInput.value = data.id;
      nameInput.value = data.name || "";
      descriptionInput.value = data.description || "";

      if (data.image) {
        imagePreview.src = data.image;
        imagePreview.style.display = "block";
      } else {
        imagePreview.style.display = "none";
      }
    } else {
      modalTitle.textContent = "Add Category";
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

  // Wire up each Edit button with its row data. Delegated so it also
  // covers rows that get added later (e.g. after an AJAX reload of the list).
  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (!editBtn) return;
    openModal("edit", {
      id: editBtn.dataset.id,
      name: editBtn.dataset.name,
      description: editBtn.dataset.description,
      image: editBtn.dataset.image,
    });
  });

  // Live image preview on file select
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function validateForm() {
    clearErrors();
    let valid = true;

    const name = nameInput.value.trim();
    if (!name) {
      nameError.textContent = "Category name is required.";
      valid = false;
    } else if (name.length < 2) {
      nameError.textContent = "Name must be at least 2 characters.";
      valid = false;
    }

    if (descriptionInput.value.trim().length > 300) {
      descriptionError.textContent =
        "Description must be under 300 characters.";
      valid = false;
    }

    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isEdit = !!categoryIdInput.value;
    const url = isEdit
      ? `/admin/category/edit/${categoryIdInput.value}`
      : `/admin/category/add`;

    const formData = new FormData(form);

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showToast(isEdit ? "Category updated." : "Category created.");
        closeModal();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        if (data.field && data.message) {
          const errorEl = document.getElementById(`${data.field}Error`);
          if (errorEl) errorEl.textContent = data.message;
        } else {
          showToast(data.message || "Failed to save category.");
        }
      }
    } catch (error) {
      console.error(error);
      showToast("Something went wrong.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Category";
    }
  });
}

/* ===== FILTER PANEL =====
   Filters ride inside the existing #searchForm as hidden inputs
   (minPrice, maxPrice, brand) so Search + Filter always submit together
   as one GET request, e.g.:
     /admin/categories?search=&page=1&minPrice=1000&maxPrice=5000&brand=Traxxas,Tamiya

   On page load, the panel reads its own state back out of the current
   URL's query string, so if the server re-renders the page with
   ?minPrice=1000&brand=Traxxas already in the address bar, the checkboxes,
   radio, and price inputs all reflect that — and the "Filter" button shows
   an active-count badge plus removable chips.

   NOTE for the backend: this only wires the client. The GET route for
   /admin/categories needs to read req.query.minPrice / maxPrice / brand
   and apply them to whatever the price/brand filter actually targets in
   your schema (this page currently lists *categories*, which don't have
   price/brand fields — see chat note about whether this belongs on the
   Products page instead). */
function initFilterPanel() {
  const toggleBtn = document.getElementById("filterToggleBtn");
  const panel = document.getElementById("filterPanel");
  const filterWrap = toggleBtn?.closest(".filter-wrap");
  const searchForm = document.getElementById("searchForm");
  const pageInput = document.getElementById("pageInput");

  const minPriceInput = document.getElementById("minPriceInput");
  const maxPriceInput = document.getElementById("maxPriceInput");
  const brandInput = document.getElementById("brandInput");

  const fMinPrice = document.getElementById("fMinPrice");
  const fMaxPrice = document.getElementById("fMaxPrice");
  const priceRangeGroup = document.getElementById("priceRangeGroup");
  const brandGroup = document.getElementById("brandGroup");

  const applyBtn = document.getElementById("filterApplyBtn");
  const clearBtn = document.getElementById("filterClearBtn");
  const filterCount = document.getElementById("filterCount");
  const chipsWrap = document.getElementById("activeFilterChips");

  if (!toggleBtn || !panel || !searchForm) {
    console.warn(
      "[filter panel] Missing required elements — filter button will be inert.",
    );
    return;
  }

  function openPanel() {
    panel.classList.add("show");
    toggleBtn.classList.add("active");
  }
  function closePanel() {
    panel.classList.remove("show");
    toggleBtn.classList.remove("active");
  }
  function togglePanel() {
    panel.classList.contains("show") ? closePanel() : openPanel();
  }

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // Click outside closes the panel
  document.addEventListener("click", (e) => {
    if (!filterWrap) return;
    if (!filterWrap.contains(e.target)) closePanel();
  });
  panel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  // Selecting a preset radio fills the min/max number inputs to match,
  // so the two controls never disagree with each other.
  priceRangeGroup?.addEventListener("change", (e) => {
    if (e.target.name !== "priceRangePreset") return;
    const [min, max] = e.target.value.split("-");
    fMinPrice.value = min || "";
    fMaxPrice.value = max || "";
  });

  // Typing in the raw min/max inputs deselects any preset radio, since
  // a custom range no longer necessarily matches one of the presets.
  [fMinPrice, fMaxPrice].forEach((input) => {
    input?.addEventListener("input", () => {
      priceRangeGroup
        ?.querySelectorAll('input[name="priceRangePreset"]')
        .forEach((r) => (r.checked = false));
    });
  });

  function getSelectedBrands() {
    return Array.from(
      brandGroup.querySelectorAll('input[name="fBrand"]:checked'),
    ).map((el) => el.value);
  }

  function countActiveFilters() {
    let count = 0;
    if (fMinPrice.value.trim()) count++;
    if (fMaxPrice.value.trim()) count++;
    count += getSelectedBrands().length;
    return count;
  }

  function updateFilterBadge() {
    const count = countActiveFilters();
    if (count > 0) {
      filterCount.style.display = "inline-flex";
      filterCount.textContent = String(count);
    } else {
      filterCount.style.display = "none";
    }
  }

  // Keep the badge live as the user interacts, even before Apply is pressed.
  panel.addEventListener("change", updateFilterBadge);
  panel.addEventListener("input", updateFilterBadge);

  async function applyFilters() {
    const minPrice = fMinPrice.value.trim();
    const maxPrice = fMaxPrice.value.trim();
    const brands = getSelectedBrands();

    try {
      const params = new URLSearchParams();

      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      if (brands.length > 0) {
        params.set("brand", brands.join(","));
      }

      params.set("page", "1");
      const response = await fetch(
        `/admin/categories/filter?${params.toString()}`,
      );

      console.log("4. Fetch response received");
      console.log("Status:", response.status);
      const data = await response.json();

      console.log("5. Backend data:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Filter failed");
      }

      // Only replace the list
      renderCategories(data.categories);

      // Close filter
      filterPanel.classList.remove("show");
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  }

  function clearFilters() {
    fMinPrice.value = "";
    fMaxPrice.value = "";
    priceRangeGroup
      ?.querySelectorAll('input[name="priceRangePreset"]')
      .forEach((r) => (r.checked = false));
    brandGroup
      ?.querySelectorAll('input[name="fBrand"]')
      .forEach((cb) => (cb.checked = false));
    updateFilterBadge();

    // If filters are already active in the URL, clearing should also
    // resubmit immediately so the list reflects "no filters" right away.
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("minPrice") ||
      params.get("maxPrice") ||
      params.get("brand")
    ) {
      minPriceInput.value = "";
      maxPriceInput.value = "";
      brandInput.value = "";
      pageInput.value = "1";
      searchForm.submit();
    }
  }

  applyBtn?.addEventListener("click", applyFilters);
  clearBtn?.addEventListener("click", clearFilters);

  // ----- Restore state from the URL on load -----
  function priceRangeMatchesPreset(min, max) {
    const presets = {
      "0-1000": ["0", "1000"],
      "1000-5000": ["1000", "5000"],
      "5000-10000": ["5000", "10000"],
      "10000-": ["10000", ""],
    };
    for (const [value, [pMin, pMax]] of Object.entries(presets)) {
      if (min === pMin && max === pMax) return value;
    }
    return null;
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    const brands = (params.get("brand") || "").split(",").filter(Boolean);

    fMinPrice.value = minPrice;
    fMaxPrice.value = maxPrice;
    minPriceInput.value = minPrice;
    maxPriceInput.value = maxPrice;
    brandInput.value = brands.join(",");

    const presetValue = priceRangeMatchesPreset(minPrice, maxPrice);
    if (presetValue) {
      const radio = priceRangeGroup?.querySelector(
        `input[value="${presetValue}"]`,
      );
      if (radio) radio.checked = true;
    }

    brandGroup?.querySelectorAll('input[name="fBrand"]').forEach((cb) => {
      cb.checked = brands.includes(cb.value);
    });

    updateFilterBadge();
    renderChips(minPrice, maxPrice, brands);
  }

  function buildUrlWithout(paramNames) {
    const params = new URLSearchParams(window.location.search);
    paramNames.forEach((name) => params.delete(name));
    params.set("page", "1");
    const qs = params.toString();
    return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  }

  function renderChips(minPrice, maxPrice, brands) {
    if (!chipsWrap) return;
    chipsWrap.innerHTML = "";

    if (minPrice || maxPrice) {
      const label =
        minPrice && maxPrice
          ? `Price: ${minPrice}–${maxPrice}`
          : minPrice
            ? `Price: ${minPrice}+`
            : `Price: up to ${maxPrice}`;
      chipsWrap.appendChild(
        makeChip(label, buildUrlWithout(["minPrice", "maxPrice"])),
      );
    }

    brands.forEach((brand) => {
      const remaining = brands.filter((b) => b !== brand);
      const params = new URLSearchParams(window.location.search);
      if (remaining.length) {
        params.set("brand", remaining.join(","));
      } else {
        params.delete("brand");
      }
      params.set("page", "1");
      const qs = params.toString();
      const href = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;
      chipsWrap.appendChild(makeChip(`Brand: ${brand}`, href));
    });
  }

  function makeChip(label, removeHref) {
    const chip = document.createElement("span");
    chip.className = "filter-chip";
    const text = document.createElement("span");
    text.textContent = label;
    const removeLink = document.createElement("a");
    removeLink.href = removeHref;
    removeLink.setAttribute("aria-label", `Remove ${label} filter`);
    removeLink.textContent = "✕";
    chip.appendChild(text);
    chip.appendChild(removeLink);
    return chip;
  }

  restoreFromUrl();
}
function initActiveSidebar() {
  const currentPath = window.location.pathname;

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    // Remove active from every sidebar link first
    link.classList.remove("active");

    const linkPath = new URL(link.href, window.location.origin).pathname;

    // Add active only to the current page
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSearchField();
  initSidebarToggle();
  initStatusToast();
  initListUnlist();
  initDeleteButtons();
  initCategoryModal();
  initFilterPanel();
  initActiveSidebar();
});
