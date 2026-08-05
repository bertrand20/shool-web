USE school_management;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
  is_published TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  category ENUM('School', 'Student', 'Event', 'Activity') DEFAULT 'School',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  info_key VARCHAR(100) UNIQUE NOT NULL,
  info_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO admin_users (username, password_hash, full_name) VALUES
('admin', '$2b$10$y5hZQ9F2uxcy/WLCuEm25.d9984.nUdYIdMPD7EkhirP4YMenhh8a', 'School Administrator');

INSERT IGNORE INTO announcements (title, content, priority, is_published) VALUES
('Welcome to New Academic Year 2025-26', 'We are excited to welcome all students and parents to the new academic year. This year promises to be filled with learning, growth, and memorable experiences. Please ensure all enrollment formalities are completed before the first day of classes.', 'High', 1),
('Annual Sports Day - August 15, 2026', 'Our annual sports day will be held on August 15, 2026. All students are encouraged to participate in various events including track and field, relay races, and team sports. Parents are welcome to attend and cheer for their children.', 'High', 1),
('Parent-Teacher Meeting Schedule', 'Parent-Teacher meetings will be conducted on the first Saturday of every month. Please check the school notice board for specific time slots. Your participation is highly valued in your child''s academic journey.', 'Medium', 1),
('School Library Hours Extended', 'The school library will now remain open until 4:30 PM on weekdays. Students are encouraged to make use of this extended time for reading and research. New books have been added to the collection this month.', 'Low', 1),
('Science Exhibition Coming Soon', 'Get ready for our annual science exhibition! Students from Grades 3-5 will be presenting their innovative projects. Mark your calendars for September 10, 2026. We invite all parents to witness the scientific temper of our young minds.', 'Medium', 1);

INSERT IGNORE INTO gallery (title, image_url, category, description) VALUES
('Main School Building', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'School', 'Our state-of-the-art campus with modern facilities'),
('Annual Day Celebration', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800', 'Event', 'Students performing at the annual day celebration'),
('Science Lab', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', 'School', 'Well-equipped science laboratory for hands-on experiments'),
('Sports Day', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'Activity', 'Students participating in sports day activities'),
('Classroom Learning', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'Student', 'Interactive classroom sessions with modern teaching methods'),
('School Library', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800', 'School', 'Our well-stocked library with thousands of books'),
('Art Competition', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'Event', 'Students showcasing their artistic talents'),
('School Playground', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', 'School', 'Spacious playground for outdoor activities');

INSERT IGNORE INTO school_info (info_key, info_value) VALUES
('mission', 'To provide quality education that empowers students with knowledge, skills, and values necessary to become responsible global citizens and leaders of tomorrow.'),
('vision', 'To be a center of educational excellence that nurtures creativity, critical thinking, and character development in every student.'),
('about', 'Greenfield Academy was established in 2005 with a vision to transform education. Over the years, we have grown to serve over 500 students with a dedicated team of 50+ educators. Our campus spans 10 acres with modern facilities including smart classrooms, science and computer labs, a library, sports complex, and auditorium.'),
('contact_email', 'info@greenfieldacademy.edu'),
('contact_phone', '+91-9876543210'),
('contact_address', '45 Education Lane, Greenfield Campus, Mumbai - 400001, Maharashtra, India'),
('contact_hours', 'Monday - Saturday: 8:00 AM - 3:30 PM');

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  class_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('CAT 1', 'CAT 2', 'Exam') NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  exam_id INT NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) DEFAULT 100,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_mark (student_id, subject_id, exam_id)
);

INSERT IGNORE INTO subjects (name, code, class_id) VALUES
('Mathematics', 'MATH', 1), ('English', 'ENG', 1), ('Science', 'SCI', 1),
('Kinyarwanda', 'KIN', 1), ('Social Studies', 'SST', 1), ('Physical Education', 'PE', 1),
('Mathematics', 'MATH', 2), ('English', 'ENG', 2), ('Science', 'SCI', 2),
('Kinyarwanda', 'KIN', 2), ('Social Studies', 'SST', 2), ('Physical Education', 'PE', 2);

INSERT IGNORE INTO exams (name, type, academic_year, term) VALUES
('CAT 1 - Term 1', 'CAT 1', '2025-2026', 'Term 1'),
('CAT 2 - Term 1', 'CAT 2', '2025-2026', 'Term 1'),
('Final Exam - Term 1', 'Exam', '2025-2026', 'Term 1');
