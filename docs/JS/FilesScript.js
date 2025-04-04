document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "141449uijs7m0mqo4w1opg";
    const folderListUrl = `https://darkibox.com/api/folder/list?key=${apiKey}&files=1`;
    const filePanel = document.getElementById("files-panel");
    const folderTreeList = document.getElementById("folder-tree-list");
    const breadcrumb = document.getElementById("breadcrumb");

    let currentFolderId = ""; // ID du dossier actuel
    let breadcrumbTrail = []; // Historique des dossiers pour le breadcrumb

    // Fonction pour charger les fichiers et dossiers
    async function loadFolder(folderId = "") {
        try {
            const response = await fetch(`${folderListUrl}&fld_id=${folderId}`);
            if (!response.ok) throw new Error("Erreur lors du chargement des dossiers");

            const data = await response.json();
            if (data.status === 200 && data.result) {
                displayFilesAndFolders(data.result.files, data.result.folders);
                updateBreadcrumb(folderId);
            } else {
                filePanel.innerHTML = `<p class="empty-message">Vide</p>`;
            }
        } catch (error) {
            console.error(error);
            filePanel.innerHTML = `<p class="empty-message">Erreur : ${error.message}</p>`;
        }
    }

    // Fonction pour afficher les fichiers et dossiers
    function displayFilesAndFolders(files, folders) {
        filePanel.innerHTML = "";

        folders.forEach(folder => {
            const folderItem = document.createElement("div");
            folderItem.classList.add("folder-item");
            folderItem.textContent = folder.name;

            folderItem.addEventListener("click", () => {
                breadcrumbTrail.push({ id: folder.fld_id, name: folder.name });
                loadFolder(folder.fld_id);
            });

            filePanel.appendChild(folderItem);
        });

        files.forEach(file => {
            const fileItem = document.createElement("div");
            fileItem.classList.add("file-item");
            fileItem.textContent = file.title;

            filePanel.appendChild(fileItem);
        });

        if (files.length === 0 && folders.length === 0) {
            filePanel.innerHTML = `<p class="empty-message">Vide</p>`;
        }
    }

    // Fonction pour mettre à jour la file d'Ariane
    function updateBreadcrumb(folderId) {
        breadcrumb.innerHTML = ""; // Réinitialise le breadcrumb

        // Ajoute la racine
        const root = document.createElement("span");
        root.textContent = "...";
        root.dataset.folderId = "";
        root.addEventListener("click", () => {
            breadcrumbTrail = [];
            loadFolder("");
        });
        breadcrumb.appendChild(root);

        // Ajoute les dossiers dans le breadcrumb
        breadcrumbTrail.forEach((crumb, index) => {
            const separator = document.createTextNode(" > ");
            breadcrumb.appendChild(separator);

            const crumbElement = document.createElement("span");
            crumbElement.textContent = crumb.name;
            crumbElement.dataset.folderId = crumb.id;
            crumbElement.addEventListener("click", () => {
                breadcrumbTrail = breadcrumbTrail.slice(0, index + 1);
                loadFolder(crumb.id);
            });
            breadcrumb.appendChild(crumbElement);
        });
    }

    // Fonction pour charger la hiérarchie des dossiers
    async function fetchFolderHierarchy(folderId = "") {
        try {
            const response = await fetch(`${folderListUrl}&fld_id=${folderId}&files=0`); // Ne pas inclure les fichiers
            if (!response.ok) throw new Error("Erreur lors du chargement des dossiers");

            const data = await response.json();
            if (data.status === 200 && data.result) {
                const folders = data.result.folders;

                // Récupérer les sous-dossiers récursivement
                for (const folder of folders) {
                    folder.subfolders = await fetchFolderHierarchy(folder.fld_id);
                }

                return folders;
            } else {
                return [];
            }
        } catch (error) {
            console.error("Erreur lors du chargement de la hiérarchie :", error);
            return [];
        }
    }

    async function loadFolderTree() {
        try {
            folderTreeList.innerHTML = ""; // Réinitialise la liste

            // Ajouter la racine "..."
            const rootLi = document.createElement("li");
            rootLi.textContent = "...";
            rootLi.style.fontWeight = "bold";
            rootLi.addEventListener("click", () => loadFolder(""));
            folderTreeList.appendChild(rootLi);

            // Charger la hiérarchie complète des dossiers
            const folders = await fetchFolderHierarchy();
            displayFolderTree(folders, folderTreeList);
        } catch (error) {
            console.error(error);
            folderTreeList.innerHTML = `<li>Erreur : ${error.message}</li>`;
        }
    }

    // Fonction pour afficher la hiérarchie des dossiers
    function displayFolderTree(folders, parentElement = folderTreeList, level = 0, isLast = false) {
        folders.forEach((folder, index) => {
            const li = document.createElement("li");

            // Déterminer le préfixe pour la hiérarchie
            const isLastFolder = index === folders.length - 1;
            const prefix = folder.subfolders && folder.subfolders.length > 0 ? "▾ " : "   ";

            li.textContent = `${prefix}${folder.name}`;

            // Ajouter un événement pour charger le dossier au clic
            li.addEventListener("click", (e) => {
                e.stopPropagation(); // Empêche la propagation du clic
                loadFolder(folder.fld_id);
            });

            parentElement.appendChild(li);

            // Si le dossier a des sous-dossiers, les afficher récursivement
            if (folder.subfolders && folder.subfolders.length > 0) {
                const subList = document.createElement("ul");
                parentElement.appendChild(subList);
                displayFolderTree(folder.subfolders, subList, level + 1, isLastFolder);
            }
        });
    }

    // Charger les dossiers et fichiers au démarrage
    loadFolder();
    loadFolderTree();
});