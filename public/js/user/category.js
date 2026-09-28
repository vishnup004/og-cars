// ===========================================================
// HYPER_RC | Category Page — Search, Filters, Sort, Pagination
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("product-grid");
  function getCards() {
    return Array.from(grid.querySelectorAll(".product-card"));
  }
  const resultCountEl = document.getElementById("result-count");
  const searchInput = document.getElementById("product-search");
  const searchBtn = document.getElementById("search-btn");
  const sortSelect = document.getElementById("sort-select");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const activeChips = document.getElementById("active-chips");
  const presetBtns = document.querySelectorAll(".price-preset-btn");
  const categoryChecks = document.querySelectorAll('input[name="category"]');
  const brandChecks = document.querySelectorAll('input[name="brand"]');

  const pageNumbers = document.getElementById("page-numbers");
  const prevPage = document.getElementById("prev-page");
  const nextPage = document.getElementById("next-page");

  let state = {
    search: "",
    categories: [],
    brands: [],
    priceMin: 0,
    priceMax: Infinity,
    sort: "relevance",
  };

  // ---------- Filter Group Collapse ----------
  document.querySelectorAll(".filter-group-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".filter-group").classList.toggle("collapsed");
    });
  });

  // ---------- Search ----------

  async function loadProducts(page = 1) {
    const searchValue = searchInput.value.trim();

    const params = new URLSearchParams();

    params.set("search", searchValue);
    params.set("page", page);

    if (state.categories.length > 0) {
      params.set("category", state.categories.join(","));
    }
    if (state.brands.length) {
      params.set("brand", state.brands.join(","));
    }
    if (state.priceMin > 0) {
      params.set("minPrice", state.priceMin);
    }
    if (state.priceMax !== Infinity) {
      params.set("maxPrice", state.priceMax);
    }
    params.set("sort", state.sort);

    console.log("query params : ", `/category?${params.toString()}`);

    try {
      const response = await fetch(`/category?${params.toString()}`, {
        headers: {
          "X-requested-With": "XMLHttpRequest",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();

      // Clear old products
      grid.innerHTML = "";

      // No products
      if (!data.products || data.products.length === 0) {
        grid.innerHTML = `
                <div class="no-products">
                    <p>No products found.</p>
                </div>
            `;
        resultCountEl.textContent = "0";
        renderPagination(1, 0);
        return;
      }

      // Display products
      data.products.forEach((product) => {
        const card = document.createElement("div");

        card.className = "product-card";

        card.dataset.name = product.productName || "";
        card.dataset.price = product.price || 0;
        card.dataset.category = product.category || "";

        card.innerHTML = `
                    <div class="product-media">
                        <img
                            class="product-img"
                            src="${product.images?.[0] || ""}"
                            alt="${product.productName || "Product"}"
                        >
                    </div>

                    <div class="product-body cat-product-body">
                        <h3 class="product-name cat-product-name">
                            ${product.productName || ""}
                        </h3>

                        <div class="price-row">
                            <span class="price">
                                ₹${Number(product.price || 0).toLocaleString("en-IN")}
                            </span>
                        </div>

                        <a class="btn btn-view-details" href="/product/${product._id}">
                            VIEW DETAILS
                        </a>
                    </div>
            `;
        grid.appendChild(card);
      });
      resultCountEl.textContent = data.totalProduct;
      // Update pagination
      renderPagination(data.currentPage, data.totalPage);
    } catch (error) {
      console.log("search failed :", error);
      grid.innerHTML = `
      <div class="no-products">
       <p>${error.message}</p>
      </div>
      `;
    }
  }

  // ---------- Pagination ----------

  function renderPagination(currentPage, totalPage) {
    if (!pageNumbers) return;

    // Clear old page numbers
    pageNumbers.innerHTML = "";

    // Create page numbers
    for (let i = 1; i <= totalPage; i++) {
      const pageBtn = document.createElement("a");

      pageBtn.href = "#";
      pageBtn.className = "page-btn page-num";

      if (i === currentPage) {
        pageBtn.classList.add("active");
      }

      pageBtn.textContent = i;
      pageBtn.dataset.page = i;

      pageNumbers.appendChild(pageBtn);
    }

    // ---------- Previous ----------

    if (currentPage <= 1) {
      prevPage.classList.add("disabled");
      prevPage.removeAttribute("href");
      prevPage.removeAttribute("data-page");
    } else {
      prevPage.classList.remove("disabled");
      prevPage.href = `/category?page=${currentPage - 1}`;
      prevPage.dataset.page = currentPage - 1;
    }

    // ---------- Next ----------

    if (currentPage >= totalPage) {
      nextPage.classList.add("disabled");
      nextPage.removeAttribute("href");
      nextPage.removeAttribute("data-page");
    } else {
      nextPage.classList.remove("disabled");
      nextPage.href = `/category?page=${currentPage + 1}`;
      nextPage.dataset.page = currentPage + 1;
    }
  }

  // ---------- Page number click ----------

  if (pageNumbers) {
    pageNumbers.addEventListener("click", (e) => {
      const button = e.target.closest("[data-page]");
      if (!button) return;
      e.preventDefault();
      const page = Number(button.dataset.page);
      if (page < 1) return;
      loadProducts(page);
    });
  }

  // ---------- Previous click ----------

  prevPage?.addEventListener("click", (e) => {
    if (prevPage.classList.contains("disabled")) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const page = Number(prevPage.dataset.page);
    if (page >= 1) {
      loadProducts(page);
    }
  });

  // ---------- Next click ----------

  nextPage?.addEventListener("click", (e) => {
    if (nextPage.classList.contains("disabled")) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const page = Number(nextPage.dataset.page);
    if (page >= 1) {
      loadProducts(page);
    }
  });

  searchBtn.addEventListener("click", () => {
    loadProducts(1);
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadProducts(1);
  });

  // ---------- Category / Brand Checkboxes ----------
  categoryChecks.forEach((cb) =>
    cb.addEventListener("change", () => {
      state.categories = Array.from(categoryChecks)
        .filter((c) => c.checked)
        .map((c) => c.value);
      loadProducts(1);
    }),
  );

  brandChecks.forEach((cb) =>
    cb.addEventListener("change", () => {
      state.brands = Array.from(brandChecks)
        .filter((c) => c.checked)
        .map((c) => c.value);
      loadProducts(1);
    }),
  );

  // ---------- Price Presets (only price filter UI now) ----------
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isActive = btn.classList.contains("active");
      presetBtns.forEach((b) => b.classList.remove("active"));

      if (isActive) {
        // clicking the active preset again clears the price filter
        state.priceMin = 0;
        state.priceMax = Infinity;
      } else {
        btn.classList.add("active");
        state.priceMin = Number(btn.dataset.min);
        state.priceMax = Number(btn.dataset.max);
      }
      loadProducts(1);
    });
  });

  // ---------- Apply Filters button ----------
  const applyFiltersBtn = document.querySelector(".btn-apply-filters");

  applyFiltersBtn?.addEventListener("click", () => {
    loadProducts(1);
  });

  // ---------- Clear All ----------
  clearFiltersBtn.addEventListener("click", () => {
    state = {
      search: "",
      categories: [],
      brands: [],
      priceMin: 0,
      priceMax: Infinity,
      sort: "relevance",
    };
    searchInput.value = "";
    categoryChecks.forEach((c) => (c.checked = false));
    brandChecks.forEach((c) => (c.checked = false));
    presetBtns.forEach((b) => b.classList.remove("active"));
    sortSelect.value = "relevance";
    loadProducts(1);
  });

  // ---------- Sort ----------
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    loadProducts(1);
  });

  // ---------- Active Chips ----------
  function renderChips() {
    activeChips.innerHTML = "";
    const chips = [];

    if (state.search)
      chips.push({
        label: `"${state.search}"`,
        clear: () => {
          state.search = "";
          searchInput.value = "";
        },
      });
    state.categories.forEach((cat) =>
      chips.push({
        label: cat.replace(/-/g, " "),
        clear: () => {
          state.categories = state.categories.filter((c) => c !== cat);
          document.querySelector(
            `input[name="category"][value="${cat}"]`,
          ).checked = false;
        },
      }),
    );
    state.brands.forEach((b) =>
      chips.push({
        label: b.replace(/-/g, " "),
        clear: () => {
          state.brands = state.brands.filter((x) => x !== b);
          document.querySelector(
            `input[name="brand"][value="${b}"]`,
          ).checked = false;
        },
      }),
    );
    if (state.priceMin > 0 || state.priceMax < Infinity) {
      chips.push({
        label: `₹${state.priceMin} - ₹${state.priceMax === Infinity ? "∞" : state.priceMax}`,
        clear: () => {
          state.priceMin = 0;
          state.priceMax = Infinity;
          presetBtns.forEach((b) => b.classList.remove("active"));
        },
      });
    }

    activeChips.hidden = chips.length === 0;

    chips.forEach((chip) => {
      const el = document.createElement("div");
      el.className = "chip";
      el.innerHTML = `<span>${chip.label.toUpperCase()}</span><button aria-label="Remove filter"><span class="material-symbols-outlined">close</span></button>`;
      el.querySelector("button").addEventListener("click", () => {
        chip.clear();
        loadProducts(1);
      });
      activeChips.appendChild(el);
    });
  }

  // ---------- Mobile Filter Drawer ----------
  const filterSidebar = document.querySelector(".filters-sidebar");
  const drawerOverlay = document.getElementById("filter-drawer-overlay");
  const mobileFilterToggle = document.getElementById("mobile-filter-toggle");

  function openDrawer() {
    filterSidebar.classList.add("open");
    drawerOverlay.classList.add("open");
  }
  function closeDrawer() {
    filterSidebar.classList.remove("open");
    drawerOverlay.classList.remove("open");
  }

  mobileFilterToggle.addEventListener("click", openDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  // Initial render
  loadProducts(1);
});