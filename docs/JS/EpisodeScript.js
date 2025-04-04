document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const rawTitle = params.get("title");
    const videoCode = params.get("video");

    if (rawTitle && videoCode) {
        // Remettre les espaces dans le titre
        const title = rawTitle.replace(/([a-z])([A-Z])/g, "$1 $2");

        // Met à jour le titre de la page
        document.title = `${title} | QuoicouStream`;

        // Met à jour les informations dans la page
        const oeuvreTitleElement = document.querySelector(".oeuvre-title");
        oeuvreTitleElement.textContent = title;
        document.querySelector("iframe").src = `https://darkibox.com/embed-${videoCode}.html`;

        // Charger les informations du fichier via l'API File Info
        fetch(`https://darkibox.com/api/file/info?key=141449uijs7m0mqo4w1opg&file_code=${videoCode}`)
            .then(response => response.json())
            .then(data => {
                if (data.result?.length > 0) {
                    const fileInfo = data.result[0];
                    const folderId = fileInfo.fld_id; // Récupérer l'ID du dossier

                    if (folderId) {
                        // Ajouter un événement click pour rediriger vers oeuvre.html
                        oeuvreTitleElement.addEventListener("click", () => {
                            window.location.href = `Oeuvre.html?title=${encodeURIComponent(rawTitle)}&id=${folderId}`;
                        });
                    } else {
                        console.error("Erreur : L'ID du dossier (fld_id) est introuvable dans la réponse de l'API.");
                    }
                } else {
                    console.error("Erreur : Aucune donnée trouvée dans la réponse de l'API File Info.");
                }
            })
            .catch(error => {
                console.error("Erreur lors de la requête API File Info :", error);
            });
    } else {
        console.error("Paramètres manquants dans l'URL");
    }
});