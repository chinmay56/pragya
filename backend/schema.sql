-- ==========================================================
-- Pragya AI - Sovereign AI Workbench for MRPL
-- Complete Clean Database Initialization Script
-- Database: MySQL 8.0+
-- ==========================================================

-- 1. Clean Reset: Drop and recreate database from scratch
DROP DATABASE IF EXISTS `pragya_ai`;

CREATE DATABASE `pragya_ai` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `pragya_ai`;

-- 2. Users Table (Core Auth Table with Admin Approval Workflow)
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `role` ENUM('admin', 'engineer', 'auditor', 'analyst') NOT NULL DEFAULT 'engineer',
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approved_by` INT DEFAULT NULL,
    `approved_at` TIMESTAMP NULL DEFAULT NULL,
    `auth_provider` ENUM('local', 'ldap', 'sso', 'airgap_token') NOT NULL DEFAULT 'local',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `last_login_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_status` (`status`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Auth Sessions & Refresh Tokens Table
CREATE TABLE `auth_sessions` (
    `id` VARCHAR(64) PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(500) DEFAULT NULL,
    `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_auth_sessions_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_auth_sessions_user` (`user_id`),
    INDEX `idx_auth_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Air-Gapped Master Keys Table
CREATE TABLE `airgap_api_keys` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `key_name` VARCHAR(100) NOT NULL,
    `key_prefix` VARCHAR(16) NOT NULL,
    `key_hash` VARCHAR(255) NOT NULL,
    `permissions` JSON DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_airgap_keys_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_key_prefix` (`key_prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Logs Table (Strict ISO-27001 On-Premises Compliance)
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(150) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `details` JSON DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Knowledge Documents Table (Centralized Refinery Documents)
CREATE TABLE `knowledge_documents` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` ENUM('SOP', 'Inspection Report', 'Technical Manual', 'Safety Policy', 'P&ID') NOT NULL,
    `unit` VARCHAR(100) NOT NULL,
    `access_level` ENUM('Confidential', 'Restricted', 'Public-Internal') NOT NULL DEFAULT 'Confidential',
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` VARCHAR(50) DEFAULT '4.2 MB',
    `version` VARCHAR(50) DEFAULT 'v1.0',
    `indexed_vectors` INT NOT NULL DEFAULT 0,
    `content` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_docs_category` (`category`),
    INDEX `idx_docs_unit` (`unit`),
    INDEX `idx_docs_access` (`access_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Document Embeddings & Vector Store Table (Persistent 384-D Vectors)
CREATE TABLE `document_embeddings` (
    `id` VARCHAR(64) PRIMARY KEY,
    `document_id` VARCHAR(64) NOT NULL,
    `collection_name` VARCHAR(100) NOT NULL,
    `chunk_index` INT NOT NULL DEFAULT 0,
    `chunk_text` TEXT NOT NULL,
    `vector_dimensions` INT NOT NULL DEFAULT 384,
    `distance_metric` VARCHAR(20) NOT NULL DEFAULT 'Cosine',
    `embedding_vector` JSON NOT NULL, -- Storing 384-dimensional float vector array: [0.0491, -0.0132, ...]
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_embeddings_document` FOREIGN KEY (`document_id`) 
        REFERENCES `knowledge_documents` (`id`) ON DELETE CASCADE,
    INDEX `idx_embeddings_doc` (`document_id`),
    INDEX `idx_embeddings_collection` (`collection_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. User Chat Sessions Table (ChatGPT-Style Multi-Turn Sessions per User)
CREATE TABLE `chat_sessions` (
    `id` VARCHAR(64) PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `model_name` VARCHAR(100) NOT NULL DEFAULT 'qwen3:8b',
    `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
    `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_chat_sessions_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_sessions_user_updated` (`user_id`, `updated_at`),
    INDEX `idx_sessions_archived` (`is_archived`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Chat Messages Table (Stores User Prompts and AI Responses per Session)
CREATE TABLE `chat_messages` (
    `id` VARCHAR(64) PRIMARY KEY,
    `session_id` VARCHAR(64) NOT NULL,
    `user_id` INT NOT NULL,
    `role` ENUM('user', 'assistant', 'system') NOT NULL,
    `content` LONGTEXT NOT NULL,
    `citations` JSON DEFAULT NULL, -- Stores grounded SOP vectors: [{"title": "MRPL-SOP-VDU-204", "section": "4.2"}]
    `tokens_count` INT DEFAULT 0,
    `latency_ms` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_chat_messages_session` FOREIGN KEY (`session_id`) 
        REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_chat_messages_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_messages_session_time` (`session_id`, `created_at`),
    INDEX `idx_messages_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Chat Attachments Table (Attached PDFs, P&ID CAD scans, NDT Images)
CREATE TABLE `chat_attachments` (
    `id` VARCHAR(64) PRIMARY KEY,
    `message_id` VARCHAR(64) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `storage_path` VARCHAR(500) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_chat_attachments_message` FOREIGN KEY (`message_id`) 
        REFERENCES `chat_messages` (`id`) ON DELETE CASCADE,
    INDEX `idx_attachments_message` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Seed Users (Admin & Pre-approved profiles)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `status`, `auth_provider`) VALUES
(1, 'admin', 'admin@pragya.internal', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'System Administrator', 'admin', 'approved', 'local'),
(2, 'chinmay', 'chinmay@enterprise.internal', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Chinmay', 'engineer', 'approved', 'local'),
(3, 'rajesh', 'rajesh.analyst@enterprise.internal', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Rajesh Patel', 'analyst', 'pending', 'local'),
(4, 'priya', 'priya.audit@enterprise.internal', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Priya Menon', 'auditor', 'pending', 'ldap');

-- 12. Seed Knowledge Documents
INSERT INTO `knowledge_documents` (`id`, `title`, `category`, `unit`, `access_level`, `file_name`, `file_size`, `version`, `indexed_vectors`, `content`) VALUES
('doc-mrpl-01', 'MRPL-SOP-CDU-402: Crude Distillation Unit Startup & Emergency Depressurization', 'SOP', 'CDU-1', 'Confidential', 'MRPL_SOP_CDU_402_Rev4.pdf', '6.4 MB', 'v4.2', 1420, 'Standard operating procedure for Crude Distillation Unit (CDU-1) column pre-heating, reflux stabilization, and emergency depressurization sequences under nitrogen purge.'),
('doc-mrpl-02', 'MRPL-INSP-2026-B04: High-Pressure Steam Boiler Ultrasonic Thickness & Weld Integrity Audit', 'Inspection Report', 'Captive Power Plant', 'Restricted', 'MRPL_Boiler_Inspection_2026_Q1.pdf', '12.8 MB', 'v1.0', 3840, 'Non-destructive testing (NDT) inspection results for 25MW boiler steam drum welds. Minimum wall thickness measured at 34.2mm against design threshold of 32.0mm. Relief valve PRV-402 calibrated with +4.2% setpoint tolerance.'),
('doc-mrpl-03', 'MRPL-MAN-DSU-108: Hydro-Desulfurization (DHDS) Catalyst Loading & Reactivation Manual', 'Technical Manual', 'Desulfurization', 'Confidential', 'DHDS_Catalyst_Operating_Manual.pdf', '18.2 MB', 'v3.1', 5210, 'Vendor technical operating manual for Co-Mo/Al2O3 hydrotreating catalyst bed regeneration, sulfur equilibrium calculations, and hydrogen gas circulation rates.'),
('doc-mrpl-04', 'MRPL-PID-UTL-088: Piping & Instrumentation Diagram - Cooling Water & Nitrogen Blanket', 'P&ID', 'Utilities', 'Restricted', 'PID_Cooling_Nitrogen_Loop_RevD.dwg', '24.5 MB', 'Rev D', 2900, 'P&ID engineering drawings detailing ISA-5.1 tag numbers for control valves FCV-101 to FCV-114, fail-closed safety interlocks, and emergency flare line tie-ins.');

-- 13. Seed Chat Sessions & Messages for User (Chinmay, user_id = 2)
INSERT INTO `chat_sessions` (`id`, `user_id`, `title`, `model_name`) VALUES
('session-vdu-204', 2, 'VDU-204 Pressure Relief Audit', 'qwen3:8b'),
('session-pid-cooling', 2, 'Cooling Water P&ID Schematic', 'moondream'),
('session-capex-var', 2, 'Q3 Capex Variance Breakdown', 'qwen3:8b');

INSERT INTO `chat_messages` (`id`, `session_id`, `user_id`, `role`, `content`) VALUES
('msg-vdu-01', 'session-vdu-204', 2, 'user', 'Extract technical parameters, compliance checklists, and deviation risks from MRPL_SOP_VDU_204_Vacuum_Distillation_Safety.pdf for emergency shutdown.'),
('msg-vdu-02', 'session-vdu-204', 2, 'assistant', '### MRPL SOP VDU-204 Emergency Depressurization Audit\n\nAnalyzed **MRPL SOP VDU-204** engineering specifications against **ASME Section VIII Div 1** and ISA-5.1 standards.\n\n### Extracted Operating Parameters\n| Equipment Tag | Parameter | Normal Operating | Safety Trip Limit | Interlock Status |\n| :--- | :--- | :--- | :--- | :--- |\n| **PIC-102** | Column Top Pressure | 42.5 bar | 44.2 bar | Flare Auto-Open |\n| **FIC-103** | Reflux Condenser Flow | 120 m³/h | < 95 m³/h | Alarm Annunciation |\n| **TI-204** | Overhead Vapor Temp | 168.4 °C | 185.0 °C | Normal |\n| **NDT Wall** | Boiler Shell Thickness | 34.2 mm | 32.0 mm (Min) | Acceptable [Verified] |\n\n### Key Procedural Steps\n1. Confirm nitrogen purge sequence before introducing hydrocarbons.\n2. Verify PIC-102 relief valve setpoint complies with safe limits (4.2 kg/cm²).\n3. Recalibrate PRV-402 (+4.2% drift detected during annual turnaround).');
