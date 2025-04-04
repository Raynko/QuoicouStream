document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const rawTitle = params.get("title");
    const videoCode = params.get("video");
    const folderId = params.get("id"); // Récupérer l'ID du dossier

    // Sélection des éléments HTML pour la saison, l'épisode et l'iframe
    const seasonTextElement = document.querySelector(".season-text");
    const episodeTextElement = document.querySelector(".episode-text");
    const oeuvreTitleElement = document.querySelector(".oeuvre-title");
    const iframeElement = document.querySelector(".video-player iframe");

    // Fonction pour ajouter des espaces dans le titre brut
    const formatTitle = (title) => {
        return title.replace(/([a-z])([A-Z])/g, "$1 $2");
    };

    // Vérifier si le titre brut est disponible
    if (rawTitle) {
        const formattedTitle = formatTitle(rawTitle); // Ajouter des espaces dans le titre

        // Mettre à jour le titre de l'œuvre
        oeuvreTitleElement.textContent = formattedTitle;

        // Mettre à jour le titre de la page
        document.title = `${formattedTitle} | QuoicouStream`;

        // Rendre le titre cliquable pour rediriger vers Oeuvre.html
        oeuvreTitleElement.addEventListener("click", () => {
            window.location.href = `Oeuvre.html?title=${encodeURIComponent(rawTitle)}&id=${folderId}`;
        });
    }

    if (videoCode) {
        // Mettre à jour la source de l'iframe avec le videoCode
        iframeElement.src = `https://darkibox.com/embed-${videoCode}.html`;

        // Effectuer une requête à l'API File Info pour récupérer le file_title
        fetch(`https://darkibox.com/api/file/info?key=141449uijs7m0mqo4w1opg&file_code=${videoCode}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 200 && data.result?.length > 0) {
                    const fileTitle = data.result[0].file_title; // Récupérer le titre du fichier
                    console.log(`Titre du fichier récupéré : ${fileTitle}`);

                    // Extraire les informations de la saison et de l'épisode depuis file_title
                    const match = fileTitle.match(/S(\d{2})E(\d{2})/i); // Rechercher le format SXXEXX

                    if (match) {
                        const seasonNumber = parseInt(match[1], 10); // Extraire le numéro de la saison
                        const episodeNumber = parseInt(match[2], 10); // Extraire le numéro de l'épisode

                        // Mettre à jour les textes de la saison et de l'épisode
                        seasonTextElement.textContent = `Saison ${seasonNumber} /`;
                        episodeTextElement.textContent = `Épisode ${episodeNumber}`;
                    } else {
                        // Si aucune information n'est trouvée, afficher des valeurs par défaut
                        seasonTextElement.textContent = `Saison 0 /`;
                        episodeTextElement.textContent = `Épisode 0`;
                    }
                } else {
                    console.error("Erreur lors de la récupération des informations du fichier.");
                    seasonTextElement.textContent = `Saison 0 /`;
                    episodeTextElement.textContent = `Épisode 0`;
                }
            })
            .catch(error => {
                console.error("Erreur lors de la requête API :", error);
                seasonTextElement.textContent = `Saison 0 /`;
                episodeTextElement.textContent = `Épisode 0`;
            });
    } else {
        console.error("Paramètre videoCode manquant dans l'URL.");
        seasonTextElement.textContent = `Saison 0 /`;
        episodeTextElement.textContent = `Épisode 0`;
    }
});