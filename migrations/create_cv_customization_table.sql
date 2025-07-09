-- Create cv_customization table
CREATE TABLE IF NOT EXISTS cv_customization (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cv_id INT NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#667eea',
    download_format ENUM('pdf', 'xml', 'latex', 'all') DEFAULT 'pdf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_cv (user_id, cv_id)
);
