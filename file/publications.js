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
  const parseMonth = (monthStr) => {
    if (!monthStr) return 0;
    const cleanStr = monthStr.trim().toLowerCase();
    const num = parseInt(cleanStr, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) return num;
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const index = months.findIndex(m => cleanStr.startsWith(m));
    return index !== -1 ? index + 1 : 0;
  };

  return entries.sort((a, b) => {
    const yearDiff = Number(b.year || 0) - Number(a.year || 0);
    if (yearDiff !== 0) return yearDiff;

    const monthDiff = parseMonth(b.month) - parseMonth(a.month);
    if (monthDiff !== 0) return monthDiff;

    const authorA = (a.author || "").toLowerCase();
    const authorB = (b.author || "").toLowerCase();
    return authorA.localeCompare(authorB);
  });
}

function formatAuthors(authorStr) {
  if (!authorStr) return "";
  const authors = authorStr.split(/\s+and\s+/i).map(a => a.trim()).filter(Boolean);

  const formatted = authors.map(author => {
    let lastName = "";
    let firstNames = "";

    if (author.includes(",")) {
      const parts = author.split(",").map(s => s.trim());
      lastName = parts[0];
      firstNames = parts[1] || "";
    } else {
      const parts = author.split(/\s+/);
      lastName = parts.pop() || "";
      firstNames = parts.join(" ");
    }

    const initials = firstNames
      ? firstNames
          .split(/[\s-]+/)
          .filter(Boolean)
          .map(n => n[0].toUpperCase() + ".")
          .join(" ")
      : "";

    return initials ? `${lastName}, ${initials}` : lastName;
  });

  if (formatted.length === 0) return "";
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;

  return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
}

function renderPublications() {
  const list = document.getElementById("publication-list");
  const search = document.getElementById("publication-search").value.toLowerCase().trim();
  const year = document.getElementById("publication-filter").value;
  const filtered = publications.filter(p => {
    const haystack = [p.title, p.author, p.journal, p.note, p.year].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) && (year === "all" || p.year === year);
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="empty">No publications found.</div>';
    return;
  }

  const groups = {
    journal: filtered.filter(p => p.type === 'article'),
    conference: filtered.filter(p => p.type === 'inproceedings' || p.type === 'conference'),
    other: filtered.filter(p => p.type !== 'article' && p.type !== 'inproceedings' && p.type !== 'conference')
  };

  let html = '';

  if (groups.journal.length) {
    html += `<h2 class="publication-group-title">Journal articles</h2>`;
    html += groups.journal.map(p => renderPublicationItem(p)).join('');
  }

  if (groups.conference.length) {
    html += `<h2 class="publication-group-title">Conference papers</h2>`;
    html += groups.conference.map(p => renderPublicationItem(p)).join('');
  }

  if (groups.other.length) {
    html += `<h2 class="publication-group-title">Other publications</h2>`;
    html += groups.other.map(p => renderPublicationItem(p)).join('');
  }

  list.innerHTML = html;
}

function renderPublicationItem(p) {
  const venue = p.journal || p.note || p.publisher || "";
  const url = p.url || p.doi ? (p.url || `https://doi.org/${p.doi}`) : "";
  const formattedAuthors = formatAuthors(p.author || "");
return `
    <article class="publication">
      <div class="pub-year">${escapeHtml(p.year || "—")}</div>
      <div>
        <h2 class="pub-title">${escapeHtml(p.title || "Untitled")}</h2>
        <p class="pub-authors">${escapeHtml(formattedAuthors)}</p>
        ${venue ? `<div class="pub-venue">${escapeHtml(venue)}</div>` : ""}
      </div>
      ${url ? `<a class="pub-link" href="${escapeAttr(url)}" target="_blank"
      rel="noopener">View paper ↗</a>` : ""}
    </article>
  `;
}

async function loadPublications() {
  if (publicationsLoaded) {
    renderPublications();
    return;
  }

  const list = document.getElementById("publication-list");

  try {
    const response = await fetch("./file/publications.bib");
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
        Please make sure <code>./file/publications.bib</code> exists and the site is served
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
