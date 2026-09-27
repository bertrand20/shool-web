-- Publish the requested school identity without inventing official contact details.
-- This migration preserves existing students, payments, staff, and operational records.

USE school_management;

INSERT INTO school_info (info_key, info_value) VALUES
('school_name', CONVERT(0x50657469742053C3A96D696E61697265205361696E742056696E63656E74206465205061756C204E64657261 USING utf8mb4)),
('school_location', 'Ndera, Rwanda'),
('hero_title', 'Knowledge, faith, and disciplined growth.'),
('hero_intro', 'Petit Séminaire Saint Vincent de Paul Ndera is a Catholic educational community committed to learning, character formation, and service.'),
('mission', 'To support the intellectual, moral, spiritual, and personal formation of young people through education, discipline, and service.'),
('vision', 'A school community where every learner is encouraged to grow in knowledge, responsibility, faith, and respect for others.'),
('about', 'Petit Seminaire Saint Vincent de Paul Ndera is an educational community in Ndera, Rwanda. This website shares the school public information, learning life, announcements, and opportunities for families to connect with the administration.'),
('contact_email', 'The official school email will be published here.'),
('contact_phone', 'The official school phone will be published here.'),
('contact_address', 'Ndera, Rwanda'),
('contact_hours', 'Official office hours will be published here.')
ON DUPLICATE KEY UPDATE info_value = VALUES(info_value);
