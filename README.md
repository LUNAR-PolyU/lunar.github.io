# LUNAR Group Academic Homepage

A modern, single-page academic website designed for GitHub Pages.

## Folder structure

```text
.
├── index.html
└── file/
    ├── style.css
    ├── main.js
    ├── publications.js
    └── publications.bib
```

All external assets/files are kept in `file/`.

## How to publish on GitHub Pages

1. Create a repository named `YOUR_USERNAME.github.io`.
2. Upload `index.html` and the entire `file/` folder to the repository root.
3. Push to GitHub.
4. Open **Settings → Pages**.
5. Select **Deploy from a branch**, choose `main` and `/ (root)`.
6. Your site will be available at:

   `https://YOUR_USERNAME.github.io/`

## How to edit the website

### 1. Group information

Edit the text in `index.html`, especially:

- Group name
- University / department
- Research areas
- PI information
- Recruitment information
- Contact email

### 2. Members

Replace the sample names and research interests in the `#members` section.

To use actual portraits, place images in `file/`, for example:

```text
file/
├── prof.jpg
├── member01.jpg
└── member02.jpg
```

Then replace:

```html
<div class="avatar placeholder">PI</div>
```

with:

```html
<img class="avatar" src="file/prof.jpg" alt="Professor Name">
```

### 3. Publications

Edit only:

```text
file/publications.bib
```

The website automatically reads the BibTeX file and displays:

- Year
- Title
- Authors
- Journal / conference
- DOI / URL when provided

You do not need to manually edit the publication list in `index.html`.

### 4. Navigation

The top navigation switches between:

- Home
- Members
- Publications
- Recruitment

The URL hash changes accordingly, e.g.:

```text
https://YOUR_USERNAME.github.io/#publications
```

## Local preview

Because the Publications page uses `fetch()` to read the `.bib` file, opening `index.html` directly with `file://` may block the BibTeX request.

Run a simple local server from the repository folder:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/
```

## Notes

This version uses no external JavaScript/CSS libraries, so it is lightweight and works well with GitHub Pages.
