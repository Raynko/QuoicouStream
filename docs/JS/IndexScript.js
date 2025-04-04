document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "141449uijs7m0mqo4w1opg";
    const folderListUrl = `https://darkibox.com/api/folder/list?key=${apiKey}&files=0`;

    const animesList = document.querySelector("#animes-container .oeuvre-list");
    const seriesList = document.querySelector("#series-container .oeuvre-list");

    const showLoading = (targetList) => {
        targetList.innerHTML = `<p class="loading-message">Chargement...</p>`;
    };

    const loadFolders = (folderId, targetList) => {
        showLoading(targetList);

        fetch(`${folderListUrl}&fld_id=${folderId}`)
            .then(response => response.json())
            .then(data => {
                if (data.result?.folders?.length > 0) {
                    targetList.innerHTML = "";
                    data.result.folders.forEach(folder => {
                        const oeuvreCardItem = document.createElement("div");
                        oeuvreCardItem.classList.add("oeuvre-card-item");

                        const oeuvreName = document.createElement("p");
                        oeuvreName.classList.add("oeuvre-name");
                        oeuvreName.textContent = folder.name;

                        oeuvreCardItem.addEventListener("click", () => {
                            const formattedTitle = folder.name.replace(/\s+/g, "");
                            window.location.href = `Oeuvre.html?title=${encodeURIComponent(formattedTitle)}&id=${folder.fld_id}`;
                        });

                        oeuvreCardItem.appendChild(oeuvreName);
                        targetList.appendChild(oeuvreCardItem);
                    });
                } else {
                    targetList.innerHTML = `<p class="empty-message">Aucun élément trouvé.</p>`;
                }
            })
            .catch(error => {
                console.error("Erreur :", error);
                targetList.innerHTML = `<p class="empty-message">Erreur : ${error.message}</p>`;
            });
    };

    loadFolders(68894, animesList); // Animes
    loadFolders(68897, seriesList); // Séries
});