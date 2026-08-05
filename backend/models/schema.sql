CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  capacity INT DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  occupation VARCHAR(150),
  relationship ENUM('Father', 'Mother', 'Guardian', 'Other') NOT NULL DEFAULT 'Father',
  address TEXT,
  password_hash VARCHAR(255),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  class_id INT,
  parent_id INT,
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(20),
  address TEXT,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('Active', 'Inactive', 'Graduated', 'Transferred') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('Teacher', 'Admin', 'Accountant', 'Librarian', 'Nurse', 'Security', 'Janitor', 'Driver', 'Other') NOT NULL DEFAULT 'Teacher',
  department VARCHAR(100),
  qualification VARCHAR(200),
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  hire_date DATE DEFAULT (CURRENT_DATE),
  salary DECIMAL(10,2),
  address TEXT,
  class_id INT,
  status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL DEFAULT 'Present',
  remarks VARCHAR(255),
  recorded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  fee_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  academic_year VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  fee_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT (CURRENT_DATE),
  payment_method ENUM('Cash', 'Bank Transfer', 'Card', 'Online') DEFAULT 'Cash',
  receipt_number VARCHAR(50),
  notes TEXT,
  recorded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE
);

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

INSERT INTO admin_users (username, password_hash, full_name) VALUES
('admin', '$2b$10$y5hZQ9F2uxcy/WLCuEm25.d9984.nUdYIdMPD7EkhirP4YMenhh8a', 'School Administrator');

INSERT INTO announcements (title, content, priority, is_published) VALUES
('Welcome to New Academic Year 2025-26', 'We are excited to welcome all students and parents to the new academic year. This year promises to be filled with learning, growth, and memorable experiences. Please ensure all enrollment formalities are completed before the first day of classes.', 'High', 1),
('Annual Sports Day - August 15, 2026', 'Our annual sports day will be held on August 15, 2026. All students are encouraged to participate in various events including track and field, relay races, and team sports. Parents are welcome to attend and cheer for their children.', 'High', 1),
('Parent-Teacher Meeting Schedule', 'Parent-Teacher meetings will be conducted on the first Saturday of every month. Please check the school notice board for specific time slots. Your participation is highly valued in your child\\'s academic journey.', 'Medium', 1),
('School Library Hours Extended', 'The school library will now remain open until 4:30 PM on weekdays. Students are encouraged to make use of this extended time for reading and research. New books have been added to the collection this month.', 'Low', 1),
('Science Exhibition Coming Soon', 'Get ready for our annual science exhibition! Students from Grades 3-5 will be presenting their innovative projects. Mark your calendars for September 10, 2026. We invite all parents to witness the scientific temper of our young minds.', 'Medium', 1);

INSERT INTO gallery (title, image_url, category, description) VALUES
('Main School Building', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'School', 'Our state-of-the-art campus with modern facilities'),
('Annual Day Celebration', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800', 'Event', 'Students performing at the annual day celebration'),
('Science Lab', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', 'School', 'Well-equipped science laboratory for hands-on experiments'),
('Sports Day', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'Activity', 'Students participating in sports day activities'),
('Classroom Learning', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'Student', 'Interactive classroom sessions with modern teaching methods'),
('School Library', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800', 'School', 'Our well-stocked library with thousands of books'),
('Art Competition', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'Event', 'Students showcasing their artistic talents'),
('School Playground', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', 'School', 'Spacious playground for outdoor activities');

INSERT INTO school_info (info_key, info_value) VALUES
('mission', 'To provide quality education that empowers students with knowledge, skills, and values necessary to become responsible global citizens and leaders of tomorrow.'),
('vision', 'To be a center of educational excellence that nurtures creativity, critical thinking, and character development in every student.'),
('about', 'Greenfield Academy was established in 2005 with a vision to transform education. Over the years, we have grown to serve over 500 students with a dedicated team of 50+ educators. Our campus spans 10 acres with modern facilities including smart classrooms, science and computer labs, a library, sports complex, and auditorium.'),
('contact_email', 'info@greenfieldacademy.edu'),
('contact_phone', '+91-9876543210'),
('contact_address', '45 Education Lane, Greenfield Campus, Mumbai - 400001, Maharashtra, India'),
('contact_hours', 'Monday - Saturday: 8:00 AM - 3:30 PM');

INSERT INTO classes (name, section, capacity) VALUES
('Grade 1', 'A', 35),
('Grade 1', 'B', 35),
('Grade 2', 'A', 35),
('Grade 2', 'B', 35),
('Grade 3', 'A', 40),
('Grade 3', 'B', 40),
('Grade 4', 'A', 40),
('Grade 5', 'A', 40);

INSERT INTO parents (first_name, last_name, email, phone, occupation, relationship, address, status) VALUES
('Rajesh', 'Sharma', 'rajesh.sharma@email.com', '9876543200', 'Software Engineer', 'Father', '12 MG Road, Mumbai', 'Active'),
('Mehul', 'Patel', 'mehul.patel@email.com', '9876543201', 'Business Owner', 'Father', '45 Gandhi Nagar, Ahmedabad', 'Active'),
('Vikram', 'Gupta', 'vikram.gupta@email.com', '9876543202', 'Accountant', 'Father', '78 Nehru Place, Delhi', 'Active'),
('Suresh', 'Reddy', 'suresh.reddy@email.com', '9876543203', 'Doctor', 'Father', '23 Banjara Hills, Hyderabad', 'Active'),
('Ravi', 'Nair', 'ravi.nair@email.com', '9876543204', 'Lawyer', 'Father', '56 Marine Drive, Kochi', 'Active'),
('Amit', 'Singh', 'amit.singh@email.com', '9876543205', 'Teacher', 'Father', '89 Civil Lines, Lucknow', 'Active'),
('Kumar', 'Iyer', 'kumar.iyer@email.com', '9876543206', 'Professor', 'Father', '34 Anna Salai, Chennai', 'Active'),
('Prakash', 'Joshi', 'prakash.joshi@email.com', '9876543207', 'Bank Manager', 'Father', '67 FC Road, Pune', 'Active');

INSERT INTO staff (first_name, last_name, email, phone, role, department, qualification, gender, hire_date, salary, class_id, status) VALUES
('Anjali', 'Mehta', 'anjali.mehta@school.com', '9800000001', 'Teacher', 'Primary', 'M.Ed, B.Ed', 'Female', '2020-06-15', 45000.00, 1, 'Active'),
('Deepak', 'Verma', 'deepak.verma@school.com', '9800000002', 'Teacher', 'Primary', 'M.Sc, B.Ed', 'Male', '2019-04-10', 48000.00, 3, 'Active'),
('Sunita', 'Rao', 'sunita.rao@school.com', '9800000003', 'Teacher', 'Middle School', 'M.A, B.Ed', 'Female', '2021-07-20', 42000.00, 5, 'Active'),
('Manoj', 'Kumar', 'manoj.kumar@school.com', '9800000004', 'Teacher', 'Middle School', 'M.Sc, B.Ed', 'Male', '2018-01-12', 52000.00, 7, 'Active'),
('Pooja', 'Sinha', 'pooja.sinha@school.com', '9800000005', 'Admin', 'Administration', 'MBA, HR', 'Female', '2020-09-01', 55000.00, NULL, 'Active'),
('Rakesh', 'Tiwari', 'rakesh.tiwari@school.com', '9800000006', 'Accountant', 'Finance', 'CA', 'Male', '2021-03-15', 50000.00, NULL, 'Active'),
('Neha', 'Gupta', 'neha.gupta@school.com', '9800000007', 'Librarian', 'Library', 'M.Lib.Sc', 'Female', '2022-01-05', 38000.00, NULL, 'Active'),
('Vijay', 'Deshmukh', 'vijay.d@school.com', '9800000008', 'Nurse', 'Medical', 'B.Sc Nursing', 'Male', '2023-06-01', 35000.00, NULL, 'Active'),
('Alok', 'Ranjan', 'alok.r@school.com', '9800000009', 'Security', 'Operations', '12th Pass', 'Male', '2022-08-15', 25000.00, NULL, 'Active'),
('Geeta', 'Pandey', 'geeta.p@school.com', '9800000010', 'Other', 'Canteen', 'Diploma in Catering', 'Female', '2023-02-01', 22000.00, NULL, 'Active');

INSERT INTO students (first_name, last_name, email, phone, date_of_birth, gender, class_id, parent_id, guardian_name, guardian_phone, address, enrollment_date, status) VALUES
('Aarav', 'Sharma', 'aarav.sharma@email.com', '9876543210', '2015-03-12', 'Male', 1, 1, 'Rajesh Sharma', '9876543200', '12 MG Road, Mumbai', '2025-04-01', 'Active'),
('Priya', 'Patel', 'priya.patel@email.com', '9876543211', '2015-07-22', 'Female', 1, 2, 'Mehul Patel', '9876543201', '45 Gandhi Nagar, Ahmedabad', '2025-04-01', 'Active'),
('Rohan', 'Gupta', 'rohan.gupta@email.com', '9876543212', '2014-11-05', 'Male', 3, 3, 'Vikram Gupta', '9876543202', '78 Nehru Place, Delhi', '2025-04-01', 'Active'),
('Sneha', 'Reddy', 'sneha.reddy@email.com', '9876543213', '2014-01-18', 'Female', 3, 4, 'Suresh Reddy', '9876543203', '23 Banjara Hills, Hyderabad', '2025-04-01', 'Active'),
('Karthik', 'Nair', 'karthik.nair@email.com', '9876543214', '2013-05-30', 'Male', 5, 5, 'Ravi Nair', '9876543204', '56 Marine Drive, Kochi', '2025-04-01', 'Active'),
('Ananya', 'Singh', 'ananya.singh@email.com', '9876543215', '2013-09-14', 'Female', 5, 6, 'Amit Singh', '9876543205', '89 Civil Lines, Lucknow', '2025-04-01', 'Active'),
('Vikram', 'Iyer', 'vikram.iyer@email.com', '9876543216', '2012-12-01', 'Male', 7, 7, 'Kumar Iyer', '9876543206', '34 Anna Salai, Chennai', '2025-04-01', 'Active'),
('Meera', 'Joshi', 'meera.joshi@email.com', '9876543217', '2012-04-25', 'Female', 7, 8, 'Prakash Joshi', '9876543207', '67 FC Road, Pune', '2025-04-01', 'Active'),
('Arjun', 'Das', 'arjun.das@email.com', '9876543218', '2016-02-08', 'Male', 2, 1, 'Rajesh Sharma', '9876543200', '12 MG Road, Mumbai', '2025-06-15', 'Active'),
('Nisha', 'Kumar', 'nisha.kumar@email.com', '9876543219', '2015-08-19', 'Female', 2, 3, 'Vikram Gupta', '9876543202', '78 Nehru Place, Delhi', '2025-06-15', 'Inactive');

INSERT INTO fees (class_id, fee_type, amount, due_date, academic_year, description) VALUES
(1, 'Tuition Fee', 15000.00, '2026-04-15', '2025-2026', 'Annual tuition for Grade 1'),
(1, 'Lab Fee', 3000.00, '2026-04-15', '2025-2026', 'Science lab charges'),
(2, 'Tuition Fee', 15000.00, '2026-04-15', '2025-2026', 'Annual tuition for Grade 1-B'),
(3, 'Tuition Fee', 18000.00, '2026-04-15', '2025-2026', 'Annual tuition for Grade 2'),
(5, 'Tuition Fee', 20000.00, '2026-04-15', '2025-2026', 'Annual tuition for Grade 3'),
(5, 'Sports Fee', 4000.00, '2026-04-15', '2025-2026', 'Sports and activities'),
(7, 'Tuition Fee', 22000.00, '2026-04-15', '2025-2026', 'Annual tuition for Grade 4'),
(8, 'Tuition Fee', 22000.00, '2026-04-15', '2025-2026', 'Annual tuition for Grade 5');

INSERT INTO fee_payments (student_id, fee_id, amount_paid, payment_date, payment_method, receipt_number, recorded_by) VALUES
(1, 1, 15000.00, '2026-03-20', 'Bank Transfer', 'REC-001', 'Admin'),
(1, 2, 3000.00, '2026-03-20', 'Bank Transfer', 'REC-002', 'Admin'),
(2, 1, 7500.00, '2026-03-22', 'Cash', 'REC-003', 'Admin'),
(3, 4, 18000.00, '2026-03-25', 'Online', 'REC-004', 'Admin'),
(4, 4, 9000.00, '2026-03-28', 'Card', 'REC-005', 'Admin'),
(5, 5, 20000.00, '2026-04-01', 'Bank Transfer', 'REC-006', 'Admin'),
(5, 6, 4000.00, '2026-04-01', 'Bank Transfer', 'REC-007', 'Admin'),
(6, 5, 10000.00, '2026-04-02', 'Cash', 'REC-008', 'Admin'),
(7, 7, 22000.00, '2026-04-03', 'Online', 'REC-009', 'Admin'),
(8, 8, 11000.00, '2026-04-05', 'Bank Transfer', 'REC-010', 'Admin');

INSERT INTO attendance (student_id, date, status, recorded_by) VALUES
(1, '2026-07-25', 'Present', 'Admin'),
(2, '2026-07-25', 'Present', 'Admin'),
(3, '2026-07-25', 'Late', 'Admin'),
(4, '2026-07-25', 'Present', 'Admin'),
(5, '2026-07-25', 'Absent', 'Admin'),
(6, '2026-07-25', 'Present', 'Admin'),
(7, '2026-07-25', 'Present', 'Admin'),
(8, '2026-07-25', 'Excused', 'Admin'),
(1, '2026-07-26', 'Present', 'Admin'),
(2, '2026-07-26', 'Absent', 'Admin'),
(3, '2026-07-26', 'Present', 'Admin'),
(4, '2026-07-26', 'Present', 'Admin'),
(5, '2026-07-26', 'Present', 'Admin'),
(6, '2026-07-26', 'Late', 'Admin'),
(7, '2026-07-26', 'Present', 'Admin'),
(8, '2026-07-26', 'Present', 'Admin'),
(1, '2026-07-27', 'Present', 'Admin'),
(2, '2026-07-27', 'Present', 'Admin'),
(3, '2026-07-27', 'Present', 'Admin'),
(4, '2026-07-27', 'Late', 'Admin'),
(5, '2026-07-27', 'Present', 'Admin'),
(6, '2026-07-27', 'Present', 'Admin'),
(7, '2026-07-27', 'Absent', 'Admin'),
(8, '2026-07-27', 'Present', 'Admin');
