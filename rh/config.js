// Configuration pour l'application CV Generator - RH
const CONFIG = {
  // URL de base de l'API backend
  API_BASE_URL: 'http://localhost:5000/api',
  
  // Configuration de la base de données (pour référence)
  DATABASE: {
    HOST: 'localhost',
    PORT: 3306,
    NAME: 'cv_craft',
    USER: 'root', // À modifier selon votre configuration
    PASSWORD: '' // À modifier selon votre configuration
  },
  
  // Configuration de l'application
  APP: {
    NAME: 'CV Generator - Portail RH',
    VERSION: '1.0.0',
    DEBUG: true
  }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
