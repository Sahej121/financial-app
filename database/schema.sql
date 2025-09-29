-- Financial App Database Schema
-- Multiple databases for different entities

-- =============================================
-- USER AUTHENTICATION DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS user_auth_db;
USE user_auth_db;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role ENUM('user', 'ca', 'analyst', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_verification_token (verification_token),
    INDEX idx_reset_token (reset_password_token)
);

-- OAuth providers table
CREATE TABLE oauth_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    provider ENUM('google', 'facebook', 'linkedin', 'twitter') NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    provider_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_user (provider, provider_id),
    INDEX idx_user_provider (user_id, provider)
);

-- User sessions table
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- =============================================
-- DOCUMENTS DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS documents_db;
USE documents_db;

CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    category ENUM('tax_documents', 'financial_statements', 'bank_statements', 'invoices', 'receipts', 'contracts', 'identity_documents', 'other') DEFAULT 'other',
    status ENUM('uploaded', 'processing', 'verified', 'rejected', 'archived') DEFAULT 'uploaded',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    description TEXT,
    tags JSON,
    metadata JSON,
    checksum VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_file_type (file_type)
);

-- Document assignments to professionals
CREATE TABLE document_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    assigned_to_id INT NOT NULL,
    assigned_role ENUM('ca', 'analyst', 'reviewer') NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('assigned', 'in_review', 'reviewed', 'approved', 'rejected', 'requires_changes') DEFAULT 'assigned',
    review_notes TEXT,
    reviewed_at TIMESTAMP NULL,
    deadline DATETIME,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_status (status)
);

-- Document versions for tracking changes
CREATE TABLE document_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    version_number INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    changes_description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_document_version (document_id, version_number)
);

-- =============================================
-- CA PROFILES DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS ca_profiles_db;
USE ca_profiles_db;

CREATE TABLE ca_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ca_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    profile_picture VARCHAR(500),
    bio TEXT,
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_consultations INT DEFAULT 0,
    total_clients INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    availability_status ENUM('available', 'busy', 'offline', 'on_break') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_ca_number (ca_number),
    INDEX idx_rating (rating),
    INDEX idx_is_active (is_active),
    INDEX idx_availability (availability_status)
);

-- CA specializations
CREATE TABLE ca_specializations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ca_id INT NOT NULL,
    specialization ENUM('tax_planning', 'audit', 'financial_planning', 'business_consulting', 'investment_advice', 'insurance_planning', 'retirement_planning', 'estate_planning', 'gst_compliance', 'company_law', 'other') NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    years_experience INT DEFAULT 0,
    FOREIGN KEY (ca_id) REFERENCES ca_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ca_specialization (ca_id, specialization),
    INDEX idx_ca_id (ca_id),
    INDEX idx_specialization (specialization)
);

-- CA qualifications and certifications
CREATE TABLE ca_qualifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ca_id INT NOT NULL,
    qualification_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(255),
    certificate_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ca_id) REFERENCES ca_profiles(id) ON DELETE CASCADE,
    INDEX idx_ca_id (ca_id),
    INDEX idx_qualification (qualification_name)
);

-- CA languages
CREATE TABLE ca_languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ca_id INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    proficiency ENUM('basic', 'conversational', 'fluent', 'native') DEFAULT 'conversational',
    FOREIGN KEY (ca_id) REFERENCES ca_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ca_language (ca_id, language),
    INDEX idx_ca_id (ca_id)
);

-- CA availability schedule
CREATE TABLE ca_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ca_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ca_id) REFERENCES ca_profiles(id) ON DELETE CASCADE,
    INDEX idx_ca_day (ca_id, day_of_week)
);

-- CA reviews and ratings
CREATE TABLE ca_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ca_id INT NOT NULL,
    client_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    consultation_id INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ca_id) REFERENCES ca_profiles(id) ON DELETE CASCADE,
    INDEX idx_ca_id (ca_id),
    INDEX idx_client_id (client_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- ANALYST PROFILES DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS analyst_profiles_db;
USE analyst_profiles_db;

CREATE TABLE analyst_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    analyst_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    profile_picture VARCHAR(500),
    bio TEXT,
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_consultations INT DEFAULT 0,
    total_clients INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    availability_status ENUM('available', 'busy', 'offline', 'on_break') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_analyst_id (analyst_id),
    INDEX idx_rating (rating),
    INDEX idx_is_active (is_active),
    INDEX idx_availability (availability_status)
);

-- Analyst specializations
CREATE TABLE analyst_specializations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analyst_id INT NOT NULL,
    specialization ENUM('equity_research', 'technical_analysis', 'fundamental_analysis', 'portfolio_management', 'risk_management', 'derivatives', 'commodities', 'forex', 'mutual_funds', 'insurance_products', 'retirement_planning', 'tax_planning', 'other') NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    years_experience INT DEFAULT 0,
    FOREIGN KEY (analyst_id) REFERENCES analyst_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_analyst_specialization (analyst_id, specialization),
    INDEX idx_analyst_id (analyst_id),
    INDEX idx_specialization (specialization)
);

-- Analyst qualifications and certifications
CREATE TABLE analyst_qualifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analyst_id INT NOT NULL,
    qualification_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(255),
    certificate_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (analyst_id) REFERENCES analyst_profiles(id) ON DELETE CASCADE,
    INDEX idx_analyst_id (analyst_id),
    INDEX idx_qualification (qualification_name)
);

-- Analyst languages
CREATE TABLE analyst_languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analyst_id INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    proficiency ENUM('basic', 'conversational', 'fluent', 'native') DEFAULT 'conversational',
    FOREIGN KEY (analyst_id) REFERENCES analyst_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_analyst_language (analyst_id, language),
    INDEX idx_analyst_id (analyst_id)
);

-- Analyst availability schedule
CREATE TABLE analyst_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analyst_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (analyst_id) REFERENCES analyst_profiles(id) ON DELETE CASCADE,
    INDEX idx_analyst_day (analyst_id, day_of_week)
);

-- Analyst reviews and ratings
CREATE TABLE analyst_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analyst_id INT NOT NULL,
    client_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    consultation_id INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analyst_id) REFERENCES analyst_profiles(id) ON DELETE CASCADE,
    INDEX idx_analyst_id (analyst_id),
    INDEX idx_client_id (client_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- METADATA AND ANALYTICS DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS metadata_analytics_db;
USE metadata_analytics_db;

-- System metadata
CREATE TABLE system_metadata (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('user', 'document', 'ca', 'analyst') NOT NULL,
    entity_id INT NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_metadata_key (metadata_key)
);

-- User activity logs
CREATE TABLE user_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    entity_type ENUM('user', 'document', 'ca', 'analyst', 'system') NOT NULL,
    entity_id INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_recorded_at (recorded_at)
);

-- Audit logs
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_action (action),
    INDEX idx_changed_at (changed_at)
);
