// Données des filières
const filieres = [
        {
          id: 1,
          nom: "Génie Mécanique",
          description:
            "Conception, fabrication, et maintenance de systèmes mécaniques. Travaille sur les moteurs, les structures mécaniques, la thermodynamique et la résistance des matériaux.",
        },
        {
          id: 2,
          nom: "Génie Industriel",
          description:
            "Optimisation des systèmes de production, logistique, qualité, organisation et performance des processus industriels.",
        },
        {
          id: 3,
          nom: "Génie Électrique",
          description:
            "Étude et application de l'électricité, des circuits électriques, des systèmes de puissance et de l'électronique de puissance.",
        },
        {
          id: 4,
          nom: "Génie Électromécanique",
          description:
            "Filière hybride combinant les systèmes mécaniques et électriques (automatisme, moteurs, maintenance intégrée), avec une forte orientation technique sur les machines.",
        },
        {
          id: 5,
          nom: "Génie Civil",
          description:
            "Conception, construction et gestion d'infrastructures : bâtiments, ponts, routes, barrages, structures métalliques et en béton.",
        },
        {
          id: 6,
          nom: "Architecture",
          description:
            "Art et science de la conception des bâtiments et de l'environnement bâti. Inclut design, urbanisme, patrimoine, avec une formation artistique poussée.",
        },
        {
          id: 7,
          nom: "Informatique & Numérique",
          description:
            "Programmation, systèmes d'exploitation, réseaux, cybersécurité, génie logiciel, administration des systèmes et technologies web.",
        },
        {
          id: 8,
          nom: "Intelligence Artificielle & Data Science",
          description:
            "Traitement des données massives, apprentissage automatique, vision par ordinateur, modélisation prédictive, traitement du langage naturel.",
        },
        {
          id: 9,
          nom: "Génie Chimique & Procédés",
          description:
            "Transformation de la matière et de l'énergie à l'échelle industrielle. Inclut réacteurs chimiques, cinétique, thermodynamique appliquée.",
        },
        {
          id: 10,
          nom: "Énergies & Environnement",
          description:
            "Production, gestion énergétique (renouvelable ou non), traitement des déchets, de l'air, de l'eau, durabilité.",
        },
        {
          id: 11,
          nom: "Télécommunications & Électronique",
          description:
            "Transmission de données, réseaux sans fil, antennes, fibres optiques, traitement du signal, capteurs.",
        },
        {
          id: 12,
          nom: "Mathématiques Appliquées & Modélisation",
          description:
            "Modélisation mathématique de systèmes complexes, simulations numériques, optimisation, finance quantitative.",
        },
        {
          id: 13,
          nom: "Économie & Gestion Appliquée",
          description:
            "Analyse des systèmes économiques, finance, logistique, stratégie, audit, marketing analytique.",
        },
        {
          id: 14,
          nom: "Génie Biomédical",
          description:
            "Application de l'ingénierie au domaine médical : appareils médicaux, imagerie, prothèses, interfaces homme-machine.",
        },
        {
          id: 15,
          nom: "Génie Maritime",
          description:
            "Ingénierie navale : construction navale, logistique maritime, mécanique marine, transport international.",
        },
        {
          id: 16,
          nom: "Aéronautique",
          description:
            "Conception et maintenance des systèmes aéronautiques : moteurs, structures, aérodynamique, contrôle de vol.",
        },
        {
          id: 17,
          nom: "Agroalimentaire",
          description:
            "Transformation industrielle des produits agricoles : sécurité alimentaire, nutrition, biotechnologie alimentaire.",
        },
        {
          id: 18,
          nom: "Textile & Matériaux",
          description:
            "Conception de textiles techniques, polymères, matériaux composites à usage industriel, biomédical ou technologique.",
        },
        {
          id: 19,
          nom: "Sciences de la Vie & de la Terre",
          description:
            "Biologie, géologie, écologie, biochimie, microbiologie, recherche environnementale.",
        },
        {
          id: 20,
          nom: "Sciences Cognitives & Interdisciplinaires",
          description:
            "Étude de l'intelligence humaine et artificielle : psychologie cognitive, neurosciences, interfaces cerveau-machine.",
        },
        {
          id: 21,
          nom: "Médecine",
          description:
            "Études médicales classiques : soins aux patients, diagnostic, pathologies, pharmacologie, chirurgie.",
        },
        {
          id: 22,
          nom: "Ingénierie Multimédia & Technologies Interactives",
          description:
            "Création de contenus numériques, jeux vidéo, réalité virtuelle/augmentée, design interactif.",
        },
        {
          id: 23,
          nom: "Génie Juridique & Droit des Technologies",
          description:
            "Droit numérique, cybersécurité juridique, RGPD, propriété intellectuelle.",
        },
        {
          id: 24,
          nom: "Géomatique & SIG",
          description:
            "Traitement de données spatiales : cartographie, GPS, images satellites, SIG.",
        },
        {
          id: 25,
          nom: "Sciences Spatiales & Aérospatiales",
          description:
            "Technologie des satellites, propulsion spatiale, orbites, capteurs embarqués.",
        },
        {
          id: 26,
          nom: "Sciences de l'Éducation & Ingénierie Pédagogique",
          description:
            "Conception de dispositifs d'apprentissage, neurosciences éducatives, e-learning.",
        },
        {
          id: 27,
          nom: "Sécurité Industrielle & Gestion des Risques",
          description:
            "Analyse des dangers, gestion de crise, prévention industrielle et environnementale.",
        },
        {
          id: 28,
          nom: "Pharmacie Industrielle & Biotechnologies",
          description:
            "Production de médicaments, bioprocédés, génie pharmaceutique, vaccins.",
        },
        {
          id: 29,
          nom: "Actuariat & Ingénierie Financière",
          description:
            "Mathématiques de l'assurance, modélisation des risques, statistiques financières.",
        },
        {
          id: 30,
          nom: "Diplomatie & Relations Techno-stratégiques",
          description:
            "Géopolitique de l'innovation, coopération technologique, cybersécurité internationale.",
        },
      ];

// Initialiser la page
document.addEventListener("DOMContentLoaded", function () {
  loadFilieres();
  setupEventListeners();
  setupNameValidation();
});

// Charger les filières dans le select
function loadFilieres() {
  const select = document.getElementById("signup_filiere");
  if (select) {
    filieres.forEach((filiere) => {
      const option = document.createElement("option");
      option.value = filiere.id;
      option.textContent = filiere.nom;
      select.appendChild(option);
    });
  }
}

// Configuration des événements
function setupEventListeners() {
  // Événement pour afficher la description de la filière
  const filiereSelect = document.getElementById("signup_filiere");
  if (filiereSelect) {
    filiereSelect.addEventListener("change", function () {
      const selectedId = parseInt(this.value);
      const descriptionDiv = document.getElementById("filiereDescription");

      if (selectedId && descriptionDiv) {
        const filiere = filieres.find((f) => f.id === selectedId);
        if (filiere) {
          descriptionDiv.innerHTML = `<strong>${filiere.nom}</strong><br>${filiere.description}`;
          descriptionDiv.classList.add("show");
        }
      } else if (descriptionDiv) {
        descriptionDiv.classList.remove("show");
      }
    });
  }

  // Événements pour les formulaires
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
  
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
}

// Validation en temps réel pour les champs nom et prénom
function setupNameValidation() {
  const nomInput = document.getElementById("signup_nom");
  const prenomInput = document.getElementById("signup_prenom");
  
  if (nomInput) {
    nomInput.addEventListener("input", function() {
      const nom = this.value.trim();
      const helpText = this.nextElementSibling;
      
      // Reset styles
      this.style.borderColor = "";
      if (helpText) {
        helpText.style.color = "";
      }
      
      if (nom.length > 0) {
        if (nom.length < 2) {
          this.style.borderColor = "#dc3545";
          if (helpText) {
            helpText.style.color = "#dc3545";
            helpText.textContent = "Trop court (minimum 2 caractères)";
          }
        } else if (nom.length > 255) {
          this.style.borderColor = "#dc3545";
          if (helpText) {
            helpText.style.color = "#dc3545";
            helpText.textContent = "Trop long (maximum 255 caractères)";
          }
        } else {
          this.style.borderColor = "#28a745";
          if (helpText) {
            helpText.style.color = "#28a745";
            helpText.textContent = "Nom valide ✓";
          }
        }
      } else {
        if (helpText) {
          helpText.textContent = "Votre nom de famille";
        }
      }
    });
  }
  
  if (prenomInput) {
    prenomInput.addEventListener("input", function() {
      const prenom = this.value.trim();
      const helpText = this.nextElementSibling;
      
      // Reset styles
      this.style.borderColor = "";
      if (helpText) {
        helpText.style.color = "";
      }
      
      if (prenom.length > 0) {
        if (prenom.length < 2) {
          this.style.borderColor = "#dc3545";
          if (helpText) {
            helpText.style.color = "#dc3545";
            helpText.textContent = "Trop court (minimum 2 caractères)";
          }
        } else if (prenom.length > 255) {
          this.style.borderColor = "#dc3545";
          if (helpText) {
            helpText.style.color = "#dc3545";
            helpText.textContent = "Trop long (maximum 255 caractères)";
          }
        } else {
          this.style.borderColor = "#28a745";
          if (helpText) {
            helpText.style.color = "#28a745";
            helpText.textContent = "Prénom valide ✓";
          }
        }
      } else {
        if (helpText) {
          helpText.textContent = "Votre prénom";
        }
      }
    });
  }
}

// Basculer entre login et signup - This is the key function for the "S'inscrire" button
function toggleForm() {
  const loginSection = document.querySelector(".login-section");
  const signupSection = document.querySelector(".signup-section");

  if (loginSection && signupSection) {
    if (loginSection.classList.contains("active")) {
      loginSection.classList.remove("active");
      signupSection.classList.add("active");
    } else {
      signupSection.classList.remove("active");
      loginSection.classList.add("active");
    }

    // Réinitialiser les alertes
    hideAlert("loginAlert");
    hideAlert("signupAlert");
  }
}

// Gestion de la connexion
async function handleLogin(e) {
  e.preventDefault();

  const btn = document.getElementById("loginBtn");
  const loading = document.getElementById("loginLoading");

  if (btn) btn.style.display = "none";
  if (loading) loading.classList.add("show");

  const formData = new FormData(e.target);

  try {
    const response = await fetch("login_handler_mvc.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      showAlert("loginAlert", result.message, "success");
      setTimeout(() => {
        window.location.href = result.redirect;
      }, 1500);
    } else {
      showAlert("loginAlert", result.message, "error");
    }
  } catch (error) {
    showAlert("loginAlert", "Erreur de connexion. Veuillez réessayer.", "error");
  } finally {
    if (btn) btn.style.display = "block";
    if (loading) loading.classList.remove("show");
  }
}

// Gestion de l'inscription
async function handleSignup(e) {
  e.preventDefault();

  // Validation côté client pour nom et prenom
  const nom = document.getElementById("signup_nom").value.trim();
  const prenom = document.getElementById("signup_prenom").value.trim();

  if (nom.length < 2 || nom.length > 255) {
    showAlert("signupAlert", "Le nom doit contenir entre 2 et 255 caractères.", "error");
    return;
  }

  if (prenom.length < 2 || prenom.length > 255) {
    showAlert("signupAlert", "Le prénom doit contenir entre 2 et 255 caractères.", "error");
    return;
  }

  const btn = document.getElementById("signupBtn");
  const loading = document.getElementById("signupLoading");

  if (btn) btn.style.display = "none";
  if (loading) loading.classList.add("show");

  const formData = new FormData(e.target);

  try {
    const response = await fetch("signup_handler_mvc.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      showAlert("signupAlert", result.message, "success");
      setTimeout(() => {
        window.location.href = result.redirect;
      }, 1500);
    } else {
      showAlert("signupAlert", result.message, "error");
    }
  } catch (error) {
    showAlert("signupAlert", "Erreur lors de l'inscription. Veuillez réessayer.", "error");
  } finally {
    if (btn) btn.style.display = "block";
    if (loading) loading.classList.remove("show");
  }
}

// Afficher une alerte
function showAlert(alertId, message, type) {
  const alert = document.getElementById(alertId);
  if (alert) {
    alert.textContent = message;
    alert.className = `alert ${type} show`;
  }
}

// Masquer une alerte
function hideAlert(alertId) {
  const alert = document.getElementById(alertId);
  if (alert) {
    alert.classList.remove("show");
  }
}
