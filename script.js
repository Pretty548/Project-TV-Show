function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const n = String(number).padStart(2, "0");
  return `S${s}E${n}`;
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

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    card.innerHTML = `
      <h3>${episode.name} (${formatEpisodeCode(
        episode.season,
        episode.number,
      )})</h3>
      <img src="${episode.image?.medium || ""}" alt="${episode.name}">
      <p>${episode.summary || "No summary available"}</p>
    `;

    rootElem.appendChild(card);
  });
}

function setup() {
  const allEpisodes = getAllEpisodes();

  // 🔍 Search functionality
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

  // Initial load
  makePageForEpisodes(allEpisodes);
}

window.onload = setup;
