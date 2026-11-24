const pages = ["home", "members", "publications", "fundings", "recruitment"];

function setPage(page) {
  if (!pages.includes(page)) page = "home";

  document.querySelectorAll(".page").forEach(el => {
    el.classList.toggle("active", el.id === page);
  });

  document.querySelectorAll(".nav-link").forEach(el => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  document.querySelector(".nav")?.classList.remove("open");
  document.querySelector(".menu-button")?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (page === "publications" && window.loadPublications) {
    window.loadPublications();
  }
}

function route() {
  const page = location.hash.replace("#", "") || "home";
  setPage(page);
}

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");

  function closeMenu() {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }

  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (
      nav?.classList.contains("open") &&
      !nav.contains(e.target) &&
      !menuButton?.contains(e.target)
    ) {
      closeMenu();
    }
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (document.getElementById("home")) {
    window.addEventListener("hashchange", route);
    route();
  }
});