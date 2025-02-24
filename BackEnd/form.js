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
