let currentEpisodes = [];

function showLoadingMessage() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes...</p>";
}

function showErrorMessage(message) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
}

function formatEpisodeTitle(name, season, number) {
  const s = String(season).padStart(2, "0");
  const n = String(number).padStart(2, "0");
  return `${name} - S${s}E${n}`;
}

function createEpisodeCard(episode) {
  let cardDiv = document.createElement("div");
  cardDiv.className = "episode-card";

  let title = document.createElement("h3");
  title.innerText = formatEpisodeTitle(
    episode.name,
    episode.season,
    episode.number,
  );

  let image = document.createElement("img");
  if (episode.image && episode.image.medium) {
    image.src = episode.image.medium;
  } else {
    image.src = "https://via.placeholder.com/250x140?text=No+Image";
  }

  let summary = document.createElement("div");
  summary.innerHTML = episode.summary || "<p>No summary available.</p>";

  cardDiv.append(title, image, summary);
  return cardDiv;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const count = document.createElement("p");
  count.className = "count";
  count.textContent = `Displaying ${episodeList.length} episode(s)`;
  rootElem.appendChild(count);

  if (episodeList.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No episodes found 💔";
    message.style.textAlign = "center";
    rootElem.appendChild(message);
    return;
  }

  const episodeCards = episodeList.map(createEpisodeCard);
  episodeCards.forEach((card) => rootElem.appendChild(card));
}

function setupShowSelect(shows) {
  const showSelect = document.getElementById("showSelect");
  showSelect.innerHTML = "";

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.innerText = show.name;
    showSelect.appendChild(option);
  });

  showSelect.onchange = async (event) => {
    const selectedShowId = event.target.value;

    showLoadingMessage();
    currentEpisodes = await fetchEpisodes(selectedShowId);

    document.getElementById("searchInput").value = "";

    setupEpisodeSelect(currentEpisodes);
    makePageForEpisodes(currentEpisodes);
  };
}

function setupEpisodeSelect(episodes) {
  const episodeSelect = document.getElementById("episodeSelect");
  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.innerText = "Show All Episodes";
  episodeSelect.appendChild(defaultOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;

    option.innerText = formatEpisodeTitle(
      episode.name,
      episode.season,
      episode.number,
    );

    episodeSelect.appendChild(option);
  });

  episodeSelect.onchange = (event) => {
    const selectedId = event.target.value;

    if (selectedId === "all") {
      makePageForEpisodes(episodes);
    } else {
      const singleEpisode = episodes.filter((episode) => {
        return String(episode.id) === selectedId;
      });
      makePageForEpisodes(singleEpisode);
    }

    document.getElementById("searchInput").value = "";
  };
}

async function fetchShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const shows = await response.json();
    shows.sort((a, b) => a.name.localeCompare(b.name));

    return shows;
  } catch (error) {
    showErrorMessage("Failed to load shows. Please try again later.");
    return [];
  }
}

async function fetchEpisodes(showId) {
  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const episodes = await response.json();
    return episodes;
  } catch (error) {
    showErrorMessage("Failed to load episodes. Please try again later.");
    return [];
  }
}

async function setup() {
  showLoadingMessage();

  const allShows = await fetchShows();
  setupShowSelect(allShows);

  const initialShowId = allShows.length > 0 ? allShows[0].id : 82;

  currentEpisodes = await fetchEpisodes(initialShowId);

  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase();

    const filteredEpisodes = currentEpisodes.filter((episode) => {
      const name = episode.name ? episode.name.toLowerCase() : "";
      const summary = episode.summary ? episode.summary.toLowerCase() : "";

      return name.includes(searchText) || summary.includes(searchText);
    });

    makePageForEpisodes(filteredEpisodes);

    const episodeSelect = document.getElementById("episodeSelect");
    if (episodeSelect) {
      episodeSelect.value = "all";
    }
  });

  setupEpisodeSelect(currentEpisodes);
  makePageForEpisodes(currentEpisodes);
}

window.onload = setup;
