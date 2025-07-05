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
        
        try {
            // 1. Personal Information
            if (isset($cleanFormData['nom']) && isset($cleanFormData['prenom'])) {
                $personalData = [
                    'user_id' => $userId,
                    'cv_id' => $cvId,
                    'nom' => $cleanFormData['nom'],
                    'prenom' => $cleanFormData['prenom'],
                    'location' => $cleanFormData['location'] ?? '',
                    'email' => $cleanFormData['email'] ?? '',
                    'telephone' => $cleanFormData['telephone'] ?? '',
                    'website' => $cleanFormData['website'] ?? null,
                    'linkedin' => $cleanFormData['linkedin'] ?? null,
                    'github' => $cleanFormData['github'] ?? null,
                    'photo_path' => $cleanFormData['photo_path'] ?? null
                ];
                $results['personal_info'] = $this->personalInfo->savePersonalInfo($personalData);
            }
            
            // 2. Profile
            if (isset($cleanFormData['profil_description'])) {
                $profileData = [
                    'user_id' => $userId,
                    'cv_id' => $cvId,
                    'profil_description' => $cleanFormData['profil_description']
                ];
                $results['profile'] = $this->profile->saveProfile($profileData);
            }
            
            // 3. Education
            if (isset($cleanFormData['education_degree']) && is_array($cleanFormData['education_degree'])) {
                $educationData = $this->formatArrayData($cleanFormData, 'education', [
                    'education_degree', 'education_dates', 'education_university', 
                    'education_field', 'education_details'
                ]);
                $results['education'] = $this->education->saveEducation($cvId, $userId, $educationData);
            }
            
            // 4. Experience
            if (isset($cleanFormData['experience_company']) && is_array($cleanFormData['experience_company'])) {
                $experienceData = $this->formatArrayData($cleanFormData, 'experience', [
                    'experience_location', 'experience_dates', 'experience_company',
                    'experience_position', 'experience_description'
                ]);
                $results['experience'] = $this->experience->saveExperience($cvId, $userId, $experienceData);
            }
            
            // 5. Projects
            if (isset($cleanFormData['project_name']) && is_array($cleanFormData['project_name'])) {
                $projectsData = $this->formatArrayData($cleanFormData, 'project', [
                    'project_name', 'project_link', 'project_description'
                ]);
                $results['projects'] = $this->projects->saveProjects($cvId, $userId, $projectsData);
            }
            
            // 6. Certificates
            if (isset($cleanFormData['certificate_name']) && is_array($cleanFormData['certificate_name'])) {
                $certificatesData = $this->formatArrayData($cleanFormData, 'certificate', [
                    'certificate_name', 'certificate_date', 'certificate_issuer',
                    'certificate_location', 'certificate_description'
                ]);
                $results['certificates'] = $this->certificates->saveCertificates($cvId, $userId, $certificatesData);
            }
            
            // 7. Skills
            if (isset($cleanFormData['skill_category']) && is_array($cleanFormData['skill_category'])) {
                $skillsData = $this->formatArrayData($cleanFormData, 'skill', [
                    'skill_category', 'skill_items'
                ]);
                $results['skills'] = $this->skills->saveSkills($cvId, $userId, $skillsData);
            }
            
            // 8. Languages
            if (isset($cleanFormData['language_name']) && is_array($cleanFormData['language_name'])) {
                $languagesData = $this->formatArrayData($cleanFormData, 'language', [
                    'language_name', 'language_level'
                ]);
                $results['languages'] = $this->languages->saveLanguages($cvId, $userId, $languagesData);
            }
            
            // 9. Customization
            if (isset($cleanFormData['primary_color']) || isset($cleanFormData['format'])) {
                $customizationData = [
                    'user_id' => $userId,
                    'cv_id' => $cvId,
                    'primary_color' => $cleanFormData['primary_color'] ?? '#667eea',
                    'download_format' => $cleanFormData['format'] ?? 'pdf'
                ];
                $results['customization'] = $this->customization->saveCustomization($customizationData);
            }
            
            return $results;
            
        } catch (Exception $e) {
            throw new Exception("Error saving CV sections: " . $e->getMessage());
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
        
        // Build the formatted array
        for ($i = 0; $i < $count; $i++) {
            $item = [];
            foreach ($fields as $field) {
                $item[$field] = isset($formData[$field][$i]) ? $formData[$field][$i] : '';
            }
            $result[] = $item;
        }
        
        return $result;
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
