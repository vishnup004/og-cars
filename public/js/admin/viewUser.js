

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* Reset page number to 1 whenever the user edits the search box by hand,
   so a fresh search always starts on page 1. This only updates the hidden
   field's value — actual navigation still happens via the form's native
   GET submission. */
function initSearchField() {
  const searchInput = document.getElementById("searchInput");
  const pageInput = document.getElementById("pageInput");
  if (!searchInput || !pageInput) return;

  searchInput.addEventListener("input", () => {
    pageInput.value = "1";
  });
}

/* ===== SIDEBAR TOGGLE (same pattern as adminHome) ===== */
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

/* Optional: show a toast if the server redirects back with a status flag,
   e.g. /admin/users?search=...&page=...&updated=blocked */
function initStatusToast() {
  const params = new URLSearchParams(window.location.search);
  const updated = params.get("updated");
  if (updated === "blocked") showToast("User blocked.");
  if (updated === "unblocked") showToast("User unblocked.");
}

function initBlockUnblock() {

  const blockButtons = document.querySelectorAll(".block-btn");
  const unblockButtons = document.querySelectorAll(".unblock-btn");

  blockButtons.forEach(button => {

    button.addEventListener("click", async () => {

      const userId = button.dataset.id;

      try {

        const response = await fetch(`/admin/user/block/${userId}`, {
          method: "PATCH"
        });

        const data = await response.json();

        if (data.success) {
          showToast("User blocked.");

          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          showToast(data.message || "Failed to block user.");
        }

      } catch (error) {
        console.error(error);
        showToast("Something went wrong.");
      }

    });

  });


  unblockButtons.forEach(button => {

    button.addEventListener("click", async () => {

      const userId = button.dataset.id;

      try {

        const response = await fetch(`/admin/user/unblock/${userId}`, {
          method: "PATCH"
        });

        const data = await response.json();

        if (data.success) {
          showToast("User unblocked.");

          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          showToast(data.message || "Failed to unblock user.");
        }

      } catch (error) {
        console.error(error);
        showToast("Something went wrong.");
      }

    });

  });

}

document.addEventListener("DOMContentLoaded", () => {
  initSearchField();
  initSidebarToggle();
  initStatusToast();
  initBlockUnblock();
  
});