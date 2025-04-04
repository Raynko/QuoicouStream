document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const folderId = params.get("id");
    const videoCode = params.get("video");
    const rawTitle = params.get("title");

    const prevBtn = document.getElementById("prev-episode-btn");
    const nextBtn = document.getElementById("next-episode-btn");
    const episodesSelect = document.getElementById("episodes-select");
    const iframeElement = document.querySelector(".video-player iframe");
    const seasonTextElement = document.querySelector(".season-text");
    const episodeTextElement = document.querySelector(".episode-text");
    const oeuvreTitleElement = document.querySelector(".oeuvre-title");

    let episodes = [];
    let currentEpisodeIndex = -1;

    // Charge les épisodes depuis l'API
    const loadEpisodes = async () => {
        try {
            const response = await fetch(`https://darkibox.com/api/folder/list?key=141449uijs7m0mqo4w1opg&fld_id=${folderId}&files=1`);
            const data = await response.json();

            if (data.status === 200 && data.result?.folders?.length > 0) {
                episodes = await Promise.all(
                    data.result.folders.map(async (season) => {
                        const seasonResponse = await fetch(`https://darkibox.com/api/folder/list?key=141449uijs7m0mqo4w1opg&fld_id=${season.fld_id}&files=1`);
                        const seasonData = await seasonResponse.json();
                        return seasonData.status === 200 ? seasonData.result.files : [];
                    })
                ).then((allFiles) => allFiles.flat().sort((a, b) => a.title.localeCompare(b.title)));

                populateEpisodes();
            } else {
                episodesSelect.innerHTML = `<option>Aucune saison trouvée</option>`;
            }
        } catch {
            episodesSelect.innerHTML = `<option>Erreur de chargement</option>`;
        }
    };

    // Remplit le sélecteur d'épisodes
    const populateEpisodes = () => {
        episodesSelect.innerHTML = episodes
            .map((episode, index) => {
                const match = episode.title.match(/S\d{2}E(\d{2})/i);
                const episodeNumber = match ? `Épisode ${parseInt(match[1], 10)}` : episode.title;
                return `<option value="${index}">${episodeNumber}</option>`;
            })
            .join("");

        currentEpisodeIndex = episodes.findIndex((ep) => ep.file_code === videoCode) || 0;
        episodesSelect.selectedIndex = currentEpisodeIndex;
        updateUI();
    };

    // Met à jour l'interface utilisateur (vidéo, texte, boutons)
    const updateUI = () => {
        const episode = episodes[currentEpisodeIndex];
        iframeElement.src = `https://darkibox.com/embed-${episode.file_code}.html`;

        const match = episode.title.match(/S(\d{2})E(\d{2})/i);
        seasonTextElement.textContent = match ? `Saison ${parseInt(match[1], 10)} /` : "Saison ?";
        episodeTextElement.textContent = match ? `Épisode ${parseInt(match[2], 10)}` : "Épisode ?";

        window.history.replaceState(null, "", `Episode.html?title=${encodeURIComponent(rawTitle)}&video=${episode.file_code}&id=${folderId}`);

        // Met à jour l'état des boutons
        prevBtn.classList.toggle("disabled", currentEpisodeIndex === 0);
        prevBtn.disabled = currentEpisodeIndex === 0;
        nextBtn.classList.toggle("disabled", currentEpisodeIndex === episodes.length - 1);
        nextBtn.disabled = currentEpisodeIndex === episodes.length - 1;
    };

    // Gestion des événements pour les boutons et le sélecteur
    const changeEpisode = (direction) => {
        currentEpisodeIndex += direction;
        episodesSelect.selectedIndex = currentEpisodeIndex;
        updateUI();
    };

    prevBtn.addEventListener("click", () => currentEpisodeIndex > 0 && changeEpisode(-1));
    nextBtn.addEventListener("click", () => currentEpisodeIndex < episodes.length - 1 && changeEpisode(1));
    episodesSelect.addEventListener("change", () => {
        currentEpisodeIndex = parseInt(episodesSelect.value, 10);
        updateUI();
    });

    // Initialisation
    loadEpisodes();
    if (rawTitle) {
        const formattedTitle = rawTitle.replace(/([a-z])([A-Z])/g, "$1 $2");
        oeuvreTitleElement.textContent = formattedTitle;
        oeuvreTitleElement.addEventListener("click", () => {
            window.location.href = `Oeuvre.html?title=${encodeURIComponent(rawTitle)}&id=${folderId}`;
        });
        document.title = `${formattedTitle} | QuoicouStream`;
    }
});