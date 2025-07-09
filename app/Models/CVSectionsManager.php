<?php

require_once __DIR__ . '/CVPersonalInfo.php';
require_once __DIR__ . '/CVProfile.php';
require_once __DIR__ . '/CVEducation.php';
require_once __DIR__ . '/CVExperience.php';
require_once __DIR__ . '/CVProjects.php';
require_once __DIR__ . '/CVCertificates.php';
require_once __DIR__ . '/CVSkills.php';
require_once __DIR__ . '/CVLanguages.php';
require_once __DIR__ . '/CVCustomization.php';

class CVSectionsManager {
    private $personalInfo;
    private $profile;
    private $education;
    private $experience;
    private $projects;
    private $certificates;
    private $skills;
    private $languages;
    private $customization;
    
    public function __construct() {
        $this->personalInfo = new CVPersonalInfo();
        $this->profile = new CVProfile();
        $this->education = new CVEducation();
        $this->experience = new CVExperience();
        $this->projects = new CVProjects();
        $this->certificates = new CVCertificates();
        $this->skills = new CVSkills();
        $this->languages = new CVLanguages();
        $this->customization = new CVCustomization();
    }
    
    /**
     * Save all CV sections data
     */
    public function saveAllSections($cvId, $userId, $formData) {
        $results = [];
        
        // Clean all form data for database storage
        $cleanFormData = $this->cleanArrayForDatabase($formData);
        
        // Add logging to debug form data
        error_log("CVSectionsManager::saveAllSections - CV ID: $cvId, User ID: $userId");
        error_log("CVSectionsManager::saveAllSections - Form data keys: " . implode(', ', array_keys($cleanFormData)));
        
        // Add detailed logging for array fields
        foreach (['education_degree', 'experience_company', 'project_name', 'certificate_name', 'skill_category', 'language_name'] as $arrayField) {
            if (isset($cleanFormData[$arrayField])) {
                error_log("CVSectionsManager::saveAllSections - $arrayField type: " . gettype($cleanFormData[$arrayField]) . ", count: " . (is_array($cleanFormData[$arrayField]) ? count($cleanFormData[$arrayField]) : 'N/A'));
            }
        }
        
        try {
            // 1. Personal Information
            if (isset($cleanFormData['nom']) && isset($cleanFormData['prenom'])) {
                try {
                    $personalData = [
                        'user_id' => $userId,
                        'cv_id' => $cvId,
                        'nom' => $cleanFormData['nom'],
                        'prenom' => $cleanFormData['prenom'],
                        'localisation' => $cleanFormData['localisation'] ?? '',  // Now using localisation directly
                        'email' => $cleanFormData['email'] ?? '',
                        'telephone' => $cleanFormData['telephone'] ?? '',
                        'site_web' => $cleanFormData['website'] ?? null,     // Map website to site_web
                        'linkedin' => $cleanFormData['linkedin'] ?? null,
                        'github' => $cleanFormData['github'] ?? null,
                        'chemin_photo' => $cleanFormData['photo_path'] ?? null  // Map photo_path to chemin_photo
                    ];
                    $results['personal_info'] = $this->personalInfo->savePersonalInfo($personalData);
                    error_log("CVSectionsManager::saveAllSections - Personal info saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Personal info error: " . $e->getMessage());
                    throw $e;
                }
            }
            
            // 2. Profile
            if (isset($cleanFormData['description'])) {
                try {
                    $profileData = [
                        'user_id' => $userId,
                        'cv_id' => $cvId,
                        'description' => $cleanFormData['description']  // Now using description directly
                    ];
                    $results['profile'] = $this->profile->saveProfile($profileData);
                    error_log("CVSectionsManager::saveAllSections - Profile saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Profile error: " . $e->getMessage());
                    throw $e;
                }
            }
            
            // 3. Education
            if (isset($cleanFormData['education_degree']) && is_array($cleanFormData['education_degree'])) {
                try {
                    $educationData = $this->formatArrayData($cleanFormData, 'education', [
                        'education_degree', 'education_dates', 'education_university', 
                        'education_field', 'education_details'
                    ]);
                    $results['education'] = $this->education->saveEducation($cvId, $educationData);
                    error_log("CVSectionsManager::saveAllSections - Education saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Education error: " . $e->getMessage());
                    throw new Exception("Error saving education: " . $e->getMessage());
                }
            }
            
            // 4. Experience
            if (isset($cleanFormData['experience_company']) && is_array($cleanFormData['experience_company'])) {
                try {
                    $experienceData = $this->formatArrayData($cleanFormData, 'experience', [
                        'experience_location', 'experience_dates', 'experience_company',
                        'experience_position', 'experience_description'
                    ]);
                    $results['experience'] = $this->experience->saveExperience($cvId, $experienceData);
                    error_log("CVSectionsManager::saveAllSections - Experience saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Experience error: " . $e->getMessage());
                    throw new Exception("Error saving experience: " . $e->getMessage());
                }
            }
            
            // 5. Projects
            if (isset($cleanFormData['project_name']) && is_array($cleanFormData['project_name'])) {
                try {
                    $projectsData = $this->formatArrayData($cleanFormData, 'project', [
                        'project_name', 'project_link', 'project_description'
                    ]);
                    $results['projects'] = $this->projects->saveProjects($cvId, $projectsData);
                    error_log("CVSectionsManager::saveAllSections - Projects saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Projects error: " . $e->getMessage());
                    throw new Exception("Error saving projects: " . $e->getMessage());
                }
            }
            
            // 6. Certificates
            if (isset($cleanFormData['certificate_name']) && is_array($cleanFormData['certificate_name'])) {
                try {
                    $certificatesData = $this->formatArrayData($cleanFormData, 'certificate', [
                        'certificate_name', 'certificate_date', 'certificate_issuer',
                        'certificate_location', 'certificate_description'
                    ]);
                    $results['certificates'] = $this->certificates->saveCertificates($cvId, $certificatesData);
                    error_log("CVSectionsManager::saveAllSections - Certificates saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Certificates error: " . $e->getMessage());
                    throw new Exception("Error saving certificates: " . $e->getMessage());
                }
            }
            
            // 7. Skills
            if (isset($cleanFormData['skill_category']) && is_array($cleanFormData['skill_category'])) {
                try {
                    $skillsData = $this->formatArrayData($cleanFormData, 'skill', [
                        'skill_category', 'skill_items'
                    ]);
                    $results['skills'] = $this->skills->saveSkills($cvId, $skillsData);
                    error_log("CVSectionsManager::saveAllSections - Skills saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Skills error: " . $e->getMessage());
                    throw new Exception("Error saving skills: " . $e->getMessage());
                }
            }
            
            // 8. Languages
            if (isset($cleanFormData['language_name']) && is_array($cleanFormData['language_name'])) {
                try {
                    $languagesData = $this->formatArrayData($cleanFormData, 'language', [
                        'language_name', 'language_level'
                    ]);
                    $results['languages'] = $this->languages->saveLanguages($cvId, $languagesData);
                    error_log("CVSectionsManager::saveAllSections - Languages saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Languages error: " . $e->getMessage());
                    throw new Exception("Error saving languages: " . $e->getMessage());
                }
            }
            
            // 9. Customization
            if (isset($cleanFormData['primary_color']) || isset($cleanFormData['format'])) {
                try {
                    $customizationData = [
                        'user_id' => $userId,
                        'cv_id' => $cvId,
                        'primary_color' => $cleanFormData['primary_color'] ?? '#667eea',
                        'download_format' => $cleanFormData['format'] ?? 'pdf'
                    ];
                    $results['customization'] = $this->customization->saveCustomization($customizationData);
                    error_log("CVSectionsManager::saveAllSections - Customization saved successfully");
                } catch (Exception $e) {
                    error_log("CVSectionsManager::saveAllSections - Customization error: " . $e->getMessage());
                    throw new Exception("Error saving customization: " . $e->getMessage());
                }
            }
            
            return $results;
            
        } catch (Exception $e) {
            error_log("CVSectionsManager::saveAllSections - Database error: " . $e->getMessage());
            error_log("CVSectionsManager::saveAllSections - Stack trace: " . $e->getTraceAsString());
            throw new Exception("Error saving CV sections: Database operation failed - " . $e->getMessage());
        }
    }
    
    /**
     * Get all CV sections data
     */
    public function getAllSections($cvId, $userId) {
        return [
            'personal_info' => $this->personalInfo->getPersonalInfo($cvId, $userId),
            'profile' => $this->profile->getProfile($cvId, $userId),
            'education' => $this->education->getEducation($cvId, $userId),
            'experience' => $this->experience->getExperience($cvId, $userId),
            'projects' => $this->projects->getProjects($cvId, $userId),
            'certificates' => $this->certificates->getCertificates($cvId, $userId),
            'skills' => $this->skills->getSkills($cvId, $userId),
            'languages' => $this->languages->getLanguages($cvId, $userId),
            'customization' => $this->customization->getCustomization($cvId, $userId)
        ];
    }
    
    /**
     * Delete all CV sections data
     */
    public function deleteAllSections($cvId, $userId) {
        $this->personalInfo->deletePersonalInfo($cvId, $userId);
        $this->profile->deleteProfile($cvId, $userId);
        $this->education->deleteEducation($cvId, $userId);
        $this->experience->deleteExperience($cvId, $userId);
        $this->projects->deleteProjects($cvId, $userId);
        $this->certificates->deleteCertificates($cvId, $userId);
        $this->skills->deleteSkills($cvId, $userId);
        $this->languages->deleteLanguages($cvId, $userId);
        $this->customization->deleteCustomization($cvId, $userId);
    }
    
    /**
     * Format array data from form inputs
     */
    private function formatArrayData($formData, $prefix, $fields) {
        $result = [];
        $count = 0;
        
        // Find the maximum count from any field
        foreach ($fields as $field) {
            if (isset($formData[$field]) && is_array($formData[$field])) {
                $count = max($count, count($formData[$field]));
            }
        }
        
        // Build the formatted array with proper field mapping
        for ($i = 0; $i < $count; $i++) {
            $item = [];
            foreach ($fields as $field) {
                $mappedKey = $this->mapFormFieldToDbField($field, $prefix);
                $item[$mappedKey] = isset($formData[$field][$i]) ? $formData[$field][$i] : '';
            }
            $result[] = $item;
        }
        
        return $result;
    }
    
    /**
     * Map form field names to database field names
     */
    private function mapFormFieldToDbField($formField, $prefix) {
        $mappings = [
            // Education mappings
            'education_degree' => 'diplome',
            'education_dates' => 'dates', 
            'education_university' => 'universite',
            'education_field' => 'specialite',
            'education_details' => 'description',
            
            // Experience mappings
            'experience_location' => 'lieu',
            'experience_dates' => 'dates',
            'experience_company' => 'entreprise',
            'experience_position' => 'poste',
            'experience_description' => 'description',
            
            // Project mappings
            'project_name' => 'nom_projet',
            'project_link' => 'lien_projet',
            'project_description' => 'description',
            
            // Certificate mappings
            'certificate_name' => 'nom_certificat',
            'certificate_date' => 'date_certificat',
            'certificate_issuer' => 'organisme',
            'certificate_location' => 'lieu',
            'certificate_description' => 'description',
            
            // Skills mappings
            'skill_category' => 'categorie',
            'skill_items' => 'competences',
            
            // Languages mappings
            'language_name' => 'nom_langue',
            'language_level' => 'niveau'
        ];
        
        return $mappings[$formField] ?? $formField;
    }
    
    /**
     * Clean text for database storage by decoding HTML entities
     */
    private function cleanForDatabase($text) {
        if (is_string($text)) {
            return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
        return $text;
    }
    
    /**
     * Recursively clean array data for database storage
     */
    private function cleanArrayForDatabase($data) {
        if (is_array($data)) {
            return array_map([$this, 'cleanArrayForDatabase'], $data);
        }
        return $this->cleanForDatabase($data);
    }
}
