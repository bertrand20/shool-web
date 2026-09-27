-- Security hardening migration. Preserves existing records.

USE school_management;

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS role ENUM(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'ACADEMIC_ADMIN',
    'FINANCE_ADMIN',
    'HR_ADMIN',
    'CONTENT_EDITOR',
    'TEACHER'
  ) NOT NULL DEFAULT 'SCHOOL_ADMIN' AFTER full_name;

UPDATE admin_users
SET role = 'SUPER_ADMIN'
WHERE username = 'admin' AND role = 'SCHOOL_ADMIN';

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('New', 'Read', 'Resolved', 'Spam') NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_messages_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS admission_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_first_name VARCHAR(100) NOT NULL,
  parent_last_name VARCHAR(100) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(30) NOT NULL,
  parent_relationship VARCHAR(50),
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_email VARCHAR(255),
  student_date_of_birth DATE,
  student_gender ENUM('Male', 'Female', 'Other') NOT NULL,
  notes TEXT,
  status ENUM('New', 'Reviewing', 'Accepted', 'Rejected') NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admission_applications_status_created (status, created_at)
);

ALTER TABLE admission_applications
  ADD COLUMN IF NOT EXISTS student_age TINYINT UNSIGNED,
  ADD COLUMN IF NOT EXISTS district VARCHAR(120),
  ADD COLUMN IF NOT EXISTS sector VARCHAR(120),
  ADD COLUMN IF NOT EXISTS cell VARCHAR(120),
  ADD COLUMN IF NOT EXISTS village VARCHAR(120),
  ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS father_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS father_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS previous_school VARCHAR(200),
  ADD COLUMN IF NOT EXISTS medical_information TEXT;
