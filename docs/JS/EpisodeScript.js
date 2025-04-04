document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const folderId = params.get("id"); // ID du dossier de l'œuvre
    const videoCode = params.get("video");
    const rawTitle = params.get("title");

    const prevBtn = document.getElementById("prev-episode-btn");
    const nextBtn = document.getElementById("next-episode-btn");
    const episodesSelect = document.getElementById("episodes-select");
    const iframeElement = document.querySelector(".video-player iframe");
    const seasonTextElement = document.querySelector(".season-text");
    const episodeTextElement = document.querySelector(".episode-text");
    const oeuvreTitleElement = document.querySelector(".oeuvre-title");

    let episodes = []; // Liste des épisodes
    let currentEpisodeIndex = -1; // Index de l'épisode actuel

    // Fonction pour charger les épisodes
    const loadEpisodes = async () => {
        try {
            console.log("folderId:", folderId); // Vérifiez que folderId est correct

            const response = await fetch(`https://darkibox.com/api/folder/list?key=141449uijs7m0mqo4w1opg&fld_id=${folderId}&files=1`);
            const data = await response.json();

            console.log("Réponse de l'API :", data); // Vérifiez le contenu de la réponse

            if (data.status === 200 && data.result?.folders?.length > 0) {
                const seasonFolders = data.result.folders;

                // Charger les épisodes de chaque saison
                episodes = [];
                for (const season of seasonFolders) {
                    const seasonResponse = await fetch(`https://darkibox.com/api/folder/list?key=141449uijs7m0mqo4w1opg&fld_id=${season.fld_id}&files=1`);
                    const seasonData = await seasonResponse.json();

                    if (seasonData.status === 200 && seasonData.result?.files?.length > 0) {
                        episodes.push(...seasonData.result.files);
                    }
                }

                // Trier les épisodes par titre
                episodes.sort((a, b) => a.title.localeCompare(b.title));

                if (episodes.length > 0) {
                    populateEpisodes();
                } else {
                    console.error("Aucun épisode trouvé après le chargement des saisons.");
                    episodesSelect.innerHTML = `<option>Aucun épisode trouvé</option>`;
                }
            } else {
                console.error("Erreur API ou aucun dossier de saison trouvé :", data);
                episodesSelect.innerHTML = `<option>Aucune saison trouvée</option>`;
            }
        } catch (error) {
            console.error("Erreur lors du chargement des épisodes :", error);
            episodesSelect.innerHTML = `<option>Erreur de chargement</option>`;
        }
    };

    // Fonction pour remplir le sélecteur d'épisodes
    const populateEpisodes = () => {
        episodesSelect.innerHTML = "";
        episodes.forEach((episode, index) => {
            const option = document.createElement("option");
            option.value = index;

            // Extraire le numéro de l'épisode depuis le titre
            const match = episode.title.match(/S\d{2}E(\d{2})/i); // Rechercher le format SXXEXX
            const episodeNumber = match ? parseInt(match[1], 10) : null;

            // Afficher "Épisode X" ou le titre brut si aucune correspondance n'est trouvée
            option.textContent = episodeNumber ? `Épisode ${episodeNumber}` : episode.title;
            episodesSelect.appendChild(option);
        });

        // Définir l'épisode actuel
        currentEpisodeIndex = episodes.findIndex(ep => ep.file_code === videoCode);
        if (currentEpisodeIndex === -1) currentEpisodeIndex = 0; // Par défaut, premier épisode
        episodesSelect.selectedIndex = currentEpisodeIndex;

        updateEpisode();
        updateNavigationButtons();
    };

    // Fonction pour mettre à jour l'épisode
    const updateEpisode = () => {
        const episode = episodes[currentEpisodeIndex];
        iframeElement.src = `https://darkibox.com/embed-${episode.file_code}.html`;

        // Extraire les informations de la saison et de l'épisode
        const match = episode.title.match(/S(\d{2})E(\d{2})/i);
        if (match) {
            const seasonNumber = parseInt(match[1], 10);
            const episodeNumber = parseInt(match[2], 10);
            seasonTextElement.textContent = `Saison ${seasonNumber} /`;
            episodeTextElement.textContent = `Épisode ${episodeNumber}`;
        } else {
            seasonTextElement.textContent = "Saison ?";
            episodeTextElement.textContent = "Épisode ?";
        }

        // Mettre à jour l'URL avec le nouveau code vidéo
        const newUrl = `Episode.html?title=${encodeURIComponent(rawTitle)}&video=${episode.file_code}&id=${folderId}`;
        window.history.replaceState(null, "", newUrl);
    };

    // Fonction pour mettre à jour l'état des boutons de navigation
    const updateNavigationButtons = () => {
        prevBtn.disabled = currentEpisodeIndex === 0;
        nextBtn.disabled = currentEpisodeIndex === episodes.length - 1;

        prevBtn.classList.toggle("disabled", currentEpisodeIndex === 0);
        nextBtn.classList.toggle("disabled", currentEpisodeIndex === episodes.length - 1);
    };

    // Gestion des événements pour les boutons "Précédent" et "Suivant"
    prevBtn.addEventListener("click", () => {
        if (currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            episodesSelect.selectedIndex = currentEpisodeIndex;
            updateEpisode();
            updateNavigationButtons();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentEpisodeIndex < episodes.length - 1) {
            currentEpisodeIndex++;
            episodesSelect.selectedIndex = currentEpisodeIndex;
            updateEpisode();
            updateNavigationButtons();
        }
    });

    // Gestion de l'événement "change" pour le sélecteur d'épisodes
    episodesSelect.addEventListener("change", () => {
        currentEpisodeIndex = parseInt(episodesSelect.value, 10);
        updateEpisode();
        updateNavigationButtons();
    });

    // Charger les épisodes au démarrage
    loadEpisodes();

    // Mettre à jour le titre de l'œuvre
    if (rawTitle) {
        oeuvreTitleElement.textContent = rawTitle.replace(/([a-z])([A-Z])/g, "$1 $2");
        oeuvreTitleElement.addEventListener("click", () => {
            window.location.href = `Oeuvre.html?title=${encodeURIComponent(rawTitle)}&id=${folderId}`;
        });
    }
});