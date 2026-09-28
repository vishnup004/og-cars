console.log("PROFILE JS LOADING ")
document.addEventListener('DOMContentLoaded', () => {

    // ===== Avatar upload =====
    const avatarUploadBtn = document.getElementById('avatarUploadBtn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImg = document.getElementById('avatarImg');
    const avatarInitials = document.getElementById('avatarInitials');


    console.log("Profile JS loaded");
    console.log("Button:", avatarUploadBtn);
    console.log("Input:", avatarInput);
    console.log("Image:", avatarImg);
    console.log("Initials:", avatarInitials);

    if (avatarUploadBtn) {
      avatarUploadBtn.addEventListener('click', () => {
        console.log("Camera button clicked");
        avatarInput.click()
      });
    }

    if (avatarInput) {
      avatarInput.addEventListener('change', async () => {
        console.log("Image selected");
        const file = avatarInput.files[0];

        console.log("Selected file:", file);  
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          return;
        }
        const reader = new FileRea12der();
        reader.onload = (e) => {
          avatarImg.src = e.target.result;
          avatarImg.hidden = false;
          avatarInitials.hidden = true;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
         
        formData.append('profileImage', file);

        try{
          const response = await fetch('/profile/upload', {
            method : 'POST',
            body : formData
          });
          if(!response.ok) {
            throw new Error("Image upload failed");
          };
          console.log("Profile image uploaded successfully")
        }catch(error){
          console.error('Image upload error:', error);
          alert("Failed to upload profile image.")
        }
      });
    }

    // ===== Auto-generate initials from full name =====
    const fullNameInput = document.getElementById('fullName');
    function updateInitials() {
      if (avatarImg && !avatarImg.hidden) return; // don't override a real photo
      const parts = fullNameInput.value.trim().split(/\s+/).filter(Boolean);
      const initials = parts.slice(0, 2).map(p => p[0].toUpperCase()).join('');
      if (avatarInitials) avatarInitials.textContent = initials || '?';
    }
    if (fullNameInput) {
      fullNameInput.addEventListener('input', updateInitials);
    }

    // ===== Phone number & Email fields =====
    const phoneInput = document.getElementById('phone');
    const emailField = document.getElementById('email');

    // ===== Edit Profile modal =====
    const modalOverlay = document.getElementById('modalOverlay');
    const editOpenBtn = document.getElementById('editOpenBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalForm = document.getElementById('modalForm');
    const modalError = document.getElementById('modalError');

    const modalFullName = document.getElementById('modalFullName');
    const modalPhone = document.getElementById('modalPhone');
    const modalEmail = document.getElementById('modalEmail');

    function openModal() {
      modalFullName.value = fullNameInput.value;
      modalPhone.value = phoneInput.value;
      modalEmail.value = emailField.value;
      modalError.textContent = '';

      modalOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      modalFullName.focus();
    }

    function closeModal() {
      modalOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (editOpenBtn) editOpenBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('show')) {
        closeModal();
      }
    });

    if (modalPhone) {
      modalPhone.addEventListener('input', () => {
        modalPhone.value = modalPhone.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    // ===== Edit Profile modal: field validation =====
    // Regex rules
    const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/; // letters, spaces, apostrophes, hyphens
    const PHONE_REGEX = /^[6-9]\d{9}$/;                   // 10-digit Indian mobile number
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;      // basic email shape

    function setFieldError(inputEl, message) {
      if (message) {
        inputEl.classList.add('field-invalid');
      } else {
        inputEl.classList.remove('field-invalid');
      }
    }

    function validateModalName() {
      const val = modalFullName.value.trim();
      if (!val) return 'Full name is required.';
      if (val.length < 2) return 'Full name must be at least 2 characters.';
      if (!NAME_REGEX.test(val)) return 'Full name can only contain letters, spaces, hyphens and apostrophes.';
      return '';
    }

    function validateModalPhone() {
      const val = modalPhone.value.trim();
      if (!val) return 'Phone number is required.';
      if (!PHONE_REGEX.test(val)) return 'Enter a valid 10-digit mobile number.';
      return '';
    }

    function validateModalEmail() {
      const val = modalEmail.value.trim();
      if (!val) return 'Email address is required.';
      if (!EMAIL_REGEX.test(val)) return 'Enter a valid email address.';
      return '';
    }

    function validateModalForm() {
      const errors = [
        validateModalName(),
        validateModalPhone(),
        validateModalEmail()
      ];

      setFieldError(modalFullName, errors[0]);
      setFieldError(modalPhone, errors[1]);
      setFieldError(modalEmail, errors[2]);

      const firstError = errors.find(Boolean);
      modalError.textContent = firstError || '';
      return !firstError;
    }

    // Live validation as the user types/blurs, so errors clear as they fix them
    if (modalFullName) {
      modalFullName.addEventListener('blur', () => setFieldError(modalFullName, validateModalName()));
      modalFullName.addEventListener('input', () => {
        if (modalFullName.classList.contains('field-invalid')) {
          setFieldError(modalFullName, validateModalName());
        }
      });
    }

    if (modalPhone) {
      modalPhone.addEventListener('blur', () => setFieldError(modalPhone, validateModalPhone()));
      modalPhone.addEventListener('input', () => {
        if (modalPhone.classList.contains('field-invalid')) {
          setFieldError(modalPhone, validateModalPhone());
        }
      });
    }

    if (modalEmail) {
      modalEmail.addEventListener('blur', () => setFieldError(modalEmail, validateModalEmail()));
      modalEmail.addEventListener('input', () => {
        if (modalEmail.classList.contains('field-invalid')) {
          setFieldError(modalEmail, validateModalEmail());
        }
      });
    }

    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        if (!validateModalForm()) {
          e.preventDefault();
        }
      });
    }


    // ===== OTP Modal Controls =====
    const otpModalOverlay = document.getElementById('otpModalOverlay');
    const otpModalCloseBtn = document.getElementById('otpModalCloseBtn');
    const otpModalCancelBtn = document.getElementById('otpModalCancelBtn');
    const otpInput = document.getElementById('otpInput');

    function closeOtpModal() {
      if (otpModalOverlay) {
        otpModalOverlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    }

    if (otpModalCloseBtn) otpModalCloseBtn.addEventListener('click', closeOtpModal);
    if (otpModalCancelBtn) otpModalCancelBtn.addEventListener('click', closeOtpModal);

    if (otpModalOverlay) {
      otpModalOverlay.addEventListener('click', (e) => {
        if (e.target === otpModalOverlay) closeOtpModal();
      });
    }

    if (otpInput) {
      otpInput.addEventListener('input', () => {
        otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
      });
    }

    // Fix profileBt selector check
    const profileBt = document.getElementsByClassName("profileBt");
    if (profileBt.length > 0) {
      profileBt[0].addEventListener("click", () => {
        window.location.href = "/profile";
      });
    }
//     document.querySelectorAll('[data-delete-address]').forEach((btn) => {

//   btn.addEventListener('click', () => {

//     openDeleteModal(btn.dataset.deleteAddress);

//   });

// });


// // Close using X button
// if (deleteModalCloseBtn) {
//   deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
// }


// // Close using CANCEL button
// if (deleteModalCancelBtn) {
//   deleteModalCancelBtn.addEventListener('click', closeDeleteModal);
// }


// // Close when clicking outside the modal
// if (deleteModalOverlay) {

//   deleteModalOverlay.addEventListener('click', (e) => {

//     if (e.target === deleteModalOverlay) {
//       closeDeleteModal();
//     }

//   });
// }

  
// ===== Logout Modal =====

const logoutModalOverlay = document.getElementById('logoutModalOverlay');
const logoutModalCloseBtn = document.getElementById('logoutModalCloseBtn');
const logoutModalCancelBtn = document.getElementById('logoutModalCancelBtn');
const logoutBtn = document.querySelector('[data-panel="logout"]');


// Open logout modal
function openLogoutModal() {
    logoutModalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}


// Close logout modal
function closeLogoutModal() {
    logoutModalOverlay.classList.remove('show');
    document.body.style.overflow = '';
}


// Click LOGOUT in sidebar
if (logoutBtn) {

    logoutBtn.addEventListener('click', (e) => {

        e.preventDefault();

        openLogoutModal();

    });

}


// Click X
if (logoutModalCloseBtn) {

    logoutModalCloseBtn.addEventListener('click', closeLogoutModal);

}


// Click CANCEL
if (logoutModalCancelBtn) {

    logoutModalCancelBtn.addEventListener('click', closeLogoutModal);

}


// Click outside modal
if (logoutModalOverlay) {

    logoutModalOverlay.addEventListener('click', (e) => {

        if (e.target === logoutModalOverlay) {
            closeLogoutModal();
        }

    });

}

});