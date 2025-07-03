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
    
    console.log('Loading user CVs...');
    
    try {
        const response = await fetch('get_user_cvs_mvc.php');
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Check if response is actually JSON
        if (!text.startsWith('{') && !text.startsWith('[')) {
            console.error('Response is not JSON. Likely PHP error output:', text);
            
            // Show helpful error message
            const errorMessage = `
Server Error Detected:

The server returned HTML/PHP error output instead of JSON. This usually means:

1. PHP errors/warnings are being displayed
2. Missing database table 'user_cvs'
3. PHP configuration issues

Raw server response:
${text.substring(0, 500)}${text.length > 500 ? '...' : ''}

To fix this:
1. Open browser console and run: debugSessionAndDB()
2. Or visit: check_db_table.php directly
3. Or run: setup_database.php to create missing tables

Contact support if this persists.
            `;
            
            console.error(errorMessage);
            
            // Show user-friendly popup
            if (confirm('Server configuration error detected. Would you like to run automatic diagnostics?')) {
                await debugSessionAndDB();
            }
            
            throw new Error('Server returned non-JSON response. Check server logs for PHP errors.');
        }
        
        const result = JSON.parse(text);
        console.log('Parsed result:', result);
        
        if (result.status === 'success') {
            userCVs = result.cvs;
            console.log('CVs loaded:', userCVs.length, 'CVs found');
            displayCVs();
        } else {
            console.error('Error loading CVs:', result.message);
            if (result.debug) {
                console.log('Debug info:', result.debug);
            }
            emptyElement.style.display = 'block';
            
            // If it's an authentication error, redirect to login
            if (result.message && result.message.includes('Authentication')) {
                alert('Session expired. Redirecting to login...');
                window.location.href = '../Login_Signup/auth.html';
                return;
            }
        }
    } catch (error) {
        console.error('Network/Parse error:', error);
        console.error('This usually indicates PHP errors being output before JSON response');
        emptyElement.style.display = 'block';
        
        // Show user-friendly error message
        if (error.message.includes('Unexpected token')) {
            console.error('JSON Parse Error - Server likely returned HTML/PHP errors instead of JSON');
        }
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
                <div class="cv-card-info-left">
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
        // Afficher le modal avec un indicateur de chargement
        document.getElementById('previewFrame').src = '';
        document.getElementById('previewModal').classList.add('show');
        
        // Afficher un message de chargement temporaire
        const iframe = document.getElementById('previewFrame');
        iframe.style.display = 'none';
        
        // Créer un div de chargement temporaire
        let loadingDiv = document.getElementById('previewLoading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'previewLoading';
            loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Génération de l\'aperçu...';
            iframe.parentNode.insertBefore(loadingDiv, iframe);
        }
        loadingDiv.style.display = 'flex';
        
        // Générer l'aperçu PDF avec LaTeX (preview_cv.php)
        console.log('Generating LaTeX preview for CV ID:', cvId);
        const response = await fetch('preview_cv_mvc.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cv_id: cvId })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            
            // Vérifier que c'est bien un PDF
            if (blob.type === 'application/pdf' || blob.size > 0) {
                const url = URL.createObjectURL(blob);
                
                iframe.src = url;
                iframe.style.display = 'block';
                loadingDiv.style.display = 'none';
                
                console.log('LaTeX preview generated successfully');
                
                // Nettoyer l'URL après un délai
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            } else {
                throw new Error('Invalid PDF response');
            }
        } else {
            const errorText = await response.text();
            console.error('Preview generation failed:', response.status, errorText);
            loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><br>Erreur lors de la génération de l\'aperçu LaTeX<br><small>Vérifiez que preview_cv.php existe et que LaTeX est installé</small>';
            setTimeout(() => {
                loadingDiv.style.display = 'none';
                iframe.style.display = 'block';
            }, 3000);
        }
    } catch (error) {
        console.error('Preview error:', error);
        const loadingDiv = document.getElementById('previewLoading');
        if (loadingDiv) {
            loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><br>Erreur lors de la génération de l\'aperçu LaTeX<br><small>' + error.message + '</small><br><a href="setup_verification.php" target="_blank">Vérifier la configuration</a>';
            setTimeout(() => {
                loadingDiv.style.display = 'none';
                document.getElementById('previewFrame').style.display = 'block';
            }, 5000);
        }
    }
}

// Modifier un CV
function editCV(cvId) {
    window.location.href = `get_cv_for_edit_mvc.php?cv_id=${cvId}`;
}

// Télécharger un CV (fonction modifiée pour utiliser la modale de sélection)
function downloadCV(cvId) {
    openDownloadFormatModal(cvId);
}

// Ancienne fonction de téléchargement direct (conservée pour compatibilité)
async function downloadCVDirect(cvId, format = 'pdf') {
    try {
        const response = await fetch('download_cv_mvc.php', {
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
        const response = await fetch('delete_cv_mvc.php', {
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
        const response = await fetch('download_cv_mvc.php', {
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
                case 'latex':
                    filename += '.tex';
                    break;
                case 'all':
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
            // Get error details from response
            const errorText = await response.text();
            console.error('Download error:', response.status, errorText);
            alert(`Erreur lors du téléchargement: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert(`Erreur lors du téléchargement: ${error.message}`);
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
            const response = await fetch('import_cv_mvc.php', {
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

// Debug function to help troubleshoot issues
async function debugSessionAndDB() {
    try {
        const response = await fetch('debug_session_and_db.php');
        const debugInfo = await response.json();
        console.log('=== DEBUG INFO ===');
        console.log(debugInfo);
        
        // Display in a more user-friendly way
        const debugWindow = window.open('', 'debug', 'width=800,height=600');
        debugWindow.document.write('<html><head><title>Debug Info</title></head><body>');
        debugWindow.document.write('<h1>Debug Information</h1>');
        debugWindow.document.write('<pre>' + JSON.stringify(debugInfo, null, 2) + '</pre>');
        debugWindow.document.write('</body></html>');
        
        return debugInfo;
    } catch (error) {
        console.error('Debug request failed:', error);
        alert('Debug request failed: ' + error.message);
    }
}

// Add debug to window for console access
window.debugSessionAndDB = debugSessionAndDB;
