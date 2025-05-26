// Variables globales
let currentView = 'grid';
let userCVs = [];
let currentCVForPreview = null;
let currentCVForDelete = null;
let currentCVForDownload = null; // Nouvelle variable pour le CV à télécharger

// Initialisation de la page
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadUserCVs();
    setupEventListeners();
});

// Vérifier la session utilisateur
async function checkUserSession() {
    try {
        const response = await fetch('../Login_Signup/check_session.php');
        const result = await response.json();
        
        if (result.status === 'success' && result.logged_in) {
            document.getElementById('userEmail').textContent = result.user_email;
        } else {
            // Rediriger vers la page de connexion si pas connecté
            window.location.href = '../Login_Signup/auth.html';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
        window.location.href = '../Login_Signup/auth.html';
    }
}

// Charger les CV de l'utilisateur
async function loadUserCVs() {
    const loadingElement = document.getElementById('loadingCVs');
    const emptyElement = document.getElementById('emptyCVs');
    const gridElement = document.getElementById('cvGrid');
    
    loadingElement.style.display = 'block';
    emptyElement.style.display = 'none';
    gridElement.innerHTML = '';
    
    try {
        const response = await fetch('get_user_cvs.php');
        const result = await response.json();
        
        if (result.status === 'success') {
            userCVs = result.cvs;
            displayCVs();
        } else {
            console.error('Erreur lors du chargement des CV:', result.message);
            emptyElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
        emptyElement.style.display = 'block';
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Afficher les CV
function displayCVs() {
    const emptyElement = document.getElementById('emptyCVs');
    const gridElement = document.getElementById('cvGrid');
    
    if (userCVs.length === 0) {
        emptyElement.style.display = 'block';
        gridElement.innerHTML = '';
        return;
    }
    
    emptyElement.style.display = 'none';
    gridElement.className = `cv-grid ${currentView === 'list' ? 'list-view' : ''}`;
    
    gridElement.innerHTML = userCVs.map(cv => `
        <div class="cv-card" onclick="previewCV(${cv.id})">
            <div class="cv-card-header">
                <div>
                    <div class="cv-card-title">${cv.cv_name}</div>
                    <div class="cv-card-date">Créé le ${formatDate(cv.created_at)}</div>
                </div>
                <div class="cv-card-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); editCV(${cv.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); downloadCV(${cv.id})" title="Télécharger">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); deleteCV(${cv.id}, '${cv.cv_name}', '${cv.created_at}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="cv-card-info">
                <div class="cv-format">
                    <i class="fas fa-file-pdf"></i>
                    ${cv.xml_content ? 'PDF + XML' : 'PDF'}
                </div>
                <div class="cv-card-date">Modifié le ${formatDate(cv.updated_at)}</div>
            </div>
        </div>
    `).join('');
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Changer la vue (grille/liste)
function setView(view) {
    currentView = view;
    
    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    
    displayCVs();
}

// Créer un nouveau CV
function createNewCV() {
    window.location.href = 'home.html';
}

// Importer un CV
function importCV() {
    document.getElementById('importModal').classList.add('show');
}

// Prévisualiser un CV
async function previewCV(cvId) {
    currentCVForPreview = userCVs.find(cv => cv.id === cvId);
    
    if (!currentCVForPreview) {
        alert('CV introuvable');
        return;
    }
    
    try {
        // Générer l'aperçu PDF
        const response = await fetch('generate_preview.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cv_id: cvId })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            document.getElementById('previewFrame').src = url;
            document.getElementById('previewModal').classList.add('show');
        } else {
            alert('Erreur lors de la génération de l\'aperçu');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la génération de l\'aperçu');
    }
}

// Modifier un CV
function editCV(cvId) {
    window.location.href = `home.html?edit=${cvId}`;
}

// Télécharger un CV (fonction modifiée pour utiliser la modale de sélection)
function downloadCV(cvId) {
    openDownloadFormatModal(cvId);
}

// Ancienne fonction de téléchargement direct (conservée pour compatibilité)
async function downloadCVDirect(cvId, format = 'pdf') {
    try {
        const response = await fetch('download_cv.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                cv_id: cvId,
                format: format 
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'cv.pdf';
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('Erreur lors du téléchargement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du téléchargement');
    }
}

// Supprimer un CV
function deleteCV(cvId, cvName, createdAt) {
    currentCVForDelete = cvId;
    
    document.getElementById('deleteCVName').textContent = cvName;
    document.getElementById('deleteCVDate').textContent = `Créé le ${formatDate(createdAt)}`;
    document.getElementById('deleteModal').classList.add('show');
}

// Confirmer la suppression
async function confirmDelete() {
    if (!currentCVForDelete) return;
    
    try {
        const response = await fetch('delete_cv.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cv_id: currentCVForDelete })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            closeModal('deleteModal');
            loadUserCVs(); // Recharger la liste
        } else {
            alert('Erreur lors de la suppression: ' + result.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
    
    currentCVForDelete = null;
}

// Télécharger le CV en cours de prévisualisation
function downloadCurrentCV() {
    if (currentCVForPreview) {
        openDownloadFormatModal(currentCVForPreview.id);
    }
}

// Ouvrir la modale de sélection de format pour un CV spécifique
function openDownloadFormatModal(cvId) {
    currentCVForDownload = cvId;
    openModal('downloadFormatModal');
    
    // Réinitialiser la sélection par défaut (PDF)
    const pdfRadio = document.querySelector('input[name="downloadFormat"][value="pdf"]');
    if (pdfRadio) {
        pdfRadio.checked = true;
    }
}

// Confirmer le téléchargement avec le format sélectionné
async function confirmDownload() {
    if (!currentCVForDownload) {
        alert('Aucun CV sélectionné pour le téléchargement');
        return;
    }
    
    const selectedFormat = document.querySelector('input[name="downloadFormat"]:checked');
    if (!selectedFormat) {
        alert('Veuillez sélectionner un format de téléchargement');
        return;
    }
    
    const format = selectedFormat.value;
    
    try {
        const response = await fetch('download_cv.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                cv_id: currentCVForDownload,
                format: format 
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            let filename = 'cv';
            
            // Déterminer l'extension basée sur le format
            switch(format) {
                case 'pdf':
                    filename += '.pdf';
                    break;
                case 'xml':
                    filename += '.xml';
                    break;
                case 'both':
                    filename += '.zip';
                    break;
                default:
                    filename += '.pdf';
            }
            
            // Essayer d'extraire le nom du fichier depuis les headers de réponse
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches[1]) {
                    filename = matches[1];
                }
            }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Fermer la modale après téléchargement réussi
            closeModal('downloadFormatModal');
            currentCVForDownload = null;
        } else {
            alert('Erreur lors du téléchargement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du téléchargement');
    }
}

// Sélectionner un fichier pour l'import
function selectFile() {
    document.getElementById('fileInput').click();
}

// Gestion du menu utilisateur
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Déconnexion
async function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        try {
            const response = await fetch('../Login_Signup/logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'logout=1'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                window.location.href = '../' + result.redirect;
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            window.location.href = '../main_page.html';
        }
    }
}

// Ouvrir une modal
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

// Fermer les modals
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    
    if (modalId === 'previewModal') {
        document.getElementById('previewFrame').src = '';
        currentCVForPreview = null;
    }
    
    if (modalId === 'deleteModal') {
        currentCVForDelete = null;
    }
    
    if (modalId === 'downloadFormatModal') {
        currentCVForDownload = null;
    }
}

// Configuration des event listeners
function setupEventListeners() {
    // Fermer les modals en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
        
        // Fermer le menu utilisateur
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown').classList.remove('show');
        }
    });
    
    // Gestion de l'import de fichier
    const fileInput = document.getElementById('fileInput');
    const importZone = document.getElementById('importZone');
    const importBtn = document.getElementById('importBtn');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'text/xml') {
            importBtn.disabled = false;
            importZone.querySelector('h4').textContent = file.name;
        } else {
            importBtn.disabled = true;
            alert('Veuillez sélectionner un fichier XML valide.');
        }
    });
    
    // Drag & Drop pour l'import
    importZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        importZone.classList.add('dragover');
    });
    
    importZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        importZone.classList.remove('dragover');
    });
    
    importZone.addEventListener('drop', function(e) {
        e.preventDefault();
        importZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'text/xml') {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        } else {
            alert('Veuillez déposer un fichier XML valide.');
        }
    });
    
    importZone.addEventListener('click', selectFile);
    
    // Gestion de l'import
    importBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('xml_file', file);
        
        const progressElement = document.getElementById('importProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressElement.style.display = 'block';
        importBtn.disabled = true;
        
        try {
            const response = await fetch('import_cv.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                progressFill.style.width = '100%';
                progressText.textContent = 'Import terminé !';
                
                setTimeout(() => {
                    closeModal('importModal');
                    loadUserCVs();
                    
                    // Réinitialiser le formulaire
                    fileInput.value = '';
                    importBtn.disabled = true;
                    progressElement.style.display = 'none';
                    progressFill.style.width = '0%';
                    importZone.querySelector('h4').textContent = 'Glissez votre fichier XML ici';
                }, 1000);
            } else {
                alert('Erreur lors de l\'import: ' + result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'import');
        } finally {
            importBtn.disabled = false;
            if (progressFill.style.width !== '100%') {
                progressElement.style.display = 'none';
            }
        }
    });
    
    // Échappement pour fermer les modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}
