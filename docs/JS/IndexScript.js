document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "141449uijs7m0mqo4w1opg";
    const folderListUrl = `https://darkibox.com/api/folder/list?key=${apiKey}&files=0`;

    const loadFolders = (folderId, targetList) => {
        targetList.innerHTML = `<p class="loading-message">Chargement...</p>`;
        fetch(`${folderListUrl}&fld_id=${folderId}`)
            .then(response => response.json())
            .then(data => {
                targetList.innerHTML = data.result?.folders?.length
                    ? data.result.folders.map(folder => `
                        <div class="oeuvre-card-item" onclick="window.location.href='Oeuvre.html?title=${encodeURIComponent(folder.name.replace(/\s+/g, ""))}&id=${folder.fld_id}'">
                            <p class="oeuvre-name">${folder.name}</p>
                        </div>
                    `).join("")
                    : `<p class="empty-message">Aucun élément trouvé.</p>`;
            })
            .catch(() => {
                targetList.innerHTML = `<p class="empty-message">Erreur de chargement.</p>`;
            });
    };

    loadFolders(68894, document.querySelector("#animes-container .oeuvre-list")); // Animes
    loadFolders(68897, document.querySelector("#series-container .oeuvre-list")); // Séries
});