function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

let allEpisodes = [];
let showsCache = {};
let episodesCache = {};

function showError(message) {
  document.getElementById("root").innerHTML = `<p>${message}</p>`;
}

/* ---------- COVER PAGE ---------- */

function makePageForShows(showList) {
  const showsRoot = document.getElementById("showsRoot");

  showsRoot.innerHTML = "";

  showList.forEach((show) => {
    const card = document.createElement("div");

    card.className = "episode-card";

    card.innerHTML = `
      <h3 class="show-link" data-id="${show.id}">
        ${show.name}
      </h3>

      <img
       src="${show.image?.medium || ""}"
       alt="${show.name}"
      >
    `;

    showsRoot.appendChild(card);
  });

  document.querySelectorAll(".show-link").forEach((link) => {
    link.addEventListener("click", function () {
      loadEpisodes(this.dataset.id);
    });
  });
}

/* ---------- SHOW DETAILS ---------- */

function showSelectedShowDetails(showId) {
  const show = showsCache.shows.find((s) => s.id == showId);

  const details = document.getElementById("showDetails");

  details.style.display = "block";

  details.innerHTML = `

   <div class="episode-card">

    <h2>
      ${show.name}
    </h2>

    <img
      src="${show.image?.medium || ""}"
    >

    <p>
      ${show.summary || ""}
    </p>

    <p>
      Genres:
      ${show.genres.join(", ")}
    </p>

    <p>
      Status:
      ${show.status}
    </p>

    <p>
      Rating:
      ${show.rating?.average}
    </p>

    <p>
      Runtime:
      ${show.runtime} mins
    </p>

   </div>

  `;
}

/* ---------- EPISODES ---------- */

function makePageForEpisodes(episodeList) {
  const root = document.getElementById("root");

  root.innerHTML = "";

  const count = document.createElement("p");

  count.className = "count";

  count.textContent = `Displaying ${episodeList.length} episode(s)`;

  root.appendChild(count);

  episodeList.forEach((ep) => {
    const card = document.createElement("div");

    card.className = "episode-card";

    card.innerHTML = `

<h3>

${ep.name}

(${formatEpisodeCode(ep.season, ep.number)})

</h3>

${ep.image?.medium ? `<img src="${ep.image.medium}">` : ""}

<div>
${ep.summary || ""}
</div>

`;

    root.appendChild(card);
  });
}

function populateEpisodeSelector() {
  const selector = document.getElementById("episodeSelect");

  selector.innerHTML = `<option value="">
All Episodes
</option>`;

  allEpisodes.forEach((ep) => {
    const option = document.createElement("option");

    option.value = ep.id;

    option.textContent = `${formatEpisodeCode(
      ep.season,
      ep.number,
    )} - ${ep.name}`;

    selector.appendChild(option);
  });
}

/* ---------- FETCH SHOWS ---------- */

async function loadShows() {
  if (showsCache.shows) {
    makePageForShows(showsCache.shows);

    populateShowSelector(showsCache.shows);

    return;
  }

  const response = await fetch("https://api.tvmaze.com/shows");

  const shows = await response.json();

  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    }),
  );

  showsCache.shows = shows;

  makePageForShows(shows);

  populateShowSelector(shows);
}

function populateShowSelector(shows) {
  const selector = document.getElementById("showSelect");

  selector.innerHTML = '<option value="">Select a show</option>';

  shows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;

    option.textContent = show.name;

    selector.appendChild(option);
  });
}

document.getElementById("showSelect").addEventListener("change", function (e) {
  if (!e.target.value) return;

  loadEpisodes(e.target.value);
});
/* ---------- FETCH EPISODES ---------- */

async function loadEpisodes(showId) {
  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
  } else {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    allEpisodes = await response.json();

    episodesCache[showId] = allEpisodes;
  }

  showSelectedShowDetails(showId);

  populateEpisodeSelector();

  makePageForEpisodes(allEpisodes);

  document.getElementById("showsRoot").style.display = "none";

  document.getElementById("root").style.display = "grid";

  document.getElementById("backToShows").style.display = "inline-block";
}

/* ---------- EVENTS ---------- */

document.getElementById("backToShows").addEventListener("click", function (e) {
  e.preventDefault();

  document.getElementById("showsRoot").style.display = "grid";

  document.getElementById("root").style.display = "none";

  document.getElementById("showDetails").style.display = "none";

  this.style.display = "none";
});

document
  .getElementById("episodeSelect")
  .addEventListener("change", function (e) {
    if (!e.target.value) {
      makePageForEpisodes(allEpisodes);

      return;
    }

    const selected = allEpisodes.filter((ep) => ep.id == e.target.value);

    makePageForEpisodes(selected);
  });

document.getElementById("searchInput").addEventListener("input", function (e) {
  const query = e.target.value.toLowerCase();

  if (document.getElementById("showsRoot").style.display !== "none") {
    const filteredShows = showsCache.shows.filter(
      (show) =>
        show.name.toLowerCase().includes(query) ||
        show.summary?.toLowerCase().includes(query) ||
        show.genres.join(" ").toLowerCase().includes(query),
    );

    makePageForShows(filteredShows);

    return;
  }

  const filteredEpisodes = allEpisodes.filter(
    (ep) =>
      ep.name.toLowerCase().includes(query) ||
      ep.summary?.toLowerCase().includes(query),
  );

  makePageForEpisodes(filteredEpisodes);
});

/* ---------- START ---------- */

window.onload = loadShows;
