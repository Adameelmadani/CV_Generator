<?php

require_once __DIR__ . '/../../core/bootstrap.php';
require_once __DIR__ . '/User.php';

class CV extends Model {
    protected $table = 'cvs';
    
    public function getUserCVs($userId) {
        $sql = "SELECT c.id, c.contenu_xml, c.lien_pdf, c.est_publie, c.date_creation, c.date_modification, c.id_filiere,
                       COALESCE(CONCAT(p.prenom, ' ', p.nom), 'CV sans nom') as cv_name,
                       COALESCE(CONCAT(p.prenom, ' ', p.nom), 'CV sans nom') as display_name,
                       c.date_creation as created_at,
                       c.date_modification as updated_at
                FROM {$this->table} c
                LEFT JOIN informations_personnelles p ON c.id = p.id_cv
                WHERE c.id_utilisateur = :user_id 
                ORDER BY c.date_modification DESC";
        
        $stmt = $this->execute($sql, [':user_id' => $userId]);
        return $stmt->fetchAll();
    }
    
    public function getUserCV($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id = :cv_id AND id_utilisateur = :user_id";
        
        $stmt = $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId
        ]);
        
        return $stmt->fetch();
    }
    
    public function createCV($userId, $xmlContent, $cvName = null, $pdfPath = null, $templateXslt = null, $userFiliereId = null) {
        // Validate inputs
        if (empty($userId) || empty($xmlContent)) {
            error_log("ERROR: Invalid input data for CV creation - userId: " . $userId . ", xmlContent length: " . strlen($xmlContent));
            throw new Exception("Invalid input data for CV creation");
        }
        
        // If userFiliereId is not provided, get it from the user data
        if ($userFiliereId === null) {
            $userModel = new User();
            $userData = $userModel->findById($userId);
            $userFiliereId = $userData['id_filiere'] ?? null;
        }
        
        // Log creation details for debugging
        error_log("CV::createCV - XML content length: " . strlen($xmlContent));
        error_log("CV::createCV - CV name: " . ($cvName ?: 'auto-generated'));
        error_log("CV::createCV - User filiere ID: " . ($userFiliereId ?: 'none'));
        
        $data = [
            ':id_utilisateur' => $userId,
            ':contenu_xml' => $xmlContent,
            ':cv_name' => $cvName,
            ':lien_pdf' => $pdfPath,
            ':template_xslt' => $templateXslt,
            ':est_publie' => false,
            ':date_creation' => date('Y-m-d'),
            ':date_modification' => date('Y-m-d'),
            ':id_filiere' => $userFiliereId
        ];
        
        $sql = "INSERT INTO {$this->table} (id_utilisateur, contenu_xml, cv_name, lien_pdf, template_xslt, est_publie, date_creation, date_modification, id_filiere) 
                VALUES (:id_utilisateur, :contenu_xml, :cv_name, :lien_pdf, :template_xslt, :est_publie, :date_creation, :date_modification, :id_filiere)";
        
        try {
            $stmt = $this->execute($sql, $data);
            $cvId = $this->db->lastInsertId();
            
            if (!$cvId) {
                error_log("ERROR: No CV ID returned from database after insertion");
                throw new Exception("Failed to get CV ID after insertion");
            }
            
            // Verify the CV was actually created
            $verifySQL = "SELECT id FROM {$this->table} WHERE id = :cv_id AND id_utilisateur = :user_id";
            $verifyStmt = $this->execute($verifySQL, [':cv_id' => $cvId, ':user_id' => $userId]);
            $verifyResult = $verifyStmt->fetch();
            
            if (!$verifyResult) {
                error_log("ERROR: CV verification failed - CV not found in database after creation");
                throw new Exception("CV verification failed after creation");
            }
            
            return $cvId;
        } catch (Exception $e) {
            error_log("ERROR creating CV: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function updateCV($cvId, $userId, $cvName, $xmlContent, $pdfPath = null, $templateXslt = null, $isPublished = null) {
        $data = [
            ':cv_id' => $cvId,
            ':user_id' => $userId,
            ':cv_name' => $cvName,
            ':contenu_xml' => $xmlContent,
            ':date_modification' => date('Y-m-d')
        ];
        
        $sql = "UPDATE {$this->table} 
                SET cv_name = :cv_name, contenu_xml = :contenu_xml, date_modification = :date_modification";
        
        if ($pdfPath !== null) {
            $data[':lien_pdf'] = $pdfPath;
            $sql .= ", lien_pdf = :lien_pdf";
        }
        
        if ($templateXslt !== null) {
            $data[':template_xslt'] = $templateXslt;
            $sql .= ", template_xslt = :template_xslt";
        }
        
        if ($isPublished !== null) {
            $data[':est_publie'] = $isPublished;
            $sql .= ", est_publie = :est_publie";
        }
        
        $sql .= " WHERE id = :cv_id AND id_utilisateur = :user_id";
        
        return $this->execute($sql, $data);
    }
    
    public function deleteUserCV($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :cv_id AND id_utilisateur = :user_id";
        return $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId
        ]);
    }
    
    public function deleteAllUserCVs($userId) {
        $sql = "DELETE FROM {$this->table} WHERE id_utilisateur = :user_id";
        return $this->execute($sql, [
            ':user_id' => $userId
        ]);
    }
    
    public function getCVData($cvId, $userId) {
        $sql = "SELECT contenu_xml FROM {$this->table} 
                WHERE id = :cv_id AND id_utilisateur = :user_id";
        
        $stmt = $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId
        ]);
        
        $result = $stmt->fetch();
        return $result ? $result['contenu_xml'] : null;
    }
    
    public function updatePDFPath($cvId, $userId, $pdfPath) {
        $sql = "UPDATE {$this->table} 
                SET lien_pdf = :lien_pdf, date_modification = :date_modification 
                WHERE id = :cv_id AND id_utilisateur = :user_id";
        
        return $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId,
            ':lien_pdf' => $pdfPath,
            ':date_modification' => date('Y-m-d')
        ]);
    }
    
    public function publishCV($cvId, $userId, $isPublished = true) {
        $sql = "UPDATE {$this->table} 
                SET est_publie = :est_publie, date_modification = :date_modification 
                WHERE id = :cv_id AND id_utilisateur = :user_id";
        
        return $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId,
            ':est_publie' => $isPublished,
            ':date_modification' => date('Y-m-d')
        ]);
    }
}
