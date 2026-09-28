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
    searchProducts();
  });

  /* Press Enter to search */
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      searchProducts();
    }
  });

  /* Clear search */
  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    pageInput.value = "1";

    searchProducts();
  });

  async function searchProducts() {
    const search = searchInput.value.trim();

    const page = pageInput.value || "1";

    try {
      categoryList.style.opacity = "0.5";
      categoryList.style.pointerEvents = "none";

      const response = await fetch(
        `/admin/products/search?search=${encodeURIComponent(search)}&page=${page}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Search failed");
      }

      renderProducts(data.products);
    } catch (error) {
      console.error("Search error:", error);

      showToast(error.message || "Something went wrong.");
    } finally {
      categoryList.style.opacity = "1";
      categoryList.style.pointerEvents = "auto";
    }
  }

  function renderProducts(products) {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";

    if (!products || products.length === 0) {
      categoryList.innerHTML = `<div class="empty-row"> No products found. </div>`;
      return;
    }

    products.forEach((prod) => {
      const row = document.createElement("div");

      row.className = "category-row";

      row.innerHTML = `<div class="cat-cell"> <img class="cat-thumb" src="${escapeHtml(prod.image || "")}" alt="${escapeHtml(prod.name || "")}"> 
      <div>
              <span class="cat-name">
                  ${escapeHtml(prod.name || "")}
              </span>

              <span class="cell-desc">
                  ${escapeHtml(prod.discription || "")}
              </span>
          </div>
      </div>


      <div class="row-products">
          <span class="row-products-label">
              Price
          </span>
          <span class="row-products-count">
              ₹${escapeHtml(String(prod.price ?? ""))}
          </span>
      </div>

      <div class="row-products">
          <span class="row-products-label">
              Stock
          </span>
          <span class="row-products-count">
              ${escapeHtml(String(prod.stock ?? ""))}
          </span>
      </div>

      <span class="status-badge ${prod.status ? "active" : "blocked"}" data-status-id="${prod._id}"> ${prod.status ? "Listed" : "Unlisted"} </span>

      <div class="actions-cell">

          <button
              class="icon-btn edit-btn"
              title="Edit"
              data-id="${prod._id}"
              data-name="${escapeHtml(prod.name || "")}"
              data-description="${escapeHtml(prod.discription || "")}"
              data-image="${escapeHtml(prod.image || "")}"
              data-category="${escapeHtml(prod.category || "")}"
              data-price="${escapeHtml(String(prod.price ?? ""))}"
              data-stock="${escapeHtml(String(prod.stock ?? ""))}"
              data-color="${escapeHtml(prod.color || "")}"
              data-motor="${escapeHtml(prod.motorType || "")}"
              data-chassis="${escapeHtml(prod.chassisMaterial || "")}"
              data-scale="${escapeHtml(prod.scale || "")}"
          >
              ✏️
          </button>


          <button
              class="icon-btn delete-btn"
              title="Delete"
              data-id="${prod._id}"
              data-name="${escapeHtml(prod.name || "")}">🗑️</button>
          ${prod.status ? `<button class="block-btn" title="Unlist product" data-id="${prod._id}"></button>` : `<button class="unblock-btn" title="List product" data-id="${prod._id}" ></button>`}
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
  if (updated === "listed") showToast("Product listed.");
  if (updated === "unlisted") showToast("Product unlisted.");
  if (updated === "created") showToast("Product created.");
  if (updated === "edited") showToast("Product updated.");
}

/* ===== LIST / UNLIST ===== */
function initListUnlist() {
  document.addEventListener("click", async (e) => {
    const button = e.target.closest(".block-btn, .unblock-btn");

    if (!button) return;

    const productId = button.dataset.id;

    if (!productId) {
      showToast("Product ID is missing.");
      return;
    }

    // block-btn = currently Listed
    // unblock-btn = currently Unlisted
    const isCurrentlyListed = button.classList.contains("block-btn");

    const action = isCurrentlyListed ? "unlist" : "list";

    try {
      button.disabled = true;

      const response = await fetch(`/admin/product/${action}/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update product");
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

        button.title = "List product";

        // Change status badge
        const statusBadge = row?.querySelector(".status-badge");

        if (statusBadge) {
          statusBadge.classList.remove("status-active");
          statusBadge.classList.add("status-blocked");
          statusBadge.textContent = "Unlisted";
        }

        showToast("Product unlisted.");
      } else {
        // Change button from unblock-btn -> block-btn
        button.classList.remove("unblock-btn");
        button.classList.add("block-btn");

        button.title = "Unlist product";

        // Change status badge
        const statusBadge = row?.querySelector(".status-badge");

        if (statusBadge) {
          statusBadge.classList.remove("status-blocked");
          statusBadge.classList.add("status-active");
          statusBadge.textContent = "Listed";
        }

        showToast("Product listed.");
      }
    } catch (error) {
      console.error("List/unlist error:", error);

      showToast(error.message || "Something went wrong.");
    } finally {
      button.disabled = false;
    }
  });
}

/* ===== DELETE ===== */
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

    const productId = deleteBtn.dataset.id;
    const productName = deleteBtn.dataset.name;

    deleteCategoryId.value = productId;
    deleteCategoryName.textContent = productName || "";

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
    const productId = deleteCategoryId.value;

    if (!productId) {
      showToast("Product ID is missing.");
      return;
    }

    try {
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = "Deleting...";

      const response = await fetch(`/admin/product/delete/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        closeDeleteModal();

        showToast("Product deleted.");

        setTimeout(() => {
          window.location.reload();
        }, 700);
      } else {
        showToast(data.message || "Failed to delete product.");
      }
    } catch (error) {
      console.error("Delete product error:", error);

      showToast("Something went wrong.");
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = "Delete";
    }
  });
}

/* ===== ADD / EDIT MODAL =====
   Every required element is verified up front, and a clear console.warn
   tells you exactly which id is missing from the DOM instead of the modal
   just silently doing nothing.

   Technical Variants (color, variant) and Technical Specification
   (motorType, chassisMaterial, scale) are plain named inputs inside the
   same <form>, so FormData picks them up automatically on submit — no
   extra wiring needed for the POST/PUT beyond what's below for the
   edit-populate step. */
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

  const imageInputs = [
    document.getElementById("categoryImage1"),
    document.getElementById("categoryImage2"),
    document.getElementById("categoryImage3"),
    document.getElementById("categoryImage4"),
    document.getElementById("categoryImage5"),
    document.getElementById("categoryImage6"),
  ];
  const imagePreviews = [
    document.getElementById("imagePreview1"),
    document.getElementById("imagePreview2"),
    document.getElementById("imagePreview3"),
    document.getElementById("imagePreview4"),
    document.getElementById("imagePreview5"),
    document.getElementById("imagePreview6"),
  ];

  const categorySelect = document.getElementById("productCategory");
  const priceInput = document.getElementById("productPrice");
  const stockInput = document.getElementById("productStock");

  const colorInput = document.getElementById("colorInput");
  const addColorBtn = document.getElementById("addColorBtn");
  const colorTags = document.getElementById("colorTags");
  const productColorsInput = document.getElementById("productColors");
  
  const motorInput = document.getElementById("productMotorType");
  const chassisInput = document.getElementById("productChassisMaterial");
  const scaleInput = document.getElementById("productScale");

  const nameError = document.getElementById("nameError");
  const descriptionError = document.getElementById("descriptionError");
  const imageError = document.getElementById("imageError");
  const categoryError = document.getElementById("categoryError");
  const priceError = document.getElementById("priceError");
  const stockError = document.getElementById("stockError");
  const colorError = document.getElementById("colorError");
  
  const motorError = document.getElementById("motorError");
  const chassisError = document.getElementById("chassisError");
  const scaleError = document.getElementById("scaleError");

  let colors = [];

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
    categoryImage1: imageInputs[0],
    categoryImage2: imageInputs[1],
    categoryImage3: imageInputs[2],
    categoryImage4: imageInputs[3],
    categoryImage5: imageInputs[4],
    categoryImage6: imageInputs[5],
    imagePreview1: imagePreviews[0],
    imagePreview2: imagePreviews[1],
    imagePreview3: imagePreviews[2],
    imagePreview4: imagePreviews[3],
    imagePreview5: imagePreviews[4],
    imagePreview6: imagePreviews[5],
    productCategory: categorySelect,
    productPrice: priceInput,
    productStock: stockInput,
    productColor: colorInput,
    addColorBtn,
    colorTags,
    productColors: productColorsInput,
    productMotorType: motorInput,
    productChassisMaterial: chassisInput,
    productScale: scaleInput,
    nameError,
    descriptionError,
    imageError,
  };

  const missing = Object.entries(required)
    .filter(([, el]) => !el)
    .map(([id]) => id);

  if (missing.length) {
    console.warn(
      "[product modal] Could not initialize — missing elements in the DOM:",
      missing.join(", "),
      "\nCheck that product.ejs matches these ids exactly and that this script runs after the modal markup is rendered.",
    );
    return;
  }

  function clearErrors() {
    nameError.textContent = "";
    descriptionError.textContent = "";
    imageError.textContent = "";
    if (categoryError) categoryError.textContent = "";
    if (priceError) priceError.textContent = "";
    if (stockError) stockError.textContent = "";
    if (colorError) colorError.textContent = "";
    if (motorError) motorError.textContent = "";
    if (chassisError) chassisError.textContent = "";
    if (scaleError) scaleError.textContent = "";
  }

  // ----- Color tags -----
  function renderColorTags() {
    colorTags.innerHTML = "";
    colors.forEach((color) => {
      const tag = document.createElement("span");
      tag.className = "color-tag";

      const swatch = document.createElement("span");
      swatch.className = "color-tag-swatch";
      swatch.style.background = color;

      const label = document.createElement("span");
      label.textContent = color;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", `Remove ${color}`);
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        colors = colors.filter((c) => c !== color);
        renderColorTags();
      });

      tag.appendChild(swatch);
      tag.appendChild(label);
      tag.appendChild(removeBtn);
      colorTags.appendChild(tag);
    });

    productColorsInput.value = colors.join(",");
  }

  function addColor() {
    const value = colorInput.value.trim();
    if (!value) return;

    const exists = colors.some((c) => c.toLowerCase() === value.toLowerCase());
    if (exists) {
      colorInput.value = "";
      return;
    }

    colors.push(value);
    colorInput.value = "";
    renderColorTags();
    colorError.textContent = "";
  }

  addColorBtn.addEventListener("click", addColor);
  colorInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addColor();
    }
  });

  renderColorTags();

  function resetForm() {
    form.reset();
    categoryIdInput.value = "";
    imagePreviews.forEach((preview) => {
      preview.src = "";
      preview.style.display = "none";
    });
    colors = [];
    renderColorTags();
    clearErrors();
  }

  function openModal(mode, data) {
    clearErrors();

    if (mode === "edit" && data) {
      modalTitle.textContent = "Edit Product";
      categoryIdInput.value = data.id;
      nameInput.value = data.name || "";
      descriptionInput.value = data.description || "";
      categorySelect.value = data.category || "";
      priceInput.value = data.price || "";
      stockInput.value = data.stock || "";

      colors = (data.color || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      renderColorTags();
      motorInput.value = data.motor || "";
      chassisInput.value = data.chassis || "";
      scaleInput.value = data.scale || "";

      const images = [data.image, data.image2, data.image3];
      imagePreviews.forEach((preview, i) => {
        if (images[i]) {
          preview.src = images[i];
          preview.style.display = "block";
        } else {
          preview.style.display = "none";
        }
      });
    } else {
      modalTitle.textContent = "Add Product";
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
  image2: editBtn.dataset.image2,
  image3: editBtn.dataset.image3,
  image4: editBtn.dataset.image4,
  image5: editBtn.dataset.image5,
  image6: editBtn.dataset.image6,
  category: editBtn.dataset.category,
  price: editBtn.dataset.price,
  stock: editBtn.dataset.stock,
  color: editBtn.dataset.color,
  motor: editBtn.dataset.motor,
  chassis: editBtn.dataset.chassis,
  scale: editBtn.dataset.scale,
    });
  });

  // Live image preview on file select, one listener per slot
  imageInputs.forEach((input, i) => {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      const preview = imagePreviews[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  });

  function validateForm() {
    clearErrors();
    let valid = true;

    const name = nameInput.value.trim();
    if (!name) {
      nameError.textContent = "Product name is required.";
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

    if (!categorySelect.value) {
      categoryError.textContent = "Select a category.";
      valid = false;
    }

    if (priceInput.value === "" || Number(priceInput.value) < 0) {
      priceError.textContent = "Enter a valid price.";
      valid = false;
    }

    if (stockInput.value === "" || Number(stockInput.value) < 0) {
      stockError.textContent = "Enter a valid stock quantity.";
      valid = false;
    }

    // At least the first image is required; slots 2 and 3 are optional,
    // but an existing edit (preview already showing) counts too.
    const hasImage1 =
      imageInputs[0].files.length > 0 ||
      imagePreviews[0].style.display === "block";
    if (!hasImage1) {
      imageError.textContent = "At least one product image is required.";
      valid = false;
    }

    if (colors.length === 0) {
      colorError.textContent = "Add at least one color.";
      valid = false;
    }


    if (!motorInput.value.trim()) {
      motorError.textContent = "Motor type is required.";
      valid = false;
    }

    if (!chassisInput.value.trim()) {
      chassisError.textContent = "Chassis material is required.";
      valid = false;
    }

    if (!scaleInput.value) {
      scaleError.textContent = "Select a scale.";
      valid = false;
    }

    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isEdit = !!categoryIdInput.value;
    const url = isEdit
      ? `/admin/product/edit/${categoryIdInput.value}`
      : `/admin/product/add`;
      
      console.log("selected url :", url)
    const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
}
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showToast(isEdit ? "Product updated." : "Product created.");
        closeModal();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        if (data.field && data.message) {
          const errorEl = document.getElementById(`${data.field}Error`);
          if (errorEl) errorEl.textContent = data.message;
        } else {
          showToast(data.message || "Failed to save product.");
        }
      }
    } catch (error) {
      console.error(error);
      showToast("Something went wrong.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Product";
    }
  });
}
/* ==========================================
   PRODUCT IMAGE CROP + RESIZE
========================================== */

function initImageCropper() {

    const imageInputs = [
        document.getElementById("categoryImage1"),
        document.getElementById("categoryImage2"),
        document.getElementById("categoryImage3")
    ];

    const imagePreviews = [
        document.getElementById("imagePreview1"),
        document.getElementById("imagePreview2"),
        document.getElementById("imagePreview3")
    ];


    const cropModal = document.getElementById("cropModal");
    const cropImage = document.getElementById("cropImage");

    const closeCropModal = document.getElementById("closeCropModal");
    const cancelCropBtn = document.getElementById("cancelCropBtn");

    const applyCropBtn = document.getElementById("applyCropBtn");

    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");

    const rotateLeftBtn = document.getElementById("rotateLeftBtn");
    const rotateRightBtn = document.getElementById("rotateRightBtn");

    const resetCropBtn = document.getElementById("resetCropBtn");

    const zoomValue = document.getElementById("zoomValue");


    let cropper = null;

    let currentImageIndex = null;

    let originalFile = null;


    /* ==========================================
       SELECT IMAGE
    ========================================== */

    imageInputs.forEach((input, index) => {

        input.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;


            if (!file.type.startsWith("image/")) {

                alert("Please select an image");

                input.value = "";

                return;
            }


            originalFile = file;

            currentImageIndex = index;


            const reader = new FileReader();


            reader.onload = function (event) {

                imagePreviews[index].src = event.target.result;

                imagePreviews[index].style.display = "block";

            };


            reader.readAsDataURL(file);

        });

    });


    /* ==========================================
       OPEN CROP MODAL
    ========================================== */

    document.querySelectorAll(".crop-image-btn").forEach(button => {

        button.addEventListener("click", function () {

            const index = Number(this.dataset.index);

            const input = imageInputs[index];

            const file = input.files[0];


            if (!file) {

                alert("Please select an image first.");

                return;
            }


            currentImageIndex = index;

            originalFile = file;


            const reader = new FileReader();


            reader.onload = function (event) {

                cropImage.src = event.target.result;

                cropModal.classList.add("active");


                if (cropper) {

                    cropper.destroy();

                    cropper = null;

                }


                cropImage.onload = function () {

                    cropper = new Cropper(cropImage, {

                        aspectRatio: 1,

                        viewMode: 1,

                        dragMode: "move",

                        autoCropArea: 0.8,

                        responsive: true,

                        background: false,

                        movable: true,

                        zoomable: true,

                        rotatable: true,

                        scalable: false

                    });


                    updateZoomValue();

                };

            };


            reader.readAsDataURL(file);

        });

    });


    /* ==========================================
       ZOOM IN
    ========================================== */

    zoomInBtn.addEventListener("click", function () {

        if (!cropper) return;

        cropper.zoom(0.1);

        updateZoomValue();

    });


    /* ==========================================
       ZOOM OUT
    ========================================== */

    zoomOutBtn.addEventListener("click", function () {

        if (!cropper) return;

        cropper.zoom(-0.1);

        updateZoomValue();

    });


    /* ==========================================
       ROTATE LEFT
    ========================================== */

    rotateLeftBtn.addEventListener("click", function () {

        if (!cropper) return;

        cropper.rotate(-90);

    });


    /* ==========================================
       ROTATE RIGHT
    ========================================== */

    rotateRightBtn.addEventListener("click", function () {

        if (!cropper) return;

        cropper.rotate(90);

    });


    /* ==========================================
       RESET
    ========================================== */

    resetCropBtn.addEventListener("click", function () {

        if (!cropper) return;

        cropper.reset();

        updateZoomValue();

    });


    /* ==========================================
       APPLY CROP
    ========================================== */

    applyCropBtn.addEventListener("click", function () {

        if (!cropper) return;


        const canvas = cropper.getCroppedCanvas({

            width: 800,

            height: 800,

            imageSmoothingEnabled: true,

            imageSmoothingQuality: "high"

        });


        canvas.toBlob(

            function (blob) {

                if (!blob) {

                    alert("Failed to process image.");

                    return;
                }


                const fileName = originalFile.name
                    .replace(/\.[^/.]+$/, "")
                    + ".jpg";


                const croppedFile = new File(

                    [blob],

                    fileName,

                    {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    }

                );


                /*
                 * Replace the original selected file
                 * with the cropped file.
                 */

                const dataTransfer = new DataTransfer();

                dataTransfer.items.add(croppedFile);

                imageInputs[currentImageIndex].files =
                    dataTransfer.files;


                /*
                 * Update preview
                 */

                const previewUrl = URL.createObjectURL(croppedFile);

                imagePreviews[currentImageIndex].src = previewUrl;

                imagePreviews[currentImageIndex].style.display =
                    "block";


                closeCropper();

            },

            "image/jpeg",

            0.90

        );

    });


    /* ==========================================
       CLOSE
    ========================================== */

    closeCropModal.addEventListener("click", closeCropper);

    cancelCropBtn.addEventListener("click", closeCropper);


    function closeCropper() {

        cropModal.classList.remove("active");


        if (cropper) {

            cropper.destroy();

            cropper = null;

        }


        cropImage.src = "";

        currentImageIndex = null;

        originalFile = null;

    }


    /* ==========================================
       UPDATE ZOOM %
    ========================================== */

    function updateZoomValue() {

        if (!cropper) return;


        const data = cropper.getData();

        const containerData = cropper.getContainerData();


        if (!data || !containerData) return;


        const zoom =
            data.width / containerData.width;


        zoomValue.textContent =
            Math.round(zoom * 100) + "%";

    }

}

/* ===== FILTER PANEL =====
   Filters ride inside the existing #searchForm as hidden inputs
   (minPrice, maxPrice, brand) so Search + Filter always submit together
   as one GET request, e.g.:
     /admin/products?search=&page=1&minPrice=1000&maxPrice=5000&brand=Traxxas,Tamiya

   On page load, the panel reads its own state back out of the current
   URL's query string, so if the server re-renders the page with
   ?minPrice=1000&brand=Traxxas already in the address bar, the checkboxes,
   radio, and price inputs all reflect that — and the "Filter" button shows
   an active-count badge plus removable chips.

   Backend: the GET route for /admin/products should read
   req.query.minPrice / maxPrice / brand and apply them against the
   product schema's price and brand fields. */
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
        `/admin/products/filter?${params.toString()}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Filter failed");
      }

      // Only replace the list
      renderProducts(data.products);

      // Close filter
      panel.classList.remove("show");
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
  initImageCropper();
  initFilterPanel();
  initActiveSidebar();
});