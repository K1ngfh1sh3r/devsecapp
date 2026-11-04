const API_URL = "/api/vulnerabilities";

const severityLabels = {
    LOW: "Faible",
    MEDIUM: "Moyenne",
    HIGH: "Élevée",
    CRITICAL: "Critique"
};

const statusLabels = {
    OPEN: "Ouverte",
    IN_PROGRESS: "En cours",
    RESOLVED: "Résolue"
};

const severityClasses = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
};

const statusClasses = {
    OPEN: "open",
    IN_PROGRESS: "in-progress",
    RESOLVED: "resolved"
};

// Données chargées depuis l'API
let allVulnerabilities = [];
let editingVulnerabilityId = null;

// --------------------------------------------------
// UTILITAIRES
// --------------------------------------------------

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// --------------------------------------------------
// STATISTIQUES
// --------------------------------------------------

function renderStatistics(vulnerabilities) {
    const total = vulnerabilities.length;

    const critical = vulnerabilities.filter(
        item => item.severity === "CRITICAL"
    ).length;

    const inProgress = vulnerabilities.filter(
        item => item.status === "IN_PROGRESS"
    ).length;

    const resolved = vulnerabilities.filter(
        item => item.status === "RESOLVED"
    ).length;

    setText("total-count", total);
    setText("critical-count", critical);
    setText("progress-count", inProgress);
    setText("resolved-count", resolved);
}

// --------------------------------------------------
// BADGES
// --------------------------------------------------

function createBadge(label, className) {
    const badge = document.createElement("span");

    badge.className = `badge badge-${className}`;
    badge.textContent = label;

    return badge;
}

// --------------------------------------------------
// TABLEAUX DES VULNÉRABILITÉS
// --------------------------------------------------

function renderVulnerabilityTable(
    vulnerabilities,
    tableId = "vulnerability-list",
    emptyMessage = "Aucune vulnérabilité enregistrée."
) {
    const tableBody = document.getElementById(tableId);

    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    const isInventory = tableId === "all-vulnerabilities-list";

    if (vulnerabilities.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = isInventory ? 6 : 5;
        cell.className = "table-empty";
        cell.textContent = emptyMessage;

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    vulnerabilities.forEach(vulnerability => {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = vulnerability.title ?? "Sans titre";

        const severityCell = document.createElement("td");
        const severity = vulnerability.severity ?? "LOW";

        severityCell.appendChild(
            createBadge(
                severityLabels[severity] ?? severity,
                severityClasses[severity] ?? "low"
            )
        );

        const statusCell = document.createElement("td");
        const status = vulnerability.status ?? "OPEN";

        statusCell.appendChild(
            createBadge(
                statusLabels[status] ?? status,
                statusClasses[status] ?? "open"
            )
        );

        const componentCell = document.createElement("td");
        componentCell.textContent =
            vulnerability.affected_component ?? "Non spécifié";

        if (!isInventory) {
            const idCell = document.createElement("td");
            idCell.textContent = vulnerability.id ?? "—";

            row.append(
                idCell,
                titleCell,
                severityCell,
                statusCell,
                componentCell
            );
        } else {
            const dateCell = document.createElement("td");

            dateCell.textContent = vulnerability.created_at
                ? new Date(vulnerability.created_at).toLocaleDateString("fr-FR")
                : "—";

            const actionsCell = document.createElement("td");
            actionsCell.className = "table-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "table-action edit-action";
            editButton.textContent = "Modifier";
            editButton.dataset.action = "edit";
            editButton.dataset.id = vulnerability.id;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "table-action delete-action";
            deleteButton.textContent = "Supprimer";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.id = vulnerability.id;

            actionsCell.append(editButton, deleteButton);

            row.append(
                titleCell,
                severityCell,
                statusCell,
                componentCell,
                dateCell,
                actionsCell
            );
        }

        tableBody.appendChild(row);
    });
}
// --------------------------------------------------
// GRAPHIQUE : RÉPARTITION PAR SÉVÉRITÉ
// --------------------------------------------------

function renderSeveritySummary(vulnerabilities) {
    const container = document.getElementById("severity-chart");

    if (!container) {
        return;
    }

    const counts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
    };

    vulnerabilities.forEach(item => {
        if (Object.hasOwn(counts, item.severity)) {
            counts[item.severity]++;
        }
    });

    container.replaceChildren();

    Object.entries(counts).forEach(([severity, count]) => {
        const line = document.createElement("p");

        line.className = "chart-summary-line";
        line.textContent = `${severityLabels[severity]} : ${count}`;

        container.appendChild(line);
    });
}

// --------------------------------------------------
// GRAPHIQUE : ÉTAT DES VULNÉRABILITÉS
// --------------------------------------------------

function renderStatusSummary(vulnerabilities) {
    const container = document.getElementById("status-chart");

    if (!container) {
        return;
    }

    const counts = {
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0
    };

    vulnerabilities.forEach(item => {
        if (Object.hasOwn(counts, item.status)) {
            counts[item.status]++;
        }
    });

    container.replaceChildren();

    Object.entries(counts).forEach(([status, count]) => {
        const line = document.createElement("p");

        line.className = "chart-summary-line";
        line.textContent = `${statusLabels[status]} : ${count}`;

        container.appendChild(line);
    });
}


// --------------------------------------------------
// RAPPORTS DE SÉCURITÉ
// --------------------------------------------------

function renderReports(vulnerabilities) {
    const total = vulnerabilities.length;

    const highRisk = vulnerabilities.filter(
        item => item.severity === "HIGH" || item.severity === "CRITICAL"
    ).length;

    const open = vulnerabilities.filter(
        item => item.status === "OPEN"
    ).length;

    const resolved = vulnerabilities.filter(
        item => item.status === "RESOLVED"
    ).length;

    const resolutionRate = total === 0
        ? 0
        : Math.round((resolved / total) * 100);

    setText("report-total", total);
    setText("report-high-risk", highRisk);
    setText("report-open", open);
    setText("report-resolution-rate", `${resolutionRate}%`);

   // --------------------------------------------------
// GRAPHIQUE : RÉPARTITION PAR CRITICITÉ
// --------------------------------------------------

const severityContainer = document.getElementById(
    "report-severity-chart"
);

if (severityContainer) {
    const counts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
    };

    const colors = {
        CRITICAL: "#ef4444",
        HIGH: "#f97316",
        MEDIUM: "#eab308",
        LOW: "#3b82f6"
    };

    vulnerabilities.forEach(item => {
        if (Object.hasOwn(counts, item.severity)) {
            counts[item.severity]++;
        }
    });

    const totalSeverity = Object.values(counts)
        .reduce((sum, count) => sum + count, 0);

    severityContainer.replaceChildren();

    const content = document.createElement("div");
    content.className = "severity-chart-content";

    const donut = document.createElement("div");
    donut.className = "severity-donut";

    const segments = [];
    let currentPercentage = 0;

    Object.entries(counts).forEach(([severity, count]) => {
        const percentage = totalSeverity === 0
            ? 0
            : (count / totalSeverity) * 100;

        const nextPercentage = currentPercentage + percentage;

        if (percentage > 0) {
            segments.push(
                `${colors[severity]} ${currentPercentage}% ${nextPercentage}%`
            );
        }

        currentPercentage = nextPercentage;
    });

    donut.style.background = totalSeverity === 0
        ? "#26364a"
        : `conic-gradient(${segments.join(", ")})`;

    const donutCenter = document.createElement("div");
    donutCenter.className = "severity-donut-center";

    const totalValue = document.createElement("strong");
    totalValue.textContent = totalSeverity;

    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Total";

    donutCenter.append(totalValue, totalLabel);
    donut.appendChild(donutCenter);
    content.appendChild(donut);

    const legend = document.createElement("div");
    legend.className = "chart-legend";

    Object.entries(counts).forEach(([severity, count]) => {
        const percentage = totalSeverity === 0
            ? 0
            : Math.round((count / totalSeverity) * 100);

        const item = document.createElement("div");
        item.className = "chart-legend-item";

        const indicator = document.createElement("span");
        indicator.className = "chart-legend-dot";
        indicator.style.background = colors[severity];

        const label = document.createElement("span");
        label.className = "chart-legend-label";
        label.textContent = severityLabels[severity];

        const value = document.createElement("strong");
        value.textContent = `${count} (${percentage}%)`;

        item.append(indicator, label, value);
        legend.appendChild(item);
    });

    content.appendChild(legend);
    severityContainer.appendChild(content);
}

// --------------------------------------------------
// GRAPHIQUE : ÉTAT DU TRAITEMENT
// --------------------------------------------------

const statusContainer = document.getElementById(
    "report-status-chart"
);

if (statusContainer) {
    const counts = {
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0
    };

    const colors = {
        OPEN: "#f97316",
        IN_PROGRESS: "#eab308",
        RESOLVED: "#10b981"
    };

    vulnerabilities.forEach(item => {
        if (Object.hasOwn(counts, item.status)) {
            counts[item.status]++;
        }
    });

    const totalStatus = Object.values(counts)
        .reduce((sum, count) => sum + count, 0);

    statusContainer.replaceChildren();

    const content = document.createElement("div");
    content.className = "status-chart-content";

    Object.entries(counts).forEach(([status, count]) => {
        const percentage = totalStatus === 0
            ? 0
            : Math.round((count / totalStatus) * 100);

        const item = document.createElement("div");
        item.className = "status-chart-item";

        const header = document.createElement("div");
        header.className = "status-chart-header";

        const label = document.createElement("span");
        label.textContent = statusLabels[status];

        const value = document.createElement("strong");
        value.textContent = `${count} (${percentage}%)`;

        header.append(label, value);

        const track = document.createElement("div");
        track.className = "status-chart-track";

        const fill = document.createElement("div");
        fill.className = "status-chart-fill";
        fill.style.width = `${percentage}%`;
        fill.style.background = colors[status];

        track.appendChild(fill);
        item.append(header, track);
        content.appendChild(item);
    });

    statusContainer.appendChild(content);
}

    // Vulnérabilités prioritaires
    const priorityBody = document.getElementById(
        "report-priority-list"
    );

    if (priorityBody) {
        priorityBody.replaceChildren();

        const priorityOrder = {
            CRITICAL: 0,
            HIGH: 1
        };

        const priorities = vulnerabilities
            .filter(item => ["CRITICAL", "HIGH"].includes(item.severity))
            .sort((a, b) => {
                const severityDifference =
                    priorityOrder[a.severity] - priorityOrder[b.severity];

                if (severityDifference !== 0) {
                    return severityDifference;
                }

                return a.id - b.id;
            });

        if (priorities.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "table-empty";
            cell.textContent = "Aucune vulnérabilité prioritaire.";

            row.appendChild(cell);
            priorityBody.appendChild(row);
        } else {
            priorities.forEach(item => {
                const row = document.createElement("tr");

                const titleCell = document.createElement("td");
                titleCell.textContent = item.title;

                const componentCell = document.createElement("td");
                componentCell.textContent = item.affected_component;

                const severityCell = document.createElement("td");
                severityCell.textContent = severityLabels[item.severity];

                const statusCell = document.createElement("td");
                statusCell.textContent = statusLabels[item.status];

                row.append(
                    titleCell,
                    componentCell,
                    severityCell,
                    statusCell
                );

                priorityBody.appendChild(row);
            });
        }
    }
}


function exportVulnerabilitiesCSV() {
    if (allVulnerabilities.length === 0) {
        alert("Aucune vulnérabilité à exporter.");
        return;
    }

    const headers = [
        "ID",
        "Titre",
        "Description",
        "Criticité",
        "Statut",
        "Composant",
        "Date de création",
        "Dernière modification"
    ];

    const escapeCSV = value => {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = allVulnerabilities.map(item => [
        item.id,
        item.title,
        item.description,
        severityLabels[item.severity] ?? item.severity,
        statusLabels[item.status] ?? item.status,
        item.affected_component,
        item.created_at,
        item.updated_at
    ]);

    const csvContent = [
        headers,
        ...rows
    ]
        .map(row => row.map(escapeCSV).join(";"))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ares-rapport-vulnerabilites-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}


// --------------------------------------------------
// RECHERCHE ET FILTRES
// --------------------------------------------------

function applyVulnerabilityFilters() {
    const searchInput = document.getElementById(
        "vulnerability-search"
    );

    const severityFilter = document.getElementById(
        "severity-filter"
    );

    const statusFilter = document.getElementById(
        "status-filter"
    );

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedSeverity = severityFilter
        ? severityFilter.value
        : "";

    const selectedStatus = statusFilter
        ? statusFilter.value
        : "";

    const filteredVulnerabilities = allVulnerabilities.filter(
        vulnerability => {
            const title = (
                vulnerability.title ?? ""
            ).toLowerCase();

            const component = (
                vulnerability.affected_component ?? ""
            ).toLowerCase();

            const matchesSearch =
                title.includes(searchTerm) ||
                component.includes(searchTerm);

            const matchesSeverity =
                !selectedSeverity ||
                vulnerability.severity === selectedSeverity;

            const matchesStatus =
                !selectedStatus ||
                vulnerability.status === selectedStatus;

            return (
                matchesSearch &&
                matchesSeverity &&
                matchesStatus
            );
        }
    );

    const emptyMessage = allVulnerabilities.length === 0
        ? "Aucune vulnérabilité enregistrée."
        : "Aucun résultat ne correspond aux filtres.";

    renderVulnerabilityTable(
        filteredVulnerabilities,
        "all-vulnerabilities-list",
        emptyMessage
    );

    setText(
        "vulnerability-results-count",
        `${filteredVulnerabilities.length} résultat(s) sur ${allVulnerabilities.length} vulnérabilité(s)`
    );
}

// --------------------------------------------------
// RÉINITIALISATION DES FILTRES
// --------------------------------------------------

function resetVulnerabilityFilters() {
    const searchInput = document.getElementById(
        "vulnerability-search"
    );

    const severityFilter = document.getElementById(
        "severity-filter"
    );

    const statusFilter = document.getElementById(
        "status-filter"
    );

    if (searchInput) {
        searchInput.value = "";
    }

    if (severityFilter) {
        severityFilter.value = "";
    }

    if (statusFilter) {
        statusFilter.value = "";
    }

    applyVulnerabilityFilters();
}

// --------------------------------------------------
// GESTION DES ERREURS API
// --------------------------------------------------

function showApiError(message) {
    setText("total-count", "—");
    setText("critical-count", "—");
    setText("progress-count", "—");
    setText("resolved-count", "—");

    renderVulnerabilityTable(
        [],
        "vulnerability-list",
        message
    );

    renderVulnerabilityTable(
        [],
        "all-vulnerabilities-list",
        message
    );

    setText("vulnerability-results-count", "Données indisponibles.");

    ["severity-chart", "status-chart"].forEach(id => {
        const container = document.getElementById(id);

        if (container) {
            container.textContent = "Données indisponibles.";
        }
    });
}

// --------------------------------------------------
// CHARGEMENT DES DONNÉES
// --------------------------------------------------

async function loadDashboard() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Format de réponse API inattendu.");
        }

        allVulnerabilities = data;

        // Dashboard
        renderStatistics(data);

        renderVulnerabilityTable(
            data,
            "vulnerability-list"
        );

        renderSeveritySummary(data);
        renderStatusSummary(data);
	    renderReports(data);

        // Inventaire avec filtres
        applyVulnerabilityFilters();

    } catch (error) {
        console.error(
            "Impossible de charger les vulnérabilités :",
            error
        );

        showApiError(
            "Impossible de récupérer les données de l'API."
        );
    }
}

// --------------------------------------------------
// NAVIGATION ENTRE LES VUES
// --------------------------------------------------

function navigateToPage(pageName) {
    const pages = document.querySelectorAll(".page-view");
    const links = document.querySelectorAll(".nav-link");

    const targetPage = document.querySelector(
        `.page-view[data-page="${pageName}"]`
    );

    if (!targetPage) {
        console.warn(`Vue introuvable : ${pageName}`);
        return;
    }

    pages.forEach(page => {
        const isActive = page === targetPage;

        page.hidden = !isActive;
        page.classList.toggle("active", isActive);
    });

    links.forEach(link => {
        const isActive = link.hash === `#${pageName}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    history.replaceState(null, "", `#${pageName}`);
}

// --------------------------------------------------
// INITIALISATION
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Chargement initial
    loadDashboard();

    // Navigation latérale
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const pageName = link.hash.slice(1);

            navigateToPage(pageName);
        });
    });

    // Lien "Voir tout" du Dashboard
    document.querySelectorAll(".text-link").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            navigateToPage("vulnerabilities");
        });
    });

    // Recherche
    const searchInput = document.getElementById(
        "vulnerability-search"
    );

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyVulnerabilityFilters
        );
    }

    // Filtre par sévérité
    const severityFilter = document.getElementById(
        "severity-filter"
    );

    if (severityFilter) {
        severityFilter.addEventListener(
            "change",
            applyVulnerabilityFilters
        );
    }

    // Filtre par statut
    const statusFilter = document.getElementById(
        "status-filter"
    );

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            applyVulnerabilityFilters
        );
    }

    // Réinitialisation
    const resetButton = document.getElementById(
        "reset-filters"
    );

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            resetVulnerabilityFilters
        );
    }

    // Vue initiale
    const initialPage =
        window.location.hash.slice(1) || "dashboard";

    navigateToPage(initialPage);
});
// --------------------------------------------------
// CRÉATION DE VULNÉRABILITÉS
// --------------------------------------------------

function openVulnerabilityModal(vulnerability = null) {
    const modal = document.getElementById("vulnerability-modal");
    const form = document.getElementById("vulnerability-form");
    const saveButton = document.getElementById("save-vulnerability-button");

    if (!modal || !form) {
        console.error("Fenêtre de vulnérabilité introuvable.");
        return;
    }

    form.reset();

    editingVulnerabilityId = vulnerability ? vulnerability.id : null;

    if (vulnerability) {
        document.getElementById("modal-title").textContent =
            "Modifier la vulnérabilité";

        document.getElementById("vulnerability-title").value =
            vulnerability.title ?? "";

        document.getElementById("vulnerability-description").value =
            vulnerability.description ?? "";

        document.getElementById("vulnerability-severity").value =
            vulnerability.severity ?? "MEDIUM";

        document.getElementById("vulnerability-status").value =
            vulnerability.status ?? "OPEN";

        document.getElementById("vulnerability-component").value =
            vulnerability.affected_component ?? "";

        saveButton.textContent = "Enregistrer les modifications";
    } else {
        document.getElementById("modal-title").textContent =
            "Nouvelle vulnérabilité";

        document.getElementById("vulnerability-severity").value = "MEDIUM";
        document.getElementById("vulnerability-status").value = "OPEN";

        saveButton.textContent = "Enregistrer";
    }

    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("vulnerability-title").focus();
}
function closeVulnerabilityModal() {
    const modal = document.getElementById("vulnerability-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
}

async function createVulnerability(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const saveButton = document.getElementById("save-vulnerability-button");

    const isEditing = editingVulnerabilityId !== null;

    const vulnerability = {
        title: document.getElementById("vulnerability-title").value.trim(),
        description: document.getElementById("vulnerability-description").value.trim(),
        severity: document.getElementById("vulnerability-severity").value,
        status: document.getElementById("vulnerability-status").value,
        affected_component: document.getElementById("vulnerability-component").value.trim()
    };

    if (
        !vulnerability.title ||
        !vulnerability.description ||
        !vulnerability.affected_component
    ) {
        alert("Merci de remplir tous les champs obligatoires.");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Enregistrement...";

    try {
        const url = isEditing
            ? `${API_URL}/${editingVulnerabilityId}`
            : API_URL;

        const response = await fetch(url, {
            method: isEditing ? "PATCH" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(vulnerability)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const detail = errorData?.detail;

            throw new Error(
                typeof detail === "string"
                    ? detail
                    : `Erreur HTTP ${response.status}`
            );
        }

        closeVulnerabilityModal();
        form.reset();

        editingVulnerabilityId = null;

        await loadDashboard();

        navigateToPage("vulnerabilities");

        alert(
            isEditing
                ? "La vulnérabilité a été modifiée avec succès."
                : "La vulnérabilité a été enregistrée avec succès."
        );

    } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);

        alert(`Impossible d'enregistrer la vulnérabilité : ${error.message}`);

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Enregistrer";
    }
}
// --------------------------------------------------
// ÉVÉNEMENTS DE LA FENÊTRE MODALE
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.getElementById(
        "add-vulnerability-button"
    );

    const closeButton = document.getElementById(
        "close-modal-button"
    );

    const cancelButton = document.getElementById(
        "cancel-modal-button"
    );

    const modal = document.getElementById(
        "vulnerability-modal"
    );

    const form = document.getElementById(
        "vulnerability-form"
    );

    if (addButton) {
        addButton.addEventListener("click", () => {
            openVulnerabilityModal();
        });
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeVulnerabilityModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeVulnerabilityModal
        );
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeVulnerabilityModal();
            }
        });
    }

    if (form) {
        form.addEventListener(
            "submit",
            createVulnerability
        );
    }
    // Actions des rapports
    const exportReportButton = document.getElementById(
        "export-report-btn"
    );

    if (exportReportButton) {
        exportReportButton.addEventListener(
            "click",
            exportVulnerabilitiesCSV
        );
    }

// Actions de l'inventaire et confirmation de suppression
const inventoryBody = document.getElementById(
    "all-vulnerabilities-list"
);

const deleteModal = document.getElementById(
    "delete-confirmation-modal"
);

const deleteTitle = document.getElementById(
    "delete-vulnerability-title"
);

const confirmDeleteButton = document.getElementById(
    "confirm-delete-button"
);

const cancelDeleteButton = document.getElementById(
    "cancel-delete-button"
);

const closeDeleteModalButton = document.getElementById(
    "close-delete-modal-button"
);

let pendingDeleteVulnerability = null;

function openDeleteModal(vulnerability) {
    pendingDeleteVulnerability = vulnerability;

    deleteTitle.textContent = vulnerability.title;

    deleteModal.querySelector(".delete-modal-warning").textContent =
        "Cette action est irréversible.";

    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = "Supprimer";

    deleteModal.classList.add("is-visible");
    deleteModal.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
    deleteModal.classList.remove("is-visible");
    deleteModal.setAttribute("aria-hidden", "true");

    pendingDeleteVulnerability = null;
}

if (inventoryBody) {
    inventoryBody.addEventListener("click", event => {
        const button = event.target.closest(
            "button[data-action]"
        );

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const vulnerabilityId = Number(button.dataset.id);

        const vulnerability = allVulnerabilities.find(
            item => item.id === vulnerabilityId
        );

        if (!vulnerability) {
            console.warn("Vulnérabilité introuvable :", vulnerabilityId);
            return;
        }

        if (action === "edit") {
            openVulnerabilityModal(vulnerability);
            return;
        }

        if (action === "delete") {
            openDeleteModal(vulnerability);
        }
    });
}

// Annulation et fermeture de la modale
if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener(
        "click",
        closeDeleteModal
    );
}

if (closeDeleteModalButton) {
    closeDeleteModalButton.addEventListener(
        "click",
        closeDeleteModal
    );
}

if (deleteModal) {
    deleteModal.addEventListener("click", event => {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// Confirmation effective de la suppression
if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", async () => {
        if (!pendingDeleteVulnerability) {
            return;
        }

        const vulnerabilityId = pendingDeleteVulnerability.id;

        confirmDeleteButton.disabled = true;
        confirmDeleteButton.textContent = "Suppression...";

        try {
            const response = await fetch(
                `${API_URL}/${vulnerabilityId}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Impossible de supprimer la vulnérabilité."
                );
            }

            closeDeleteModal();
            await loadDashboard();

        } catch (error) {
            console.error("Erreur de suppression :", error);

            deleteModal.querySelector(".delete-modal-warning").textContent =
                error.message;

            confirmDeleteButton.disabled = false;
            confirmDeleteButton.textContent = "Réessayer";
        }
    });
}
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeVulnerabilityModal();
        }
    });
});
