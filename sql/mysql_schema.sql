-- Aegis LifeOps MySQL Workbench Database Schema
-- Compatible with MySQL 8.0+ / MySQL Workbench

CREATE DATABASE IF NOT EXISTS aegis_lifeops;
USE aegis_lifeops;

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url VARCHAR(512),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. OBLIGATIONS TABLE
CREATE TABLE IF NOT EXISTS obligations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  provider VARCHAR(255),
  amount DECIMAL(12, 2) DEFAULT 0.00,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'Pending',
  consequence_severity VARCHAR(50) DEFAULT 'medium',
  consequence_note TEXT,
  prerequisite_id VARCHAR(64),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prerequisite_id) REFERENCES obligations(id) ON DELETE SET NULL
);

-- 3. PROOFS TABLE
CREATE TABLE IF NOT EXISTS proofs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  obligation_id VARCHAR(64) NOT NULL,
  type VARCHAR(50) DEFAULT 'reference_note',
  reference_number VARCHAR(100),
  file_name VARCHAR(255),
  file_path VARCHAR(512),
  note TEXT,
  attached_at DATE,
  is_self_reported BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (obligation_id) REFERENCES obligations(id) ON DELETE CASCADE
);

-- 4. NOTICE DRAFTS TABLE
CREATE TABLE IF NOT EXISTS notice_drafts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  raw_text TEXT,
  draft_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
