<?php

require_once __DIR__ . '/../../core/bootstrap.php';

class CVController extends Controller {
    private $cvModel;
    private $userModel;
    
    public function __construct() {
        parent::__construct();
        $this->cvModel = new CV();
        $this->userModel = new User();
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
            
            error_log("CVController::getCVData - Success, returning CV data");
            $this->jsonResponse([
                'status' => 'success',
                'cv_id' => $cvId,
                'cv_data' => $xmlContent,           // For form.js compatibility
                'xml_content' => $xmlContent,       // For backward compatibility
                'cv' => [                           // For home.html compatibility
                    'data' => $xmlContent
                ]
            ]);
            
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
        
        $cvId = $input['cv_id'];
        
        try {
            // Verify CV exists and belongs to user
            $cv = $this->cvModel->getUserCV($cvId, $userId);
            
            if (!$cv) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'CV not found or you do not have permission to delete it'
                ], 404);
                return;
            }
            
            // Delete the CV
            $this->cvModel->deleteUserCV($cvId, $userId);
            
            $this->jsonResponse([
                'status' => 'success',
                'message' => 'CV deleted successfully'
            ]);
            
        } catch (Exception $e) {
            error_log("Error in deleteCV: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error deleting CV'
            ], 500);
        }
    }
    
    public function deleteAllCVs() {
        $userId = $this->requireAuth();
        
        try {
            // Delete all CVs for the user
            $this->cvModel->deleteAllUserCVs($userId);
            
            $this->jsonResponse([
                'status' => 'success',
                'message' => 'All CVs deleted successfully'
            ]);
            
        } catch (Exception $e) {
            error_log("Error in deleteAllCVs: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error deleting all CVs'
            ], 500);
        }
    }
    
    public function generateCV() {
        error_log("=== CV Generation Started ===");
        error_log("Session data: " . print_r($_SESSION, true));
        error_log("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'N/A'));
        error_log("Request headers: " . print_r(getallheaders(), true));
        
        // Check if this is a guest mode request
        $isGuestMode = isset($_POST['guest_mode']) && $_POST['guest_mode'] === 'true';
        error_log("Guest mode detected: " . ($isGuestMode ? 'true' : 'false'));
        
        $userId = null;
        if (!$isGuestMode) {
            $userId = $this->requireAuth();
            error_log("User ID authenticated: " . $userId);
        } else {
            error_log("Guest mode - skipping authentication");
        }
        
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            error_log("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Method not allowed'
            ], 405);
            return;
        }
        
        error_log("POST data received: " . print_r($_POST, true));
        
        try {
            $editingCVId = isset($_POST['editing_cv_id']) ? intval($_POST['editing_cv_id']) : null;
            
            // In guest mode, don't allow editing existing CVs
            if ($isGuestMode && $editingCVId) {
                error_log("Guest mode - editing not allowed");
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
            
            if ($editingCVId && !$isGuestMode) {
                // Update existing CV
                $this->cvModel->updateCV($editingCVId, $userId, $cvName, $xmlContent);
                $cvId = $editingCVId;
            } else if (!$isGuestMode) {
                // Create new CV for authenticated users
                $cvId = $this->cvModel->createCV($userId, $cvName, $xmlContent);
            } else {
                // Guest mode - generate temporary CV ID for PDF generation
                $cvId = 'guest_' . time() . '_' . rand(1000, 9999);
            }
            
            // Generate LaTeX and PDF
            $pdfResult = $this->generatePDF($xmlContent, $cvId, $isGuestMode);
            
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
        
        // Validate file type
        if ($file['type'] !== 'text/xml' && pathinfo($file['name'], PATHINFO_EXTENSION) !== 'xml') {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'File must be XML format'
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
            // Read XML content
            $xmlContent = file_get_contents($file['tmp_name']);
            
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
            $cvId = $this->cvModel->createCV($userId, $cvName, $xmlContent);
            
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
        // Check if a custom CV name was provided
        if (isset($formData['custom_cv_name']) && !empty(trim($formData['custom_cv_name']))) {
            $customName = trim($formData['custom_cv_name']);
            // Sanitize the custom name
            $customName = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $customName);
            $customName = str_replace(' ', '_', $customName);
            return $customName;
        }
        
        // Fallback to default naming scheme
        $nom = $formData['nom'] ?? '';
        $prenom = $formData['prenom'] ?? '';
        $timestamp = date('Y-m-d H:i:s');
        
        return "CV_{$prenom}_{$nom}_{$timestamp}";
    }
    
    private function generateXMLContent($formData, $photoPath) {
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
                        $xmlContent .= "      <description>" . ($education_details[$i] ?? ''). "</description>\n";
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
                                . "      <description>". ($experience_description[$i] ?? '') . "</description>\n"
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
                        $xmlContent .= "      <description>" . ($project_description[$i] ?? '') . "</description>\n";
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
        
        $prenom = (string)$xml->personalInfo->firstname;
        $nom = (string)$xml->personalInfo->lastname;
        $location = (string)$xml->personalInfo->location;
        $email = (string)$xml->personalInfo->email;
        $telephone = (string)$xml->personalInfo->phone;
        $website = (string)$xml->personalInfo->website;
        $linkedin = (string)$xml->personalInfo->linkedin;
        $github = (string)$xml->personalInfo->github;
        $photoPath = (string)$xml->personalInfo->photo;
        $profil = (string)$xml->profil->description;
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
            $sectionProfil = "     \\section{Profil}\n";
            $sectionProfil .= "        \\begin{onecolentry}\n";
            $sectionProfil .= "        " . $profil;
            $sectionProfil .= "        \\end{onecolentry}\n";
        }

        // Education Section
        $sectionEducation = "";
        if (isset($xml->education->degree)) {
            $sectionEducation = "    \\section{Formation}\n";
            foreach ($xml->education->degree as $degree) {
                $degreeTitle = (string)$degree->title;
                $dates = (string)$degree->period;
                $university = (string)$degree->institution;
                $field = (string)$degree->field;
                $detail = (string)$degree->description;

                // Prepare highlights
                $highlights = "";
                if (!empty($detail)) {
                    $highlights .= "\\item " . $detail . "\n            ";
                }
                if (!empty($field)) {
                    $highlights .= "\\item Field: " . $field . "\n            ";
                }

                $sectionEducation .= "    \\educationentry{" . $dates . "}{" . $degreeTitle . "}{" . $university . "}{}{" . $highlights . "}\n\n";
                    }
        }
        
        // Certificates Section
        $sectionCertificates = "";
        if (isset($xml->certificates->certificate)) {
            $sectionCertificates = "    \\section{Certificats}\n";
            foreach ($xml->certificates->certificate as $cert) {
                $certName = (string)$cert->name;
                $certDate = (string)$cert->date;
                $certIssuer = (string)$cert->issuer;
                $certLocation = (string)$cert->location;
                $certDescription = (string)$cert->description;

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
                $expPosition = (string)$exp->position;
                $expCompany = (string)$exp->company;
                $expDates = (string)$exp->period;
                $expLocation = (string)$exp->location;
                $expDescription = (string)$exp->description;

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
                $projectName = (string)$project->name;
                $projectLink = (string)$project->link;
                $projectDescription = (string)$project->description;

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
                $skillCategory = (string)$skill->category;
                $skillItems = (string)$skill->items;

                $sectionSkills .= "    \\skillsentry{" . $skillCategory . "}{" . $skillItems . "}\n\n";
            }
        }

        // Languages Section
        $sectionLanguages = "";
        if (isset($xml->languages->language)) {
            $sectionLanguages = "    \\section{Langues}\n";
            foreach ($xml->languages->language as $language) {
                $langName = (string)$language->name;
                $langLevel = (string)$language->level;
                $lang_items[] = $langName . " (" . $langLevel . ")";
            }
            $sectionLanguages .= "\    \skillsentry{Langues}{" . implode(", ", $lang_items) . "}\n\n";
        }
        
        $sectionFooter = "\\end{document}";
        
        $latexContent = $sectionHeader . $sectionProfil . $sectionEducation . $sectionCertificates . $sectionExperience . $sectionProjects . $sectionSkills . $sectionLanguages . $sectionFooter;

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
            $userId = $this->requireAuth();
        }
        
        $cvId = null;
        $format = 'pdf';
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = $this->getJsonInput();
            
            if ($isGuestMode) {
                if (!isset($input['guest_id'])) {
                    http_response_code(400);
                    exit('Guest CV ID required');
                }
                $cvId = $input['guest_id'];
            } else {
                if (!isset($input['cv_id'])) {
                    http_response_code(400);
                    exit('CV ID required');
                }
                $cvId = $input['cv_id'];
            }
            
            $format = isset($input['format']) ? $input['format'] : 'pdf';
        } else {
            // Handle GET requests
            if ($isGuestMode) {
                if (!isset($_GET['guest_id']) || !isset($_GET['format'])) {
                    http_response_code(400);
                    exit('Missing parameters for guest download');
                }
                $cvId = $_GET['guest_id'];
                $format = $_GET['format'];
            } else {
                if (!isset($_GET['id']) || !isset($_GET['format'])) {
                    http_response_code(400);
                    exit('Missing parameters');
                }
                $cvId = intval($_GET['id']);
                $format = $_GET['format'];
            }
        }
        
        try {
            if ($isGuestMode) {
                // For guest mode, only PDF downloads are allowed
                error_log("Guest download attempt - CV ID: " . $cvId . ", Format: " . $format);
                
                // Restrict guests to PDF only
                if ($format !== 'pdf') {
                    http_response_code(403);
                    $restrictedFormat = strtoupper($format);
                    exit($restrictedFormat . ' download requires authentication. Please create an account to access this format.');
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
                    
                    http_response_code(404);
                    exit('PDF file not found. Expected: ' . basename($pdfPath));
                }
                
                $filename = 'CV_Guest_' . date('Y-m-d') . '.pdf';
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Content-Length: ' . filesize($pdfPath));
                readfile($pdfPath);
                unlink($pdfPath);
                exit();
            } else {
                // Get CV from database for authenticated users
                $cv = $this->cvModel->getUserCV($cvId, $userId);
                
                if (!$cv) {
                    http_response_code(404);
                    exit('CV not found');
                }
                
                $xmlContent = $cv['xml_content'];
                $cvName = $cv['cv_name'];
                
                // Parse XML to get personal info
                $xml = simplexml_load_string($xmlContent);
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
            
        } catch (Exception $e) {
            error_log("Error in downloadCV: " . $e->getMessage());
            http_response_code(500);
            exit('Error downloading CV');
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
        try {
            $files = $this->generatePDF($xmlContent, 0);
            $texFile = $files['tex_file'];
            $filename = "CV_{$prenom}_{$nom}.tex";
            
            header('Content-Type: text/plain');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($texFile));
            header('Cache-Control: no-cache, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
            
            readfile($texFile);
            
            // Clean up
            $this->cleanupFiles($files);
            exit();
            
        } catch (Exception $e) {
            error_log("Error generating LaTeX: " . $e->getMessage());
            http_response_code(500);
            exit('Error generating LaTeX file');
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
            $zipFileName = $workingDir . "CV_{$prenom}_{$nom}.zip";
            
            // Create XML file
            $xmlFile = $workingDir . "CV_{$prenom}_{$nom}.xml";
            file_put_contents($xmlFile, $xmlContent);
            
            $zip = new ZipArchive();
            if ($zip->open($zipFileName, ZipArchive::CREATE) === TRUE) {
                // Add files to ZIP
                $zip->addFile($files['pdf_file'], "CV_{$prenom}_{$nom}.pdf");
                $zip->addFile($xmlFile, "CV_{$prenom}_{$nom}.xml");
                $zip->addFile($files['tex_file'], "CV_{$prenom}_{$nom}.tex");
                $zip->close();
                
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="CV_' . $prenom . '_' . $nom . '.zip"');
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
            error_log("Error generating ZIP: " . $e->getMessage());
            http_response_code(500);
            exit('Error generating ZIP file');
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

    public function generatePreview() {
        $userId = $this->requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit('Method not allowed');
        }
        
        $input = $this->getJsonInput();
        
        if (!isset($input['cv_id'])) {
            http_response_code(400);
            exit('CV ID required');
        }
        
        $cvId = $input['cv_id'];
        
        try {
            $xmlContent = $this->cvModel->getCVData($cvId, $userId);
            
            if (!$xmlContent) {
                http_response_code(404);
                exit('CV not found');
            }
            
            // Generate PDF for preview
            $files = $this->generatePDF($xmlContent, $cvId);
            $pdfFile = $files['pdf_file'];
            
            // Return PDF content
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="preview.pdf"');
            header('Content-Length: ' . filesize($pdfFile));
            
            readfile($pdfFile);
            
            // Clean up
            $this->cleanupFiles($files);
            exit();
            
        } catch (Exception $e) {
            error_log("Error in generatePreview: " . $e->getMessage());
            http_response_code(500);
            exit('Error generating preview');
        }
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
            
            // Debug: Log what form data is received
            error_log("Live Preview form data received:");
            error_log("Certificate data: " . print_r($input['certificate_name'] ?? 'MISSING', true));
            error_log("Project data: " . print_r($input['project_name'] ?? 'MISSING', true));
            error_log("Skill data: " . print_r($input['skill_category'] ?? 'MISSING', true));
            error_log("Language data: " . print_r($input['language_name'] ?? 'MISSING', true));
            
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
}
