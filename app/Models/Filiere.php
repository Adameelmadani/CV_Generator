<?php

require_once __DIR__ . '/../../core/Model.php';

class Filiere extends Model {
    protected $table = 'filieres';
    
    public function getAllFilieres() {
        $sql = "SELECT * FROM {$this->table} ORDER BY nom ASC";
        $stmt = $this->execute($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getFiliereById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->execute($sql, [':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function createFiliere($nom, $description = null) {
        $sql = "INSERT INTO {$this->table} (nom, description) VALUES (:nom, :description)";
        $this->execute($sql, [
            ':nom' => $nom,
            ':description' => $description
        ]);
        return $this->db->lastInsertId();
    }
    
    public function updateFiliere($id, $nom, $description = null) {
        $sql = "UPDATE {$this->table} SET nom = :nom, description = :description WHERE id = :id";
        return $this->execute($sql, [
            ':id' => $id,
            ':nom' => $nom,
            ':description' => $description
        ]);
    }
    
    public function deleteFiliere($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";
        return $this->execute($sql, [':id' => $id]);
    }
    
    public function getFiliereAssociees($filiereId) {
        $sql = "SELECT f.* FROM {$this->table} f 
                INNER JOIN filiere_associee fa ON f.id = fa.filiere_associee_id 
                WHERE fa.filiere_id = :filiere_id";
        $stmt = $this->execute($sql, [':filiere_id' => $filiereId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function addFiliereAssociation($filiereId, $filiereAssocieeId) {
        $sql = "INSERT INTO filiere_associee (filiere_id, filiere_associee_id) VALUES (:filiere_id, :filiere_associee_id)";
        return $this->execute($sql, [
            ':filiere_id' => $filiereId,
            ':filiere_associee_id' => $filiereAssocieeId
        ]);
    }
    
    public function removeFiliereAssociation($filiereId, $filiereAssocieeId) {
        $sql = "DELETE FROM filiere_associee WHERE filiere_id = :filiere_id AND filiere_associee_id = :filiere_associee_id";
        return $this->execute($sql, [
            ':filiere_id' => $filiereId,
            ':filiere_associee_id' => $filiereAssocieeId
        ]);
    }
}
