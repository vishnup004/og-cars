console.log("CHANGE PASSWORD JS IS RUNNING");
document.addEventListener('DOMContentLoaded', () => {

    // ===== Show/hide password toggles =====
    document.querySelectorAll('.toggle-visibility').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.classList.toggle('is-visible', isPassword);
      });
    });

    // ===== Password form validation =====
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordHint = document.getElementById('passwordHint');
    const passwordFormError = document.getElementById('passwordFormError');
    const passwordSaveBtn = document.getElementById('passwordSaveBtn');

    function validateNewPassword() {
      const val = newPassword.value;
      if (val.length === 0) {
        passwordHint.textContent = 'Use at least 8 characters.';
        passwordHint.className = 'field-hint';
        return;
      }
      if (val.length < 8) {
        passwordHint.textContent = 'Too short — use at least 8 characters.';
        passwordHint.className = 'field-hint hint-error';
        return;
      }
      if (currentPassword.value && val === currentPassword.value) {
        passwordHint.textContent = 'New password must be different from current password.';
        passwordHint.className = 'field-hint hint-error';
        return;
      }
      passwordHint.textContent = 'Looks good.';
      passwordHint.className = 'field-hint hint-ok';
    }

    if (newPassword) newPassword.addEventListener('input', validateNewPassword);
    if (currentPassword) currentPassword.addEventListener('input', validateNewPassword);

    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        passwordFormError.textContent = '';

        if (newPassword.value.length < 8) {
          e.preventDefault();
          passwordFormError.textContent = 'New password must be at least 8 characters.';
          return;
        }
        if (newPassword.value === currentPassword.value) {
          e.preventDefault();
          passwordFormError.textContent = 'New password must be different from current password.';
          return;
        }
        if (newPassword.value !== confirmPassword.value) {
          e.preventDefault();
          passwordFormError.textContent = 'New password and confirm password do not match.';
          return;
        }

        passwordSaveBtn.disabled = true;
        passwordSaveBtn.textContent = 'UPDATING...';
      });
    }

    // ===== Logout Modal (same as profile page) =====
    const logoutModalOverlay = document.getElementById('logoutModalOverlay');
    const logoutModalCloseBtn = document.getElementById('logoutModalCloseBtn');
    const logoutModalCancelBtn = document.getElementById('logoutModalCancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    function openLogoutModal() {
      logoutModalOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function closeLogoutModal() {
      logoutModalOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openLogoutModal();
      });
    }

    if (logoutModalCloseBtn) logoutModalCloseBtn.addEventListener('click', closeLogoutModal);
    if (logoutModalCancelBtn) logoutModalCancelBtn.addEventListener('click', closeLogoutModal);

    if (logoutModalOverlay) {
      logoutModalOverlay.addEventListener('click', (e) => {
        if (e.target === logoutModalOverlay) closeLogoutModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && logoutModalOverlay && logoutModalOverlay.classList.contains('show')) {
        closeLogoutModal();
      }
    });

    const toast = document.getElementById("toast")

    if(toast){
      showToast()
    }

});
function showToast() {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}