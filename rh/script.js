// Configuration de l'API
const API_BASE_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:5000/api';

// Charger les paramètres utilisateur
function loadUserSettings() {
  const saved = localStorage.getItem('rh_portal_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      return null;
    }
  }
  return null;
}

// Récupérer les coefficients actuels
function getCurrentCoefficients() {
  const settings = loadUserSettings();
  if (settings && settings.coefficients) {
    return settings.coefficients;
  }
  return {
    profil: 0.3,
    experience: 0.4,
    competences: 0.3
  };
}

// Récupérer les seuils actuels
function getCurrentThresholds() {
  const settings = loadUserSettings();
  if (settings && settings.thresholds) {
    return settings.thresholds;
  }
  return {
    minimum: 0.1,
    maxResults: 20
  };
}

// Fonctions d'API
async function fetchFilieres() {
  try {
    const response = await fetch(`${API_BASE_URL}/filieres`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.filieres;
    } else {
      console.error('Erreur lors du chargement des filières:', data.message);
      // Fallback vers les données de test
      return [
        { id: 1, nom: "Informatique", description: "Technologies de l'information" },
        { id: 2, nom: "Marketing", description: "Marketing et communication" },
        { id: 3, nom: "Finance", description: "Finance et comptabilité" },
        { id: 4, nom: "Ressources Humaines", description: "Gestion des ressources humaines" },
        { id: 5, nom: "Ingénierie", description: "Ingénierie et techniques" },
      ];
    }
  } catch (error) {
    console.error('Erreur de connexion à l\'API:', error);
    // Fallback vers les données de test
    return [
      { id: 1, nom: "Informatique", description: "Technologies de l'information" },
      { id: 2, nom: "Marketing", description: "Marketing et communication" },
      { id: 3, nom: "Finance", description: "Finance et comptabilité" },
      { id: 4, nom: "Ressources Humaines", description: "Gestion des ressources humaines" },
      { id: 5, nom: "Ingénierie", description: "Ingénierie et techniques" },
    ];
  }
}

async function searchCandidates(searchData) {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
}

async function fetchCVDetails(cvId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cv/${cvId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement du CV:', error);
    throw error;
  }
}

// Add fetchSuggestions for autocomplete
async function fetchSuggestions(query, fieldType = 'all', limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/suggestions?query=${encodeURIComponent(query)}&field_type=${fieldType}&limit=${limit}`);
    const data = await response.json();
    if (data.status === 'success') {
      return data.suggestions;
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions:', error);
    return [];
  }
}

// Données de test simulées (conservées en fallback)
const testData = {
  filieres: [
    { id: 1, nom: "Informatique", description: "Technologies de l'information" },
    { id: 2, nom: "Marketing", description: "Marketing et communication" },
    { id: 3, nom: "Finance", description: "Finance et comptabilité" },
    { id: 4, nom: "Ressources Humaines", description: "Gestion des ressources humaines" },
    { id: 5, nom: "Ingénierie", description: "Ingénierie et techniques" },
  ],

  cvs: [
    {
      id: 1,
      informations_personnelles: {
        nom: "Dupont",
        prenom: "Jean",
        localisation: "Paris, France",
        email: "jean.dupont@email.com",
        telephone: "+33 1 23 45 67 89",
        linkedin: "linkedin.com/in/jeandupont",
        github: "github.com/jeandupont",
      },
      profil:
        "Développeur Full-Stack passionné avec 5 ans d'expérience dans le développement d'applications web modernes. Expert en JavaScript, React, Node.js et bases de données.",
      formations: [
        {
          diplome: "Master en Informatique",
          dates: "2018-2020",
          universite: "Université Paris-Saclay",
          specialite: "Génie Logiciel",
          description: "Spécialisation en développement web et architecture logicielle",
        },
        {
          diplome: "Licence Informatique",
          dates: "2015-2018",
          universite: "Université Pierre et Marie Curie",
          specialite: "Informatique Générale",
          description: "Formation générale en informatique et programmation",
        },
      ],
      experiences: [
        {
          poste: "Développeur Full-Stack Senior",
          entreprise: "TechCorp",
          lieu: "Paris",
          dates: "2021-2024",
          description:
            "Développement d'applications web avec React et Node.js. Gestion d'équipe de 3 développeurs. Migration vers le cloud AWS.",
        },
        {
          poste: "Développeur Frontend",
          entreprise: "WebAgency",
          lieu: "Lyon",
          dates: "2020-2021",
          description:
            "Création d'interfaces utilisateur modernes avec React et Vue.js. Optimisation des performances web.",
        },
      ],
      projets: [
        {
          nom_projet: "E-commerce Platform",
          description: "Plateforme e-commerce complète avec React, Node.js et MongoDB. Gestion des paiements Stripe.",
        },
        {
          nom_projet: "Task Management App",
          description: "Application de gestion de tâches collaborative avec temps réel (Socket.io)",
        },
      ],
      certificats: [
        {
          nom_certificat: "AWS Certified Developer",
          organisme: "Amazon Web Services",
          description: "Certification en développement sur AWS",
        },
      ],
      competences: [
        {
          categorie: "Frontend",
          competences: "React, Vue.js, JavaScript, TypeScript, HTML5, CSS3, Sass",
        },
        {
          categorie: "Backend",
          competences: "Node.js, Express, Python, Django, PHP",
        },
        {
          categorie: "Base de données",
          competences: "MongoDB, MySQL, PostgreSQL, Redis",
        },
        {
          categorie: "DevOps",
          competences: "Docker, AWS, Git, CI/CD, Jenkins",
        },
      ],
      langues: [
        { nom_langue: "Français", niveau: "Natif" },
        { nom_langue: "Anglais", niveau: "Courant" },
        { nom_langue: "Espagnol", niveau: "Intermédiaire" },
      ],
      filiere_id: 1,
    },
    {
      id: 2,
      informations_personnelles: {
        nom: "Martin",
        prenom: "Sophie",
        localisation: "Lyon, France",
        email: "sophie.martin@email.com",
        telephone: "+33 4 56 78 90 12",
        linkedin: "linkedin.com/in/sophiemartin",
      },
      profil:
        "Chef de projet digital expérimentée avec 7 ans d'expérience dans la gestion de projets web et mobile. Expertise en méthodologies agiles et gestion d'équipes multidisciplinaires.",
      formations: [
        {
          diplome: "Master Management de Projet",
          dates: "2016-2018",
          universite: "EM Lyon",
          specialite: "Management de Projet Digital",
          description: "Formation en gestion de projet et transformation digitale",
        },
      ],
      experiences: [
        {
          poste: "Chef de Projet Digital Senior",
          entreprise: "Digital Solutions",
          lieu: "Lyon",
          dates: "2020-2024",
          description:
            "Gestion de projets web et mobile pour des clients grands comptes. Coordination d'équipes de 10+ personnes. Budget de 500K€+",
        },
        {
          poste: "Chef de Projet Web",
          entreprise: "WebFactory",
          lieu: "Lyon",
          dates: "2018-2020",
          description: "Gestion de projets e-commerce et sites vitrine. Méthodologie Scrum et Kanban.",
        },
      ],
      projets: [
        {
          nom_projet: "Refonte Site E-commerce",
          description: "Refonte complète d'un site e-commerce avec migration vers Shopify Plus. +150% de conversion.",
        },
      ],
      certificats: [
        {
          nom_certificat: "PMP Certification",
          organisme: "PMI",
          description: "Certification Project Management Professional",
        },
        {
          nom_certificat: "Scrum Master",
          organisme: "Scrum Alliance",
          description: "Certification Scrum Master",
        },
      ],
      competences: [
        {
          categorie: "Gestion de projet",
          competences: "Scrum, Kanban, Agile, Waterfall, Jira, Trello",
        },
        {
          categorie: "Digital",
          competences: "UX/UI, SEO, Analytics, A/B Testing",
        },
      ],
      langues: [
        { nom_langue: "Français", niveau: "Natif" },
        { nom_langue: "Anglais", niveau: "Courant" },
        { nom_langue: "Italien", niveau: "Débutant" },
      ],
      filiere_id: 1,
    },
    {
      id: 3,
      informations_personnelles: {
        nom: "Dubois",
        prenom: "Pierre",
        localisation: "Marseille, France",
        email: "pierre.dubois@email.com",
        telephone: "+33 4 91 23 45 67",
        linkedin: "linkedin.com/in/pierredubois",
      },
      profil:
        "Spécialiste Marketing Digital avec 6 ans d'expérience en stratégie digitale, SEO/SEA et social media. Expert en growth hacking et analytics.",
      formations: [
        {
          diplome: "Master Marketing Digital",
          dates: "2017-2019",
          universite: "KEDGE Business School",
          specialite: "Marketing Digital et E-business",
          description: "Formation spécialisée en marketing digital et e-commerce",
        },
      ],
      experiences: [
        {
          poste: "Responsable Marketing Digital",
          entreprise: "GrowthCorp",
          lieu: "Marseille",
          dates: "2021-2024",
          description:
            "Stratégie marketing digital complète. Gestion budgets Google Ads 100K€/mois. +200% croissance trafic organique.",
        },
        {
          poste: "Traffic Manager",
          entreprise: "AdAgency",
          lieu: "Nice",
          dates: "2019-2021",
          description: "Gestion campagnes SEA multi-clients. Optimisation ROI et conversion.",
        },
      ],
      projets: [
        {
          nom_projet: "Stratégie SEO E-commerce",
          description: "Stratégie SEO complète pour site e-commerce. +300% trafic organique en 12 mois.",
        },
      ],
      certificats: [
        {
          nom_certificat: "Google Ads Certified",
          organisme: "Google",
          description: "Certification Google Ads",
        },
        {
          nom_certificat: "Google Analytics Certified",
          organisme: "Google",
          description: "Certification Google Analytics",
        },
      ],
      competences: [
        {
          categorie: "SEO/SEA",
          competences: "Google Ads, SEO, SEM, Google Analytics, Search Console",
        },
        {
          categorie: "Social Media",
          competences: "Facebook Ads, Instagram, LinkedIn, TikTok, Hootsuite",
        },
        {
          categorie: "Analytics",
          competences: "Google Analytics, Data Studio, Hotjar, Mixpanel",
        },
      ],
      langues: [
        { nom_langue: "Français", niveau: "Natif" },
        { nom_langue: "Anglais", niveau: "Courant" },
        { nom_langue: "Allemand", niveau: "Intermédiaire" },
      ],
      filiere_id: 2,
    },
    {
      id: 4,
      informations_personnelles: {
        nom: "Leroy",
        prenom: "Marie",
        localisation: "Toulouse, France",
        email: "marie.leroy@email.com",
        telephone: "+33 5 61 23 45 67",
        linkedin: "linkedin.com/in/marieleroy",
      },
      profil:
        "Analyste financier senior avec 8 ans d'expérience en analyse financière, modélisation et reporting. Expertise en finance d'entreprise et marchés financiers.",
      formations: [
        {
          diplome: "Master Finance",
          dates: "2015-2017",
          universite: "Toulouse Business School",
          specialite: "Finance d'Entreprise",
          description: "Formation en finance d'entreprise et analyse financière",
        },
      ],
      experiences: [
        {
          poste: "Analyste Financier Senior",
          entreprise: "FinanceGroup",
          lieu: "Toulouse",
          dates: "2020-2024",
          description:
            "Analyse financière d'entreprises, modélisation financière, reporting mensuel. Suivi portefeuille 50M€.",
        },
        {
          poste: "Analyste Junior",
          entreprise: "BankCorp",
          lieu: "Toulouse",
          dates: "2017-2020",
          description: "Analyse crédit, évaluation risques, reporting réglementaire.",
        },
      ],
      projets: [
        {
          nom_projet: "Modèle de Valorisation",
          description: "Développement modèle de valorisation d'entreprises avec Excel et VBA.",
        },
      ],
      certificats: [
        {
          nom_certificat: "CFA Level II",
          organisme: "CFA Institute",
          description: "Certification CFA niveau 2",
        },
      ],
      competences: [
        {
          categorie: "Analyse Financière",
          competences: "Modélisation financière, DCF, Valorisation, Excel, VBA",
        },
        {
          categorie: "Reporting",
          competences: "Power BI, Tableau, SQL, Python",
        },
      ],
      langues: [
        { nom_langue: "Français", niveau: "Natif" },
        { nom_langue: "Anglais", niveau: "Courant" },
      ],
      filiere_id: 3,
    },
    {
      id: 5,
      informations_personnelles: {
        nom: "Moreau",
        prenom: "Thomas",
        localisation: "Nantes, France",
        email: "thomas.moreau@email.com",
        telephone: "+33 2 40 12 34 56",
        linkedin: "linkedin.com/in/thomasmoreau",
      },
      profil:
        "Responsable RH avec 10 ans d'expérience en recrutement, gestion des talents et développement RH. Expert en transformation digitale RH et people analytics.",
      formations: [
        {
          diplome: "Master Ressources Humaines",
          dates: "2013-2015",
          universite: "Université de Nantes",
          specialite: "Management des Ressources Humaines",
          description: "Formation en GRH et management",
        },
      ],
      experiences: [
        {
          poste: "Responsable RH",
          entreprise: "TechStart",
          lieu: "Nantes",
          dates: "2019-2024",
          description:
            "Gestion RH complète entreprise 200 personnes. Recrutement, formation, GPEC. Mise en place SIRH.",
        },
        {
          poste: "Chargé de Recrutement Senior",
          entreprise: "HR Solutions",
          lieu: "Nantes",
          dates: "2015-2019",
          description: "Recrutement profils IT et management. 100+ recrutements/an.",
        },
      ],
      projets: [
        {
          nom_projet: "Transformation Digitale RH",
          description: "Mise en place SIRH et digitalisation processus RH. ROI +30%.",
        },
      ],
      certificats: [
        {
          nom_certificat: "Certification GPEC",
          organisme: "CNAM",
          description: "Certification en Gestion Prévisionnelle des Emplois et Compétences",
        },
      ],
      competences: [
        {
          categorie: "Recrutement",
          competences: "Sourcing, Entretiens, Assessment, LinkedIn Recruiter",
        },
        {
          categorie: "SIRH",
          competences: "Workday, SAP SuccessFactors, Talentsoft",
        },
        {
          categorie: "Analytics",
          competences: "People Analytics, Excel, Power BI, Reporting RH",
        },
      ],
      langues: [
        { nom_langue: "Français", niveau: "Natif" },
        { nom_langue: "Anglais", niveau: "Courant" },
        { nom_langue: "Espagnol", niveau: "Intermédiaire" },
      ],
      filiere_id: 4,
    },
    {
      id: 6,
      informations_personnelles: {
        nom: "Bernard",
        prenom: "Julie",
        localisation: "Strasbourg, France",
        email: "julie.bernard@email.com",
        telephone: "+33 3 88 12 34 56",
        linkedin: "linkedin.com/in/juliebernard",
      },
      profil:
        "Ingénieure logiciel spécialisée en intelligence artificielle et machine learning. 4 ans d'expérience en développement d'algorithmes et déploiement de modèles ML.",
      formations: [
        {
          diplome: "Diplôme d'Ingénieur",
          dates: "2018-2021",
          universite: "INSA Strasbourg",
          specialite: "Informatique et Intelligence Artificielle",
          description: "Formation d'ingénieur en informatique avec spécialisation IA",
        },
      ],
      experiences: [
        {
          poste: "Ingénieure Machine Learning",
          entreprise: "AI Solutions",
          lieu: "Strasbourg",
          dates: "2021-2024",
          description:
            "Développement modèles ML pour reconnaissance d'images. Déploiement en production avec Docker et Kubernetes.",
        },
      ],
      projets: [
        {
          nom_projet: "Système de Recommandation",
          description: "Développement système de recommandation avec TensorFlow et déploiement sur GCP.",
        },
        {
          nom_projet: "Chatbot IA",
          description: "Création chatbot intelligent avec NLP et intégration API.",
        },
      ],
      certificats: [
        {
          nom_certificat: "TensorFlow Developer",
          organisme: "Google",
          description: "Certification TensorFlow Developer",
        },
      ],
      competences: [
        {
          categorie: "Machine Learning",
          competences: "TensorFlow, PyTorch, Scikit-learn, Keras, OpenCV",
        },
        {
          categorie: "Programmation",
          competences: "Python, R, Java, C++, SQL",
        },
        {
          categorie: "Cloud",
          competences: "GCP, AWS, Docker, Kubernetes, MLOps",
        },
      ],
      langues: [
        { nom_langue: "Français", niveau: "Natif" },
        { nom_langue: "Anglais", niveau: "Courant" },
        { nom_langue: "Allemand", niveau: "Courant" },
      ],
      filiere_id: 5,
    },
  ],
}

// Variables globales
let currentResults = []
let currentPage = 1
const resultsPerPage = 5

// Initialisation de l'application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  loadFilieres()
  setupEventListeners()
  applyUserSettings()
}

// Appliquer les paramètres utilisateur à l'interface
function applyUserSettings() {
  const settings = loadUserSettings();
  if (!settings) return;

  // Appliquer le thème
  if (settings.ui && settings.ui.theme) {
    applyTheme(settings.ui.theme);
  }

  // Appliquer la vitesse d'animation
  if (settings.ui && settings.ui.animationSpeed) {
    applyAnimationSpeed(settings.ui.animationSpeed);
  }

  // Ouvrir automatiquement les filtres avancés si configuré
  if (settings.ui && settings.ui.autoOpenFilters) {
    const filters = document.getElementById("advancedFilters");
    if (filters) {
      filters.classList.add("show");
    }
  }
}

// Appliquer un thème
function applyTheme(theme) {
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
function applyAnimationSpeed(speed) {
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

// Charger les filières dans le select
async function loadFilieres() {
  const filiereSelect = document.getElementById("filiere")
  
  try {
    const filieres = await fetchFilieres();
    filieres.forEach((filiere) => {
      const option = document.createElement("option")
      option.value = filiere.id
      option.textContent = filiere.nom
      filiereSelect.appendChild(option)
    })
  } catch (error) {
    console.error('Erreur lors du chargement des filières:', error);
    // Fallback vers les données de test
    testData.filieres.forEach((filiere) => {
      const option = document.createElement("option")
      option.value = filiere.id
      option.textContent = filiere.nom
      filiereSelect.appendChild(option)
    })
  }
}

// Configuration des event listeners
function setupEventListeners() {
  // Formulaire de recherche
  document.getElementById("candidateSearchForm").addEventListener("submit", handleSearch)

  // Boutons d'action
  document.getElementById("toggleFilters").addEventListener("click", toggleAdvancedFilters)
  document.getElementById("clearForm").addEventListener("click", clearForm)
  document.getElementById("exportResults").addEventListener("click", exportResults)
  document.getElementById("saveSearch").addEventListener("click", saveSearch)

  // Modal
  const closeButton = document.getElementById("closeModal")
  const modal = document.getElementById("cvModal")
  
  if (closeButton) {
    closeButton.addEventListener("click", closeModal)
  }
  
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) closeModal()
    })
  }
  
  // Fermer la modal avec la touche Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("cvModal")
      if (modal && modal.style.display === "flex") {
        closeModal()
      }
    }
  })
}

// Gestion de la recherche
function handleSearch(e) {
  e.preventDefault()

  // Récupérer les valeurs du formulaire
  const profilProfessionnel = document.getElementById("profil_professionnel").value || "";
  const experiencesCles = document.getElementById("experiences_cles").value || "";
  const competencesTechniques = document.getElementById("competences_techniques").value || "";
  
  // Récupérer les valeurs multi-select pour les filières
  const filiereSelect = document.getElementById("filiere");
  const selectedFilieres = Array.from(filiereSelect.selectedOptions)
    .map(option => option.value)
    .filter(value => value !== ""); // Filtrer l'option "Toutes filières"
  
  // Récupérer les pondérations des champs
  const weightDescription = parseFloat(document.getElementById('weight_description').value) || 0.3;
  const weightTasks = parseFloat(document.getElementById('weight_tasks').value) || 0.4;
  const weightCompetences = parseFloat(document.getElementById('weight_competences').value) || 0.3;
  const weightRecency = parseFloat(document.getElementById('weight_recency').value) || 0.2;

  // Créer l'objet de recherche avec pondérations
  const searchParams = {
    description: profilProfessionnel,
    tasks: experiencesCles,
    competences: competencesTechniques,
    filiere_ids: selectedFilieres.length > 0 ? selectedFilieres.map(id => parseInt(id)) : null,
    weights: {
      description: weightDescription,
      tasks: weightTasks,
      competences: weightCompetences,
      recency: weightRecency
    }
  }

  performSearch(searchParams)
}

// Recherche utilisant l'API backend
async function performSearch(params) {
  showLoading(true)

  try {
    // Collect weights from sliders
    const weights = {
      description: parseFloat(document.getElementById('weight_description').value),
      tasks: parseFloat(document.getElementById('weight_tasks').value),
      competences: parseFloat(document.getElementById('weight_competences').value),
      recency: parseFloat(document.getElementById('weight_recency').value)
    };
    // Add weights to params
    params.weights = weights;

    const response = await searchCandidates(params);
    
    if (response.status === 'success') {
      displayResults(response.results)
    } else {
      console.error('Erreur de recherche:', response.message);
      // Fallback vers la recherche locale
      performLocalSearch(params);
    }
  } catch (error) {
    console.error('Erreur de connexion API:', error);
    // Fallback vers la recherche locale
    performLocalSearch(params);
  } finally {
    showLoading(false)
  }
}

// Fallback: recherche locale (conservée pour compatibilité)
function performLocalSearch(params) {
  // Convertir les paramètres pour la recherche locale
  const localParams = {
    profil_professionnel: params.description,
    experiences_cles: params.tasks,
    competences_techniques: params.competences,
    filieres: params.filiere_ids,
  };
  
  const results = searchCVs(localParams)
  displayResults(results)
}

// Algorithme de recherche simplifié
function searchCVs(params) {
  const results = []
  const coefficients = getCurrentCoefficients()
  const thresholds = getCurrentThresholds()

  testData.cvs.forEach((cv) => {
    let score = 0
    const matchDetails = {}

    // Filtrage par filière (multi-sélection)
    if (params.filieres && params.filieres.length > 0) {
      const cvFiliereId = cv.filiere_id;
      // Si le CV n'est pas dans une des filières sélectionnées, on l'ignore
      if (!params.filieres.some(id => parseInt(id) === cvFiliereId)) {
        return;
      }
    }

    // Scoring basé sur le profil professionnel
    if (params.profil_professionnel) {
      const profilScore = calculateTextSimilarity(params.profil_professionnel, cv.profil)
      score += profilScore * coefficients.profil
      matchDetails.profil = profilScore
    }

    // Scoring basé sur les expériences
    if (params.experiences_cles) {
      const expText = cv.experiences.map((exp) => `${exp.poste} ${exp.description}`).join(" ")
      const expScore = calculateTextSimilarity(params.experiences_cles, expText)
      score += expScore * coefficients.experience
      matchDetails.experiences = expScore
    }

    // Scoring basé sur les compétences
    if (params.competences_techniques) {
      const compText = cv.competences.map((comp) => comp.competences).join(" ")
      const compScore = calculateTextSimilarity(params.competences_techniques, compText)
      score += compScore * coefficients.competences
      matchDetails.competences = compScore
    }

    // Ajouter aux résultats si score > seuil personnalisé
    if (score > thresholds.minimum) {
      results.push({
        cv_id: cv.id,
        similarity: score,
        nom: `${cv.informations_personnelles.prenom} ${cv.informations_personnelles.nom}`,
        details: matchDetails,
        cv_data: cv,
      })
    }
  })

  // Trier par score décroissant et limiter le nombre de résultats
  results.sort((a, b) => b.similarity - a.similarity)
  return results.slice(0, thresholds.maxResults)
}

// Calcul de similarité textuelle simple
function calculateTextSimilarity(query, text) {
  if (!query || !text) return 0

  const queryWords = query.toLowerCase().split(/\s+/)
  const textWords = text.toLowerCase().split(/\s+/)

  let matches = 0
  queryWords.forEach((word) => {
    if (textWords.some((textWord) => textWord.includes(word) || word.includes(textWord))) {
      matches++
    }
  })

  return matches / queryWords.length
}

// Affichage des résultats
function displayResults(results) {
  currentResults = results
  currentPage = 1

  const resultsSection = document.getElementById("resultsSection")
  const resultsCount = document.getElementById("resultsCount")
  const resultsContainer = document.getElementById("resultsContainer")

  resultsSection.style.display = "block"
  resultsCount.textContent = `${results.length} candidat(s) trouvé(s)`

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h4>Aucun résultat trouvé</h4>
        <p>Essayez de modifier vos critères de recherche</p>
      </div>
    `
    return
  }

  renderResultsPage()
  renderPagination()
}

// Rendu d'une page de résultats
function renderResultsPage() {
  const resultsContainer = document.getElementById("resultsContainer")
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const pageResults = currentResults.slice(startIndex, endIndex)

  resultsContainer.innerHTML = pageResults
    .map(
      (result) => `
    <div class="cv-card" onclick="showCVDetails(${result.cv_id})">
      <div class="cv-header">
        <div>
          <div class="cv-name">${result.nom}</div>
          <div class="cv-details">
            <div class="cv-detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${result.cv_data.informations_personnelles.localisation}</span>
            </div>
            <div class="cv-detail-item">
              <i class="fas fa-envelope"></i>
              <span>${result.cv_data.informations_personnelles.email}</span>
            </div>
            ${
              result.cv_data.informations_personnelles.telephone
                ? `
              <div class="cv-detail-item">
                <i class="fas fa-phone"></i>
                <span>${result.cv_data.informations_personnelles.telephone}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>
        <div class="cv-similarity">${Math.round(result.similarity * 100)}% de correspondance</div>
      </div>
      <div class="cv-details">
        <div class="cv-detail-item">
          <i class="fas fa-user-tie"></i>
          <span>${result.cv_data.profil.substring(0, 100)}...</span>
        </div>
        <div class="cv-detail-item">
          <i class="fas fa-briefcase"></i>
          <span>${result.cv_data.experiences[0]?.poste || "N/A"} chez ${result.cv_data.experiences[0]?.entreprise || "N/A"}</span>
        </div>
        <div class="cv-detail-item">
          <i class="fas fa-graduation-cap"></i>
          <span>${result.cv_data.formations[0]?.diplome || "N/A"}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// Rendu de la pagination
function renderPagination() {
  const pagination = document.getElementById("pagination")
  const totalPages = Math.ceil(currentResults.length / resultsPerPage)

  if (totalPages <= 1) {
    pagination.innerHTML = ""
    return
  }

  let paginationHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ""}>
        ${i}
      </button>
    `
  }

  paginationHTML += `
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `

  pagination.innerHTML = paginationHTML
}

// Changement de page
function changePage(page) {
  const totalPages = Math.ceil(currentResults.length / resultsPerPage)
  if (page < 1 || page > totalPages) return

  currentPage = page
  renderResultsPage()
  renderPagination()
}

// Affichage des détails d'un CV
async function showCVDetails(cvId) {
  const modal = document.getElementById("cvModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalBody = document.getElementById("modalBody")

  try {
    // Essayer de récupérer les détails depuis l'API
    const response = await fetchCVDetails(cvId);
    
    if (response.status === 'success') {
      const cv = response.cv;
      const info = cv.informations_personnelles;
      
      modalTitle.textContent = `${info.prenom} ${info.nom}`;
      
      modalBody.innerHTML = generateCVHTML(cv);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Erreur lors du chargement du CV depuis l\'API:', error);
    
    // Fallback vers les données locales
    const cv = testData.cvs.find((c) => c.id === cvId)
    if (!cv) {
      modalBody.innerHTML = '<p>CV non trouvé.</p>';
      return;
    }

    modalTitle.textContent = `${cv.informations_personnelles.prenom} ${cv.informations_personnelles.nom}`
    modalBody.innerHTML = generateCVHTMLLocal(cv);
  }

  modal.style.display = "flex"
  // Ajouter la classe show pour l'animation si nécessaire
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)
}

// Fonction pour générer le HTML du CV (données API)
function generateCVHTML(cv) {
  const info = cv.informations_personnelles;
  
  return `
    <div class="cv-section">
      <h4><i class="fas fa-user"></i> Informations Personnelles</h4>
      <div class="cv-info-grid">
        <div class="cv-info-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${info.localisation || 'Non spécifié'}</span>
        </div>
        <div class="cv-info-item">
          <i class="fas fa-envelope"></i>
          <span>${info.email || 'Non spécifié'}</span>
        </div>
        ${
          info.telephone
            ? `
          <div class="cv-info-item">
            <i class="fas fa-phone"></i>
            <span>${info.telephone}</span>
          </div>
        `
            : ""
        }
        ${
          info.linkedin
            ? `
          <div class="cv-info-item">
            <i class="fab fa-linkedin"></i>
            <span>${info.linkedin}</span>
          </div>
        `
            : ""
        }
        ${
          info.github
            ? `
          <div class="cv-info-item">
            <i class="fab fa-github"></i>
            <span>${info.github}</span>
          </div>
        `
            : ""
        }
      </div>
    </div>

    ${cv.profil ? `
    <div class="cv-section">
      <h4><i class="fas fa-user-tie"></i> Profil</h4>
      <p>${cv.profil}</p>
    </div>
    ` : ''}

    ${cv.formations && cv.formations.length > 0 ? `
    <div class="cv-section">
      <h4><i class="fas fa-graduation-cap"></i> Formations</h4>
      ${cv.formations.map(formation => `
        <div class="cv-item">
          <div class="cv-item-header">
            <strong>${formation.diplome}</strong>
            <span class="dates">${formation.dates}</span>
          </div>
          <div class="cv-item-subtitle">${formation.universite} - ${formation.specialite}</div>
          ${formation.description ? `<p>${formation.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${cv.experiences && cv.experiences.length > 0 ? `
    <div class="cv-section">
      <h4><i class="fas fa-briefcase"></i> Expériences</h4>
      ${cv.experiences.map(exp => `
        <div class="cv-item">
          <div class="cv-item-header">
            <strong>${exp.poste}</strong>
            <span class="dates">${exp.dates}</span>
          </div>
          <div class="cv-item-subtitle">${exp.entreprise} - ${exp.lieu}</div>
          ${exp.description ? `<p>${exp.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${cv.projets && cv.projets.length > 0 ? `
    <div class="cv-section">
      <h4><i class="fas fa-project-diagram"></i> Projets</h4>
      ${cv.projets.map(projet => `
        <div class="cv-item">
          <strong>${projet.nom_projet}</strong>
          ${projet.description ? `<p>${projet.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${cv.certificats && cv.certificats.length > 0 ? `
    <div class="cv-section">
      <h4><i class="fas fa-certificate"></i> Certificats</h4>
      ${cv.certificats.map(cert => `
        <div class="cv-item">
          <strong>${cert.nom_certificat}</strong>
          <div class="cv-item-subtitle">${cert.organisme}</div>
          ${cert.description ? `<p>${cert.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${cv.competences && cv.competences.length > 0 ? `
    <div class="cv-section">
      <h4><i class="fas fa-cogs"></i> Compétences</h4>
      ${cv.competences.map(comp => `
        <div class="cv-item">
          <strong>${comp.categorie}</strong>
          <p>${comp.competences}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${cv.langues && cv.langues.length > 0 ? `
    <div class="cv-section">
      <h4><i class="fas fa-language"></i> Langues</h4>
      <div class="cv-info-grid">
        ${cv.langues.map(langue => `
          <div class="cv-info-item">
            <strong>${langue.nom_langue}</strong>
            <span>${langue.niveau}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;
}

// Fonction pour générer le HTML du CV (données locales - fallback)
function generateCVHTMLLocal(cv) {
  return `
    <div class="cv-section">
      <h4><i class="fas fa-user"></i> Informations Personnelles</h4>
      <div class="cv-info-grid">
        <div class="cv-info-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${cv.informations_personnelles.localisation}</span>
        </div>
        <div class="cv-info-item">
          <i class="fas fa-envelope"></i>
          <span>${cv.informations_personnelles.email}</span>
        </div>
        ${
          cv.informations_personnelles.telephone
            ? `
          <div class="cv-info-item">
            <i class="fas fa-phone"></i>
            <span>${cv.informations_personnelles.telephone}</span>
          </div>
        `
            : ""
        }
        ${
          cv.informations_personnelles.linkedin
            ? `
          <div class="cv-info-item">
            <i class="fab fa-linkedin"></i>
            <span>${cv.informations_personnelles.linkedin}</span>
          </div>
        `
            : ""
        }
        ${
          cv.informations_personnelles.github
            ? `
          <div class="cv-info-item">
            <i class="fab fa-github"></i>
            <span>${cv.informations_personnelles.github}</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
    
    <div class="cv-section">
      <h4><i class="fas fa-user-tie"></i> Profil Professionnel</h4>
      <p>${cv.profil}</p>
    </div>
    
    <div class="cv-section">
      <h4><i class="fas fa-briefcase"></i> Expériences Professionnelles</h4>
      ${cv.experiences
        .map(
          (exp) => `
        <div class="experience-item">
          <h5>${exp.poste}</h5>
          <div class="experience-meta">
            <strong>${exp.entreprise}</strong> • ${exp.lieu} • ${exp.dates}
          </div>
          <p>${exp.description}</p>
        </div>
      `
        )
        .join("")}
    </div>
    
    <div class="cv-section">
      <h4><i class="fas fa-graduation-cap"></i> Formations</h4>
      ${cv.formations
        .map(
          (form) => `
        <div class="formation-item">
          <h5>${form.diplome}</h5>
          <div class="formation-meta">
            <strong>${form.universite}</strong> • ${form.specialite} • ${form.dates}
          </div>
          <p>${form.description}</p>
        </div>
      `
        )
        .join("")}
    </div>
    
    ${
      cv.projets.length > 0
        ? `
      <div class="cv-section">
        <h4><i class="fas fa-project-diagram"></i> Projets</h4>
        ${cv.projets
          .map(
            (projet) => `
          <div class="project-item">
            <h5>${projet.nom_projet}</h5>
            <p>${projet.description}</p>
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }
    
    ${
      cv.certificats.length > 0
        ? `
      <div class="cv-section">
        <h4><i class="fas fa-certificate"></i> Certifications</h4>
        ${cv.certificats
          .map(
            (cert) => `
          <div class="project-item">
            <h5>${cert.nom_certificat}</h5>
            <div class="formation-meta"><strong>${cert.organisme}</strong></div>
            <p>${cert.description}</p>
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }
    
    <div class="cv-section">
      <h4><i class="fas fa-cogs"></i> Compétences</h4>
      ${cv.competences
        .map(
          (comp) => `
        <div style="margin-bottom: 1rem;">
          <h5 style="color: #667eea; margin-bottom: 0.5rem;">${comp.categorie}</h5>
          <div class="competence-tags">
            ${comp.competences
              .split(",")
              .map(
                (skill) => `
              <span class="competence-tag">${skill.trim()}</span>
            `
              )
              .join("")}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    
    <div class="cv-section">
      <h4><i class="fas fa-language"></i> Langues</h4>
      <div class="cv-info-grid">
        ${cv.langues
          .map(
            (langue) => `
          <div class="cv-info-item">
            <i class="fas fa-globe"></i>
            <span>${langue.nom_langue} - ${langue.niveau}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

// Fermeture de la modal
function closeModal() {
  const modal = document.getElementById("cvModal")
  if (modal) {
    modal.classList.remove("show")
    modal.style.display = "none"
    console.log("Modal fermée")
  }
}

// Toggle des filtres avancés
function toggleAdvancedFilters() {
  const filters = document.getElementById("advancedFilters")
  filters.classList.toggle("show")
}

// Effacer le formulaire
function clearForm() {
  document.getElementById("candidateSearchForm").reset()
  document.getElementById("resultsSection").style.display = "none"
}

// Affichage du loading
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay")
  if (show) {
    overlay.classList.add("show")
  } else {
    overlay.classList.remove("show")
  }
}

// Export des résultats (simulation)
function exportResults() {
  if (currentResults.length === 0) {
    alert("Aucun résultat à exporter")
    return
  }

  const csvContent = generateCSV(currentResults)
  downloadCSV(csvContent, "resultats_recherche_cv.csv")
}

// Génération du CSV
function generateCSV(results) {
  const headers = ["Nom", "Email", "Localisation", "Score", "Profil"]
  const rows = results.map((result) => [
    result.nom,
    result.cv_data.informations_personnelles.email,
    result.cv_data.informations_personnelles.localisation,
    Math.round(result.similarity * 100) + "%",
    result.cv_data.profil.substring(0, 100) + "...",
  ])

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

// Téléchargement du CSV
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Sauvegarde de la recherche (simulation)
function saveSearch() {
  alert("Fonctionnalité de sauvegarde à implémenter")
}

// Autocomplete dropdown logic for profil_professionnel
const profilInput = document.getElementById('profil_professionnel');
const suggestionsBox = document.getElementById('profil_professionnel_suggestions');
let currentSuggestions = [];
let activeSuggestionIndex = -1;

profilInput.addEventListener('input', async function(e) {
  const query = e.target.value;
  if (query.length > 1) {
    const suggestions = await fetchSuggestions(query, 'profile', 10);
    currentSuggestions = suggestions;
    renderSuggestions(suggestions);
  } else {
    hideSuggestions();
  }
});

profilInput.addEventListener('keydown', function(e) {
  if (!suggestionsBox.style.display || suggestionsBox.style.display === 'none') return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (activeSuggestionIndex < currentSuggestions.length - 1) {
      activeSuggestionIndex++;
      updateActiveSuggestion();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (activeSuggestionIndex > 0) {
      activeSuggestionIndex--;
      updateActiveSuggestion();
    }
  } else if (e.key === 'Enter') {
    if (activeSuggestionIndex >= 0 && activeSuggestionIndex < currentSuggestions.length) {
      e.preventDefault();
      selectSuggestion(activeSuggestionIndex);
    }
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
});

document.addEventListener('click', function(e) {
  if (!suggestionsBox.contains(e.target) && e.target !== profilInput) {
    hideSuggestions();
  }
});

function renderSuggestions(suggestions) {
  suggestionsBox.innerHTML = '';
  activeSuggestionIndex = -1;
  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }
  suggestionsBox.style.display = 'block';
  suggestions.forEach((suggestion, idx) => {
    const div = document.createElement('div');
    div.className = 'autocomplete-suggestion';
    div.textContent = suggestion;
    div.addEventListener('mousedown', function(e) {
      // Use mousedown instead of click to avoid input blur before event
      selectSuggestion(idx);
    });
    suggestionsBox.appendChild(div);
  });
  positionSuggestionsBox();
}

function updateActiveSuggestion() {
  const items = suggestionsBox.querySelectorAll('.autocomplete-suggestion');
  items.forEach((item, idx) => {
    item.classList.toggle('active', idx === activeSuggestionIndex);
  });
}

function selectSuggestion(idx) {
  if (idx >= 0 && idx < currentSuggestions.length) {
    profilInput.value = currentSuggestions[idx];
    hideSuggestions();
    profilInput.dispatchEvent(new Event('input'));
  }
}

function hideSuggestions() {
  suggestionsBox.style.display = 'none';
  suggestionsBox.innerHTML = '';
  activeSuggestionIndex = -1;
}

function positionSuggestionsBox() {
  // Optionally, adjust position if needed (for now, CSS absolute should suffice)
}
