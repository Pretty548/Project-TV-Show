function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const n = String(number).padStart(2, "0");
  return `S${s}E${n}`;
}

function createEpisodeCard(episode) {
  let cardDiv = document.createElement("div");
  cardDiv.className = "episode-card";

  let title = document.createElement("h3");
  let episodeCode = formatEpisodeCode(episode.season, episode.number);
  title.innerText = episode.name + " - " + episodeCode;

  let image = document.createElement("img");
  image.src = episode.image.medium;

  let summary = document.createElement("div");
  summary.innerHTML = episode.summary;

  cardDiv.appendChild(title);
  cardDiv.appendChild(image);
  cardDiv.appendChild(summary);

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

  const episodeCard = episodeList.map(createEpisodeCard);
  episodeCard.forEach((card) => rootElem.appendChild(card));
}

function setup() {
  const allEpisodes = getAllEpisodes();

  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchText) ||
        episode.summary.toLowerCase().includes(searchText)
      );
    });

    makePageForEpisodes(filteredEpisodes);
  });

  makePageForEpisodes(allEpisodes);
}

window.onload = setup;
