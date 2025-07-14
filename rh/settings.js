// Gestionnaire des paramètres pour le Portail RH
class SettingsManager {
  constructor() {
    this.defaultSettings = {
      // Coefficients de recherche
      coefficients: {
        profil: 0.3,
        experience: 0.4,
        competences: 0.3
      },
      // Seuils de recherche
      thresholds: {
        minimum: 0.1,
        maxResults: 20
      },
      // Interface utilisateur
      ui: {
        theme: 'blue',
        animationSpeed: 'normal',
        autoOpenFilters: false,
        showSimilarityScore: true
      },
      // Configuration API
      api: {
        url: 'http://localhost:5000/api',
        timeout: 30,
        useFallback: true
      }
    };
    
    this.currentSettings = this.loadSettings();
    this.initializeEventListeners();
    this.loadFormValues();
  }

  // Charger les paramètres depuis localStorage
  loadSettings() {
    const saved = localStorage.getItem('rh_portal_settings');
    if (saved) {
      try {
        return { ...this.defaultSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return this.defaultSettings;
      }
    }
    return this.defaultSettings;
  }

  // Sauvegarder les paramètres dans localStorage
  saveSettings(settings = this.currentSettings) {
    try {
      localStorage.setItem('rh_portal_settings', JSON.stringify(settings));
      this.currentSettings = settings;
      this.showToast('Paramètres sauvegardés avec succès!', 'success');
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showToast('Erreur lors de la sauvegarde des paramètres', 'error');
      return false;
    }
  }

  // Charger les valeurs dans le formulaire
  loadFormValues() {
    // Coefficients
    document.getElementById('coeff_profil').value = this.currentSettings.coefficients.profil * 100;
    document.getElementById('coeff_experience').value = this.currentSettings.coefficients.experience * 100;
    document.getElementById('coeff_competences').value = this.currentSettings.coefficients.competences * 100;

    // Seuils
    document.getElementById('seuil_minimum').value = this.currentSettings.thresholds.minimum;
    document.getElementById('nb_resultats_max').value = this.currentSettings.thresholds.maxResults;

    // Interface utilisateur
    document.getElementById('theme_color').value = this.currentSettings.ui.theme;
    document.getElementById('animation_speed').value = this.currentSettings.ui.animationSpeed;
    document.getElementById('auto_open_filters').checked = this.currentSettings.ui.autoOpenFilters;
    document.getElementById('show_similarity_score').checked = this.currentSettings.ui.showSimilarityScore;

    // API
    document.getElementById('api_url').value = this.currentSettings.api.url;
    document.getElementById('api_timeout').value = this.currentSettings.api.timeout;
    document.getElementById('use_fallback').checked = this.currentSettings.api.useFallback;

    // Mettre à jour l'affichage
    this.updateCoefficientDisplay();
    this.updateThresholdDisplay();
  }

  // Récupérer les valeurs du formulaire
  getFormValues() {
    return {
      coefficients: {
        profil: parseFloat(document.getElementById('coeff_profil').value) / 100,
        experience: parseFloat(document.getElementById('coeff_experience').value) / 100,
        competences: parseFloat(document.getElementById('coeff_competences').value) / 100
      },
      thresholds: {
        minimum: parseFloat(document.getElementById('seuil_minimum').value),
        maxResults: parseInt(document.getElementById('nb_resultats_max').value)
      },
      ui: {
        theme: document.getElementById('theme_color').value,
        animationSpeed: document.getElementById('animation_speed').value,
        autoOpenFilters: document.getElementById('auto_open_filters').checked,
        showSimilarityScore: document.getElementById('show_similarity_score').checked
      },
      api: {
        url: document.getElementById('api_url').value.trim(),
        timeout: parseInt(document.getElementById('api_timeout').value),
        useFallback: document.getElementById('use_fallback').checked
      }
    };
  }

  // Mettre à jour l'affichage des coefficients
  updateCoefficientDisplay() {
    const profil = parseInt(document.getElementById('coeff_profil').value);
    const experience = parseInt(document.getElementById('coeff_experience').value);
    const competences = parseInt(document.getElementById('coeff_competences').value);
    
    document.querySelector('#coeff_profil + .coefficient-control .coefficient-value').textContent = `${profil}%`;
    document.querySelector('#coeff_experience + .coefficient-control .coefficient-value').textContent = `${experience}%`;
    document.querySelector('#coeff_competences + .coefficient-control .coefficient-value').textContent = `${competences}%`;

    const total = profil + experience + competences;
    const totalElement = document.getElementById('coefficientTotal');
    const warningElement = document.getElementById('coefficientWarning');
    
    totalElement.textContent = `${total}%`;
    
    if (total !== 100) {
      totalElement.style.color = '#e74c3c';
      warningElement.style.display = 'inline';
    } else {
      totalElement.style.color = '#27ae60';
      warningElement.style.display = 'none';
    }
  }

  // Mettre à jour l'affichage des seuils
  updateThresholdDisplay() {
    const threshold = parseFloat(document.getElementById('seuil_minimum').value);
    document.querySelector('#seuil_minimum + .threshold-control .threshold-value').textContent = `${Math.round(threshold * 100)}%`;
  }

  // Initialiser les event listeners
  initializeEventListeners() {
    // Coefficients - mise à jour en temps réel
    ['coeff_profil', 'coeff_experience', 'coeff_competences'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        this.updateCoefficientDisplay();
      });
    });

    // Seuil - mise à jour en temps réel
    document.getElementById('seuil_minimum').addEventListener('input', () => {
      this.updateThresholdDisplay();
    });

    // Formulaire de sauvegarde
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });

    // Boutons d'action
    document.getElementById('resetSettings').addEventListener('click', () => {
      this.handleReset();
    });

    document.getElementById('exportSettings').addEventListener('click', () => {
      this.handleExport();
    });

    document.getElementById('importSettings').addEventListener('click', () => {
      this.handleImport();
    });

    // Input file pour l'import
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      this.handleFileImport(e);
    });

    // Changement de thème en temps réel
    document.getElementById('theme_color').addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });
  }

  // Gérer la sauvegarde
  handleSave() {
    const formValues = this.getFormValues();
    
    // Vérifier que les coefficients totalisent 100%
    const totalCoeff = (formValues.coefficients.profil + formValues.coefficients.experience + formValues.coefficients.competences) * 100;
    if (Math.abs(totalCoeff - 100) > 0.01) {
      this.showToast('Erreur: Les coefficients doivent totaliser 100%', 'error');
      return;
    }

    // Valider l'URL de l'API
    if (formValues.api.url && !this.isValidUrl(formValues.api.url)) {
      this.showToast('Erreur: URL de l\'API invalide', 'error');
      return;
    }

    if (this.saveSettings(formValues)) {
      // Appliquer les nouveaux paramètres
      this.applySettings();
    }
  }

  // Gérer la réinitialisation
  handleReset() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut?')) {
      this.currentSettings = { ...this.defaultSettings };
      this.loadFormValues();
      this.saveSettings();
      this.applySettings();
    }
  }

  // Gérer l'export
  handleExport() {
    const dataStr = JSON.stringify(this.currentSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `rh_portal_settings_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showToast('Paramètres exportés avec succès!', 'success');
  }

  // Gérer l'import
  handleImport() {
    document.getElementById('importFileInput').click();
  }

  // Gérer l'import de fichier
  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        
        // Valider la structure des paramètres
        if (this.validateSettings(importedSettings)) {
          this.currentSettings = { ...this.defaultSettings, ...importedSettings };
          this.loadFormValues();
          this.saveSettings();
          this.applySettings();
          this.showToast('Paramètres importés avec succès!', 'success');
        } else {
          this.showToast('Erreur: Fichier de paramètres invalide', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        this.showToast('Erreur lors de l\'import du fichier', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }

  // Valider la structure des paramètres
  validateSettings(settings) {
    return (
      settings &&
      typeof settings === 'object' &&
      settings.coefficients &&
      settings.thresholds &&
      settings.ui &&
      settings.api
    );
  }

  // Valider une URL
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Appliquer les paramètres à l'interface
  applySettings() {
    this.applyTheme(this.currentSettings.ui.theme);
    this.applyAnimationSpeed(this.currentSettings.ui.animationSpeed);
    
    // Mettre à jour la configuration globale si elle existe
    if (typeof CONFIG !== 'undefined') {
      CONFIG.API_BASE_URL = this.currentSettings.api.url;
      CONFIG.COEFFICIENTS = this.currentSettings.coefficients;
      CONFIG.THRESHOLDS = this.currentSettings.thresholds;
    }
  }

  // Appliquer un thème
  applyTheme(theme) {
    const root = document.documentElement;
    
    const themes = {
      blue: { primary: '#667eea', secondary: '#764ba2' },
      green: { primary: '#56ab2f', secondary: '#a8e6cf' },
      purple: { primary: '#667eea', secondary: '#764ba2' },
      orange: { primary: '#ff7e5f', secondary: '#feb47b' },
      teal: { primary: '#38ef7d', secondary: '#11998e' }
    };

    if (themes[theme]) {
      root.style.setProperty('--primary-color', themes[theme].primary);
      root.style.setProperty('--secondary-color', themes[theme].secondary);
    }
  }

  // Appliquer la vitesse d'animation
  applyAnimationSpeed(speed) {
    const root = document.documentElement;
    
    const speeds = {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.6s',
      none: '0s'
    };

    if (speeds[speed]) {
      root.style.setProperty('--animation-speed', speeds[speed]);
    }
  }

  // Afficher un toast
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // Récupérer les paramètres actuels
  getSettings() {
    return this.currentSettings;
  }

  // Mettre à jour un paramètre spécifique
  updateSetting(path, value) {
    const keys = path.split('.');
    let current = this.currentSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.saveSettings();
  }
}

// Initialiser le gestionnaire de paramètres quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});
