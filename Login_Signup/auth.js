// Données des filières (will be loaded from API)
let filieres = [];

// Initialiser la page
document.addEventListener("DOMContentLoaded", function () {
  loadFilieres();
  setupEventListeners();
  setupNameValidation();
  setupRHDisplay();
});

// Charger les filières dans le select
async function loadFilieres() {
  try {
    const response = await fetch("filieres_mvc.php?action=getAllFilieres");
    const result = await response.json();
    
    if (result.status === "success") {
      filieres = result.filieres;
      const select = document.getElementById("signup_filiere");
      if (select) {
        // Clear existing options except the default one
        select.innerHTML = '<option value="">Sélectionnez votre filière</option>';
        
        filieres.forEach((filiere) => {
          const option = document.createElement("option");
          option.value = filiere.id;
          option.textContent = filiere.nom;
          select.appendChild(option);
        });
      }
    } else {
      console.error("Error loading filieres:", result.message);
    }
  } catch (error) {
    console.error("Error fetching filieres:", error);
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
  console.log("Login form submitted");

  const btn = document.getElementById("loginBtn");
  const loading = document.getElementById("loginLoading");

  if (btn) btn.style.display = "none";
  if (loading) loading.classList.add("show");

  const formData = new FormData(e.target);
  console.log("Form data prepared for login");

  try {
    const response = await fetch("login_handler_mvc.php", {
      method: "POST",
      body: formData,
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Login response:", result);

    if (result.status === "success") {
      showAlert("loginAlert", result.message, "success");
      // Add debug logging
      console.log("Login successful, redirecting to:", result.redirect);
      
      // Try immediate redirect first, then fallback to delayed redirect
      try {
        window.location.href = result.redirect;
      } catch (redirectError) {
        console.error("Direct redirect failed, trying delayed redirect:", redirectError);
        setTimeout(() => {
          console.log("Executing delayed redirect...");
          try {
            window.location.href = result.redirect;
          } catch (delayedRedirectError) {
            console.error("Delayed redirect also failed:", delayedRedirectError);
            // Last resort: try window.location.replace
            window.location.replace(result.redirect);
          }
        }, 500);
      }
    } else {
      showAlert("loginAlert", result.message, "error");
    }
  } catch (error) {
    console.error("Login error:", error);
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
      // Try immediate redirect first, then fallback to delayed redirect
      try {
        window.location.href = result.redirect;
      } catch (redirectError) {
        console.error("Direct redirect failed, trying delayed redirect:", redirectError);
        setTimeout(() => {
          try {
            window.location.href = result.redirect;
          } catch (delayedRedirectError) {
            console.error("Delayed redirect also failed:", delayedRedirectError);
            // Last resort: try window.location.replace
            window.location.replace(result.redirect);
          }
        }, 500);
      }
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

// RH Login
const rhLoginForm = document.getElementById('rhLoginForm');
const rhLoginBtn = document.getElementById('rhLoginBtn');
const rhLoginLoading = document.getElementById('rhLoginLoading');
const rhAlert = document.getElementById('rhAlert');

if (rhLoginForm) {
  rhLoginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log("RH Login form submitted");

    rhAlert.textContent = '';
    rhLoginBtn.disabled = true;
    rhLoginLoading.style.display = 'block';

    const formData = new FormData(rhLoginForm);
    
    try {
      const response = await fetch('rh_login_handler_mvc.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("RH Login response:", data);

      if (data.success) {
        showAlert("rhAlert", data.message, "success");
        console.log("RH Login successful, redirecting to:", data.redirect);
        
        // Redirection avec fallback
        try {
          window.location.href = data.redirect;
        } catch (redirectError) {
          console.error("Direct redirect failed, trying delayed redirect:", redirectError);
          setTimeout(() => {
            try {
              window.location.href = data.redirect;
            } catch (delayedRedirectError) {
              console.error("Delayed redirect also failed:", delayedRedirectError);
              window.location.replace(data.redirect);
            }
          }, 500);
        }
      } else {
        showAlert("rhAlert", data.message, "error");
      }
    } catch (error) {
      console.error("RH Login error:", error);
      showAlert("rhAlert", "Erreur de connexion RH. Veuillez réessayer.", "error");
    } finally {
      rhLoginBtn.disabled = false;
      rhLoginLoading.style.display = 'none';
    }
  });
}

// Configuration de l'affichage RH
function setupRHDisplay() {
  // Vérifier si on arrive avec le hash RH
  if (window.location.hash === "#rhLoginForm") {
    showRHSection();
  }
  
  // Écouter les changements de hash
  window.addEventListener('hashchange', function() {
    if (window.location.hash === "#rhLoginForm") {
      showRHSection();
    } else {
      hideRHSection();
    }
  });
}

// Afficher la section RH
function showRHSection() {
  const rhSection = document.querySelector('.form-section.rh-section');
  const loginSection = document.querySelector('.login-section');
  const signupSection = document.querySelector('.signup-section');
  
  if (rhSection) {
    // Masquer les autres sections
    if (loginSection) loginSection.classList.remove('active');
    if (signupSection) signupSection.classList.remove('active');
    
    // Afficher la section RH
    rhSection.classList.add('show-rh');
    rhSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Réinitialiser les alertes
    hideAlert("loginAlert");
    hideAlert("signupAlert");
    hideAlert("rhAlert");
  }
}

// Masquer la section RH
function hideRHSection() {
  const rhSection = document.querySelector('.form-section.rh-section');
  if (rhSection) {
    rhSection.classList.remove('show-rh');
  }
}

// Basculer vers la section RH
function toggleToRH() {
  window.location.hash = "#rhLoginForm";
  showRHSection();
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