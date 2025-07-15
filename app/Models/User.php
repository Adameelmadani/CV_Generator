<?php

require_once __DIR__ . '/../../core/Model.php';

class User extends Model {
    protected $table = 'utilisateurs';
    
    public function findByEmail($email) {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = $this->execute($sql, [':email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findById($userId) {
        $sql = "SELECT * FROM {$this->table} WHERE id = :user_id";
        $stmt = $this->execute($sql, [':user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmailOrUsername($email, $username) {
        // Since the new schema doesn't have username, just search by email
        return $this->findByEmail($email);
    }
    
    public function createUser($nom, $prenom, $email, $hashedPassword, $phoneNumber) {
        $sql = "INSERT INTO {$this->table} (nom, prenom, email, mot_de_passe_hash, numero_telephone, date_inscription) 
                VALUES (:nom, :prenom, :email, :password, :phone_number, :date_inscription)";
        $this->execute($sql, [
            ':nom' => $nom,
            ':prenom' => $prenom,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':phone_number' => $phoneNumber,
            ':date_inscription' => date('Y-m-d')
        ]);
        return $this->db->lastInsertId();
    }
    
    public function verifyPassword($password, $hashedPassword) {
        return password_verify($password, $hashedPassword);
    }
    
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    
    public function validateNom($nom) {
        $errors = [];
        
        if (empty($nom)) {
            $errors[] = 'Le nom est requis.';
        } elseif (strlen($nom) < 2) {
            $errors[] = 'Le nom doit contenir au moins 2 caractères.';
        } elseif (strlen($nom) > 255) {
            $errors[] = 'Le nom ne peut pas dépasser 255 caractères.';
        }
        
        return $errors;
    }
    
    public function validatePrenom($prenom) {
        $errors = [];
        
        if (empty($prenom)) {
            $errors[] = 'Le prénom est requis.';
        } elseif (strlen($prenom) < 2) {
            $errors[] = 'Le prénom doit contenir au moins 2 caractères.';
        } elseif (strlen($prenom) > 255) {
            $errors[] = 'Le prénom ne peut pas dépasser 255 caractères.';
        }
        
        return $errors;
    }
    
    public function validateEmail($email) {
        $errors = [];
        
        if (empty($email)) {
            $errors[] = 'L\'email est requis.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Format d\'email invalide.';
        }
        
        return $errors;
    }
    
    public function validatePassword($password) {
        $errors = [];
        
        if (empty($password)) {
            $errors[] = 'Le mot de passe est requis.';
        } elseif (strlen($password) < 6) {
            $errors[] = 'Le mot de passe doit contenir au moins 6 caractères.';
        }
        
        return $errors;
    }
    
    public function getUserById($id) {
        $sql = "SELECT id, nom, prenom, email, numero_telephone, date_inscription FROM {$this->table} WHERE id = :id";
        $stmt = $this->execute($sql, [':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function deleteUserByEmail($email) {
        $sql = "DELETE FROM {$this->table} WHERE email = :email";
        $stmt = $this->execute($sql, [':email' => $email]);
        return $stmt->rowCount() > 0;
    }
    
    public function findUserForPasswordReset($email, $phone) {
        // Vérifier que l'utilisateur existe avec l'email et le téléphone fournis
        $sql = "SELECT id, nom, prenom, email FROM {$this->table} WHERE email = :email AND numero_telephone = :phone";
        $stmt = $this->execute($sql, [':email' => $email, ':phone' => $phone]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
