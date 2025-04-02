document.addEventListener("DOMContentLoaded", () => {
    const jsonFilePath = "JSON/oeuvres.json";
    const oeuvreList = document.querySelector(".oeuvre-list");

    fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement du fichier JSON : ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            data.oeuvres.forEach(oeuvre => {
                // Crée une nouvelle carte
                const oeuvreCard = document.createElement("div");
                oeuvreCard.classList.add("oeuvre-card");

                // Ajoute le titre de l'œuvre
                const oeuvreName = document.createElement("p");
                oeuvreName.classList.add("oeuvre-name");
                oeuvreName.textContent = oeuvre.title;

                // Ajoute un gestionnaire d'événements pour rediriger
                oeuvreCard.addEventListener("click", () => {
                    const oeuvreTitle = oeuvre.title.replace(/\s+/g, ""); // Supprime les espaces
                    window.location.href = `oeuvre.html?title=${encodeURIComponent(oeuvreTitle)}`;
                });

                // Ajoute le titre à la carte et la carte à la liste
                oeuvreCard.appendChild(oeuvreName);
                oeuvreList.appendChild(oeuvreCard);
            });
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
});