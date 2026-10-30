(function () {
  "use strict";

  var DATA_URL = "writing_studies_timeline.json";

  var timelineEl = document.getElementById("timeline");
  var statusEl = document.getElementById("status");

  var entries = [];

  function render(list) {
    timelineEl.textContent = "";

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
      year.textContent = item.year;

      var event = document.createElement("p");
      event.className = "entry-event";
      event.textContent = item.event;

      li.appendChild(year);
      li.appendChild(event);
      timelineEl.appendChild(li);
    });

    statusEl.textContent = list.length + " events";
  }

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      entries = data.slice().sort(function (a, b) { return a.year - b.year; });
      render(entries);
    })
    .catch(function (err) {
      statusEl.textContent = "Could not load the timeline data (" + err.message + ").";
    });
})();
