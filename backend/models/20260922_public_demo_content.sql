-- CMS-ready public content with clearly marked demo records.
-- Replace or unpublish these records when the administration provides approved content.

USE school_management;

CREATE TABLE IF NOT EXISTS public_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section ENUM('academics', 'admissions', 'student-life', 'achievements', 'staff', 'alumni') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  content_date DATE,
  is_demo TINYINT(1) NOT NULL DEFAULT 1,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_public_content_section_title (section, title),
  INDEX idx_public_content_section (section, is_published, display_order)
);

DELETE FROM public_content
WHERE title IN ('[DEMO] Staff directory placeholder', '[DEMO] Alumni community placeholder');

INSERT IGNORE INTO public_content (section, title, description, is_demo, display_order) VALUES
('academics', '[DEMO] Academic programme overview', 'Demo content only. Replace with the school-approved academic programme description.', 1, 1),
('academics', '[DEMO] Learning and study support', 'Demo content only. Replace with approved information about the learning environment and support.', 1, 2),
('academics', '[DEMO] Examination information', 'Demo content only. Replace with official examination and academic-calendar information.', 1, 3),
('admissions', '[DEMO] Admissions overview', 'Demo content only. Replace with official admissions information and eligibility requirements.', 1, 1),
('student-life', '[DEMO] Student activities', 'Demo content only. Replace with activities officially offered by the school.', 1, 1),
('student-life', '[DEMO] Community and formation', 'Demo content only. Replace with approved student-life and formation information.', 1, 2),
('achievements', '[DEMO] School achievements', 'Demo content only. No achievement is being claimed. Replace with verified achievements.', 1, 1),
('staff', '[DEMO] Staff directory information', 'Demo content only. No individual staff member is represented by this demo record.', 1, 1),
('alumni', '[DEMO] Alumni community information', 'Demo content only. Approved alumni stories and activities can be added here.', 1, 1);

UPDATE school_info
SET info_value = REPLACE(info_value, '[Editable placeholder:', '[DEMO PLACEHOLDER]')
WHERE info_value LIKE '[Editable placeholder:%';

UPDATE announcements
SET title = CONCAT('[DEMO] ', title)
WHERE title NOT LIKE '[DEMO]%';

UPDATE gallery
SET title = CONCAT('[DEMO] ', title)
WHERE title NOT LIKE '[DEMO]%';

UPDATE events
SET title = CONCAT('[DEMO] ', title)
WHERE title NOT LIKE '[DEMO]%';

UPDATE public_content SET title = '[DEMO] Staff directory information'
WHERE title = '[DEMO] Staff directory placeholder';

UPDATE public_content SET title = '[DEMO] Alumni community information'
WHERE title = '[DEMO] Alumni community placeholder';

UPDATE public_content SET
  description = CASE title
    WHEN '[DEMO] Academic programme overview' THEN 'A sample overview of the learning journey. The school administration can edit this section with approved programme information.'
    WHEN '[DEMO] Learning and study support' THEN 'A sample description of the support available to learners. Official details can be added through the CMS.'
    WHEN '[DEMO] Examination information' THEN 'A sample academic-calendar entry. Official examination information will be added when confirmed by the school.'
    WHEN '[DEMO] Admissions overview' THEN 'A sample admissions introduction. Eligibility, documents, dates, and fees must be confirmed by the school.'
    WHEN '[DEMO] Student activities' THEN 'A sample introduction to student activities. The administration can publish approved clubs and activities here.'
    WHEN '[DEMO] Community and formation' THEN 'A sample description of school community life. Approved formation information can be added here.'
    WHEN '[DEMO] School achievements' THEN 'A sample achievement section with no achievement claimed. Verified achievements can be published by the administration.'
    WHEN '[DEMO] Staff directory information' THEN 'A sample staff-directory introduction. No individual staff member is represented by this demo record.'
    WHEN '[DEMO] Alumni community information' THEN 'A sample alumni-community introduction. Approved alumni stories and activities can be added here.'
    ELSE description
  END
WHERE is_demo = 1;
