document.addEventListener("DOMContentLoaded", async () => {
    const apiKey = "141449uijs7m0mqo4w1opg";
    const fileCode = "tmefwr7bgyc4";
    const videoElement = document.querySelector("video");

    // Fonction pour récupérer le lien direct du fichier
    const fetchVideoUrl = async () => {
        try {
            const response = await fetch(`https://darkibox.com/api/file/direct_link?key=${apiKey}&file_code=${fileCode}&q=o`);
            const data = await response.json();

            if (data.status === 200 && data.result?.versions?.length > 0) {
                // Récupérer l'URL de la version originale
                const originalQuality = data.result.versions.find(version => version.name === "o");
                if (originalQuality) {
                    videoElement.src = originalQuality.url; // Définir la source de la vidéo
                } else {
                    console.error("Qualité originale non trouvée.");
                }
            } else {
                console.error("Erreur API ou aucune version disponible :", data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du lien vidéo :", error);
        }
    };

    // Charger la vidéo
    await fetchVideoUrl();
});