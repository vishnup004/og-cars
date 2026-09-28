document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const variantColor = document.getElementById("variantColor");
  const variantScale = document.getElementById("variantScale");
  const variantStock = document.getElementById("variantStock");
  const variantList = document.getElementById("variantList");
  const variantsInput = document.getElementById("productVariants");
  const imageInputs = [
    document.getElementById("categoryImage1"),
    document.getElementById("categoryImage2"),
    document.getElementById("categoryImage3"),
  ];
  const previews = [
    document.getElementById("imagePreview1"),
    document.getElementById("imagePreview2"),
    document.getElementById("imagePreview3"),
  ];
  const toast = document.getElementById("toast");
  const productId = document.getElementById("productId").value;
  const isEditing = Boolean(productId);
  let variants = JSON.parse(variantsInput.value || "[]");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function setError(id, message) {
    document.getElementById(id).textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach((element) => element.textContent = "");
  }

  function renderVariants() {
    variantList.innerHTML = "";
    variants.forEach((variant, index) => {
      const tag = document.createElement("span");
      tag.className = "color-tag";
      tag.append(`${variant.color} · ${variant.scale} · Stock: ${variant.stock}`);
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "×";
      removeButton.addEventListener("click", () => {
        variants.splice(index, 1);
        renderVariants();
      });
      tag.appendChild(removeButton);
      variantList.appendChild(tag);
    });
    variantsInput.value = JSON.stringify(variants);
  }

  function addVariant() {
    const color = variantColor.value.trim();
    const scale = variantScale.value;
    const stock = variantStock.value;
    if (!color || !scale || stock === "" || Number(stock) < 0) {
      setError("variantError", "Enter a color, scale, and valid stock");
      return;
    }
    if (variants.some((item) => item.color.toLowerCase() === color.toLowerCase() && item.scale === scale)) {
      setError("variantError", "This color and scale already exists");
      return;
    }
    variants.push({ color, scale, stock: Number(stock) });
    variantColor.value = "";
    variantScale.value = "";
    variantStock.value = "";
    setError("variantError", "");
    renderVariants();
  }

  document.getElementById("addVariantBtn").addEventListener("click", addVariant);
  variantStock.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addVariant();
    }
  });
  renderVariants();

  imageInputs.forEach((input, index) => {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      previews[index].src = URL.createObjectURL(file);
      previews[index].style.display = "block";
    });
  });

  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("cropImage");
  let cropper;
  let cropIndex;

  function closeCropModal() {
    cropModal.classList.remove("active");
    cropper?.destroy();
    cropper = null;
    cropImage.src = "";
  }

  document.querySelectorAll(".crop-image-btn").forEach((button) => {
    button.addEventListener("click", () => {
      cropIndex = Number(button.dataset.index);
      const file = imageInputs[cropIndex].files[0];
      if (!file) return showToast("Choose an image before cropping it");
      cropImage.src = URL.createObjectURL(file);
      cropModal.classList.add("active");
      cropImage.onload = () => {
        cropper?.destroy();
        cropper = new Cropper(cropImage, { viewMode: 1, autoCropArea: 1 });
      };
    });
  });

  document.getElementById("zoomInBtn").addEventListener("click", () => cropper?.zoom(0.1));
  document.getElementById("zoomOutBtn").addEventListener("click", () => cropper?.zoom(-0.1));
  document.getElementById("rotateLeftBtn").addEventListener("click", () => cropper?.rotate(-90));
  document.getElementById("rotateRightBtn").addEventListener("click", () => cropper?.rotate(90));
  document.getElementById("resetCropBtn").addEventListener("click", () => cropper?.reset());
  document.getElementById("closeCropModal").addEventListener("click", closeCropModal);
  document.getElementById("cancelCropBtn").addEventListener("click", closeCropModal);
  document.getElementById("applyCropBtn").addEventListener("click", () => {
    if (!cropper) return;
    cropper.getCroppedCanvas({ width: 800, height: 800 }).toBlob((blob) => {
      if (!blob) return showToast("Unable to crop image");
      const file = new File([blob], "product-image.jpg", { type: "image/jpeg" });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      imageInputs[cropIndex].files = transfer.files;
      previews[cropIndex].src = URL.createObjectURL(file);
      previews[cropIndex].style.display = "block";
      closeCropModal();
    }, "image/jpeg", 0.9);
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    const data = new FormData(form);
    let valid = true;

    const requiredFields = [
      ["productName", "nameError", "Name is required"],
      ["productDescription", "descriptionError", "Description is required"],
      ["productCategory", "categoryError", "Category is required"],
      ["productPrice", "priceError", "Price is required"],
      ["productMotorType", "motorError", "Motor type is required"],
      ["productChassisMaterial", "chassisError", "Chassis material is required"],
    ];

    requiredFields.forEach(([field, error, message]) => {
      if (!String(data.get(field) || "").trim()) {
        setError(error, message);
        valid = false;
      }
    });

    if (!variants.length) {
      setError("variantError", "Add at least one variant");
      valid = false;
    }
    const selectedImages = imageInputs.filter((input) => input.files.length).length;
    if (!isEditing && selectedImages < 3) {
      setError("imageError", "Please choose at least three images");
      valid = false;
    }
    if (Number(data.get("productPrice")) < 0) {
      setError("priceError", "Price cannot be negative");
      valid = false;
    }
    if (!valid) return;

    const saveButton = document.getElementById("saveProductBtn");
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    try {
      const response = await fetch(
        isEditing ? `/admin/product/edit/${productId}` : "/admin/product/add",
        { method: isEditing ? "PUT" : "POST", body: data },
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to add product");
      window.location.href = "/admin/product";
    } catch (error) {
      showToast(error.message);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = isEditing ? "Update Product" : "Save Product";
    }
  });
});
