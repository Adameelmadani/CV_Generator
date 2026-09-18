// Variables globales
let currentView = 'grid';
let userCVs = [];
let currentCVForPreview = null;
let currentCVForDelete = null;
let currentCVForDownload = null; // Nouvelle variable pour le CV à télécharger

// Variables pour stocker les filieres
let filieres = [];
let userFilieres = []; // Filieres associated with the user

// Initialisation de la page
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadUserCVs();
    loadFilieres();
    setupEventListeners();
});

// Vérifier la session utilisateur
async function checkUserSession() {
    try {
        const response = await fetch('../Login_Signup/check_session_mvc.php', {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Session check result:', result);
        
        if (result.status === 'success' && result.logged_in) {
            // Afficher le username ou construire le nom d'affichage
            let displayName = result.username;
            if (!displayName || displayName === 'Utilisateur') {
                // Fallback: utiliser prenom + nom s'ils sont disponibles
                if (result.prenom && result.nom) {
                    displayName = `${result.prenom} ${result.nom}`;
                } else {
                    displayName = result.user_email;
                }
            }
            
            document.getElementById('userEmail').textContent = displayName;
            
            // Stocker les infos utilisateur dans des variables globales si nécessaire
            window.currentUser = {
                id: result.user_id,
                email: result.user_email,
                nom: result.nom,
                prenom: result.prenom,
                tel: result.user_tel
            };
            
        } else {
            console.log('Session invalid, redirecting to login');
            // Rediriger vers la page de connexion si pas connecté
            window.location.href = '../Login_Signup/auth.html';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
        // En cas d'erreur, rediriger vers la page de connexion
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
        const response = await fetch('get_user_cvs_mvc.php', {
            credentials: 'same-origin'
        });
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
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    
    if (userCVs.length === 0) {
        emptyElement.style.display = 'block';
        gridElement.innerHTML = '';
        deleteAllBtn.style.display = 'none';
        return;
    }
    
    emptyElement.style.display = 'none';
    deleteAllBtn.style.display = 'inline-block';
    gridElement.className = `cv-grid ${currentView === 'list' ? 'list-view' : ''}`;
    
    gridElement.innerHTML = userCVs.map(cv => {
        return `
        <div class="cv-card" onclick="previewCV(${cv.id})">
            <div class="cv-card-header">
                <div class="cv-card-info-left">
                    <div class="cv-card-title">${cv.display_name}</div>
                    <div class="cv-card-date">Créé le ${formatDate(cv.created_at)}</div>
                    ${cv.est_publie ? `<div class="cv-card-status published">Publié</div>` : ''}
                </div>
                <div class="cv-card-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); editCV(${cv.id})" title="Modifier">
                        <i class="fas fa-pen-fancy"></i>
                    </button>
                    <button class="action-btn ${cv.est_publie ? 'published' : ''}" onclick="event.stopPropagation(); ${cv.est_publie ? 'unpublishCV(' + cv.id + ')' : 'publishCV(' + cv.id + ')'}" title="${cv.est_publie ? 'Dépublier' : 'Publier'}">
                        <i class="fas ${cv.est_publie ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); downloadCV(${cv.id})" title="Télécharger">
                        <i class="fas fa-cloud-download-alt"></i>
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); deleteCV(${cv.id}, '${cv.display_name}', '${cv.created_at}')" title="Supprimer">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="cv-card-info" style="padding: 6px 10px;">
                <div class="cv-card-date">Modifié le ${formatDate(cv.updated_at)}</div>
            </div>
        </div>`;
    }).join('');
}

// Formater la date
function formatDate(dateString) {
    if (!dateString || dateString === null || dateString === 'null') {
        return 'Date non disponible';
    }
    
    // Debug: log the original date string
    console.log('Original date string:', dateString);
    
    // Check if the date string is in date-only format (YYYY-MM-DD)
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(dateString)) {
        // This is a date-only string from database (no time information stored)
        console.log('Date-only format detected - showing date without time');
        
        const date = new Date(dateString + 'T12:00:00'); // Use noon to avoid timezone issues
        
        if (isNaN(date.getTime())) {
            return 'Date non disponible';
        }
        
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Create date object and handle timezone properly for datetime strings
    let date;
    
    // If the date string doesn't include timezone info, treat it as local time
    if (dateString.includes('T') && !dateString.includes('+') && !dateString.includes('Z')) {
        // ISO format without timezone
        date = new Date(dateString);
    } else if (dateString.includes(' ') && !dateString.includes('T')) {
        // MySQL datetime format (YYYY-MM-DD HH:MM:SS), treat as local time
        date = new Date(dateString.replace(' ', 'T'));
    } else {
        // Standard date parsing
        date = new Date(dateString);
    }
    
    // Debug: log the parsed date
    console.log('Parsed date:', date);
    console.log('Date hours:', date.getHours(), 'minutes:', date.getMinutes());
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
        return 'Date non disponible';
    }
    
    // Format the date and time using local computer timezone
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
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
    // Clear the CV session on server before starting new CV
    clearCVSession().then(() => {
        // Show the CV naming modal instead of directly redirecting
        const modal = document.getElementById('newCVModal');
        
        if (modal) {
            modal.classList.add('show');
        } else {
            console.error(' Modal element not found!');
            return;
        }
        
        // Clear any previous input
        const cvNameInput = document.getElementById('cvNameInput');
        
        if (cvNameInput) {
            cvNameInput.value = '';
            cvNameInput.focus();
        } else {
            console.error(' Input element not found!');
        }
        
        // Clear any previous error
        const errorElement = document.getElementById('cvNameError');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        
        // Enable the create button
        const createBtn = document.getElementById('createCVBtn');
        if (createBtn) {
            createBtn.disabled = false;
        } else {
            console.error(' Create button not found!');
        }
    }).catch(error => {
        console.error(' Error clearing CV session:', error);
        // Still proceed with the modal even if session clear fails
        const modal = document.getElementById('newCVModal');
        if (modal) {
            modal.classList.add('show');
        }
    });
}

// Confirm CV creation with name
function confirmCreateCV() {
    const cvNameInput = document.getElementById('cvNameInput');
    const cvName = cvNameInput.value.trim();
    const errorElement = document.getElementById('cvNameError');
    const createBtn = document.getElementById('createCVBtn');
    
    // Clear previous errors
    errorElement.style.display = 'none';
    errorElement.textContent = '';
    
    // Validate CV name
    if (!cvName) {
        showCVNameError('Veuillez saisir un nom pour votre CV');
        cvNameInput.focus();
        return;
    }
    
    if (cvName.length < 3) {
        showCVNameError('Le nom du CV doit contenir au moins 3 caractères');
        cvNameInput.focus();
        return;
    }
    
    if (cvName.length > 100) {
        showCVNameError('Le nom du CV ne peut pas dépasser 100 caractères');
        cvNameInput.focus();
        return;
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(cvName)) {
        showCVNameError('Le nom ne peut pas contenir les caractères: < > : " / \\ | ? *');
        cvNameInput.focus();
        return;
    }
    
    // Disable button to prevent double submission
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';

    // Store the CV name in session storage and redirect
    sessionStorage.setItem('newCVName', cvName);

    // Clear any previous sessionStorage for newCVName after a timeout (safety)
    // This ensures that after the first use, the name is not reused accidentally
    setTimeout(() => {
        const storedName = sessionStorage.getItem('newCVName');
        if (storedName) {
            sessionStorage.removeItem('newCVName');
        }
    }, 5000); // Remove after 5s to allow home.html to pick it up (increased from 1s)

    // Close modal and redirect
    closeModal('newCVModal');
    
    // Add a small delay before redirect to ensure session clearing completes
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 100);
}

// Show CV name validation error
function showCVNameError(message) {
    const errorElement = document.getElementById('cvNameError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Setup event listeners for CV name input
function setupCVNameInputListeners() {
    const cvNameInput = document.getElementById('cvNameInput');
    const createBtn = document.getElementById('createCVBtn');
    
    if (cvNameInput) {
        // Enable/disable create button based on input
        cvNameInput.addEventListener('input', function() {
            const cvName = this.value.trim();
            createBtn.disabled = cvName.length < 3;
        });
        
        // Handle Enter key
        cvNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!createBtn.disabled) {
                    confirmCreateCV();
                }
            }
        });
        
        // Handle Escape key
        cvNameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal('newCVModal');
            }
        });
    }
}

// Importer un CV
function importCV() {
    const modal = document.getElementById('importModal');
    const importCVNameInput = document.getElementById('importCVNameInput');
    const importCVNameError = document.getElementById('importCVNameError');
    const fileInput = document.getElementById('fileInput');
    const importBtn = document.getElementById('importBtn');
    
    // Réinitialiser complètement le modal
    if (importCVNameInput) {
        importCVNameInput.value = ''; // S'assurer que le champ est vide
        importCVNameInput.removeAttribute('readonly'); // S'assurer qu'il n'est pas en lecture seule
    }
    if (importCVNameError) {
        importCVNameError.style.display = 'none';
        importCVNameError.textContent = '';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    if (importBtn) {
        importBtn.disabled = true; // Désactivé par défaut
    }
    
    modal.classList.add('show');
    
    // Mettre le focus sur le champ de nom pour forcer l'utilisateur à commencer par là
    setTimeout(() => {
        if (importCVNameInput) {
            importCVNameInput.focus();
        }
    }, 100);
}

// Prévisualiser un CV (charge le PDF sauvegardé)
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
            loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Chargement du CV...';
            iframe.parentNode.insertBefore(loadingDiv, iframe);
        }
        loadingDiv.style.display = 'flex';
        
        // Charger le PDF sauvegardé directement
        console.log('Loading saved PDF for CV ID:', cvId);
        const pdfUrl = `view_saved_cv_mvc.php?cv_id=${cvId}`;
        
        // Set iframe source to load the saved PDF
        iframe.src = pdfUrl;
        iframe.style.display = 'block';
        loadingDiv.style.display = 'none';
        
        console.log('Saved PDF loaded successfully');
        
    } catch (error) {
        console.error('Error loading saved CV:', error);
        
        // Hide loading and show error
        const loadingDiv = document.getElementById('previewLoading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        const iframe = document.getElementById('previewFrame');
        iframe.style.display = 'block';
        iframe.src = 'data:text/html,<html><body><div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;"><h3>Erreur de chargement</h3><p>Impossible de charger le CV. Veuillez réessayer.</p></div></body></html>';
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
        let response;
        
        // For PDF format, use the fast saved PDF download
        if (format === 'pdf') {
            console.log('Starting direct PDF download for CV ID:', cvId);
            
            // Use explicit path to avoid routing issues
            const downloadUrl = `./download_saved_cv_mvc.php?cv_id=${cvId}`;
            console.log('Download URL:', downloadUrl);
            
            // Try to download the saved PDF first
            try {
                const response = await fetch(downloadUrl, {
                    credentials: 'same-origin'
                });
                
                if (response.ok) {
                    // PDF found, download it
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    
                    // Try to get filename from response headers
                    let filename = 'CV.pdf';
                    const contentDisposition = response.headers.get('Content-Disposition');
                    if (contentDisposition) {
                        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
                        if (matches && matches[1]) {
                            filename = matches[1];
                        }
                    }
                    
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    
                    console.log('Downloading saved PDF:', filename);
                    link.click();
                    
                    // Clean up
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 1000);
                    
                    console.log('PDF download completed successfully');
                    return;
                    
                } else if (response.status === 404) {
                    // PDF not found, try to regenerate it
                    console.log('Saved PDF not found, trying to regenerate...');
                    
                    // Fall back to the original download method that regenerates the PDF
                    const regenerateResponse = await fetch('download_cv_mvc.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            cv_id: cvId,
                            format: 'pdf'
                        })
                    });
                    
                    if (regenerateResponse.ok) {
                        const blob = await regenerateResponse.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        
                        // Get filename from response headers
                        let filename = 'CV.pdf';
                        const contentDisposition = regenerateResponse.headers.get('Content-Disposition');
                        if (contentDisposition) {
                            const matches = contentDisposition.match(/filename="?([^"]+)"?/);
                            if (matches && matches[1]) {
                                filename = matches[1];
                            }
                        }
                        
                        link.download = filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        
                        console.log('Downloading regenerated PDF:', filename);
                        link.click();
                        
                        // Clean up
                        setTimeout(() => {
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }, 1000);
                        
                        console.log('PDF regeneration and download completed successfully');
                        return;
                    } else {
                        throw new Error(`Failed to regenerate PDF: ${regenerateResponse.status} - ${regenerateResponse.statusText}`);
                    }
                } else {
                    throw new Error(`Failed to download PDF: ${response.status} - ${response.statusText}`);
                }
                
            } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('Erreur lors du téléchargement du PDF: ' + error.message);
                return;
            }
        }
        
        // For other formats (XML, LaTeX, All), use the original compilation method
        response = await fetch('download_cv_mvc.php', {
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

// Supprimer tous les CV
function deleteAllCVs() {
    // Vérifier s'il y a des CV à supprimer
    if (!userCVs || userCVs.length === 0) {
        alert('Aucun CV à supprimer');
        return;
    }
    
    document.getElementById('deleteAllModal').classList.add('show');
}

// Confirmer la suppression de tous les CV
async function confirmDeleteAll() {
    try {
        const response = await fetch('delete_all_cvs_mvc.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            closeModal('deleteAllModal');
            loadUserCVs(); // Recharger la liste
            // Show success message briefly
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.textContent = 'Tous vos CV ont été supprimés avec succès';
            successMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                z-index: 1000;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(successMessage);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        } else {
            alert('Erreur lors de la suppression: ' + result.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de tous les CV');
    }
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
        // For PDF format, use the fast saved PDF download
        if (format === 'pdf') {
            console.log('Starting PDF download for CV ID:', currentCVForDownload);
            
            // Use explicit path to avoid routing issues
            const downloadUrl = `./download_saved_cv_mvc.php?cv_id=${currentCVForDownload}`;
            console.log('Download URL:', downloadUrl);
            console.log('Current location:', window.location.href);
            
            // Try to download the saved PDF first
            try {
                const response = await fetch(downloadUrl, {
                    credentials: 'same-origin'
                });
                
                if (response.ok) {
                    // PDF found, download it
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    
                    // Try to get filename from response headers
                    let filename = 'CV.pdf';
                    const contentDisposition = response.headers.get('Content-Disposition');
                    if (contentDisposition) {
                        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
                        if (matches && matches[1]) {
                            filename = matches[1];
                        }
                    }
                    
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    
                    console.log('Downloading saved PDF:', filename);
                    link.click();
                    
                    // Clean up
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 1000);
                    
                    console.log('PDF download completed successfully');
                    
                    // Fermer la modale après téléchargement
                    closeModal('downloadFormatModal');
                    currentCVForDownload = null;
                    return;
                    
                } else if (response.status === 404) {
                    // PDF not found, try to regenerate it
                    console.log('Saved PDF not found, trying to regenerate...');
                    
                    // Fall back to the original download method that regenerates the PDF
                    const regenerateResponse = await fetch('download_cv_mvc.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            cv_id: currentCVForDownload,
                            format: 'pdf'
                        })
                    });
                    
                    if (regenerateResponse.ok) {
                        const blob = await regenerateResponse.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        
                        // Get filename from response headers
                        let filename = 'CV.pdf';
                        const contentDisposition = regenerateResponse.headers.get('Content-Disposition');
                        if (contentDisposition) {
                            const matches = contentDisposition.match(/filename="?([^"]+)"?/);
                            if (matches && matches[1]) {
                                filename = matches[1];
                            }
                        }
                        
                        link.download = filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        
                        console.log('Downloading regenerated PDF:', filename);
                        link.click();
                        
                        // Clean up
                        setTimeout(() => {
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }, 1000);
                        
                        console.log('PDF regeneration and download completed successfully');
                        
                        // Fermer la modale après téléchargement
                        closeModal('downloadFormatModal');
                        currentCVForDownload = null;
                        return;
                    } else {
                        throw new Error(`Failed to regenerate PDF: ${regenerateResponse.status} - ${regenerateResponse.statusText}`);
                    }
                } else {
                    throw new Error(`Failed to download PDF: ${response.status} - ${response.statusText}`);
                }
                
            } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('Erreur lors du téléchargement du PDF: ' + error.message);
                closeModal('downloadFormatModal');
                currentCVForDownload = null;
                return;
            }
        }
        
        // For other formats (XML, LaTeX, All), use the original compilation method
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
    const userMenu = dropdown.closest('.user-menu');
    const userInfo = dropdown.closest('.user-info');
    
    dropdown.classList.toggle('show');
    userMenu.classList.toggle('active');
    userInfo.classList.toggle('active');
}

// Déconnexion
async function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        try {
            const response = await fetch('../Login_Signup/logout_mvc.php', {
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
    // Setup CV name input listeners
    setupCVNameInputListeners();
    
    // Setup validation for import CV name input
    setupImportCVNameInputListeners();
    
    // Fermer les modals en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
        
        // Fermer le menu utilisateur
        if (!e.target.closest('.user-menu')) {
            const dropdown = document.getElementById('userDropdown');
            const userMenu = document.querySelector('.user-menu');
            const userInfo = document.querySelector('.user-info');
            
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                userMenu?.classList.remove('active');
                userInfo?.classList.remove('active');
            }
        }
    });
    
    // Gestion de l'import de fichier
    const fileInput = document.getElementById('fileInput');
    const importZone = document.getElementById('importZone');
    const importBtn = document.getElementById('importBtn');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && (file.type === 'text/xml' || file.type === 'application/pdf' || file.name.endsWith('.xml') || file.name.endsWith('.pdf'))) {
            importZone.querySelector('h4').textContent = file.name;
            validateImportForm(); // Use the new validation function
        } else {
            importBtn.disabled = true;
            alert('Veuillez sélectionner un fichier PDF ou XML valide.');
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
        if (files.length > 0 && (files[0].type === 'text/xml' || files[0].type === 'application/pdf' || files[0].name.endsWith('.xml') || files[0].name.endsWith('.pdf'))) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        } else {
            alert('Veuillez déposer un fichier PDF ou XML valide.');
        }
    });
    
    importZone.addEventListener('click', selectFile);
    
    // Gestion de l'import
    importBtn.addEventListener('click', async function() {
        console.log(' Import button clicked'); // Debug log
        
        const file = fileInput.files[0];
        const importCVNameInput = document.getElementById('importCVNameInput');
        const importCVNameError = document.getElementById('importCVNameError');
        
        console.log(' File:', file); // Debug log
        console.log(' CV Name:', importCVNameInput ? importCVNameInput.value : 'input not found'); // Debug log
        
        if (!file) {
            console.log(' No file selected'); // Debug log
            alert('Veuillez sélectionner un fichier à importer.');
            return;
        }
        
        // Validation du nom du CV
        const cvName = importCVNameInput.value.trim();
        
        console.log(' CV Name trimmed:', cvName); // Debug log
        
        // Clear previous errors
        importCVNameError.style.display = 'none';
        importCVNameError.textContent = '';
        
        // Validate CV name - plus strict pour forcer la saisie manuelle
        if (!cvName) {
            console.log(' CV name is empty'); // Debug log
            showImportCVNameError(' Vous devez obligatoirement saisir un nom pour votre CV');
            importCVNameInput.focus();
            return;
        }
        
        // Vérifier que l'utilisateur n'a pas juste copié le placeholder
        const placeholder = 'Saisissez le nom de votre CV...';
        if (cvName === placeholder || cvName.toLowerCase() === placeholder.toLowerCase()) {
            console.log(' CV name is placeholder'); // Debug log
            showImportCVNameError(' Veuillez saisir votre propre nom, pas le texte d\'exemple');
            importCVNameInput.focus();
            importCVNameInput.select(); // Sélectionner le texte pour faciliter la réécriture
            return;
        }
        
        if (cvName.length < 3) {
            console.log(' CV name too short'); // Debug log
            showImportCVNameError(' Le nom du CV doit contenir au moins 3 caractères que vous tapez');
            importCVNameInput.focus();
            return;
        }
        
        if (cvName.length > 100) {
            console.log(' CV name too long'); // Debug log
            showImportCVNameError(' Le nom du CV ne peut pas dépasser 100 caractères');
            importCVNameInput.focus();
            return;
        }
        
        // Check for invalid characters
        const invalidChars = /[<>:"/\\|?*]/g;
        if (invalidChars.test(cvName)) {
            console.log(' CV name has invalid characters'); // Debug log
            showImportCVNameError(' Le nom ne peut pas contenir les caractères: < > : " / \\ | ? *');
            importCVNameInput.focus();
            return;
        }
        
        console.log(' All validations passed, proceeding with import'); // Debug log
        
        const formData = new FormData();
        // On garde le même champ pour compatibilité backend
        formData.append('xml_file', file);
        // Ajouter le nom personnalisé du CV
        formData.append('custom_cv_name', cvName);
        
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
                
                // Rediriger vers la page d’édition du CV importé
                window.location.href = 'user_home.html';
                return; // Arrêter ici pour ne pas recharger la liste
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

// Function to clear CV session on server
async function clearCVSession() {
    try {
        const response = await fetch('clear_cv_session_mvc.php', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                return true;
            } else {
                console.error(' Failed to clear CV session:', result.message);
                return false;
            }
        } else {
            console.error(' Failed to clear CV session - HTTP', response.status);
            return false;
        }
    } catch (error) {
        console.error(' Error clearing CV session:', error);
        return false;
    }
}

// Load filieres (simplified - no longer needed for publishing)
async function loadFilieres() {
    // We no longer need to load user-specific filieres for publishing
    // This function is kept for backward compatibility but doesn't do much
    userFilieres = [];
    filieres = [];
    
    console.log(' Filière loading skipped - direct publishing enabled');
}

// Get published status text for display
function getPublishedFilieresText(cv) {
    // Since we removed filière associations, just return empty string
    // The "Publié" text will be shown by the calling code
    return '';
}

// Publier un CV
async function publishCV(cvId) {
    console.log('<i class="fas fa-upload"></i> Publishing CV ID:', cvId);
    
    if (!confirm('Êtes-vous sûr de vouloir publier ce CV ?')) {
        return;
    }
    
    try {
        const response = await fetch('publish_cv_mvc.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                cv_id: cvId,
                is_published: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showMessage('CV publié avec succès !', 'success');
            loadUserCVs(); // Refresh the CV list
        } else {
            showMessage(result.message || 'Erreur lors de la publication', 'error');
        }
    } catch (error) {
        console.error(' Error publishing CV:', error);
        showMessage('Erreur lors de la publication du CV', 'error');
    }
}

// Dépublier un CV
async function unpublishCV(cvId) {
    if (!confirm('Êtes-vous sûr de vouloir dépublier ce CV ?')) {
        return;
    }
    
    try {
        const response = await fetch('publish_cv_mvc.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                cv_id: cvId,
                is_published: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showMessage('CV dépublié avec succès !', 'success');
            loadUserCVs(); // Refresh the CV list
        } else {
            showMessage(result.message || 'Erreur lors de la dépublication', 'error');
        }
    } catch (error) {
        console.error(' Error unpublishing CV:', error);
        showMessage('Erreur lors de la dépublication du CV', 'error');
    }
}

// Afficher un message
function showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#28a745';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#dc3545';
            break;
        default:
            messageElement.style.backgroundColor = '#007bff';
    }
    
    // Add to DOM
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Show CV import name validation error
function showImportCVNameError(message) {
    const errorElement = document.getElementById('importCVNameError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Setup import CV name input listeners for real-time validation
function setupImportCVNameInputListeners() {
    const importCVNameInput = document.getElementById('importCVNameInput');
    const importBtn = document.getElementById('importBtn');
    
    if (importCVNameInput) {
        // Real-time validation as user types
        importCVNameInput.addEventListener('input', function() {
            const errorElement = document.getElementById('importCVNameError');
            errorElement.style.display = 'none';
            
            // Validate import form on input
            validateImportForm();
        });
        
        // Focus event pour guider l'utilisateur
        importCVNameInput.addEventListener('focus', function() {
            const errorElement = document.getElementById('importCVNameError');
            if (this.value.trim() === '') {
                errorElement.textContent = 'Tapez un nom unique pour identifier votre CV (ex: "Mon_CV_Professionnel", "CV_Marketing_2025")';
                errorElement.style.display = 'block';
                errorElement.style.color = '#0066cc'; // Bleu pour l'info, pas rouge pour l'erreur
            }
        });
        
        // Blur event pour revenir à la validation normale
        importCVNameInput.addEventListener('blur', function() {
            const errorElement = document.getElementById('importCVNameError');
            if (errorElement.style.color === 'rgb(0, 102, 204)') { // Si c'était un message d'info
                errorElement.style.display = 'none';
                errorElement.style.color = ''; // Remettre la couleur par défaut
            }
        });
        
        // Handle Enter key to trigger import
        importCVNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (importBtn && !importBtn.disabled) {
                    importBtn.click();
                }
            }
        });
        
        // Handle Escape key
        importCVNameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal('importModal');
            }
        });
    }
}

// Validate import form and enable/disable import button
function validateImportForm() {
    const fileInput = document.getElementById('fileInput');
    const importCVNameInput = document.getElementById('importCVNameInput');
    const importBtn = document.getElementById('importBtn');
    
    const hasFile = fileInput.files.length > 0;
    const cvName = importCVNameInput.value.trim();
    
    console.log(' validateImportForm - hasFile:', hasFile, 'cvName:', cvName); // Debug log
    
    // Validation du nom :
    // - Au moins 3 caractères
    // - Pas seulement des espaces
    // - Pas de caractères invalides
    const hasValidName = cvName.length >= 3 && 
                        cvName.length <= 100 && 
                        !/[<>:"/\\|?*]/g.test(cvName);
    
    console.log(' validateImportForm - hasValidName:', hasValidName); // Debug log
    
    if (importBtn) {
        const shouldEnable = hasFile && hasValidName;
        importBtn.disabled = !shouldEnable;
        console.log(' validateImportForm - button enabled:', shouldEnable); // Debug log
        
        // Afficher un message d'aide si le nom n'est pas valide
        if (cvName.length > 0 && !hasValidName) {
            if (cvName.length < 3) {
                showImportCVNameError('Le nom doit contenir au moins 3 caractères');
            } else if (cvName.length > 100) {
                showImportCVNameError('Le nom ne peut pas dépasser 100 caractères');
            } else if (/[<>:"/\\|?*]/g.test(cvName)) {
                showImportCVNameError('Caractères interdits: < > : " / \\ | ? *');
            }
        }
    }
}
