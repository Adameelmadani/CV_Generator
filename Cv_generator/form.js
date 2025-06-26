// Variables globales pour la gestion de l'édition
let isEditMode = false;
let editingCVId = null;

function addExperience() {
    const container = document.getElementById('experiences');
    const entry = document.createElement('div');
    entry.className = 'experience-entry';
    entry.innerHTML = `
        <input type="text" name="experience_dates[]" placeholder="Dates (De - À)" required>
        <input type="text" name="experience_poste[]" placeholder="Poste" required>
        <input type="text" name="experience_employeur[]" placeholder="Employeur" required>
        <textarea name="experience_description[]" placeholder="Description des responsabilités" required></textarea>
        <button type="button" onclick="removeEntry(this)" class="remove-btn">Supprimer</button>
    `;
    container.appendChild(entry);
}

function addEducation() {
    const container = document.getElementById('education');
    const entry = document.createElement('div');
    entry.className = 'education-entry';
    entry.innerHTML = `
        <input type="text" name="education_dates[]" placeholder="Dates (De - À)" required>
        <input type="text" name="education_diplome[]" placeholder="Diplôme" required>
        <input type="text" name="education_etablissement[]" placeholder="Établissement" required>
        <textarea class="description" name="education_description[]" placeholder="Description de la formation"></textarea>
        <button type="button" onclick="removeEntry(this)" class="remove-btn">Supprimer</button>
    `;
    container.appendChild(entry);
}

function addLanguage() {
    const container = document.getElementById('languages');
    const entry = document.createElement('div');
    entry.className = 'language-entry';
    entry.innerHTML = `
        <input type="text" name="langue[]" placeholder="Langue" required>
        <select name="niveau[]" required>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
        </select>
        <textarea class="description" name="language_description[]" placeholder="Description de la langue (ex: compétences orales/écrites)"></textarea>
        <button type="button" onclick="removeEntry(this)" class="remove-btn">Supprimer</button>
    `;
    container.appendChild(entry);
}

function removeEntry(button) {
    const section = button.closest('.section');
    const entries = section.querySelectorAll('.experience-entry, .education-entry, .language-entry');
    if (entries.length > 1) {
        button.parentElement.remove();
    } else {
        alert('Au moins une entrée est requise dans cette section');
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => field.style.borderColor = '');

    const personalFields = [
        'nom', 'prenom', 'date_naissance', 'nationalite',
        'adresse', 'email', 'telephone', 'emploi_recherche'
    ];

    personalFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field || !field.value.trim()) {
            if (field) field.style.borderColor = 'red';
            isValid = false;
        }
    });

    const sections = {
        'experiences': ['experience_dates[]', 'experience_poste[]', 'experience_employeur[]', 'experience_description[]'],
        'education': ['education_dates[]', 'education_diplome[]', 'education_etablissement[]', 'education_description[]'],
        'languages': ['langue[]', 'niveau[]', 'language_description[]']
    };

    for (const [sectionId, fields] of Object.entries(sections)) {
        const container = document.getElementById(sectionId);
        if (!container || container.children.length === 0) {
            isValid = false;
            alert(`La section ${sectionId} ne peut pas être vide`);
            continue;
        }

        const entries = container.children;
        for (const entry of entries) {
            fields.forEach(fieldName => {
                const field = entry.querySelector(`[name="${fieldName}"]`);
                if (!field || !field.value.trim()) {
                    if (field) field.style.borderColor = 'red';
                    isValid = false;
                }
            });
        }
    }

    return isValid;
}

function formatData() {
    document.querySelectorAll('input[name="experience_dates[]"], input[name="education_dates[]"]').forEach(input => {
        input.value = input.value.trim();
    });

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.value = textarea.value.trim().replace(/\n\s*\n\s*\n/g, '\n\n');
    });
}

document.getElementById('cvForm').onsubmit = function(e) {
    if (!validateForm()) {
        e.preventDefault();
        alert('Veuillez remplir tous les champs obligatoires');
        return false;
    }

    formatData();
    return true;
};

window.onload = function() {
    if (document.querySelectorAll('#experiences .experience-entry').length === 0) {
        addExperience();
    }
    if (document.querySelectorAll('#education .education-entry').length === 0) {
        addEducation();
    }
    if (document.querySelectorAll('#languages .language-entry').length === 0) {
        addLanguage();
    }
};
// Vérifier la session au chargement
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
});

function checkSession() {
    fetch('../Login_Signup/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                document.getElementById('userEmail').textContent = `Connecté: ${data.user_email}`;
                document.getElementById('logoutBtn').style.display = 'block';
                document.getElementById('myCvsLink').style.display = 'block';
                
                // Pré-remplir les champs email et téléphone
                document.querySelector('input[name="email"]').value = data.user_email;
                document.querySelector('input[name="telephone"]').value = data.user_tel || '';
            }
        })
        .catch(error => console.log('Pas de session active'));
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        const formData = new FormData();
        formData.append('logout', '1');
        
        fetch('../Login_Signup/logout.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = '../' + data.redirect;
            }
        });
    }
}
// Variables globales pour la navigation
let currentStep = 1;
const totalSteps = 6;

// Fonctions de navigation par étapes
function showStep(step) {
    // Cacher toutes les étapes
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Afficher l'étape courante
    document.querySelector(`.step-content[data-step="${step}"]`).classList.add('active');
    
    // Mettre à jour l'indicateur d'étapes
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active', 'completed');
    });
    
    // Marquer les étapes complétées
    for (let i = 1; i < step; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('completed');
    }
    
    // Marquer l'étape active
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    
    // Gestion des boutons de navigation
    document.getElementById('prevBtn').style.display = step === 1 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').style.display = step === totalSteps ? 'none' : 'inline-block';
    document.getElementById('submitBtn').style.display = step === totalSteps ? 'inline-block' : 'none';
    
    // Mettre à jour le texte de l'étape
    document.getElementById('currentStepText').textContent = `Étape ${step} sur ${totalSteps}`;
}

function changeStep(direction) {
    const newStep = currentStep + direction;
    
    if (newStep >= 1 && newStep <= totalSteps) {
        // Valider l'étape courante avant de passer à la suivante
        if (direction > 0 && !validateCurrentStep()) {
            return;
        }
        
        currentStep = newStep;
        showStep(currentStep);
    }
}

function validateCurrentStep() {
    const currentStepContent = document.querySelector(`.step-content[data-step="${currentStep}"]`);
    const requiredFields = currentStepContent.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    // Réinitialiser les styles d'erreur
    requiredFields.forEach(field => field.style.borderColor = '');
    
    // Vérifier chaque champ requis
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        }
    });
    
    // Validation spéciale pour les sections avec plusieurs entrées
    if (currentStep === 3) { // Expérience
        const experiences = document.querySelectorAll('#experiences .experience-entry');
        if (experiences.length === 0) {
            alert('Veuillez ajouter au moins une expérience professionnelle');
            return false;
        }
    }
    
    if (currentStep === 4) { // Formation
        const educations = document.querySelectorAll('#education .education-entry');
        if (educations.length === 0) {
            alert('Veuillez ajouter au moins une formation');
            return false;
        }
    }
    
    if (currentStep === 5) { // Langues
        const languages = document.querySelectorAll('#languages .language-entry');
        if (languages.length === 0) {
            alert('Veuillez ajouter au moins une langue');
            return false;
        }
    }
    
    if (!isValid) {
        alert('Veuillez remplir tous les champs obligatoires');
    }
    
    return isValid;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
    checkSession();
    checkEditMode();
});

// Vérifier si on est en mode édition
function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        console.log('🔄 Mode édition détecté, ID:', editId);
        
        isEditMode = true;
        editingCVId = editId;
        
        // Changer le titre de la page
        const title = document.querySelector('h2');
        if (title) {
            title.textContent = 'Modifier mon CV Europass';
        }
        
        // Ajouter classe pour le styling
        document.body.classList.add('edit-mode');
        
        // Ajouter un indicateur visuel
        const indicator = document.createElement('div');
        indicator.className = 'edit-indicator';
        indicator.innerHTML = '📝 Vous êtes en train de modifier un CV existant';
        
        const form = document.getElementById('cvForm');
        if (form) {
            form.parentNode.insertBefore(indicator, form);
        }
        
        // Attendre que le DOM soit complètement prêt avant de charger les données
        setTimeout(() => {
            console.log('⏰ Chargement différé des données CV...');
            loadCVForEdit(editId);
        }, 200);
    }
}

// Charger un CV pour édition
async function loadCVForEdit(cvId) {
    console.log('🚀 Chargement du CV pour édition, ID:', cvId);
    
    try {
        const response = await fetch('get_cv_for_edit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cv_id: cvId })
        });
        
        const result = await response.json();
        console.log('📥 Réponse reçue:', result);
        
        if (result.status === 'success' && result.cv_data) {
            console.log('✓ Données CV récupérées avec succès');
            populateFormWithCVData(result.cv_data);
        } else {
            console.error('✗ Erreur lors du chargement du CV:', result.message);
            alert('Erreur lors du chargement du CV: ' + (result.message || 'CV introuvable'));
            window.location.href = 'user_home.html';
        }
    } catch (error) {
        console.error('✗ Erreur lors de la requête:', error);
        alert('Erreur lors du chargement du CV');
        window.location.href = 'user_home.html';
    }
}

// Remplir le formulaire avec les données du CV
function populateFormWithCVData(xmlContent) {
    console.log('🔍 Début de populateFormWithCVData');
    console.log('XML reçu:', xmlContent);
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        console.log('✓ XML parsé avec succès');
        
        // Informations personnelles
        const personalInfo = xmlDoc.querySelector('personalInfo');
        if (personalInfo) {
            console.log('✓ Section personalInfo trouvée');
            console.log('Contenu de personalInfo:', personalInfo.innerHTML);
            
            // Vérification spécifique des champs problématiques
            const addressElement = personalInfo.querySelector('address');
            const birthDateElement = personalInfo.querySelector('birthDate');
            const nationalityElement = personalInfo.querySelector('nationality');
            const profileDescElement = personalInfo.querySelector('profileDescription');
            
            console.log('📍 Adresse - Élément:', addressElement, 'Valeur:', addressElement?.textContent);
            console.log('📅 Date naissance - Élément:', birthDateElement, 'Valeur:', birthDateElement?.textContent);
            console.log('🌍 Nationalité - Élément:', nationalityElement, 'Valeur:', nationalityElement?.textContent);
            console.log('📝 Description - Élément:', profileDescElement, 'Valeur:', profileDescElement?.textContent);
            
            setFieldValue('prenom', personalInfo.querySelector('firstname')?.textContent || '');
            setFieldValue('nom', personalInfo.querySelector('lastname')?.textContent || '');
            setFieldValue('email', personalInfo.querySelector('email')?.textContent || '');
            setFieldValue('telephone', personalInfo.querySelector('phone')?.textContent || '');
            setFieldValue('linkedin', personalInfo.querySelector('linkedin')?.textContent || '');
            setFieldValue('emploi_recherche', personalInfo.querySelector('jobTitle')?.textContent || '');
            setFieldValue('emploi_description', personalInfo.querySelector('jobDescription')?.textContent || '');
            setFieldValue('profil_description', personalInfo.querySelector('profileDescription')?.textContent || '');
            setFieldValue('adresse', personalInfo.querySelector('address')?.textContent || '');
            setFieldValue('date_naissance', personalInfo.querySelector('birthDate')?.textContent || '');
            setFieldValue('nationalite', personalInfo.querySelector('nationality')?.textContent || '');
        } else {
            console.error('✗ Section personalInfo non trouvée');
        }
        // Expériences professionnelles
        const workExperiences = xmlDoc.querySelectorAll('experiences experience');
        workExperiences.forEach((job, index) => {
            if (index > 0) addExperience(); // Ajouter des entrées supplémentaires
            
            const entries = document.querySelectorAll('#experiences .experience-entry');
            const entry = entries[index];
            if (entry) {
                entry.querySelector('input[name="experience_dates[]"]').value = job.querySelector('period')?.textContent || '';
                entry.querySelector('input[name="experience_poste[]"]').value = job.querySelector('position')?.textContent || '';
                entry.querySelector('input[name="experience_employeur[]"]').value = job.querySelector('employer')?.textContent || '';
                entry.querySelector('textarea[name="experience_description[]"]').value = job.querySelector('description')?.textContent || '';
            }
        });
        
        // Formation
        const educations = xmlDoc.querySelectorAll('education degree');
        educations.forEach((degree, index) => {
            if (index > 0) addEducation();
            
            const entries = document.querySelectorAll('#education .education-entry');
            const entry = entries[index];
            if (entry) {
                entry.querySelector('input[name="education_dates[]"]').value = degree.querySelector('period')?.textContent || '';
                entry.querySelector('input[name="education_diplome[]"]').value = degree.querySelector('title')?.textContent || '';
                entry.querySelector('input[name="education_etablissement[]"]').value = degree.querySelector('institution')?.textContent || '';
                entry.querySelector('textarea[name="education_description[]"]').value = degree.querySelector('description')?.textContent || '';
            }
        });        
        // Compétences
        const skills = xmlDoc.querySelector('skills');
        if (skills) {
            setFieldValue('competences_numeriques', skills.querySelector('digitalSkills')?.textContent || '');
            setFieldValue('competences_autres', skills.querySelector('otherSkills')?.textContent || '');
        }
        
        // Langues
        const languages = xmlDoc.querySelectorAll('languages language');
        languages.forEach((language, index) => {
            if (index > 0) addLanguage();
            
            const entries = document.querySelectorAll('#languages .language-entry');
            const entry = entries[index];
            if (entry) {
                entry.querySelector('input[name="langue[]"]').value = language.querySelector('name')?.textContent || '';
                const levelSelect = entry.querySelector('select[name="niveau[]"]');
                const level = language.querySelector('level')?.textContent || '';
                if (level && levelSelect) {
                    levelSelect.value = level;
                }
                entry.querySelector('textarea[name="language_description[]"]').value = language.querySelector('description')?.textContent || '';
            }
        });
        
        // Définir l'ID du CV en mode édition
        const editingField = document.getElementById('editing_cv_id');
        if (editingField) {
            editingField.value = editingCVId;
        }
        
    } catch (error) {
        console.error('Erreur lors du parsing XML:', error);
        alert('Erreur lors du chargement des données du CV');
    }
}

// Fonction utilitaire pour définir la valeur d'un champ avec retry
function setFieldValue(fieldName, value) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        // Traitement spécial pour les champs de date
        if (field.type === 'date' && value) {
            // S'assurer que la date est au format YYYY-MM-DD
            if (value.includes('/')) {
                // Convertir DD/MM/YYYY vers YYYY-MM-DD
                const parts = value.split('/');
                if (parts.length === 3) {
                    value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
        }
        
        field.value = value;
        console.log(`✓ Champ ${fieldName} (${field.type}) défini avec la valeur: ${value}`);
    } else {
        console.error(`✗ Champ ${fieldName} non trouvé dans le DOM`);
        
        // Retry après un court délai (au cas où le DOM ne serait pas encore prêt)
        setTimeout(() => {
            const retryField = document.querySelector(`[name="${fieldName}"]`);
            if (retryField) {
                // Même traitement pour les dates en retry
                if (retryField.type === 'date' && value) {
                    if (value.includes('/')) {
                        const parts = value.split('/');
                        if (parts.length === 3) {
                            value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                    }
                }
                
                retryField.value = value;
                console.log(`✓ (Retry) Champ ${fieldName} (${retryField.type}) défini avec la valeur: ${value}`);
            } else {
                console.error(`✗ (Retry) Champ ${fieldName} toujours non trouvé`);
            }
        }, 100);
    }
}