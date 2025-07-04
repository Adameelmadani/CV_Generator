// Variables globales
let currentForm = "login"; // 'login' ou 'signup'

// Vérifier s'il y a des paramètres d'erreur dans l'URL
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const message = urlParams.get("message");

  if (error && message) {
    showAlert("error", decodeURIComponent(message), "login");
    // Nettoyer l'URL
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }
});

// Fonction pour basculer entre les formulaires
function toggleForm() {
  const formContent = document.getElementById("formContent");

  if (currentForm === "login") {
    formContent.classList.add("show-signup");
    currentForm = "signup";
  } else {
    formContent.classList.remove("show-signup");
    currentForm = "login";
  }

  // Réinitialiser les alertes
  hideAllAlerts();
}

// Fonction pour afficher les alertes
function showAlert(type, message, formType) {
  const alertElement = document.getElementById(formType + "Alert");
  alertElement.className = "alert " + type;
  alertElement.textContent = message;
  alertElement.style.display = "block";

  // Masquer l'alerte après 5 secondes
  setTimeout(() => {
    alertElement.style.display = "none";
  }, 5000);
}

// Fonction pour masquer toutes les alertes
function hideAllAlerts() {
  document.getElementById("loginAlert").style.display = "none";
  document.getElementById("signupAlert").style.display = "none";
}

// Fonction pour afficher/masquer le loading
function toggleLoading(formType, show) {
  const loadingElement = document.getElementById(formType + "Loading");
  const btnElement = document.getElementById(formType + "Btn");

  if (show) {
    loadingElement.style.display = "block";
    btnElement.style.display = "none";
  } else {
    loadingElement.style.display = "none";
    btnElement.style.display = "block";
  }
}

// Gestionnaire pour le formulaire de connexion
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    toggleLoading("login", true);
    hideAllAlerts();

    try {
      const response = await fetch("login_handler_mvc.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {        showAlert(
          "success",
          result.message || "Connexion réussie ! Redirection...",
          "login"
        );
        setTimeout(() => {
          window.location.href = result.redirect || '../Cv_generator/user_home.html';
        }, 1500);
      } else {
        showAlert(
          "error",
          result.message || "Email ou mot de passe incorrect.",
          "login"
        );
        if (
          result.redirect &&
          result.redirect !== window.location.pathname
        ) {
          setTimeout(() => {
            window.location.href =
              result.redirect +
              "?error=1&message=" +
              encodeURIComponent(result.message);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(
        "error",
        "Erreur de connexion. Veuillez réessayer.",
        "login"
      );
    } finally {
      toggleLoading("login", false);
    }
  });

// Gestionnaire pour le formulaire d'inscription
document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validation côté client pour le username
    const username = document.getElementById("signup_username").value.trim();
    if (username.length < 3 || username.length > 30) {
      showAlert("error", "Le nom d'utilisateur doit contenir entre 3 et 30 caractères.", "signup");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showAlert("error", "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores.", "signup");
      return;
    }

    const formData = new FormData(this);
    toggleLoading("signup", true);
    hideAllAlerts();

    try {
      const response = await fetch("signup_handler_mvc.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {        showAlert(
          "success",
          result.message || "Inscription réussie ! Redirection...",
          "signup"
        );
        setTimeout(() => {
          window.location.href = result.redirect || '../Cv_generator/user_home.html';
        }, 1500);
      } else {
        showAlert(
          "error",
          result.message || "Erreur lors de l'inscription.",
          "signup"
        );
        if (
          result.redirect &&
          result.redirect !== window.location.pathname
        ) {
          setTimeout(() => {
            window.location.href =
              result.redirect +
              "?error=1&message=" +
              encodeURIComponent(result.message);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(
        "error",
        "Erreur de connexion. Veuillez réessayer.",
        "signup"
      );
    } finally {
      toggleLoading("signup", false);
    }
  });

// Validation en temps réel
document
  .getElementById("signup_password")
  .addEventListener("input", function () {
    const password = this.value;
    if (password.length > 0 && password.length < 6) {
      this.style.borderColor = "#dc3545";
    } else {
      this.style.borderColor = "#e1e5e9";
    }
  });

// Validation email en temps réel
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

document
  .getElementById("login_email")
  .addEventListener("blur", function () {
    if (this.value && !validateEmail(this.value)) {
      this.style.borderColor = "#dc3545";
    } else {
      this.style.borderColor = "#e1e5e9";
    }
  });

document
  .getElementById("signup_email")
  .addEventListener("blur", function () {
    if (this.value && !validateEmail(this.value)) {
      this.style.borderColor = "#dc3545";
    } else {
      this.style.borderColor = "#e1e5e9";
    }
  });

// Validation en temps réel pour le champ username
document.addEventListener("DOMContentLoaded", function() {
  const usernameInput = document.getElementById("signup_username");
  if (usernameInput) {
    usernameInput.addEventListener("input", function() {
      const username = this.value.trim();
      const helpText = this.nextElementSibling;
      
      // Reset styles
      this.style.borderColor = "";
      helpText.style.color = "";
      
      if (username.length > 0) {
        if (username.length < 3) {
          this.style.borderColor = "#dc3545";
          helpText.style.color = "#dc3545";
          helpText.textContent = "Trop court (minimum 3 caractères)";
        } else if (username.length > 30) {
          this.style.borderColor = "#dc3545";
          helpText.style.color = "#dc3545";
          helpText.textContent = "Trop long (maximum 30 caractères)";
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          this.style.borderColor = "#dc3545";
          helpText.style.color = "#dc3545";
          helpText.textContent = "Caractères non autorisés (lettres, chiffres et _ uniquement)";
        } else {
          this.style.borderColor = "#28a745";
          helpText.style.color = "#28a745";
          helpText.textContent = "Nom d'utilisateur valide ✓";
        }
      } else {
        helpText.textContent = "3-30 caractères, lettres, chiffres et _ uniquement";
      }
    });
  }
});