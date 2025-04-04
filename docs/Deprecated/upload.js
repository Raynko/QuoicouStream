document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "141449uijs7m0mqo4w1opg"; // Votre clé API
    const folderApiUrl = `https://darkibox.com/api/folder/list?key=${apiKey}`;
    const uploadApiUrl = `https://darkibox.com/api/upload/url`;
    const accountInfoUrl = `https://darkibox.com/api/account/info?key=${apiKey}`;
    const urlUploadsApiUrl = `https://darkibox.com/api/file/url_uploads?key=${apiKey}`;

    const folderSelect = document.getElementById("folder-select");
    const uploadForm = document.getElementById("upload-form");
    const uploadStatus = document.getElementById("upload-status");
    const storageUsedElement = document.getElementById("storage-used");
    const uploadTableBody = document.querySelector("#upload-table tbody");

    // Fonction pour récupérer les informations de stockage
    async function fetchAccountInfo() {
        try {
            const response = await fetch(accountInfoUrl);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des informations du compte : ${response.statusText}`);
            }

            const data = await response.json();
            if (data.status === 200 && data.result) {
                const storageUsed = parseInt(data.result.storage_used || "0", 10);
                storageUsedElement.textContent = `${(storageUsed / 1e6).toFixed(2)} Mo`;
            } else {
                storageUsedElement.textContent = "Erreur";
            }
        } catch (error) {
            console.error("Erreur :", error);
            storageUsedElement.textContent = "Erreur";
        }
    }

    // Fonction pour récupérer les fichiers en cours d'upload
    async function fetchUploadsInProgress() {
        try {
            const response = await fetch(urlUploadsApiUrl);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des uploads en cours : ${response.statusText}`);
            }

            const data = await response.json();
            const uploadMessage = document.getElementById("upload-message");
            const uploadTable = document.getElementById("upload-table");

            if (data.status === 200 && data.result && data.result.length > 0) {
                uploadMessage.style.display = "none"; // Cache le message
                uploadTable.style.display = "table"; // Affiche le tableau
                displayUploadsInProgress(data.result);
            } else {
                uploadMessage.style.display = "block"; // Affiche le message
                uploadMessage.textContent = "Aucun fichier en cours";
                uploadTable.style.display = "none"; // Cache le tableau
            }
        } catch (error) {
            console.error("Erreur :", error);
            const uploadMessage = document.getElementById("upload-message");
            uploadMessage.style.display = "block";
            uploadMessage.textContent = `Erreur : ${error.message}`;
            const uploadTable = document.getElementById("upload-table");
            uploadTable.style.display = "none";
        }
    }

    // Fonction pour afficher les fichiers en cours d'upload
    function displayUploadsInProgress(uploads) {
        uploadTableBody.innerHTML = ""; // Vide le tableau

        uploads.forEach(upload => {
            const row = document.createElement("tr");

            const urlCell = document.createElement("td");
            urlCell.textContent = upload.remote_url;

            const statusCell = document.createElement("td");
            statusCell.textContent = upload.status;

            row.appendChild(urlCell);
            row.appendChild(statusCell);

            uploadTableBody.appendChild(row);
        });
    }

    // Fonction pour récupérer les dossiers et sous-dossiers
    async function fetchFolders(parentId = "") {
        try {
            const response = await fetch(`${folderApiUrl}&fld_id=${parentId}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des dossiers : ${response.statusText}`);
            }

            const data = await response.json();
            if (data.status === 200 && data.result && data.result.folders) {
                populateFolderSelect(data.result.folders, parentId ? "— " : "");
            } else if (!parentId) {
                folderSelect.innerHTML = "<option value=''>Aucun dossier trouvé</option>";
            }
        } catch (error) {
            console.error("Erreur :", error);
            folderSelect.innerHTML = `<option value=''>Erreur : ${error.message}</option>`;
        }
    }

    // Fonction pour remplir le menu déroulant des dossiers
    function populateFolderSelect(folders, prefix = "") {
        folders.forEach(folder => {
            const option = document.createElement("option");
            option.value = folder.fld_id;
            option.textContent = `${prefix}${folder.name}`;
            folderSelect.appendChild(option);

            // Charger les sous-dossiers de manière récursive
            if (folder.code) {
                fetchFolders(folder.fld_id);
            }
        });
    }

    // Fonction pour uploader un fichier
    async function uploadFile(url, folderId) {
        try {
            const uploadUrl = `${uploadApiUrl}?key=${apiKey}&url=${encodeURIComponent(url)}&fld_id=${folderId}&file_public=1&file_adult=0`;
            const response = await fetch(uploadUrl, { method: "GET" });

            if (!response.ok) {
                throw new Error(`Erreur lors de l'upload : ${response.statusText}`);
            }

            const data = await response.json();
            if (data.status === 200 && data.result && data.result.filecode) {
                uploadStatus.textContent = `Fichier uploadé avec succès ! Code du fichier : ${data.result.filecode}`;
            } else {
                uploadStatus.textContent = "Erreur lors de l'upload. Vérifiez les paramètres.";
            }

            // Mettre à jour les fichiers en cours d'upload
            fetchUploadsInProgress();
        } catch (error) {
            console.error("Erreur :", error);
            uploadStatus.textContent = `Erreur : ${error.message}`;
        }
    }

    // Gestion de la soumission du formulaire
    uploadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fileUrl = document.getElementById("file-url").value;
        const folderId = folderSelect.value;

        if (!fileUrl || !folderId) {
            uploadStatus.textContent = "Veuillez remplir tous les champs.";
            return;
        }

        uploadStatus.textContent = "Upload en cours...";
        uploadFile(fileUrl, folderId);
    });

    // Charger les dossiers, les informations de stockage et les fichiers en cours d'upload
    fetchAccountInfo();
    fetchFolders();
    fetchUploadsInProgress();
});