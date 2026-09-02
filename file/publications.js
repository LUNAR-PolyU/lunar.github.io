let publicationsLoaded = false;
let publications = [];

function parseBibTeX(text) {
  const entries = [];
  const regex = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\}\s*(?=@|\s*$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const key = match[2].trim();
    const body = match[3];
    const fields = {};
    const fieldRegex = /(\w+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)")\s*,?/g;
    let f;

    while ((f = fieldRegex.exec(body)) !== null) {
      fields[f[1].toLowerCase()] = (f[2] ?? f[3] ?? "").trim()
        .replace(/\s+/g, " ")
        .replace(/[{}]/g, "");
    }

    entries.push({ type, key, ...fields });
  }

  return entries.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
}

function renderPublications() {
  const list = document.getElementById("publication-list");
  const search = document.getElementById("publication-search").value.toLowerCase().trim();
  const year = document.getElementById("publication-filter").value;

  const filtered = publications.filter(p => {
    const haystack = [p.title, p.author, p.journal, p.booktitle, p.year].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) && (year === "all" || p.year === year);
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="empty">No publications found.</div>';
    return;
  }

  list.innerHTML = filtered.map(p => {
    const venue = p.journal || p.booktitle || p.publisher || "";
    const url = p.url || p.doi ? (p.url || `https://doi.org/${p.doi}`) : "";
    return `
      <article class="publication">
        <div class="pub-year">${escapeHtml(p.year || "—")}</div>
        <div>
          <h2 class="pub-title">${escapeHtml(p.title || "Untitled")}</h2>
          <p class="pub-authors">${escapeHtml(p.author || "")}</p>
          ${venue ? `<div class="pub-venue">${escapeHtml(venue)}</div>` : ""}
        </div>
        ${url ? `<a class="pub-link" href="${escapeAttr(url)}" target="_blank" rel="noopener">View paper ↗</a>` : ""}
      </article>
    `;
  }).join("");
}

async function loadPublications() {
  if (publicationsLoaded) {
    renderPublications();
    return;
  }

  const list = document.getElementById("publication-list");

  try {
    const response = await fetch("file/publications.bib");
    if (!response.ok) throw new Error("Could not load BibTeX");
    const text = await response.text();
    publications = parseBibTeX(text);
    publicationsLoaded = true;

    const filter = document.getElementById("publication-filter");
    [...new Set(publications.map(p => p.year).filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a))
      .forEach(y => filter.insertAdjacentHTML("beforeend", `<option value="${escapeAttr(y)}">${escapeHtml(y)}</option>`));

    document.getElementById("publication-search").addEventListener("input", renderPublications);
    filter.addEventListener("change", renderPublications);
    renderPublications();
  } catch (error) {
    list.innerHTML = `
      <div class="empty">
        <strong>Publications could not be loaded.</strong><br>
        Please make sure <code>file/publications.bib</code> exists and the site is served
        through GitHub Pages or another web server.
      </div>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}
function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

window.loadPublications = loadPublications;
