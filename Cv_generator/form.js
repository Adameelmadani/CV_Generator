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
});