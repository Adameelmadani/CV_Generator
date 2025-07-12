// Configuration de l'API
const API_BASE_URL = '../rh_api.php';

// Variables globales
let currentUser = null;
let searchResults = [];
let filieres = [];

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupWeightSliders();
});

async function initializeApp() {
    try {
        // Charger directement le dashboard (l'authentification est gérée par auth.html)
        showDashboard();
        loadStats();
        loadFilieres();
        
        // Afficher l'email de l'utilisateur connecté (si disponible)
        const userEmail = getCookie('user_email') || 'Utilisateur RH';
        document.getElementById('userEmail').textContent = userEmail;
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// Fonction pour récupérer un cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Affichage du dashboard
function showDashboard() {
    document.getElementById('dashboardSection').style.display = 'block';
}

// Déconnexion (redirection vers auth.html)
function logout() {
    // Supprimer les cookies de session
    document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'rh_authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Rediriger vers la page d'authentification
    window.location.href = '../Login_Signup/auth.html';
}

// Configuration des sliders de pondération
function setupWeightSliders() {
    const sliders = [
        { id: 'descriptionWeight', valueId: 'descriptionWeightValue' },
        { id: 'tasksWeight', valueId: 'tasksWeightValue' },
        { id: 'skillsWeight', valueId: 'skillsWeightValue' }
    ];
    
    sliders.forEach(slider => {
        const rangeInput = document.getElementById(slider.id);
        const valueSpan = document.getElementById(slider.valueId);
        
        rangeInput.addEventListener('input', function() {
            valueSpan.textContent = this.value + '%';
            normalizeWeights();
        });
    });
}

// Normaliser les pondérations pour qu'elles totalisent 100%
function normalizeWeights() {
    const sliders = [
        'descriptionWeight',
        'tasksWeight', 
        'skillsWeight'
    ];
    
    const values = sliders.map(id => parseInt(document.getElementById(id).value));
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total > 0) {
        sliders.forEach((id, index) => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id.replace('Weight', 'WeightValue'));
            const normalizedValue = Math.round((values[index] / total) * 100);
            slider.value = normalizedValue;
            valueSpan.textContent = normalizedValue + '%';
        });
    }
}

// Chargement des statistiques
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=get_stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalCVs').textContent = data.data.total_cvs;
            document.getElementById('totalFilieres').textContent = data.data.cv_by_filiere.length;
            document.getElementById('recentCVs').textContent = data.data.recent_cvs;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Chargement des filières
async function loadFilieres() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=get_filieres`);
        const data = await response.json();
        
        if (data.success) {
            filieres = data.data;
            populateFiliereFilter();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des filières:', error);
    }
}

function populateFiliereFilter() {
    const select = document.getElementById('filiereFilter');
    select.innerHTML = '<option value="">Toutes les filières</option>';
    
    filieres.forEach(filiere => {
        const option = document.createElement('option');
        option.value = filiere.id;
        option.textContent = filiere.nom;
        select.appendChild(option);
    });
}

// Recherche avancée avec pondération
async function advancedSearch() {
    const descriptionQuery = document.getElementById('descriptionSearch').value;
    const tasksQuery = document.getElementById('tasksSearch').value;
    const skillsQuery = document.getElementById('skillsSearch').value;
    
    const descriptionWeight = parseInt(document.getElementById('descriptionWeight').value) / 100;
    const tasksWeight = parseInt(document.getElementById('tasksWeight').value) / 100;
    const skillsWeight = parseInt(document.getElementById('skillsWeight').value) / 100;
    
    const filiere = document.getElementById('filiereFilter').value;
    const experienceLevel = document.getElementById('experienceLevel').value;
    const dateRange = document.getElementById('dateRange').value;
    
    try {
        showLoading();
        
        const params = new URLSearchParams();
        if (descriptionQuery) params.append('description', descriptionQuery);
        if (tasksQuery) params.append('tasks', tasksQuery);
        if (skillsQuery) params.append('skills', skillsQuery);
        if (descriptionWeight) params.append('description_weight', descriptionWeight);
        if (tasksWeight) params.append('tasks_weight', tasksWeight);
        if (skillsWeight) params.append('skills_weight', skillsWeight);
        if (filiere) params.append('filiere', filiere);
        if (experienceLevel) params.append('experience_level', experienceLevel);
        if (dateRange) params.append('date_range', dateRange);
        
        const response = await fetch(`${API_BASE_URL}?action=advanced_search&${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            searchResults = data.data;
            displayAdvancedSearchResults();
        } else {
            showMessage(data.message || 'Erreur lors de la recherche', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        showMessage('Erreur lors de la recherche', 'error');
    } finally {
        hideLoading();
    }
}

// Affichage des résultats de recherche avancée
function displayAdvancedSearchResults() {
    const container = document.getElementById('resultsContainer');
    const countElement = document.getElementById('resultsCount');
    
    countElement.textContent = `${searchResults.length} CV trouvé(s)`;
    
    if (searchResults.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Aucun CV trouvé. Utilisez les filtres pour affiner votre recherche.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = searchResults.map(cv => createAdvancedCVCard(cv)).join('');
}

// Création d'une carte CV avec score de pertinence
function createAdvancedCVCard(cv) {
    const date = new Date(cv.date_creation).toLocaleDateString('fr-FR');
    const name = `${cv.prenom || ''} ${cv.nom || ''}`.trim() || 'Nom non spécifié';
    const score = cv.relevance_score ? Math.round(cv.relevance_score * 100) : 0;
    
    return `
        <div class="cv-card" onclick="viewCVDetails(${cv.id})">
            <div class="cv-header">
                <div class="cv-name">${cv.cv_name || name}</div>
                <div class="cv-header-right">
                    <div class="cv-date">Créé le ${date}</div>
                    <div class="cv-score">${score}%</div>
                </div>
            </div>
            <div class="cv-info">
                <div class="cv-info-item">
                    <div class="cv-info-label">Nom</div>
                    <div class="cv-info-value">${name}</div>
                </div>
                <div class="cv-info-item">
                    <div class="cv-info-label">Email</div>
                    <div class="cv-info-value">${cv.email || 'Non spécifié'}</div>
                </div>
                <div class="cv-info-item">
                    <div class="cv-info-label">Localisation</div>
                    <div class="cv-info-value">${cv.localisation || 'Non spécifiée'}</div>
                </div>
                <div class="cv-info-item">
                    <div class="cv-info-label">Filière</div>
                    <div class="cv-info-value">${cv.filiere_nom || 'Non spécifiée'}</div>
                </div>
            </div>
            ${cv.profil ? `
                <div class="cv-info-item">
                    <div class="cv-info-label">Profil</div>
                    <div class="cv-info-value">${cv.profil.substring(0, 100)}${cv.profil.length > 100 ? '...' : ''}</div>
                </div>
            ` : ''}
            ${cv.matched_terms ? `
                <div class="cv-info-item">
                    <div class="cv-info-label">Termes correspondants</div>
                    <div class="cv-info-value">${cv.matched_terms.join(', ')}</div>
                </div>
            ` : ''}
            <div class="cv-actions">
                <button class="cv-action-btn" onclick="event.stopPropagation(); viewCVDetails(${cv.id})">
                    <i class="fas fa-eye"></i> Voir détails
                </button>
            </div>
        </div>
    `;
}

// Effacement des filtres avancés
function clearAdvancedFilters() {
    document.getElementById('descriptionSearch').value = '';
    document.getElementById('tasksSearch').value = '';
    document.getElementById('skillsSearch').value = '';
    document.getElementById('filiereFilter').value = '';
    document.getElementById('experienceLevel').value = '';
    document.getElementById('dateRange').value = '';
    
    // Réinitialiser les pondérations
    document.getElementById('descriptionWeight').value = 30;
    document.getElementById('descriptionWeightValue').textContent = '30%';
    document.getElementById('tasksWeight').value = 40;
    document.getElementById('tasksWeightValue').textContent = '40%';
    document.getElementById('skillsWeight').value = 30;
    document.getElementById('skillsWeightValue').textContent = '30%';
    
    searchResults = [];
    displayAdvancedSearchResults();
}

// Sauvegarder la recherche
function saveSearch() {
    const searchData = {
        description: document.getElementById('descriptionSearch').value,
        tasks: document.getElementById('tasksSearch').value,
        skills: document.getElementById('skillsSearch').value,
        descriptionWeight: document.getElementById('descriptionWeight').value,
        tasksWeight: document.getElementById('tasksWeight').value,
        skillsWeight: document.getElementById('skillsWeight').value,
        filiere: document.getElementById('filiereFilter').value,
        experienceLevel: document.getElementById('experienceLevel').value,
        dateRange: document.getElementById('dateRange').value
    };
    
    localStorage.setItem('savedSearch', JSON.stringify(searchData));
    showMessage('Recherche sauvegardée avec succès', 'success');
}

// Charger une recherche sauvegardée
function loadSavedSearch() {
    const savedSearch = localStorage.getItem('savedSearch');
    if (savedSearch) {
        const searchData = JSON.parse(savedSearch);
        
        document.getElementById('descriptionSearch').value = searchData.description || '';
        document.getElementById('tasksSearch').value = searchData.tasks || '';
        document.getElementById('skillsSearch').value = searchData.skills || '';
        document.getElementById('filiereFilter').value = searchData.filiere || '';
        document.getElementById('experienceLevel').value = searchData.experienceLevel || '';
        document.getElementById('dateRange').value = searchData.dateRange || '';
        
        if (searchData.descriptionWeight) {
            document.getElementById('descriptionWeight').value = searchData.descriptionWeight;
            document.getElementById('descriptionWeightValue').textContent = searchData.descriptionWeight + '%';
        }
        if (searchData.tasksWeight) {
            document.getElementById('tasksWeight').value = searchData.tasksWeight;
            document.getElementById('tasksWeightValue').textContent = searchData.tasksWeight + '%';
        }
        if (searchData.skillsWeight) {
            document.getElementById('skillsWeight').value = searchData.skillsWeight;
            document.getElementById('skillsWeightValue').textContent = searchData.skillsWeight + '%';
        }
        
        showMessage('Recherche chargée avec succès', 'success');
    }
}

// Exporter les résultats
function exportResults() {
    if (searchResults.length === 0) {
        showMessage('Aucun résultat à exporter', 'error');
        return;
    }
    
    const csvContent = generateCSV(searchResults);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cv_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Générer le CSV des résultats
function generateCSV(results) {
    const headers = ['Nom', 'Email', 'Filière', 'Localisation', 'Score de pertinence', 'Date de création'];
    const csvRows = [headers.join(',')];
    
    results.forEach(cv => {
        const name = `${cv.prenom || ''} ${cv.nom || ''}`.trim() || 'Nom non spécifié';
        const score = cv.relevance_score ? Math.round(cv.relevance_score * 100) : 0;
        const row = [
            `"${name}"`,
            `"${cv.email || ''}"`,
            `"${cv.filiere_nom || ''}"`,
            `"${cv.localisation || ''}"`,
            score,
            cv.date_creation
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Toggle des filtres avancés
function toggleAdvancedFilters() {
    const content = document.getElementById('advancedFiltersContent');
    const btn = document.querySelector('.toggle-filters-btn i');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        btn.className = 'fas fa-chevron-down';
    } else {
        content.classList.add('collapsed');
        btn.className = 'fas fa-chevron-up';
    }
}

// Affichage des détails d'un CV
async function viewCVDetails(cvId) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}?action=get_cv_details&id=${cvId}`);
        const data = await response.json();
        
        if (data.success) {
            displayCVDetails(data.data);
        } else {
            showMessage(data.message || 'Erreur lors du chargement des détails', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        showMessage('Erreur lors du chargement des détails', 'error');
    } finally {
        hideLoading();
    }
}

// Affichage des détails dans le modal
function displayCVDetails(cvData) {
    const modal = document.getElementById('cvModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const personalInfo = cvData.personal_info;
    const name = `${personalInfo?.prenom || ''} ${personalInfo?.nom || ''}`.trim() || 'Nom non spécifié';
    
    modalTitle.textContent = `CV de ${name}`;
    
    modalBody.innerHTML = `
        <div class="cv-details">
            ${createCVSection('Informations personnelles', [
                { label: 'Nom complet', value: name },
                { label: 'Email', value: personalInfo?.email || 'Non spécifié' },
                { label: 'Téléphone', value: personalInfo?.telephone || 'Non spécifié' },
                { label: 'Localisation', value: personalInfo?.localisation || 'Non spécifiée' },
                { label: 'Site web', value: personalInfo?.site_web || 'Non spécifié' },
                { label: 'LinkedIn', value: personalInfo?.linkedin || 'Non spécifié' },
                { label: 'GitHub', value: personalInfo?.github || 'Non spécifié' }
            ])}
            
            ${cvData.profile ? createCVSection('Profil', [{ label: 'Description', value: cvData.profile.description }]) : ''}
            
            ${cvData.filiere ? createCVSection('Filière', [{ label: 'Nom', value: cvData.filiere.nom }, { label: 'Description', value: cvData.filiere.description }]) : ''}
            
            ${cvData.experiences && cvData.experiences.length > 0 ? createExperiencesSection(cvData.experiences) : ''}
            
            ${cvData.formations && cvData.formations.length > 0 ? createFormationsSection(cvData.formations) : ''}
            
            ${cvData.competences && cvData.competences.length > 0 ? createCompetencesSection(cvData.competences) : ''}
            
            ${cvData.langues && cvData.langues.length > 0 ? createLanguesSection(cvData.langues) : ''}
            
            ${cvData.projets && cvData.projets.length > 0 ? createProjetsSection(cvData.projets) : ''}
            
            ${cvData.certificats && cvData.certificats.length > 0 ? createCertificatsSection(cvData.certificats) : ''}
        </div>
    `;
    
    modal.classList.add('show');
}

// Création d'une section CV
function createCVSection(title, items) {
    const validItems = items.filter(item => item.value && item.value !== 'Non spécifié' && item.value !== 'Non spécifiée');
    
    if (validItems.length === 0) return '';
    
    return `
        <div class="cv-section">
            <h3><i class="fas fa-info-circle"></i> ${title}</h3>
            <div class="cv-section-content">
                ${validItems.map(item => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${item.label}</div>
                        </div>
                        <div class="cv-item-description">${item.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Création de la section expériences
function createExperiencesSection(experiences) {
    return `
        <div class="cv-section">
            <h3><i class="fas fa-briefcase"></i> Expériences</h3>
            <div class="cv-section-content">
                ${experiences.map(exp => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${exp.poste || 'Poste non spécifié'}</div>
                            <div class="cv-item-date">${exp.dates || 'Dates non spécifiées'}</div>
                        </div>
                        <div class="cv-item-description">
                            <strong>Entreprise:</strong> ${exp.entreprise || 'Non spécifiée'}<br>
                            <strong>Lieu:</strong> ${exp.lieu || 'Non spécifié'}<br>
                            ${exp.description || 'Aucune description'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Création de la section formations
function createFormationsSection(formations) {
    return `
        <div class="cv-section">
            <h3><i class="fas fa-graduation-cap"></i> Formations</h3>
            <div class="cv-section-content">
                ${formations.map(formation => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${formation.diplome || 'Diplôme non spécifié'}</div>
                            <div class="cv-item-date">${formation.dates || 'Dates non spécifiées'}</div>
                        </div>
                        <div class="cv-item-description">
                            <strong>Université:</strong> ${formation.universite || 'Non spécifiée'}<br>
                            <strong>Spécialité:</strong> ${formation.specialite || 'Non spécifiée'}<br>
                            ${formation.description || 'Aucune description'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Création de la section compétences
function createCompetencesSection(competences) {
    return `
        <div class="cv-section">
            <h3><i class="fas fa-cogs"></i> Compétences</h3>
            <div class="cv-section-content">
                ${competences.map(comp => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${comp.categorie || 'Catégorie non spécifiée'}</div>
                        </div>
                        <div class="cv-item-description">${comp.competences || 'Aucune compétence spécifiée'}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Création de la section langues
function createLanguesSection(langues) {
    return `
        <div class="cv-section">
            <h3><i class="fas fa-language"></i> Langues</h3>
            <div class="cv-section-content">
                ${langues.map(langue => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${langue.nom_langue || 'Langue non spécifiée'}</div>
                            <div class="cv-item-date">${langue.niveau || 'Niveau non spécifié'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Création de la section projets
function createProjetsSection(projets) {
    return `
        <div class="cv-section">
            <h3><i class="fas fa-project-diagram"></i> Projets</h3>
            <div class="cv-section-content">
                ${projets.map(projet => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${projet.nom_projet || 'Projet non spécifié'}</div>
                        </div>
                        <div class="cv-item-description">
                            ${projet.lien_projet ? `<strong>Lien:</strong> <a href="${projet.lien_projet}" target="_blank">${projet.lien_projet}</a><br>` : ''}
                            ${projet.description || 'Aucune description'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Création de la section certificats
function createCertificatsSection(certificats) {
    return `
        <div class="cv-section">
            <h3><i class="fas fa-certificate"></i> Certificats</h3>
            <div class="cv-section-content">
                ${certificats.map(cert => `
                    <div class="cv-item">
                        <div class="cv-item-header">
                            <div class="cv-item-title">${cert.nom_certificat || 'Certificat non spécifié'}</div>
                            <div class="cv-item-date">${cert.date_certificat || 'Date non spécifiée'}</div>
                        </div>
                        <div class="cv-item-description">
                            <strong>Organisme:</strong> ${cert.organisme || 'Non spécifié'}<br>
                            <strong>Lieu:</strong> ${cert.lieu || 'Non spécifié'}<br>
                            ${cert.description || 'Aucune description'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Fermeture du modal
function closeModal() {
    document.getElementById('cvModal').classList.remove('show');
}

// Gestion des messages
function showMessage(message, type = 'info') {
    // Créer un toast temporaire
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Gestion du loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// Fermeture du modal en cliquant à l'extérieur
document.getElementById('cvModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Recherche avec la touche Entrée
document.getElementById('descriptionSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        advancedSearch();
    }
});

document.getElementById('tasksSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        advancedSearch();
    }
});

document.getElementById('skillsSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        advancedSearch();
    }
});
