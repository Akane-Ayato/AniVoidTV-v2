// Shared hamburger-drawer behavior for every page
(function () {
  const toggle = document.getElementById("menu-toggle");
  const drawer = document.getElementById("nav-drawer");
  const overlay = document.getElementById("nav-overlay");
  if (!toggle || !drawer || !overlay) return;

  function openMenu() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    toggle.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    toggle.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    drawer.classList.contains("open") ? closeMenu() : openMenu();
  });
  overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Highlight the current page in the drawer
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".drawer-link[data-page]").forEach((link) => {
    if (link.dataset.page === page) link.classList.add("current");
  });

  // Fill in your real links once — every drawer/footer/inline link with
  // these IDs across all pages updates automatically.
  const TELEGRAM_URL = "https://t.me/Anime_Void_x";
  const CONTACT_URL = "https://t.me/quanxi_core";
  window.AVTV_fillLinks = function () {
    document.querySelectorAll("[data-telegram-link]").forEach((el) => (el.href = TELEGRAM_URL));
    document.querySelectorAll("[data-contact-link]").forEach((el) => (el.href = CONTACT_URL));
  };
  window.AVTV_fillLinks();
})();
