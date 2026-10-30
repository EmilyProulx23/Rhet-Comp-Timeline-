(function () {
  "use strict";

  var DATA_URL = "writing_studies_timeline.json";

  var timelineEl = document.getElementById("timeline");
  var statusEl = document.getElementById("status");
  var searchEl = document.getElementById("search");
  var decadesEl = document.getElementById("decade-filters");

  var entries = [];
  var activeDecade = null;

  // Lowercase and strip accents so "latinx" matches "Latinx" and "e" matches "é".
  function normalize(str) {
    return String(str).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getTerms(query) {
    return normalize(query).split(/\s+/).filter(Boolean);
  }

  // Appends `text` to `parent`, wrapping any search-term matches in <mark>.
  // Matching runs on the normalized text; NFD-stripping can change string
  // length, so it builds an index map back to the original characters.
  function appendHighlighted(parent, text, terms) {
    if (!terms.length) {
      parent.textContent = text;
      return;
    }

    var norm = "";
    var map = [];
    for (var i = 0; i < text.length; i++) {
      var n = normalize(text[i]);
      for (var j = 0; j < n.length; j++) {
        norm += n[j];
        map.push(i);
      }
    }

    var re = new RegExp(terms.map(escapeRegExp).join("|"), "g");
    var last = 0;
    var m;
    while ((m = re.exec(norm)) !== null) {
      if (!m[0].length) { re.lastIndex++; continue; }
      var start = map[m.index];
      var end = map[m.index + m[0].length - 1] + 1;
      if (start > last) parent.appendChild(document.createTextNode(text.slice(last, start)));
      var mark = document.createElement("mark");
      mark.textContent = text.slice(start, end);
      parent.appendChild(mark);
      last = end;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function matches(item, terms) {
    var haystack = item._search;
    return terms.every(function (t) { return haystack.indexOf(t) !== -1; });
  }

  function render() {
    var terms = getTerms(searchEl.value);
    var list = entries.filter(function (item) {
      return (!activeDecade || item.decade === activeDecade) && matches(item, terms);
    });

    timelineEl.textContent = "";

    if (!list.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No events match your search.";
      timelineEl.appendChild(empty);
    }

    var currentDecade = null;
    list.forEach(function (item) {
      if (item.decade !== currentDecade) {
        currentDecade = item.decade;
        var heading = document.createElement("li");
        heading.className = "decade-heading";
        heading.textContent = currentDecade;
        timelineEl.appendChild(heading);
      }

      var li = document.createElement("li");
      li.className = "entry";

      var year = document.createElement("span");
      year.className = "entry-year";
      appendHighlighted(year, String(item.year), terms);

      var event = document.createElement("p");
      event.className = "entry-event";
      appendHighlighted(event, item.event, terms);

      li.appendChild(year);
      li.appendChild(event);
      timelineEl.appendChild(li);
    });

    var filtered = terms.length || activeDecade;
    statusEl.textContent = filtered
      ? "Showing " + list.length + " of " + entries.length + " events"
      : entries.length + " events";
  }

  function buildDecadeFilters() {
    var decades = [];
    entries.forEach(function (item) {
      if (decades.indexOf(item.decade) === -1) decades.push(item.decade);
    });

    decades.forEach(function (decade) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = decade;
      btn.dataset.decade = decade;
      btn.setAttribute("aria-pressed", String(decade === activeDecade));
      btn.addEventListener("click", function () {
        activeDecade = activeDecade === decade ? null : decade;
        updateDecadeButtons();
        update();
      });
      decadesEl.appendChild(btn);
    });
  }

  function updateDecadeButtons() {
    Array.prototype.forEach.call(decadesEl.children, function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.decade === activeDecade));
    });
  }

  // Keep the search in the URL so a filtered view can be bookmarked or shared.
  function syncUrl() {
    var params = new URLSearchParams();
    if (searchEl.value.trim()) params.set("q", searchEl.value.trim());
    if (activeDecade) params.set("decade", activeDecade);
    var qs = params.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  function update() {
    render();
    syncUrl();
  }

  function readUrl() {
    var params = new URLSearchParams(location.search);
    searchEl.value = params.get("q") || "";
    activeDecade = params.get("decade") || null;
  }

  searchEl.addEventListener("input", update);

  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== searchEl) {
      e.preventDefault();
      searchEl.focus();
    } else if (e.key === "Escape" && document.activeElement === searchEl) {
      searchEl.value = "";
      update();
    }
  });

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      entries = data
        .map(function (item) {
          item._search = normalize(item.year + " " + item.decade + " " + item.event);
          return item;
        })
        .sort(function (a, b) { return a.year - b.year; });

      readUrl();
      buildDecadeFilters();
      render();
    })
    .catch(function (err) {
      statusEl.textContent = "Could not load the timeline data (" + err.message + ").";
    });
})();
