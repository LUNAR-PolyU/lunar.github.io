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
  window.addEventListener("hashchange", route);
  route();

  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");

  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });

  document.getElementById("year").textContent = new Date().getFullYear();
});
