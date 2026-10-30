# Rhet/Comp Timeline 
A timeline website of studies of the field of rhet/comp

## The site

`index.html` is a static page (plain HTML, CSS, and JavaScript, no build
step) that reads `writing_studies_timeline.json` and renders it as a
searchable timeline.

- **Search** filters as you type. Every word must appear in the event or
  year, so `fulkerson 2006` narrows to one entry. Press `/` to jump to the
  search box and `Esc` to clear it.
- **Decade buttons** narrow the timeline to one decade. Click again to clear.
- **Shareable links**: the current search is kept in the URL, e.g.
  `?q=keywords&decade=2010s`.

### Adding events

Add an object to `writing_studies_timeline.json`:

```json
{"year": 2024, "decade": "2020s", "event": "Description of the study"}
```

Entries are sorted by year automatically, and decade buttons are generated
from the data.

### Publishing on GitHub Pages

In the repository's **Settings → Pages**, set the source to
**Deploy from a branch**, then pick the branch and the `/ (root)` folder.

### Previewing locally

Browsers block `fetch` on `file://` pages, so serve the folder instead of
opening the file directly:

```bash
python3 -m http.server
```

Then visit <http://localhost:8000>.
