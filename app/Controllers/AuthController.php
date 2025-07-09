<?php

require_once __DIR__ . '/../../core/Controller.php';
require_once __DIR__ . '/../Models/User.php';

class AuthController extends Controller {
    private $userModel;
    
    public function __construct() {
        parent::__construct();
        $this->userModel = new User();
    }
    
    public function signup() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Méthode non autorisée'
            ], 405);
            return;
        }
        
        try {
            // Récupérer et nettoyer les données
            $nom = trim($_POST['signup_nom'] ?? '');
            $prenom = trim($_POST['signup_prenom'] ?? '');
            $email = trim($_POST['signup_email'] ?? '');
            $password = $_POST['signup_password'] ?? '';
            $telephone = trim($_POST['signup_tel'] ?? '');
            $filiereId = !empty($_POST['signup_filiere']) ? intval($_POST['signup_filiere']) : null;
            
            // Validation des données
            $errors = [];
            
            // Valider le nom
            $nomErrors = $this->userModel->validateNom($nom);
            $errors = array_merge($errors, $nomErrors);
            
            // Valider le prénom
            $prenomErrors = $this->userModel->validatePrenom($prenom);
            $errors = array_merge($errors, $prenomErrors);
            
            // Valider l'email
            $emailErrors = $this->userModel->validateEmail($email);
            $errors = array_merge($errors, $emailErrors);
            
            // Valider le mot de passe
            $passwordErrors = $this->userModel->validatePassword($password);
            $errors = array_merge($errors, $passwordErrors);
            
            // Valider le téléphone
            if (empty($telephone)) {
                $errors[] = 'Le numéro de téléphone est requis.';
            }
            
            // Si des erreurs de validation, les retourner
            if (!empty($errors)) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => implode(' ', $errors)
                ], 400);
                return;
            }
            
            // Vérifier l'unicité de l'email
            $existingUser = $this->userModel->findByEmail($email);
            
            if ($existingUser) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => "L'email est déjà utilisé."
                ], 409);
                return;
            }
            
            // Hasher le mot de passe
            $hashedPassword = $this->userModel->hashPassword($password);
            
            // Créer l'utilisateur
            $userId = $this->userModel->createUser($nom, $prenom, $email, $hashedPassword, $telephone, $filiereId);
            
            // Créer la session
            $this->session['userId'] = $userId;
            $this->session['userEmail'] = $email;
            $this->session['nom'] = $nom;
            $this->session['prenom'] = $prenom;
            $this->session['userTel'] = $telephone;
            $this->session['filiereId'] = $filiereId;
            $this->session['loginTime'] = time(); // Add login timestamp
            
            // Regenerate session ID for security
            session_regenerate_id(true);
            
            $this->jsonResponse([
                'status' => 'success',
                'message' => 'Inscription réussie !',
                'redirect' => '../Cv_generator/user_home.html'
            ]);
            
        } catch (Exception $e) {
            error_log("Erreur lors de l'inscription : " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Erreur serveur. Veuillez réessayer.'
            ], 500);
        }
    }
    
    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Méthode non autorisée'
            ], 405);
            return;
        }
        
        try {
            $email = trim($_POST['login_email'] ?? '');
            $password = $_POST['login_password'] ?? '';
            
            // Validation des données
            if (empty($email) || empty($password)) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Email et mot de passe requis'
                ], 400);
                return;
            }
            
            // Rechercher l'utilisateur
            $user = $this->userModel->findByEmail($email);
            
            if (!$user || !$this->userModel->verifyPassword($password, $user['mot_de_passe_hash'])) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Email ou mot de passe incorrect.'
                ], 401);
                return;
            }
            
            // Créer la session
            $this->session['userId'] = $user['id'];
            $this->session['userEmail'] = $user['email'];
            $this->session['nom'] = $user['nom'];
            $this->session['prenom'] = $user['prenom'];
            $this->session['userTel'] = $user['numero_telephone'];
            $this->session['filiereId'] = $user['id_filiere'];
            $this->session['loginTime'] = time(); // Add login timestamp
            
            // Regenerate session ID for security
            session_regenerate_id(true);
            
            $this->jsonResponse([
                'status' => 'success',
                'message' => 'Connexion réussie !',
                'redirect' => '../Cv_generator/user_home.html'
            ]);
            
        } catch (Exception $e) {
            error_log("Erreur lors de la connexion : " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Erreur serveur. Veuillez réessayer.'
            ], 500);
        }
    }
    
    public function checkSession() {
        try {
            if (!isset($this->session['userId']) || empty($this->session['userId'])) {
                $this->jsonResponse([
                    'status' => 'error',
                    'logged_in' => false,
                    'message' => 'Non authentifié'
                ]);
                return;
            }
            
            // Check session timeout (optional - 24 hours)
            if (isset($this->session['loginTime'])) {
                $sessionTimeout = 24 * 60 * 60; // 24 hours in seconds
                if (time() - $this->session['loginTime'] > $sessionTimeout) {
                    session_unset();
                    session_destroy();
                    $this->jsonResponse([
                        'status' => 'error',
                        'logged_in' => false,
                        'message' => 'Session expirée'
                    ]);
                    return;
                }
            }
            
            // Récupérer les informations utilisateur depuis la base de données
            $user = $this->userModel->getUserById($this->session['userId']);
            
            if (!$user) {
                // Utilisateur introuvable en base, détruire la session
                session_unset();
                session_destroy();
                $this->jsonResponse([
                    'status' => 'error',
                    'logged_in' => false,
                    'message' => 'Session invalide'
                ]);
                return;
            }
            
            // Construire le nom d'affichage
            $displayName = trim($user['prenom'] . ' ' . $user['nom']);
            if (empty($displayName)) {
                $displayName = 'Utilisateur';
            }
            
            $this->jsonResponse([
                'status' => 'success',
                'logged_in' => true,
                'user_id' => $this->session['userId'],
                'user_email' => $user['email'],
                'user_tel' => $user['numero_telephone'], // Fixed field name
                'username' => $displayName, // Use full name as username
                'nom' => $user['nom'],
                'prenom' => $user['prenom'],
                'filiere_id' => $user['id_filiere'],
                'session_id' => session_id(),
                'login_time' => $this->session['loginTime'] ?? null
            ]);
            
        } catch (Exception $e) {
            error_log("Erreur lors de la vérification de session : " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'logged_in' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }
    }
    
    public function logout() {
        try {
            // Clear all session data
            session_unset();
            session_destroy();
            
            // Also clear the session cookie
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            $this->jsonResponse([
                'status' => 'success',
                'message' => 'Déconnexion réussie',
                'redirect' => '../Cv_generator/Login_Signup/auth.html'
            ]);
        } catch (Exception $e) {
            error_log("Erreur lors de la déconnexion : " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Erreur lors de la déconnexion'
            ], 500);
        }
    }
    
    public function resetPassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Méthode non autorisée'
            ], 405);
            return;
        }
        
        try {
            // Récupérer et valider les données
            $email = trim($_POST['email'] ?? '');
            $phone = trim($_POST['tel'] ?? '');
            
            // Validation basique
            if (empty($email) || empty($phone)) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Champs email et téléphone requis'
                ], 400);
                return;
            }
            
            // Valider le format email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Format d\'email invalide'
                ], 400);
                return;
            }
            
            // Vérifier que l'utilisateur existe avec ces informations
            $user = $this->userModel->findUserForPasswordReset($email, $phone);
            
            if (!$user) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Utilisateur non trouvé avec ces informations'
                ], 404);
                return;
            }
            
            // Supprimer l'utilisateur (permettra de se réinscrire)
            $deleted = $this->userModel->deleteUserByEmail($email);
            
            if ($deleted) {
                // Détruire la session si c'est l'utilisateur connecté
                if (isset($this->session['userEmail']) && $this->session['userEmail'] === $email) {
                    session_unset();
                    session_destroy();
                }
                
                $this->jsonResponse([
                    'status' => 'success',
                    'message' => 'Compte supprimé avec succès. Vous pouvez maintenant vous réinscrire.',
                    'redirect' => 'auth.html'
                ]);
            } else {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Erreur lors de la suppression du compte'
                ], 500);
            }
            
        } catch (Exception $e) {
            error_log("Erreur lors de la réinitialisation de mot de passe : " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Erreur serveur. Veuillez réessayer.'
            ], 500);
        }
    }
}
