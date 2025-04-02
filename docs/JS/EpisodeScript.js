document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title");
    const saison = params.get("saison");
    const episode = params.get("episode");
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
    } else {
        console.error("Paramètres manquants dans l'URL");
    }
});