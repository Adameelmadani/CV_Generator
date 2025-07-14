<?php

require_once __DIR__ . '/../../core/bootstrap.php';
require_once __DIR__ . '/../Models/CVSectionsManager.php';

class CVController extends Controller {
    private $cvModel;
    private $userModel;
    private $sectionsManager;
    
    public function __construct() {
        parent::__construct();
        $this->cvModel = new CV();
        $this->userModel = new User();
        $this->sectionsManager = new CVSectionsManager();
    }
    
    public function getUserCVs() {
        $userId = $this->requireAuth();
        
        try {
            $cvs = $this->cvModel->getUserCVs($userId);
            
            $this->jsonResponse([
                'status' => 'success',
                'cvs' => $cvs,
                'debug' => [
                    'user_id' => $userId,
                    'cv_count' => count($cvs)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("Error in getUserCVs: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error retrieving CVs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function getCVData() {
        $userId = $this->requireAuth();
        error_log("CVController::getCVData - User ID: " . $userId);
        
        if (!isset($_GET['cv_id'])) {
            error_log("CVController::getCVData - Missing cv_id parameter");
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'CV ID is required'
            ], 400);
            return;
        }
        
        $cvId = intval($_GET['cv_id']);
        error_log("CVController::getCVData - CV ID: " . $cvId);
        
        try {
            $xmlContent = $this->cvModel->getCVData($cvId, $userId);
            error_log("CVController::getCVData - XML content length: " . strlen($xmlContent ?? ''));
            
            if (!$xmlContent) {
                error_log("CVController::getCVData - CV not found or access denied");
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV not found'
                ], 404);
                return;
            }
            
            // Try to get structured data from section tables
            $sectionsData = null;
            try {
                $sectionsData = $this->sectionsManager->getAllSections($cvId, $userId);
                error_log("CVController::getCVData - Retrieved sections data");
            } catch (Exception $e) {
                error_log("CVController::getCVData - Could not retrieve sections data: " . $e->getMessage());
                // If sections data is not available, we'll just use XML
            }
            
            error_log("CVController::getCVData - Success, returning CV data");
            $response = [
                'status' => 'success',
                'cv_id' => $cvId,
                'cv_data' => $xmlContent,           // For form.js compatibility
                'xml_content' => $xmlContent,       // For backward compatibility
                'cv' => [                           // For home.html compatibility
                    'data' => $xmlContent
                ]
            ];
            
            // Add structured data if available
            if ($sectionsData) {
                $response['sections_data'] = $sectionsData;
            }
            
            $this->jsonResponse($response);
            
        } catch (Exception $e) {
            error_log("Error in getCVData: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error retrieving CV data'
            ], 500);
        }
    }
    
    public function getCVForEdit() {
        $userId = $this->requireAuth();
        
        if (!isset($_GET['cv_id']) || empty($_GET['cv_id'])) {
            $this->redirect('user_home.html?error=cv_id_required');
            return;
        }
        
        $cvId = intval($_GET['cv_id']);
        
        try {
            $cv = $this->cvModel->getUserCV($cvId, $userId);
            
            if (!$cv) {
                $this->redirect('user_home.html?error=cv_not_found');
                return;
            }
            
            $this->redirect('home.html?edit=' . $cvId);
            
        } catch (Exception $e) {
            error_log("Error in getCVForEdit: " . $e->getMessage());
            $this->redirect('user_home.html?error=database_error');
        }
    }
    
    public function deleteCV() {
        $userId = $this->requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Method not allowed'
            ], 405);
            return;
        }
        
        $input = $this->getJsonInput();
        
        if (!isset($input['cv_id'])) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'CV ID is required'
            ], 400);
            return;
        }
        
        $cvId = intval($input['cv_id']);
        
        // Start database transaction for atomic deletion
        $db = Database::getInstance();
        $conn = $db->getConnection();
        
        try {
            $conn->beginTransaction();
            
            // Verify CV exists and belongs to user
            $cv = $this->cvModel->getUserCV($cvId, $userId);
            
            if (!$cv) {
                $conn->rollback();
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV not found or you do not have permission to delete it'
                ], 404);
                return;
            }
            
            error_log("Deleting CV ID: $cvId for User ID: $userId");
            
            // Method 1: Try direct deletion (will work if CASCADE is set up)
            try {
                $this->cvModel->deleteUserCV($cvId, $userId);
                error_log("Successfully deleted CV ID: $cvId using direct deletion");
                $conn->commit();
                
                $this->jsonResponse([
                    'status' => 'success',
                    'message' => 'CV deleted successfully'
                ]);
                return;
                
            } catch (Exception $e) {
                error_log("Direct deletion failed: " . $e->getMessage() . ". Trying manual section deletion.");
                
                // Method 2: Manual deletion of sections first, then CV
                try {
                    $this->sectionsManager->deleteAllSections($cvId, $userId);
                    error_log("Successfully deleted all sections for CV ID: $cvId");
                    
                    $this->cvModel->deleteUserCV($cvId, $userId);
                    error_log("Successfully deleted CV ID: $cvId from main table");
                    
                    $conn->commit();
                    
                    $this->jsonResponse([
                        'status' => 'success',
                        'message' => 'CV deleted successfully'
                    ]);
                    return;
                    
                } catch (Exception $e2) {
                    error_log("Manual section deletion also failed: " . $e2->getMessage());
                    throw $e2;
                }
            }
            
        } catch (Exception $e) {
            $conn->rollback();
            error_log("Error in deleteCV: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error deleting CV: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function deleteAllCVs() {
        $userId = $this->requireAuth();
        
        // Start database transaction for atomic deletion
        $db = Database::getInstance();
        $conn = $db->getConnection();
        
        try {
            $conn->beginTransaction();
            
            // Get all CV IDs for this user first
            $userCVs = $this->cvModel->getUserCVs($userId);
            $cvCount = count($userCVs);
            
            error_log("Deleting all CVs for User ID: $userId (Total: $cvCount CVs)");
            
            if ($cvCount === 0) {
                $conn->commit();
                $this->jsonResponse([
                    'status' => 'success',
                    'message' => 'No CVs to delete'
                ]);
                return;
            }
            
            // Method 1: Try direct deletion (will work if CASCADE is set up)
            try {
                $this->cvModel->deleteAllUserCVs($userId);
                error_log("Successfully deleted all CVs using direct deletion");
                $conn->commit();
                
                $this->jsonResponse([
                    'status' => 'success',
                    'message' => "All $cvCount CVs deleted successfully"
                ]);
                return;
                
            } catch (Exception $e) {
                error_log("Direct deletion failed: " . $e->getMessage() . ". Trying manual section deletion.");
                
                // Method 2: Manual deletion of sections for each CV first, then all CVs
                try {
                    // Delete sections for each CV
                    foreach ($userCVs as $cv) {
                        $this->sectionsManager->deleteAllSections($cv['id'], $userId);
                        error_log("Deleted sections for CV ID: " . $cv['id']);
                    }
                    
                    // Then delete all CVs from main table
                    $this->cvModel->deleteAllUserCVs($userId);
                    error_log("Deleted all CVs from main table");
                    
                    $conn->commit();
                    
                    $this->jsonResponse([
                        'status' => 'success',
                        'message' => "All $cvCount CVs deleted successfully"
                    ]);
                    return;
                    
                } catch (Exception $e2) {
                    error_log("Manual section deletion also failed: " . $e2->getMessage());
                    throw $e2;
                }
            }
            
        } catch (Exception $e) {
            $conn->rollback();
            error_log("Error in deleteAllCVs: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error deleting all CVs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function generateCV() {
        // Check if this is a guest mode request
        $isGuestMode = isset($_POST['guest_mode']) && $_POST['guest_mode'] === 'true';
        
        error_log("CV Generation - Guest Mode: " . ($isGuestMode ? 'true' : 'false'));
        
        $userId = null;
        if (!$isGuestMode) {
            try {
                $userId = $this->requireAuth();
                error_log("CV Generation - User ID: " . $userId);
            } catch (Exception $e) {
                error_log("CV Generation - Auth failed: " . $e->getMessage());
                throw $e;
            }
        }
        
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Method not allowed'
            ], 405);
            return;
        }
        
        try {
            $editingCVId = isset($_POST['editing_cv_id']) ? intval($_POST['editing_cv_id']) : null;
            
            // In guest mode, don't allow editing existing CVs
            if ($isGuestMode && $editingCVId) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Editing CVs requires authentication'
                ], 403);
                return;
            }
            
            // Extract and sanitize form data
            $formData = $this->sanitizeInput($_POST);
            
            // Handle photo upload
            $photoPath = $this->handlePhotoUpload($formData);
            
            // Generate XML content
            $xmlContent = $this->generateXMLContent($formData, $photoPath);
            
            // Generate CV name
            $cvName = $this->generateCVName($formData);
            
            // Determine CV ID using session-based logic to prevent duplicates
            $cvId = $this->determineSessionCVId($editingCVId, $isGuestMode, $userId, $cvName, $xmlContent, $formData);
            
            // Generate LaTeX and PDF
            $pdfResult = $this->generatePDF($xmlContent, $cvId, $isGuestMode);
            
            // Save PDF for authenticated users
            if (!$isGuestMode && $userId) {
                $this->savePermanentPDF($pdfResult, $cvId, $userId, $xmlContent);
            }
            
            // Get the selected format from form data (default to pdf)
            $selectedFormat = isset($_POST['format']) ? $_POST['format'] : 'pdf';
            
            // Force PDF format for guest users
            if ($isGuestMode) {
                $selectedFormat = 'pdf';
                error_log("Guest mode - forcing PDF format");
            }
            
            if ($isGuestMode) {
                // For guest mode, return direct PDF download
                $this->jsonResponse([
                    'success' => true,
                    'status' => 'success',
                    'guest_mode' => true,
                    'message' => 'CV generated successfully',
                    'download_url' => 'download_cv_mvc.php?guest_id=' . $cvId . '&format=' . $selectedFormat,
                    'pdf_path' => 'download_cv_mvc.php?guest_id=' . $cvId . '&format=' . $selectedFormat,
                    'selected_format' => $selectedFormat
                ]);
            } else {
                // Return success response with download information for authenticated users
                $this->jsonResponse([
                    'success' => true,
                    'status' => 'success',
                    'cv_id' => $cvId,
                    'message' => $editingCVId ? 'CV updated successfully' : 'CV created successfully',
                    'download_url' => 'download_cv_mvc.php?id=' . $cvId . '&format=' . $selectedFormat,
                    'pdf_path' => 'download_cv_mvc.php?id=' . $cvId . '&format=' . $selectedFormat,
                    'selected_format' => $selectedFormat
                ]);
            }
            
        } catch (Exception $e) {
            error_log("Error in generateCV: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error generating CV: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function importCV() {
        $userId = $this->requireAuth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Method not allowed'
            ], 405);
            return;
        }
        // Check if file was uploaded
        if (!isset($_FILES['xml_file']) || $_FILES['xml_file']['error'] !== UPLOAD_ERR_OK) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'No valid file received'
            ], 400);
            return;
        }
        $file = $_FILES['xml_file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $isPDF = ($file['type'] === 'application/pdf' || $ext === 'pdf');
        $isXML = ($file['type'] === 'text/xml' || $ext === 'xml');
        // Validate file type
        if (!$isPDF && !$isXML) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'File must be PDF or XML format'
            ], 400);
            return;
        }
        // Validate file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'File is too large (max 5MB)'
            ], 400);
            return;
        }
        try {
            if ($isXML) {
                // Read XML content
                $xmlContent = file_get_contents($file['tmp_name']);
            } else if ($isPDF) {
                // Save PDF temporarily
                $tmpPdf = sys_get_temp_dir() . '/cv_import_' . uniqid() . '.pdf';
                $tmpXml = sys_get_temp_dir() . '/cv_import_' . uniqid() . '.xml';
                move_uploaded_file($file['tmp_name'], $tmpPdf);
                // Call parse_cv.py (chemin corrigé)
                $python = 'python';
                $script = __DIR__ . '/../../parsing/parse_cv.py';
                $cmd = escapeshellcmd("$python $script $tmpPdf $tmpXml") . " 2>&1";
                exec($cmd, $output, $ret);
                error_log("CMD: $cmd");
                error_log("RET: $ret");
                error_log("OUTPUT: " . implode("\n", $output));
                error_log("SCRIPT: $script");
                error_log("TMPPDF: $tmpPdf");
                error_log("TMPXML: $tmpXml");
                
                // Vérifications détaillées
                if ($ret !== 0) {
                    $error_message = "Erreur lors du parsing du PDF (code: $ret). ";
                    $output_text = implode("\n", $output);
                    
                    if (strpos($output_text, "Module lxml non trouvé") !== false) {
                        $error_message .= "Problème de dépendance Python: module lxml manquant.";
                    } elseif (strpos($output_text, "Tesseract non trouvé") !== false) {
                        $error_message .= "Tesseract OCR n'est pas installé. Installez-le pour traiter les PDF contenant des images.";
                    } elseif (strpos($output_text, "Le PDF semble vide") !== false) {
                        $error_message .= "Le PDF ne contient pas de texte lisible.";
                    } elseif (strpos($output_text, "ERREUR: Le fichier PDF") !== false) {
                        $error_message .= "Le fichier PDF est corrompu ou inaccessible.";
                    } elseif (strpos($output_text, "Aucun texte n'a pu être extrait") !== false) {
                        $error_message .= "Le PDF contient uniquement des images et l'OCR n'a pas pu extraire de texte. Vérifiez la qualité des images.";
                    } elseif (strpos($output_text, "OCR a échoué") !== false) {
                        $error_message .= "L'OCR n'a pas pu lire le texte des images. Vérifiez la qualité et la résolution du PDF.";
                    } else {
                        $error_message .= "Veuillez vérifier le format du CV.";
                    }
                    
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => $error_message,
                        'debug' => [
                            'return_code' => $ret,
                            'output' => $output,
                            'script_exists' => file_exists($script),
                            'pdf_exists' => file_exists($tmpPdf),
                            'pdf_size' => file_exists($tmpPdf) ? filesize($tmpPdf) : 0
                        ]
                    ], 500);
                    if (file_exists($tmpPdf)) unlink($tmpPdf);
                    if (file_exists($tmpXml)) unlink($tmpXml);
                    return;
                }
                
                if (!file_exists($tmpXml)) {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'Le fichier XML de sortie n\'a pas été généré. Vérifiez les permissions et l\'espace disque.',
                        'debug' => [
                            'output' => $output,
                            'script_exists' => file_exists($script),
                            'pdf_exists' => file_exists($tmpPdf),
                            'xml_exists' => file_exists($tmpXml)
                        ]
                    ], 500);
                    if (file_exists($tmpPdf)) unlink($tmpPdf);
                    return;
                }
                $xmlContent = file_get_contents($tmpXml);
                // Nettoyage fichiers temporaires
                if (file_exists($tmpPdf)) unlink($tmpPdf);
                if (file_exists($tmpXml)) unlink($tmpXml);
            } else {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Format de fichier non supporté.'
                ], 400);
                return;
            }
            // Validate XML
            $xml = simplexml_load_string($xmlContent);
            if (!$xml) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Invalid XML file'
                ], 400);
                return;
            }
            // Extract CV name from XML or use filename
            $cvName = $this->extractCVNameFromXML($xml) ?: pathinfo($file['name'], PATHINFO_FILENAME);
            // Save to database
            $cvId = $this->cvModel->createCV($userId, $xmlContent, $cvName);
            $this->jsonResponse([
                'status' => 'success',
                'message' => 'CV imported successfully',
                'cv_id' => $cvId,
                'cv_name' => $cvName
            ]);
        } catch (Exception $e) {
            error_log("Error in importCV: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error importing CV: ' . $e->getMessage()
            ], 500);
        }
    }
    
    private function extractCVNameFromXML($xml) {
        $firstname = (string)$xml->personalInfo->firstname;
        $lastname = (string)$xml->personalInfo->lastname;
        
        if (!empty($firstname) && !empty($lastname)) {
            return "CV_{$firstname}_{$lastname}";
        }
        
        return null;
    }
    
    private function handlePhotoUpload($formData) {
        $photoPath = '';
        
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            // New photo uploaded
            $uploadDir = __DIR__ . '/../../Cv_generator/uploads/photos/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileInfo = pathinfo($_FILES['photo']['name']);
            $fileName = $formData['prenom'] . '_' . $formData['nom'] . '_' . time() . '.' . $fileInfo['extension'];
            $photoPath = 'uploads/photos/' . $fileName;
            
            // Validate file type
            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
            if (in_array(strtolower($fileInfo['extension']), $allowedTypes)) {
                move_uploaded_file($_FILES['photo']['tmp_name'], $uploadDir . $fileName);
            } else {
                $photoPath = ''; // Reset if invalid file type
            }
        } elseif (!empty($formData['existing_photo_path'])) {
            // No new photo uploaded, but there's an existing photo path
            $existingPhotoPath = $formData['existing_photo_path'];
            if (file_exists(__DIR__ . '/../../Cv_generator/' . $existingPhotoPath)) {
                $photoPath = $existingPhotoPath;
            }
        }
        
        return $photoPath;
    }
    
    private function generateCVName($formData) {
        // First check if we have a stored custom CV name in session from previous generation
        if (isset($_SESSION['custom_cv_name']) && !empty(trim($_SESSION['custom_cv_name']))) {
            $customName = trim($_SESSION['custom_cv_name']);
            // Sanitize the stored custom name
            $customName = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $customName);
            $customName = str_replace(' ', '_', $customName);
            error_log("Using stored custom CV name from session: " . $customName);
            return $customName;
        }
        
        // Check if a custom CV name was provided in current request
        if (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
            $customName = trim($formData['custom_cv_name']);
            // Sanitize the custom name
            $customName = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $customName);
            $customName = str_replace(' ', '_', $customName);
            error_log("Using custom CV name from form data: " . $customName);
            return $customName;
        }
        
        // Fallback to default naming scheme
        $nom = $formData['nom'] ?? '';
        $prenom = $formData['prenom'] ?? '';
        $timestamp = date('Y-m-d H:i:s');
        
        $defaultName = "CV_{$prenom}_{$nom}_{$timestamp}";
        error_log("Using default CV name: " . $defaultName);
        return $defaultName;
    }
    
    private function generateXMLContent($formData, $photoPath) {
        error_log("generateXMLContent - Starting XML generation");
        error_log("generateXMLContent - Form data keys: " . implode(', ', array_keys($formData)));
        
        $primaryColor = $formData['primary_color'] ?? '#667eea';
        
        $xmlContent  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xmlContent .= "<cv>\n";

        // Personalization
        $xmlContent .= "  <personalization>\n";
        $xmlContent .= "    <primaryColor>" . htmlspecialchars($primaryColor) . "</primaryColor>\n";
        $xmlContent .= "  </personalization>\n\n";

        // Personal Information
        $xmlContent .= "  <personalInfo>\n";
        $xmlContent .= "    <firstname>"   . htmlspecialchars($formData['prenom'] ?? '')    . "</firstname>\n";
        $xmlContent .= "    <lastname>"    . htmlspecialchars($formData['nom'] ?? '')       . "</lastname>\n";
        $xmlContent .= "    <location>"    . htmlspecialchars($formData['location'] ?? '')  . "</location>\n";
        $xmlContent .= "    <email>"       . htmlspecialchars($formData['email'] ?? '')     . "</email>\n";
        $xmlContent .= "    <phone>"       . htmlspecialchars($formData['telephone'] ?? '') . "</phone>\n";
        if (!empty($formData['website']))  $xmlContent .= "    <website>"   . htmlspecialchars($formData['website'])   . "</website>\n";
        if (!empty($formData['linkedin'])) $xmlContent .= "    <linkedin>"  . htmlspecialchars($formData['linkedin'])  . "</linkedin>\n";
        if (!empty($formData['github']))   $xmlContent .= "    <github>"    . htmlspecialchars($formData['github'])    . "</github>\n";
        if ($photoPath) $xmlContent .= "    <photo>"    . htmlspecialchars($photoPath) . "</photo>\n";
        $xmlContent .= "  </personalInfo>\n\n";

        // Professional Profile
        if (!empty($formData['profil_description'])) {
            $xmlContent .= "  <profil>\n";
            $xmlContent .= "    <description>" . htmlspecialchars($formData['profil_description']) . "</description>\n";
            $xmlContent .= "  </profil>\n\n";
        }

        // Education
        if (!empty($formData['education_degree'])) {
            $xmlContent .= "  <education>\n";
            $education_degree = $formData['education_degree'] ?? [];
            $education_dates = $formData['education_dates'] ?? [];
            $education_university = $formData['education_university'] ?? [];
            $education_field = $formData['education_field'] ?? [];
            $education_details = $formData['education_details'] ?? [];
            
            for ($i = 0; $i < count($education_dates); $i++) {
                if (!empty($education_degree[$i]) || !empty($education_dates[$i])) {
                    $xmlContent .= "    <degree>\n"
                                . "      <title>"      . htmlspecialchars($education_degree[$i] ?? '')    . "</title>\n"
                                . "      <period>"     . htmlspecialchars($education_dates[$i] ?? '')     . "</period>\n"
                                . "      <institution>". htmlspecialchars($education_university[$i] ?? '') . "</institution>\n"
                                . "      <field>"      . htmlspecialchars($education_field[$i] ?? '')      . "</field>\n";
                    if (trim($education_details[$i] ?? '') !== "") {
                        $xmlContent .= "      <description>" . htmlspecialchars($education_details[$i] ?? ''). "</description>\n";
                    }
                    $xmlContent .= "    </degree>\n";
                }
            }
            $xmlContent .= "  </education>\n\n";
        }

        // Certificates
        if (!empty($formData['certificate_name'])) {
            $xmlContent .= "  <certificates>\n";
            $certificate_name = $formData['certificate_name'] ?? [];
            $certificate_date = $formData['certificate_date'] ?? [];
            $certificate_issuer = $formData['certificate_issuer'] ?? [];
            $certificate_location = $formData['certificate_location'] ?? [];
            $certificate_description = $formData['certificate_description'] ?? [];
            
            for ($i = 0; $i < count($certificate_name); $i++) {
                if (!empty($certificate_name[$i])) {
                    $xmlContent .= "    <certificate>\n"
                                . "      <name>"    . htmlspecialchars($certificate_name[$i] ?? '')    . "</name>\n"
                                . "      <date>"    . htmlspecialchars($certificate_date[$i] ?? '')    . "</date>\n"
                                . "      <issuer>"  . htmlspecialchars($certificate_issuer[$i] ?? '')  . "</issuer>\n"
                                . "      <location>". htmlspecialchars($certificate_location[$i] ?? ''). "</location>\n";
                    if (trim($certificate_description[$i] ?? '') !== "") {
                        $xmlContent .= "      <description>" . ($certificate_description[$i] ?? '') . "</description>\n";
                    }
                    $xmlContent .= "    </certificate>\n";
                }
            }
            $xmlContent .= "  </certificates>\n\n";
        }

        // Experiences
        if (!empty($formData['experience_location'])) {
            $xmlContent .= "  <experiences>\n";
            $experience_location = $formData['experience_location'] ?? [];
            $experience_dates = $formData['experience_dates'] ?? [];
            $experience_company = $formData['experience_company'] ?? [];
            $experience_position = $formData['experience_position'] ?? [];
            $experience_description = $formData['experience_description'] ?? [];
            
            for ($i = 0; $i < count($experience_dates); $i++) {
                if (!empty($experience_location[$i]) || !empty($experience_dates[$i])) {
                    $xmlContent .= "    <experience>\n"
                                . "      <location>"   . htmlspecialchars($experience_location[$i] ?? '')    . "</location>\n"
                                . "      <period>"     . htmlspecialchars($experience_dates[$i] ?? '')       . "</period>\n"
                                . "      <company>"    . htmlspecialchars($experience_company[$i] ?? '')     . "</company>\n"
                                . "      <position>"   . htmlspecialchars($experience_position[$i] ?? '')    . "</position>\n"
                                . "      <description>". htmlspecialchars($experience_description[$i] ?? '') . "</description>\n"
                                . "    </experience>\n";
                }
            }
            $xmlContent .= "  </experiences>\n\n";
        }

        // Projects
        if (!empty($formData['project_name'])) {
            $xmlContent .= "  <projects>\n";
            $project_name = $formData['project_name'] ?? [];
            $project_link = $formData['project_link'] ?? [];
            $project_description = $formData['project_description'] ?? [];
            
            for ($i = 0; $i < count($project_name); $i++) {
                if (!empty($project_name[$i])) {
                    $xmlContent .= "    <project>\n"
                                . "      <name>"       . htmlspecialchars($project_name[$i] ?? '')        . "</name>\n";
                    if (trim($project_link[$i] ?? '') !== "") {
                        $xmlContent .= "      <link>"     . htmlspecialchars($project_link[$i] ?? '')        . "</link>\n";
                    }
                    if (trim($project_description[$i] ?? '') !== "") {
                        $xmlContent .= "      <description>" . htmlspecialchars($project_description[$i] ?? '') . "</description>\n";
                    }
                    $xmlContent .= "    </project>\n";
                }
            }
            $xmlContent .= "  </projects>\n\n";
        }

        // Skills
        if (!empty($formData['skill_category'])) {
            $xmlContent .= "  <skills>\n";
            $skill_category = $formData['skill_category'] ?? [];
            $skill_items = $formData['skill_items'] ?? [];
            
            for ($i = 0; $i < count($skill_items); $i++) {
                if (!empty($skill_category[$i]) && !empty($skill_items[$i])) {
                    $xmlContent .= "    <skill>\n"
                                . "      <category>" . htmlspecialchars($skill_category[$i]) . "</category>\n"
                                . "      <items>"     . htmlspecialchars($skill_items[$i])    . "</items>\n"
                                . "    </skill>\n";
                }
            }
            $xmlContent .= "  </skills>\n\n";
        }

        // Languages
        if (!empty($formData['language_name'])) {
            $xmlContent .= "  <languages>\n";
            $language_name = $formData['language_name'] ?? [];
            $language_level = $formData['language_level'] ?? [];
            
            for ($i = 0; $i < count($language_name); $i++) {
                if (!empty($language_name[$i]) && !empty($language_level[$i])) {
                    $xmlContent .= "    <language>\n"
                                . "      <name>"  . htmlspecialchars($language_name[$i])  . "</name>\n"
                                . "      <level>" . htmlspecialchars($language_level[$i]) . "</level>\n"
                                . "    </language>\n";
                }
            }
            $xmlContent .= "  </languages>\n\n";
        }

        // Close root element
        $xmlContent .= "</cv>";
        
        error_log("generateXMLContent - XML generation completed, length: " . strlen($xmlContent));
        error_log("generateXMLContent - XML preview: " . substr($xmlContent, 0, 200) . "...");
        
        return $xmlContent;
    }
    
    private function generatePDF($xmlContent, $cvId, $isGuestMode = false) {
        // Start output buffering to catch any unwanted output
        ob_start();
        
        try {
            // Parse XML to extract data
            $xml = simplexml_load_string($xmlContent);
            if (!$xml) {
                throw new Exception("Invalid XML content");
            }
        
        $prenom = $this->cleanForLatex((string)$xml->personalInfo->firstname);
        $nom = $this->cleanForLatex((string)$xml->personalInfo->lastname);
        $location = $this->cleanForLatex((string)$xml->personalInfo->location);
        $email = $this->cleanForLatex((string)$xml->personalInfo->email);
        $telephone = $this->cleanForLatex((string)$xml->personalInfo->phone);
        $website = $this->cleanForLatex((string)$xml->personalInfo->website);
        $linkedin = $this->cleanForLatex((string)$xml->personalInfo->linkedin);
        $github = $this->cleanForLatex((string)$xml->personalInfo->github);
        $photoPath = (string)$xml->personalInfo->photo;
        $profil = (string)$xml->profil->description; // Don't clean here, will be cleaned when used
        $primaryColor = (string)$xml->personalization->primaryColor ?: '#667eea';
        
        $latexClass = "templates/modern";
        
        // Generate LaTeX header
        $sectionHeader = "\\documentclass{" . $latexClass . "}\n";
        $sectionHeader .= "\\hypersetup{\n";
        $sectionHeader .= "    pdftitle={" . $nom . "'s CV},\n";
        $sectionHeader .= "    pdfauthor={" . $nom . "},\n";
        $sectionHeader .= "    pdfcreator={" . $nom . "}\n";
        $sectionHeader .= "}\n\n";

        // Color definitions
        $primaryColorRGB = $this->hexToRgb($primaryColor);
        $sectionHeader .= "\\definecolor{primaryColor}{RGB}{" . $primaryColorRGB['r'] . ", " . $primaryColorRGB['g'] . ", " . $primaryColorRGB['b'] . "}\n\n";
        
        $sectionHeader .= "\\author{" . $prenom . " " . $nom . "}\n\n";
        
        $sectionHeader .= "\\begin{document}\n";
        
        // Handle photo
        $photoForLatex = '';
        $workingDir = __DIR__ . '/../../Cv_generator/';
        
        if (!empty($photoPath) && file_exists($workingDir . $photoPath)) {
            $photoExtension = pathinfo($photoPath, PATHINFO_EXTENSION);
            $photoForLatex = "cv_photo." . $photoExtension;
            
            if (copy($workingDir . $photoPath, $workingDir . $photoForLatex)) {
                error_log("Photo copied successfully: " . $photoPath . " -> " . $photoForLatex);
            } else {
                error_log("Failed to copy photo: " . $photoPath . " -> " . $photoForLatex);
                $photoForLatex = '';
            }
        }
        // Use the class's makeheader command - fixed parameter order
        $sectionHeader .= "    \\makeheader{" . $photoForLatex . "}{" . $prenom . " " . $nom . "}{" . $location . "}{" . $email . "}{" . $telephone . "}{" . $website . "}{" . $linkedin . "}{" . $github . "}\n\n";
        
        // Profile section
        $sectionProfil = "";
        if (!empty($profil)) {
            $cleanProfil = $this->cleanForLatex($profil);
            $sectionProfil = "     \\section{Profil}\n";
            $sectionProfil .= "        \\begin{onecolentry}\n";
            $sectionProfil .= "        " . $cleanProfil;
            $sectionProfil .= "        \\end{onecolentry}\n";
        }

        // Education Section
        $sectionEducation = "";
        if (isset($xml->education->degree)) {
            $sectionEducation = "    \\section{Formation}\n";
            foreach ($xml->education->degree as $degree) {
                $degreeTitle = $this->cleanForLatex((string)$degree->title);
                $dates = $this->cleanForLatex((string)$degree->period);
                $university = $this->cleanForLatex((string)$degree->institution);
                $field = $this->cleanForLatex((string)$degree->field);
                $detail = $this->cleanForLatex((string)$degree->description);

                // Prepare highlights
                $highlights = "";
                if (!empty($detail)) {
                    $highlights .= "\\item " . $detail . "\n            ";
                }
                $sectionEducation .= "    \\experienceentry{" . $dates . "}{}{" . $degreeTitle . " en " . $field . "}{" . $university . "}{" . $highlights . "}\n\n";
            }
        }
        
        // Certificates Section
        $sectionCertificates = "";
        if (isset($xml->certificates->certificate)) {
            $sectionCertificates = "    \\section{Certificats}\n";
            foreach ($xml->certificates->certificate as $cert) {
                $certName = $this->cleanForLatex((string)$cert->name);
                $certDate = $this->cleanForLatex((string)$cert->date);
                $certIssuer = $this->cleanForLatex((string)$cert->issuer);
                $certLocation = $this->cleanForLatex((string)$cert->location);
                $certDescription = $this->cleanForLatex((string)$cert->description);

               $highlights = "";
                if (!empty($certDescription)) {
                    $highlights .= "\\item " . $certDescription . "\n            ";
                }
                if (!empty($certLocation)) {
                    $highlights .= "\\item Location: " . $certLocation . "\n            ";
                }

                $sectionCertificates .= "    \\experienceentry{" . $certDate . "}{}{" . $certName . "}{" . $certIssuer . "}{" . $highlights . "}\n\n";
            }
        }

        // Experience Section
        $sectionExperience = "";
        if (isset($xml->experiences->experience)) {
            $sectionExperience = "    \\section{Expérience}\n";
            foreach ($xml->experiences->experience as $exp) {
                $expPosition = $this->cleanForLatex((string)$exp->position);
                $expCompany = $this->cleanForLatex((string)$exp->company);
                $expDates = $this->cleanForLatex((string)$exp->period);
                $expLocation = $this->cleanForLatex((string)$exp->location);
                $expDescription = $this->cleanForLatex((string)$exp->description);

                 // Convert description to highlights format
                $highlights = "";
                if (!empty($expDescription)) {
                    $descriptionLines = array_filter(array_map('trim', explode("\n", $expDescription)));
                    foreach ($descriptionLines as $line) {
                        if (!empty($line)) {
                            $highlights .= "\\item " . $line . "\n            ";
                        }
                    }
                }

                $sectionExperience .= "    \\experienceentry{" . $expDates . "}{" . $expLocation . "}{" . $expPosition . "}{" . $expCompany . "}{" . $highlights . "}\n\n";
            }
        }

        // Projects Section
        $sectionProjects = "";
        if (isset($xml->projects->project)) {
            $sectionProjects = "    \\section{Projets}\n";
            foreach ($xml->projects->project as $project) {
                $projectName = $this->cleanForLatex((string)$project->name);
                $projectLink = $this->cleanForLatex((string)$project->link);
                $projectDescription = $this->cleanForLatex((string)$project->description);

                $highlights = "";
                if (!empty($projectDescription)) {
                    $highlights .= "\\item " . $projectDescription . "\n            ";
                }
                if (!empty($projectLink)) {
                    $highlights .= "\\item GitHub: \\href{" . $projectLink . "}{" . $projectName . "}\n            ";
                }

                $sectionProjects .= "    \\projectentry{}{" . $projectName . "}{" . $highlights . "}\n\n";
            }
        }

        // Skills Section
        $sectionSkills = "";
        if (isset($xml->skills->skill)) {
            $sectionSkills = "    \\section{Compétences}\n";
            foreach ($xml->skills->skill as $skill) {
                $skillCategory = $this->cleanForLatex((string)$skill->category);
                $skillItems = $this->cleanForLatex((string)$skill->items);

                $sectionSkills .= "    \\skillsentry{" . $skillCategory . "}{" . $skillItems . "}\n\n";
            }
        }

        // Languages Section
        $sectionLanguages = "";
        if (isset($xml->languages->language)) {
            $sectionLanguages = "    \\section{Langues}\n";
            $lang_items = [];
            foreach ($xml->languages->language as $language) {
                $langName = $this->cleanForLatex((string)$language->name);
                $langLevel = $this->cleanForLatex((string)$language->level);
                $lang_items[] = $langName . " (" . $langLevel . ")";
            }
            $sectionLanguages .= "\    \skillsentry{Langues}{" . implode(", ", $lang_items) . "}\n\n";
        }
        
        $sectionFooter = "\\end{document}";

        $latexContent = $sectionHeader . $sectionProfil . $sectionEducation . $sectionExperience . $sectionProjects . $sectionCertificates . $sectionSkills . $sectionLanguages . $sectionFooter;

        // Write LaTeX file
        // Generate LaTeX filename based on mode
        if ($isGuestMode) {
            $texFile = $workingDir . "cv_" . $cvId . ".tex";
        } else {
            $texFile = $workingDir . "CV_" . $prenom . "_" . $nom . ".tex";
        }
        file_put_contents($texFile, $latexContent);

        // Change to the working directory
        $oldDir = getcwd();
        chdir($workingDir);

        // First compilation
        $output = shell_exec("pdflatex -interaction=nonstopmode " . escapeshellarg(basename($texFile)) . " 2>&1");

        // Second compilation
        $output2 = shell_exec("pdflatex -interaction=nonstopmode " . escapeshellarg(basename($texFile)) . " 2>&1");

        // Return to original directory
        chdir($oldDir);

        $pdfFile = str_replace('.tex', '.pdf', $texFile);

        if (!file_exists($pdfFile)) {
            error_log("PDF generation failed. LaTeX output: " . $output . "\n" . $output2);
            throw new Exception("PDF generation failed");
        }

        // Clean up any output buffering and return result
        ob_end_clean();
        
        // For guest mode, also save XML and LaTeX files for later download
        if ($isGuestMode) {
            $xmlFile = str_replace('.pdf', '.xml', $pdfFile);
            $xmlFile = str_replace('.tex', '.xml', $texFile);
            file_put_contents($xmlFile, $xmlContent);
            error_log("Saved XML file for guest: " . $xmlFile);
        }
        
        return [
            'tex_file' => $texFile,
            'pdf_file' => $pdfFile,
            'photo_file' => !empty($photoForLatex) ? $workingDir . $photoForLatex : null
        ];
        
        } finally {
            // Ensure output buffer is cleaned up even if an exception occurs
            if (ob_get_level() > 0) {
                ob_end_clean();
            }
        }
    }
    
    private function hexToRgb($hex) {
        // Remove # if present
        $hex = str_replace('#', '', $hex);
        
        // Convert hex to RGB
        if (strlen($hex) == 6) {
            return [
                'r' => hexdec(substr($hex, 0, 2)),
                'g' => hexdec(substr($hex, 2, 2)),
                'b' => hexdec(substr($hex, 4, 2))
            ];
        }
        
        // Default to blue if invalid hex
        return ['r' => 102, 'g' => 126, 'b' => 234];
    }

    public function downloadCV() {
        // Check if this is a guest download request
        $isGuestMode = isset($_GET['guest_id']) || isset($_POST['guest_id']);
        
        $userId = null;
        if (!$isGuestMode) {
            try {
                $userId = $this->requireAuth();
            } catch (Exception $e) {
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'Authentication required'
                    ], 401);
                    return;
                } else {
                    http_response_code(401);
                    exit('Authentication required');
                }
            }
        }
        
        $cvId = null;
        $format = 'pdf';
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = $this->getJsonInput();
            
            if ($isGuestMode) {
                if (!isset($input['guest_id'])) {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'Guest CV ID required'
                    ], 400);
                    return;
                }
                $cvId = $input['guest_id'];
            } else {
                if (!isset($input['cv_id'])) {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'CV ID required'
                    ], 400);
                    return;
                }
                $cvId = $input['cv_id'];
            }
            
            $format = isset($input['format']) ? $input['format'] : 'pdf';
        } else {
            // Handle GET requests
            if ($isGuestMode) {
                if (!isset($_GET['guest_id']) || !isset($_GET['format'])) {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'Missing parameters for guest download'
                    ], 400);
                    return;
                }
                $cvId = $_GET['guest_id'];
                $format = $_GET['format'];
            } else {
                if (!isset($_GET['id']) || !isset($_GET['format'])) {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'Missing parameters'
                    ], 400);
                    return;
                }
                $cvId = intval($_GET['id']);
                $format = $_GET['format'];
            }
        }
        
        try {
            if ($isGuestMode) {
                $this->handleGuestDownload($cvId, $format);
            } else {
                $this->handleAuthenticatedDownload($cvId, $userId, $format);
            }
            
        } catch (Exception $e) {
            error_log("Error in downloadCV: " . $e->getMessage());
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Error downloading CV: ' . $e->getMessage()
                ], 500);
            } else {
                http_response_code(500);
                exit('Error downloading CV');
            }
        }
    }
    
    private function handleGuestDownload($cvId, $format) {
        // For guest mode, only PDF downloads are allowed
        error_log("Guest download attempt - CV ID: " . $cvId . ", Format: " . $format);
        
        // Restrict guests to PDF only
        if ($format !== 'pdf') {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => strtoupper($format) . ' download requires authentication. Please create an account to access this format.'
                ], 403);
                return;
            } else {
                http_response_code(403);
                $restrictedFormat = strtoupper($format);
                exit($restrictedFormat . ' download requires authentication. Please create an account to access this format.');
            }
        }
        
        $workingDir = __DIR__ . '/../../Cv_generator/';
        error_log("Working directory: " . $workingDir);
        
        // Only handle PDF for guests
        $pdfPath = $workingDir . 'cv_' . $cvId . '.pdf';
        error_log("Looking for PDF at: " . $pdfPath);
        
        if (!file_exists($pdfPath)) {
            error_log("Working directory exists: " . (is_dir($workingDir) ? 'yes' : 'no'));
            // List files in working directory for debugging
            $files = scandir($workingDir);
            error_log("Files in working directory: " . implode(', ', $files));
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'PDF file not found. Expected: ' . basename($pdfPath)
                ], 404);
                return;
            } else {
                http_response_code(404);
                exit('PDF file not found. Expected: ' . basename($pdfPath));
            }
        }
        
        $filename = 'CV_Guest_' . date('Y-m-d') . '.pdf';
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($pdfPath));
        readfile($pdfPath);
        unlink($pdfPath);
        exit();
    }
    
    private function handleAuthenticatedDownload($cvId, $userId, $format) {
        // Get CV from database for authenticated users
        $cv = $this->cvModel->getUserCV($cvId, $userId);
        
        if (!$cv) {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV not found'
                ], 404);
                return;
            } else {
                http_response_code(404);
                exit('CV not found');
            }
        }
        
        $xmlContent = $cv['contenu_xml'];
        
        // Debug: Log the XML content to understand what we're getting
        error_log("Download CV - Raw XML content: " . substr($xmlContent, 0, 200) . (strlen($xmlContent) > 200 ? '...' : ''));
        error_log("Download CV - XML content length: " . strlen($xmlContent));
        
        // Validate XML content before proceeding
        if (empty($xmlContent) || trim($xmlContent) === '' || trim($xmlContent) === 'test') {
            error_log("Download CV - Invalid XML content detected: '" . $xmlContent . "'");
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV contains invalid or missing XML content. Please regenerate the CV.'
                ], 400);
                return;
            } else {
                http_response_code(400);
                exit('CV contains invalid XML content. Please regenerate the CV.');
            }
        }
        
        // Additional XML validation - check if it's proper XML format
        $xml = simplexml_load_string($xmlContent);
        if (!$xml) {
            error_log("Download CV - XML parsing failed for CV ID: $cvId. Content: " . substr($xmlContent, 0, 200));
            
            // Try to regenerate XML from sections if possible
            try {
                error_log("Download CV - Attempting to regenerate XML from sections for CV ID: $cvId");
                $regeneratedXML = $this->regenerateXMLFromSections($cvId, $userId);
                
                if ($regeneratedXML) {
                    // Get current CV to preserve the name
                    $currentCV = $this->cvModel->getUserCV($cvId, $userId);
                    $cvName = $currentCV['cv_name'] ?? 'CV_' . date('Y-m-d_H-i-s');
                    
                    // Update the CV with regenerated XML
                    $this->cvModel->updateCV($cvId, $userId, $cvName, $regeneratedXML);
                    $xmlContent = $regeneratedXML;
                    error_log("Download CV - Successfully regenerated XML for CV ID: $cvId");
                } else {
                    throw new Exception("Could not regenerate XML from sections");
                }
            } catch (Exception $e) {
                error_log("Download CV - XML regeneration failed: " . $e->getMessage());
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $this->jsonResponse([
                        'status' => 'error',
                        'message' => 'CV contains malformed XML content and could not be regenerated. Please edit and save the CV again.'
                    ], 400);
                    return;
                } else {
                    http_response_code(400);
                    exit('CV contains malformed XML content. Please edit and save the CV again.');
                }
            }
        }
        
        // Generate CV name from XML content since it's not stored in the database
        $cvName = $this->generateCVNameFromXML($xmlContent);
        
        // Parse XML to get personal info (re-parse since we might have regenerated it)
        $xml = simplexml_load_string($xmlContent);
        if (!$xml) {
            error_log("Download CV - Failed to parse XML content after regeneration for CV ID: $cvId");
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV XML content is corrupted and could not be repaired. Please contact support.'
                ], 500);
                return;
            } else {
                http_response_code(500);
                exit('CV XML content is corrupted. Please contact support.');
            }
        }
        
        $prenom = (string)$xml->personalInfo->firstname;
        $nom = (string)$xml->personalInfo->lastname;
        
        $workingDir = __DIR__ . '/../../Cv_generator/';
        
        switch ($format) {
            case 'xml':
                $this->downloadXML($xmlContent, $prenom, $nom);
                break;
                
            case 'latex':
                $this->downloadLaTeX($xmlContent, $prenom, $nom, $workingDir);
                break;
            
            case 'all':
                $this->downloadAll($xmlContent, $prenom, $nom, $workingDir);
                break;
                
            default: // pdf
                $this->downloadPDF($xmlContent, $prenom, $nom, $workingDir);
                break;
        }
    }
    
    private function downloadXML($xmlContent, $prenom, $nom) {
        $filename = "CV_{$prenom}_{$nom}.xml";
        
        header('Content-Type: application/xml');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($xmlContent));
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        echo $xmlContent;
        exit();
    }
    
    private function downloadLaTeX($xmlContent, $prenom, $nom, $workingDir) {
        if (!class_exists('ZipArchive')) {
            http_response_code(500);
            exit('ZIP extension not available');
        }
        
        try {
            $files = $this->generatePDF($xmlContent, 0);
            $texFile = $files['tex_file'];
            $zipFileName = $workingDir . "CV_{$prenom}_{$nom}_LaTeX.zip";
            
            // Template file path
            $templatePath = $workingDir . 'templates/modern.cls';
            
            $zip = new ZipArchive();
            if ($zip->open($zipFileName, ZipArchive::CREATE) === TRUE) {
                // Add LaTeX file
                $zip->addFile($texFile, "CV_{$prenom}_{$nom}.tex");
                
                // Add template file if it exists
                if (file_exists($templatePath)) {
                    $zip->addFile($templatePath, "modern.cls");
                } else {
                    error_log("Template file not found: " . $templatePath);
                }
                
                $zip->close();
                
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="CV_' . $prenom . '_' . $nom . '_LaTeX.zip"');
                header('Content-Length: ' . filesize($zipFileName));
                header('Cache-Control: no-cache, must-revalidate');
                header('Pragma: no-cache');
                header('Expires: 0');
                
                readfile($zipFileName);
                
                // Clean up
                $this->cleanupFiles($files);
                @unlink($zipFileName);
                exit();
                
            } else {
                throw new Exception("Failed to create ZIP file");
            }
            
        } catch (Exception $e) {
            error_log("Error generating LaTeX ZIP: " . $e->getMessage());
            http_response_code(500);
            exit('Error generating LaTeX ZIP file');
        }
    }
    
    private function downloadPDF($xmlContent, $prenom, $nom, $workingDir) {
        try {
            $files = $this->generatePDF($xmlContent, 0);
            $pdfFile = $files['pdf_file'];
            $filename = "CV_{$prenom}_{$nom}.pdf";
            
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($pdfFile));
            header('Cache-Control: no-cache, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
            
            readfile($pdfFile);
            
            // Clean up
            $this->cleanupFiles($files);
            exit();
            
        } catch (Exception $e) {
            error_log("Error generating PDF: " . $e->getMessage());
            http_response_code(500);
            exit('Error generating PDF file');
        }
    }
    
    private function downloadAll($xmlContent, $prenom, $nom, $workingDir) {
        if (!class_exists('ZipArchive')) {
            http_response_code(500);
            exit('ZIP extension not available');
        }
        
        try {
            $files = $this->generatePDF($xmlContent, 0);
            $zipFileName = $workingDir . "CV_{$prenom}_{$nom}_Complete.zip";
            
            // Create XML file
            $xmlFile = $workingDir . "CV_{$prenom}_{$nom}.xml";
            file_put_contents($xmlFile, $xmlContent);
            
            // Template file path
            $templatePath = $workingDir . 'templates/modern.cls';
            
            $zip = new ZipArchive();
            if ($zip->open($zipFileName, ZipArchive::CREATE) === TRUE) {
                // Add all files to ZIP
                $zip->addFile($files['pdf_file'], "CV_{$prenom}_{$nom}.pdf");
                $zip->addFile($xmlFile, "CV_{$prenom}_{$nom}.xml");
                $zip->addFile($files['tex_file'], "CV_{$prenom}_{$nom}.tex");
                
                // Add template file if it exists
                if (file_exists($templatePath)) {
                    $zip->addFile($templatePath, "modern.cls");
                } else {
                    error_log("Template file not found: " . $templatePath);
                }
                
                $zip->close();
                
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="CV_' . $prenom . '_' . $nom . '_Complete.zip"');
                header('Content-Length: ' . filesize($zipFileName));
                header('Cache-Control: no-cache, must-revalidate');
                header('Pragma: no-cache');
                header('Expires: 0');
                
                readfile($zipFileName);
                
                // Clean up
                $this->cleanupFiles($files);
                @unlink($xmlFile);
                @unlink($zipFileName);
                exit();
                
            } else {
                throw new Exception("Failed to create ZIP file");
            }
            
        } catch (Exception $e) {
            error_log("Error generating complete ZIP: " . $e->getMessage());
            http_response_code(500);
            exit('Error generating complete ZIP file');
        }
    }
    
    private function cleanupFiles($files) {
        @unlink($files['tex_file']);
        @unlink($files['pdf_file']);
        if ($files['photo_file']) {
            @unlink($files['photo_file']);
        }
        
        // Clean up LaTeX auxiliary files
        $baseName = str_replace('.tex', '', $files['tex_file']);
        @unlink($baseName . '.aux');
        @unlink($baseName . '.log');
        @unlink($baseName . '.out');
    }
    
    public function generateLivePreview() {
        $userId = $this->requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'success' => false,
                'error' => 'Method not allowed'
            ], 405);
            return;
        }
        
        try {
            // Get JSON input instead of POST data
            $input = $this->getJsonInput();
            
            if (empty($input)) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => 'No data provided'
                ], 400);
                return;
            }
            
            // Convert JSON input to POST-like format for existing methods
            $_POST = $input;
            
            // Extract and sanitize form data
            $formData = $this->sanitizeInput($input);
            
            // Handle photo upload for preview (skip file upload for live preview)
            $photoPath = null;
            if (isset($input['photo_preview_src']) && !empty($input['photo_preview_src'])) {
                // Handle base64 photo data for preview
                $photoPath = $this->handleBase64Photo($input['photo_preview_src']);
            }
            
            // Generate XML content
            $xmlContent = $this->generateXMLContent($formData, $photoPath);
            
            // Debug: Log the XML content structure (only for live preview)
            error_log("Live Preview XML structure check:");
            error_log("Has certificates: " . (strpos($xmlContent, '<certificates>') !== false ? 'YES' : 'NO'));
            error_log("Has projects: " . (strpos($xmlContent, '<projects>') !== false ? 'YES' : 'NO'));
            error_log("Has skills: " . (strpos($xmlContent, '<skills>') !== false ? 'YES' : 'NO'));
            error_log("Has languages: " . (strpos($xmlContent, '<languages>') !== false ? 'YES' : 'NO'));
            
            // Generate PDF for live preview
            $files = $this->generatePDF($xmlContent, 0);
            $pdfFile = $files['pdf_file'];
            
            if (!file_exists($pdfFile)) {
                $this->jsonResponse([
                    'success' => false,
                    'error' => 'PDF generation failed - file not created'
                ]);
                return;
            }
            
            // Read PDF content and encode as base64
            $pdfContent = file_get_contents($pdfFile);
            $pdfBase64 = base64_encode($pdfContent);
            
            // Clean up temporary files
            $this->cleanupFiles($files);
            
            // Return JSON response with base64 PDF
            $this->jsonResponse([
                'success' => true,
                'pdf_base64' => $pdfBase64,
                'message' => 'PDF generated successfully'
            ]);
            
        } catch (Exception $e) {
            error_log("Error in generateLivePreview: " . $e->getMessage());
            
            $this->jsonResponse([
                'success' => false,
                'error' => 'Error generating live preview: ' . $e->getMessage(),
                'debug_info' => [
                    'error_line' => $e->getLine(),
                    'error_file' => $e->getFile()
                ]
            ], 500);
        }
    }
    
    private function handleBase64Photo($base64Data) {
        // Check if it's a valid base64 image
        if (strpos($base64Data, 'data:image/') === 0) {
            // Extract image data and extension
            preg_match('/data:image\/([a-zA-Z]+);base64,(.+)/', $base64Data, $matches);
            
            if (count($matches) === 3) {
                $extension = $matches[1];
                $imageData = base64_decode($matches[2]);
                
                // Create temporary file for the preview
                $tempFileName = 'temp_preview_photo_' . uniqid() . '.' . $extension;
                $tempFilePath = __DIR__ . '/../../Cv_generator/uploads/photos/' . $tempFileName;
                
                // Ensure directory exists
                $uploadDir = dirname($tempFilePath);
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Write image data to file
                if (file_put_contents($tempFilePath, $imageData)) {
                    return 'uploads/photos/' . $tempFileName;
                }
            }
        }
        
        return null;
    }

    /**
     * Clean text for LaTeX by decoding HTML entities and escaping LaTeX special characters
     */
    private function cleanForLatex($text) {
        // First decode HTML entities
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Escape LaTeX special characters
        $latexSpecialChars = [
            '\\' => '\\textbackslash{}',
            '{' => '\\{',
            '}' => '\\}',
            '$' => '\\$',
            '&' => '\\&',
            '%' => '\\%',
            '#' => '\\#',
            '^' => '\\textasciicircum{}',
            '_' => '\\_',
            '~' => '\\textasciitilde{}'
        ];
        
        foreach ($latexSpecialChars as $char => $replacement) {
            $text = str_replace($char, $replacement, $text);
        }
        
        return $text;
    }
    
    /**
     * Determines the CV ID to use based on session state to prevent duplicate entries
     * @param int|null $editingCVId The CV ID being edited (if any)
     * @param bool $isGuestMode Whether this is guest mode
     * @param int|null $userId The user ID
     * @param string $cvName The CV name
     * @param string $xmlContent The XML content
     * @param array $formData The form data
     * @return int|string The CV ID to use
     */
    private function determineSessionCVId($editingCVId, $isGuestMode, $userId, $cvName, $xmlContent, $formData) {
        if ($isGuestMode) {
            // For guest mode, always generate a temporary ID
            $cvId = 'guest_' . time() . '_' . rand(1000, 9999);
            error_log("Guest mode - generated temporary CV ID: " . $cvId);
            return $cvId;
        }
        
        if ($editingCVId) {
            // If editing an existing CV, always use that ID
            $this->cvModel->updateCV($editingCVId, $userId, $cvName, $xmlContent);
            $this->sectionsManager->saveAllSections($editingCVId, $userId, $formData);
            
            // Clear force_new_cv flag when editing existing CV
            unset($_SESSION['force_new_cv']);
            
            // Store in session for future generations in this session
            $_SESSION['current_cv_id'] = $editingCVId;
            $_SESSION['cv_session_hash'] = $this->generateFormDataHash($formData);
            $_SESSION['cv_core_hash'] = $this->generateCoreDataHash($formData);
            $_SESSION['cv_session_start_time'] = time(); // Set session start time for editing session
            // Store custom CV name if provided
            if (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
                $_SESSION['custom_cv_name'] = trim($formData['custom_cv_name']);
            }
            
            error_log("Updated existing CV ID: " . $editingCVId);
            return $editingCVId;
        }
        
        // Check if we have an active CV session
        $sessionCVId = $_SESSION['current_cv_id'] ?? null;
        $sessionHash = $_SESSION['cv_session_hash'] ?? null;
        $currentHash = $this->generateFormDataHash($formData);
        $forceNewCV = $_SESSION['force_new_cv'] ?? false;
        
        // Get session start time - if it's recent (within 30 minutes), we're likely in the same generation session
        $sessionStartTime = $_SESSION['cv_session_start_time'] ?? null;
        $isRecentSession = $sessionStartTime && (time() - $sessionStartTime) < 1800; // 30 minutes
        
        // If force_new_cv flag is set, always create a new CV
        if ($forceNewCV) {
            // Clear ALL session CV data to ensure fresh start
            unset($_SESSION['force_new_cv']); // Clear the flag
            unset($_SESSION['current_cv_id']);
            unset($_SESSION['cv_session_hash']);
            unset($_SESSION['cv_core_hash']);
            unset($_SESSION['cv_session_start_time']);
            unset($_SESSION['custom_cv_name']);
            
            // Create a new CV
            $cvId = $this->cvModel->createCV($userId, $xmlContent, $cvName);
            if (!$cvId) {
                error_log("ERROR: Failed to create CV in database");
                throw new Exception("Failed to create CV in database");
            }
            
            // Save sections
            $this->sectionsManager->saveAllSections($cvId, $userId, $formData);
            
            // Store in session for future generations
            $_SESSION['current_cv_id'] = $cvId;
            $_SESSION['cv_session_hash'] = $currentHash;
            $_SESSION['cv_core_hash'] = $this->generateCoreDataHash($formData);
            $_SESSION['cv_session_start_time'] = time();
            // Store custom CV name if provided
            if (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
                $_SESSION['custom_cv_name'] = trim($formData['custom_cv_name']);
            }
            
            return $cvId;
        }
        
        // If we have a session CV and it's from a recent session with similar data, reuse it
        if ($sessionCVId && $isRecentSession && $sessionHash && $sessionHash === $currentHash) {
            // Verify the CV still exists and belongs to this user
            $existingCV = $this->cvModel->getUserCV($sessionCVId, $userId);
            if ($existingCV) {
                // Use stored custom name if available, otherwise use the generated one
                $finalCvName = $_SESSION['custom_cv_name'] ?? $cvName;
                
                // Update the existing CV with the current data
                $this->cvModel->updateCV($sessionCVId, $userId, $finalCvName, $xmlContent);
                $this->sectionsManager->saveAllSections($sessionCVId, $userId, $formData);
                
                error_log("Reused session CV ID: " . $sessionCVId . " with name: " . $finalCvName);
                return $sessionCVId;
            } else {
                error_log("Session CV ID $sessionCVId no longer exists or doesn't belong to user $userId");
            }
        }
        
        // Alternative check: If we have a session CV that's recent but hash doesn't match,
        // check if it's just a format change (same core data but different format request)
        if ($sessionCVId && $isRecentSession && $sessionHash && $sessionHash !== $currentHash) {
            // Generate a hash without format-specific data to see if it's the same CV
            $coreHash = $this->generateCoreDataHash($formData);
            $sessionCoreHash = $_SESSION['cv_core_hash'] ?? null;
            
            if ($coreHash === $sessionCoreHash) {
                // Same core data, just different format - reuse the CV
                $existingCV = $this->cvModel->getUserCV($sessionCVId, $userId);
                if ($existingCV) {
                    $finalCvName = $_SESSION['custom_cv_name'] ?? $cvName;
                    
                    // Update the existing CV
                    $this->cvModel->updateCV($sessionCVId, $userId, $finalCvName, $xmlContent);
                    $this->sectionsManager->saveAllSections($sessionCVId, $userId, $formData);
                    
                    // Update session hash for this generation
                    $_SESSION['cv_session_hash'] = $currentHash;
                    
                    return $sessionCVId;
                }
            }
        }
        
        // Create a new CV
        $cvId = $this->cvModel->createCV($userId, $xmlContent, $cvName);
        $this->sectionsManager->saveAllSections($cvId, $userId, $formData);
        
        // Store in session for future generations
        $_SESSION['current_cv_id'] = $cvId;
        $_SESSION['cv_session_hash'] = $currentHash;
        $_SESSION['cv_core_hash'] = $this->generateCoreDataHash($formData);
        $_SESSION['cv_session_start_time'] = time(); // Set session start time
        // Store custom CV name if provided
        if (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
            $_SESSION['custom_cv_name'] = trim($formData['custom_cv_name']);
        }
        
        return $cvId;
    }
    
    /**
     * Generates a hash of the form data to detect if it's the same CV being generated
     * @param array $formData The form data
     * @return string Hash of the form data
     */
    private function generateFormDataHash($formData) {
        // Get the custom CV name either from form data or session
        $customCVName = '';
        if (isset($_SESSION['custom_cv_name']) && !empty(trim($_SESSION['custom_cv_name']))) {
            $customCVName = trim($_SESSION['custom_cv_name']);
        } elseif (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
            $customCVName = trim($formData['custom_cv_name']);
        }
        
        // Create a comprehensive version of form data for hashing
        $hashData = [
            'nom' => $formData['nom'] ?? '',
            'prenom' => $formData['prenom'] ?? '',
            'email' => $formData['email'] ?? '',
            'telephone' => $formData['telephone'] ?? '',
            'profil_description' => $formData['profil_description'] ?? '',
            'location' => $formData['location'] ?? '',
            'website' => $formData['website'] ?? '',
            'linkedin' => $formData['linkedin'] ?? '',
            'github' => $formData['github'] ?? '',
            // Include array fields to make hash more comprehensive
            'education_degree' => $formData['education_degree'] ?? [],
            'education_university' => $formData['education_university'] ?? [],
            'experience_company' => $formData['experience_company'] ?? [],
            'experience_position' => $formData['experience_position'] ?? [],
            'project_name' => $formData['project_name'] ?? [],
            'certificate_name' => $formData['certificate_name'] ?? [],
            'skill_category' => $formData['skill_category'] ?? [],
            'language_name' => $formData['language_name'] ?? [],
            // Use consistent custom CV name from session or form
            'custom_cv_name' => $customCVName,
            // Add a session identifier to ensure fresh sessions create new CVs
            'session_start_time' => $_SESSION['cv_session_start_time'] ?? null
        ];
        
        $hash = md5(json_encode($hashData));
        error_log("Generated form data hash: " . $hash . " with custom_cv_name: " . $customCVName);
        return $hash;
    }
    
    /**
     * Generates a hash of the core form data (excluding format and other non-essential fields)
     * This is used to detect if the same CV is being generated in different formats
     * @param array $formData The form data
     * @return string Hash of the core form data
     */
    private function generateCoreDataHash($formData) {
        // Get the custom CV name either from form data or session
        $customCVName = '';
        if (isset($_SESSION['custom_cv_name']) && !empty(trim($_SESSION['custom_cv_name']))) {
            $customCVName = trim($_SESSION['custom_cv_name']);
        } elseif (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
            $customCVName = trim($formData['custom_cv_name']);
        }
        
        // Create a core version of form data for hashing (exclude format and other non-essential fields)
        $coreData = [
            'nom' => $formData['nom'] ?? '',
            'prenom' => $formData['prenom'] ?? '',
            'email' => $formData['email'] ?? '',
            'telephone' => $formData['telephone'] ?? '',
            'profil_description' => $formData['profil_description'] ?? '',
            'location' => $formData['location'] ?? '',
            'website' => $formData['website'] ?? '',
            'linkedin' => $formData['linkedin'] ?? '',
            'github' => $formData['github'] ?? '',
            // Include array fields to make hash more comprehensive
            'education_degree' => $formData['education_degree'] ?? [],
            'education_university' => $formData['education_university'] ?? [],
            'education_startdate' => $formData['education_startdate'] ?? [],
            'education_enddate' => $formData['education_enddate'] ?? [],
            'education_description' => $formData['education_description'] ?? [],
            'experience_company' => $formData['experience_company'] ?? [],
            'experience_position' => $formData['experience_position'] ?? [],
            'experience_startdate' => $formData['experience_startdate'] ?? [],
            'experience_enddate' => $formData['experience_enddate'] ?? [],
            'experience_description' => $formData['experience_description'] ?? [],
            'project_name' => $formData['project_name'] ?? [],
            'project_description' => $formData['project_description'] ?? [],
            'project_tech' => $formData['project_tech'] ?? [],
            'project_link' => $formData['project_link'] ?? [],
            'certificate_name' => $formData['certificate_name'] ?? [],
            'certificate_organization' => $formData['certificate_organization'] ?? [],
            'certificate_date' => $formData['certificate_date'] ?? [],
            'certificate_link' => $formData['certificate_link'] ?? [],
            'skill_category' => $formData['skill_category'] ?? [],
            'skills' => $formData['skills'] ?? [],
            'language_name' => $formData['language_name'] ?? [],
            'language_level' => $formData['language_level'] ?? [],
            'interest_name' => $formData['interest_name'] ?? [],
            'reference_name' => $formData['reference_name'] ?? [],
            'reference_position' => $formData['reference_position'] ?? [],
            'reference_company' => $formData['reference_company'] ?? [],
            'reference_email' => $formData['reference_email'] ?? [],
            'reference_phone' => $formData['reference_phone'] ?? [],
            // Use consistent custom CV name
            'custom_cv_name' => $customCVName,
            // NOTE: We exclude format, editing_cv_id, and other non-core fields
        ];
        
        $hash = md5(json_encode($coreData));
        error_log("Generated core data hash: " . $hash . " with custom_cv_name: " . $customCVName);
        return $hash;
    }

    /**
     * Clears the current CV session data (useful when starting fresh)
     */
    public function clearCVSession() {
        unset($_SESSION['current_cv_id']);
        unset($_SESSION['cv_session_hash']);
        unset($_SESSION['cv_core_hash']);
        unset($_SESSION['custom_cv_name']);
        unset($_SESSION['cv_session_start_time']);
        // Set a flag to force creation of new CV on next generation
        $_SESSION['force_new_cv'] = true;
        
        $this->jsonResponse([
            'status' => 'success',
            'message' => 'CV session cleared'
        ]);
    }

    /**
     * Save PDF permanently for authenticated users
     * @param array $pdfResult Result from generatePDF
     * @param int $cvId CV ID
     * @param int $userId User ID
     * @param string $xmlContent XML content for filename generation
     */
    private function savePermanentPDF($pdfResult, $cvId, $userId, $xmlContent) {
        try {
            // Parse XML to get personal info for filename
            $xml = simplexml_load_string($xmlContent);
            $prenom = $this->cleanForLatex((string)$xml->personalInfo->firstname);
            $nom = $this->cleanForLatex((string)$xml->personalInfo->lastname);
            
            // Create saved_pdfs directory if it doesn't exist
            $savedPDFsDir = __DIR__ . '/../../Cv_generator/saved_pdfs/';
            if (!is_dir($savedPDFsDir)) {
                mkdir($savedPDFsDir, 0755, true);
            }
            
            // Generate permanent filename
            $permanentFileName = "CV_{$prenom}_{$nom}_{$cvId}_{$userId}.pdf";
            $permanentPath = $savedPDFsDir . $permanentFileName;
            
            // Copy the temporary PDF to permanent location
            if (isset($pdfResult['pdf_file']) && file_exists($pdfResult['pdf_file'])) {
                if (copy($pdfResult['pdf_file'], $permanentPath)) {
                    // Store relative path in database
                    $relativePath = 'saved_pdfs/' . $permanentFileName;
                    $this->cvModel->updatePDFPath($cvId, $userId, $relativePath);
                    error_log("PDF saved permanently: " . $permanentPath);
                } else {
                    error_log("Failed to copy PDF to permanent location");
                }
            } else {
                error_log("Source PDF file not found for saving");
            }
        } catch (Exception $e) {
            error_log("Error saving permanent PDF: " . $e->getMessage());
            // Don't throw exception as this is not critical for CV generation
        }
    }

    public function viewSavedCV() {
        $userId = $this->requireAuth();
        
        if (!isset($_GET['cv_id'])) {
            http_response_code(400);
            exit('CV ID required');
        }
        
        $cvId = intval($_GET['cv_id']);
        
        try {
            // Get CV info from database
            $cv = $this->cvModel->getUserCV($cvId, $userId);
            
            if (!$cv) {
                http_response_code(404);
                exit('CV not found');
            }
            
            // Check if saved PDF exists
            if (!empty($cv['pdf_path'])) {
                $pdfPath = __DIR__ . '/../../Cv_generator/' . $cv['pdf_path'];
                
                if (file_exists($pdfPath)) {
                    // Serve the saved PDF
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: inline; filename="' . basename($pdfPath) . '"');
                    header('Content-Length: ' . filesize($pdfPath));
                    header('Cache-Control: public, max-age=3600'); // Cache for 1 hour
                    readfile($pdfPath);
                    exit();
                }
            }
            
            // If no saved PDF, generate it on the fly
            $xmlContent = $cv['contenu_xml'];
            $files = $this->generatePDF($xmlContent, $cvId);
            
            // Save this PDF for future use
            $this->savePermanentPDF($files, $cvId, $userId, $xmlContent);
            
            // Serve the PDF
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="CV_preview.pdf"');
            header('Content-Length: ' . filesize($files['pdf_file']));
            readfile($files['pdf_file']);
            
            // Clean up temporary files
            $this->cleanupFiles($files);
            exit();
            
        } catch (Exception $e) {
            error_log("Error in viewSavedCV: " . $e->getMessage());
            http_response_code(500);
            exit('Error loading CV');
        }
    }
    
    public function downloadSavedPDF() {
        $userId = $this->requireAuth();
        
        if (!isset($_GET['cv_id'])) {
            http_response_code(400);
            exit('CV ID required');
        }
        
        $cvId = intval($_GET['cv_id']);
        
        try {
            // Get CV info from database
            $cv = $this->cvModel->getUserCV($cvId, $userId);
            
            if (!$cv) {
                http_response_code(404);
                exit('CV not found');
            }
            
            // Parse XML to get user's name for filename
            $xml = simplexml_load_string($cv['xml_content']);
            $prenom = (string)$xml->personalInfo->firstname;
            $nom = (string)$xml->personalInfo->lastname;
            $filename = "CV_{$prenom}_{$nom}.pdf";
            
            // Check if saved PDF exists
            if (!empty($cv['pdf_path'])) {
                $pdfPath = __DIR__ . '/../../Cv_generator/' . $cv['pdf_path'];
                
                if (file_exists($pdfPath)) {
                    // Serve the saved PDF for download with user's name
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: attachment; filename="' . $filename . '"');
                    header('Content-Length: ' . filesize($pdfPath));
                    header('Cache-Control: no-cache, must-revalidate');
                    header('Pragma: no-cache');
                    header('Expires: 0');
                    readfile($pdfPath);
                    exit();
                }
            }
            
            // No saved PDF found - return error
            http_response_code(404);
            exit('PDF not available. Please generate the CV first.');
            
        } catch (Exception $e) {
            error_log("Error in downloadSavedPDF: " . $e->getMessage());
            http_response_code(500);
            exit('Error downloading CV');
        }
    }

    /**
     * Generate CV name from XML content
     * @param string $xmlContent XML content of the CV
     * @return string Generated CV name
     */
    private function generateCVNameFromXML($xmlContent) {
        try {
            // Validate XML content first
            if (empty($xmlContent) || trim($xmlContent) === '' || trim($xmlContent) === 'test') {
                error_log("generateCVNameFromXML - Invalid XML content: '" . $xmlContent . "'");
                return "CV_Unknown";
            }
            
            // Suppress XML parsing errors for cleaner error handling
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($xmlContent);
            
            if ($xml) {
                $prenom = trim((string)$xml->personalInfo->firstname);
                $nom = trim((string)$xml->personalInfo->lastname);
                
                if (!empty($prenom) && !empty($nom)) {
                    return "CV_{$prenom}_{$nom}";
                }
            } else {
                // Log XML parsing errors
                $errors = libxml_get_errors();
                foreach ($errors as $error) {
                    error_log("XML parsing error: " . $error->message);
                }
                libxml_clear_errors();
            }
            
            // Restore normal error handling
            libxml_use_internal_errors(false);
            
        } catch (Exception $e) {
            error_log("Error parsing XML for CV name: " . $e->getMessage());
        }
        
        // Fallback to generic name
        return "CV_" . date('Y-m-d_H-i-s');
    }
    
    /**
     * Regenerate XML content from database sections when XML is corrupted
     */
    private function regenerateXMLFromSections($cvId, $userId) {
        try {
            $db = Database::getInstance();
            $conn = $db->getConnection();
            
            error_log("regenerateXMLFromSections - Starting for CV ID: $cvId");
            
            $sectionData = [];
            
            // Personal Information
            $stmt = $conn->prepare("SELECT * FROM informations_personnelles WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $personalInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($personalInfo) {
                $sectionData['nom'] = $personalInfo['nom'];
                $sectionData['prenom'] = $personalInfo['prenom'];
                $sectionData['location'] = $personalInfo['localisation'];
                $sectionData['email'] = $personalInfo['email'];
                $sectionData['telephone'] = $personalInfo['telephone'];
                $sectionData['website'] = $personalInfo['site_web'];
                $sectionData['linkedin'] = $personalInfo['linkedin'];
                $sectionData['github'] = $personalInfo['github'];
                $sectionData['photo_path'] = $personalInfo['chemin_photo'];
            }
            
            // Profile
            $stmt = $conn->prepare("SELECT * FROM profils WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($profile) {
                $sectionData['profil_description'] = $profile['description'];
            }
            
            // Education
            $stmt = $conn->prepare("SELECT * FROM formations WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $education = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($education)) {
                $sectionData['education_degree'] = [];
                $sectionData['education_dates'] = [];
                $sectionData['education_university'] = [];
                $sectionData['education_field'] = [];
                $sectionData['education_details'] = [];
                
                foreach ($education as $edu) {
                    $sectionData['education_degree'][] = $edu['diplome'];
                    $sectionData['education_dates'][] = $edu['dates'];
                    $sectionData['education_university'][] = $edu['universite'];
                    $sectionData['education_field'][] = $edu['specialite'];
                    $sectionData['education_details'][] = $edu['description'];
                }
            }
            
            // Experience
            $stmt = $conn->prepare("SELECT * FROM experiences WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $experience = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($experience)) {
                $sectionData['experience_company'] = [];
                $sectionData['experience_dates'] = [];
                $sectionData['experience_position'] = [];
                $sectionData['experience_location'] = [];
                $sectionData['experience_details'] = [];
                
                foreach ($experience as $exp) {
                    $sectionData['experience_company'][] = $exp['entreprise'];
                    $sectionData['experience_dates'][] = $exp['dates'];
                    $sectionData['experience_position'][] = $exp['poste'];
                    $sectionData['experience_location'][] = $exp['lieu'];
                    $sectionData['experience_details'][] = $exp['description'];
                }
            }
            
            // Projects
            $stmt = $conn->prepare("SELECT * FROM projets WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($projects)) {
                $sectionData['project_name'] = [];
                $sectionData['project_link'] = [];
                $sectionData['project_details'] = [];
                
                foreach ($projects as $project) {
                    $sectionData['project_name'][] = $project['nom_projet'];
                    $sectionData['project_link'][] = $project['lien_projet'];
                    $sectionData['project_details'][] = $project['description'];
                }
            }
            
            // Skills
            $stmt = $conn->prepare("SELECT * FROM competences WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($skills)) {
                $sectionData['skill_category'] = [];
                $sectionData['skill_items'] = [];
                
                foreach ($skills as $skill) {
                    $sectionData['skill_category'][] = $skill['categorie'];
                    $sectionData['skill_items'][] = $skill['competences'];
                }
            }
            
            // Languages
            $stmt = $conn->prepare("SELECT * FROM langues WHERE id_cv = ?");
            $stmt->execute([$cvId]);
            $languages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($languages)) {
                $sectionData['language_name'] = [];
                $sectionData['language_level'] = [];
                
                foreach ($languages as $lang) {
                    $sectionData['language_name'][] = $lang['nom_langue'];
                    $sectionData['language_level'][] = $lang['niveau'];
                }
            }
            
            // Check if we have at least some data
            if (empty($sectionData['nom']) && empty($sectionData['prenom'])) {
                error_log("regenerateXMLFromSections - No personal info found for CV ID: $cvId");
                return null;
            }
            
            // Generate XML
            $newXML = $this->generateXMLContent($sectionData, $sectionData['photo_path'] ?? null);
            
            // Validate the generated XML
            $xml = simplexml_load_string($newXML);
            if (!$xml) {
                error_log("regenerateXMLFromSections - Generated XML is invalid for CV ID: $cvId");
                return null;
            }
            
            error_log("regenerateXMLFromSections - Successfully regenerated XML for CV ID: $cvId");
            return $newXML;
            
        } catch (Exception $e) {
            error_log("regenerateXMLFromSections - Error: " . $e->getMessage());
            return null;
        }
    }

    public function getUserFilieres() {
        // Since we're removing filière associations, this method is deprecated
        // but we'll keep it for backward compatibility and return an empty response
        $this->jsonResponse([
            'status' => 'success',
            'filieres' => [],
            'message' => 'Filière associations have been removed. Publishing is now direct.'
        ]);
    }

    public function getFilieres() {
        try {
            require_once __DIR__ . '/../Models/Filiere.php';
            $filiereModel = new Filiere();
            $filieres = $filiereModel->getAllFilieres();
            
            $this->jsonResponse([
                'status' => 'success',
                'filieres' => $filieres
            ]);
            
        } catch (Exception $e) {
            error_log("Error in getFilieres: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error retrieving filieres: ' . $e->getMessage()
            ], 500);
        }
    }

    public function publishCV() {
        $userId = $this->requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Method not allowed'
            ], 405);
            return;
        }

        $input = $this->getJsonInput();
        
        if (!isset($input['cv_id'])) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'CV ID is required'
            ], 400);
            return;
        }

        $cvId = intval($input['cv_id']);
        $isPublished = isset($input['is_published']) ? (bool)$input['is_published'] : true;

        try {
            // Verify the CV belongs to the user
            $cv = $this->cvModel->getUserCV($cvId, $userId);
            if (!$cv) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV not found'
                ], 404);
                return;
            }

            // Update the publication status
            $result = $this->cvModel->publishCV($cvId, $userId, $isPublished);
            
            if ($result) {
                $this->jsonResponse([
                    'status' => 'success',
                    'message' => $isPublished ? 'CV published successfully' : 'CV unpublished successfully',
                    'is_published' => $isPublished
                ]);
            } else {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Failed to update CV publication status'
                ], 500);
            }

        } catch (Exception $e) {
            error_log("Error in publishCV: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error updating CV publication status: ' . $e->getMessage()
            ], 500);
        }
    }
}
