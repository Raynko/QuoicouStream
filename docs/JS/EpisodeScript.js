document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title");
    const saison = parseInt(params.get("saison"), 10);
    const episode = parseInt(params.get("episode"), 10);
    const video = params.get("video");

    if (title && saison && episode && video) {
        // Formate le titre pour ajouter des espaces avant les majuscules
        const formattedTitle = title.replace(/([A-Z])/g, " $1").trim();

        // Met à jour le titre de la page
        document.title = `${formattedTitle} | QuoicouStream`;

        // Met à jour les informations dans la page
        document.querySelector(".oeuvre-title").textContent = formattedTitle;
        document.querySelector(".season").textContent = `Saison ${saison} /`;
        document.querySelector(".episode").textContent = `Episode ${episode}`;
        document.querySelector("iframe").src = `https://darkibox.com/embed-${video}.html`;

        // Charger les données JSON pour gérer les épisodes
        fetch("JSON/oeuvres.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur lors du chargement du fichier JSON : ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const oeuvre = data.oeuvres.find(o => o.title.replace(/\s+/g, "") === title);
                if (oeuvre) {
                    const currentSeason = oeuvre.saisons.find(s => s.saison === saison);
                    if (currentSeason) {
                        const episodes = currentSeason.episodes;

                        // Remplir le bouton <select> avec les épisodes
                        const episodeSelect = document.getElementById("episodes-select");
                        episodes.forEach(ep => {
                            const option = document.createElement("option");
                            option.value = ep.episode;
                            option.textContent = `Episode ${ep.episode}`;
                            if (ep.episode === episode) {
                                option.selected = true; // Sélectionne l'épisode actuel par défaut
                            }
                            episodeSelect.appendChild(option);
                        });

                        // Gérer le changement d'épisode via le <select>
                        episodeSelect.addEventListener("change", (event) => {
                            const selectedEpisode = parseInt(event.target.value, 10);
                            const selectedVideo = episodes.find(ep => ep.episode === selectedEpisode).lien_video;
                            window.location.href = `episode.html?title=${encodeURIComponent(title)}&saison=${saison}&episode=${selectedEpisode}&video=${selectedVideo}`;
                        });

                        // Gérer les boutons "Précédent" et "Suivant"
                        const currentIndex = episodes.findIndex(e => e.episode === episode);
                        const prevEpisode = episodes[currentIndex - 1];
                        const nextEpisode = episodes[currentIndex + 1];

                        const prevBtn = document.getElementById("prev-btn");
                        if (prevEpisode) {
                            prevBtn.classList.remove("disabled");
                            prevBtn.addEventListener("click", () => {
                                window.location.href = `episode.html?title=${encodeURIComponent(title)}&saison=${saison}&episode=${prevEpisode.episode}&video=${prevEpisode.lien_video}`;
                            });
                        } else {
                            prevBtn.classList.add("disabled");
                            prevBtn.style.pointerEvents = "none";
                        }

                        const nextBtn = document.getElementById("next-btn");
                        if (nextEpisode) {
                            nextBtn.classList.remove("disabled");
                            nextBtn.addEventListener("click", () => {
                                window.location.href = `episode.html?title=${encodeURIComponent(title)}&saison=${saison}&episode=${nextEpisode.episode}&video=${nextEpisode.lien_video}`;
                            });
                        } else {
                            nextBtn.classList.add("disabled");
                            nextBtn.style.pointerEvents = "none";
                        }
                    }
                }
            })
            .catch(error => {
                console.error("Erreur :", error);
            });

        // Ajoute un gestionnaire de clic sur le titre pour revenir à la page de l'œuvre
        const oeuvreTitle = document.querySelector(".oeuvre-title");
        if (oeuvreTitle) {
            oeuvreTitle.addEventListener("click", () => {
                window.location.href = `oeuvre.html?title=${encodeURIComponent(title)}`;
            });
        }
    } else {
        console.error("Paramètres manquants dans l'URL");
    }

    // Gestion du bouton "Retour"
    const returnBtn = document.getElementById("return-btn");
    if (returnBtn) {
        returnBtn.addEventListener("click", () => {
            window.location.href = `oeuvre.html?title=${encodeURIComponent(title)}`;
        });
    }
});