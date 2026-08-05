USE school_management;

-- ============================================================
-- Module 1: Timetable / Scheduling
-- ============================================================
CREATE TABLE IF NOT EXISTS timetable_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  staff_id INT,
  subject_id INT,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  period_number INT NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (class_id, day_of_week, period_number),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- ============================================================
-- Module 2: Homework / Assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS homework_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT,
  staff_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority ENUM('Low','Medium','High') DEFAULT 'Medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- ============================================================
-- Module 3: Notifications (email/SMS/in-app log)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_type ENUM('parent','student','staff') DEFAULT 'parent',
  recipient_id INT,
  channel ENUM('email','sms','inapp') DEFAULT 'email',
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('pending','sent','failed','logged') DEFAULT 'logged',
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO notification_settings (setting_key, setting_value) VALUES
('fee_reminders', 1),
('attendance_alerts', 1),
('payment_confirmations', 1),
('homework_updates', 1);

-- ============================================================
-- Module 4: Library
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150),
  isbn VARCHAR(50),
  category VARCHAR(100),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  shelf_location VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  student_id INT NOT NULL,
  issue_date DATE DEFAULT (CURRENT_DATE),
  due_date DATE NOT NULL,
  return_date DATE,
  status ENUM('Issued','Returned','Overdue') DEFAULT 'Issued',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

INSERT IGNORE INTO books (id, title, author, isbn, category, total_copies, available_copies, shelf_location) VALUES
(1, 'Mathematics for Grade 3', 'R. K. Gupta', '978-81-1001', 'Textbook', 10, 8, 'Shelf A-1'),
(2, 'World History Essentials', 'A. L. Mehta', '978-81-1002', 'History', 5, 4, 'Shelf A-2'),
(3, 'Elementary Science Experiments', 'S. N. Rao', '978-81-1003', 'Science', 8, 7, 'Shelf B-1'),
(4, 'English Grammar Workbook', 'P. Wilson', '978-81-1004', 'English', 12, 10, 'Shelf B-2'),
(5, 'Introduction to Computers', 'D. Kapoor', '978-81-1005', 'Computer', 6, 5, 'Shelf C-1');

-- ============================================================
-- Module 5: Transport
-- ============================================================
CREATE TABLE IF NOT EXISTS bus_routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(150) NOT NULL,
  vehicle_number VARCHAR(50),
  driver_staff_id INT,
  start_point VARCHAR(150),
  end_point VARCHAR(150),
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bus_stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT NOT NULL,
  stop_name VARCHAR(150) NOT NULL,
  pickup_time TIME,
  drop_time TIME,
  fare DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transport_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  route_id INT NOT NULL,
  stop_id INT,
  pickup_time TIME,
  drop_time TIME,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_transport (student_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES bus_stops(id) ON DELETE SET NULL
);

INSERT IGNORE INTO bus_routes (id, route_name, vehicle_number, start_point, end_point, status) VALUES
(1, 'Route A - City Center', 'GFA-001', 'City Center', 'Greenfield Academy', 'Active'),
(2, 'Route B - North Suburbs', 'GFA-002', 'North Gate', 'Greenfield Academy', 'Active');

INSERT IGNORE INTO bus_stops (id, route_id, stop_name, pickup_time, drop_time, fare) VALUES
(1, 1, 'City Center Bus Stop', '07:15:00', '15:45:00', 800.00),
(2, 1, 'Market Square', '07:30:00', '16:00:00', 700.00),
(3, 2, 'North Gate Station', '07:20:00', '15:50:00', 750.00),
(4, 2, 'Lakeview Colony', '07:35:00', '16:05:00', 650.00);

-- ============================================================
-- Module 6: Health Records
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  visit_date DATE DEFAULT (CURRENT_DATE),
  visit_type ENUM('Checkup','Illness','Injury','Vaccination','Other') DEFAULT 'Checkup',
  symptoms VARCHAR(255),
  diagnosis VARCHAR(255),
  treatment VARCHAR(255),
  nurse_staff_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (nurse_staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vaccinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  vaccine_name VARCHAR(150) NOT NULL,
  dose_number VARCHAR(50),
  date_given DATE DEFAULT (CURRENT_DATE),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
-- Module 7: Payroll
-- ============================================================
CREATE TABLE IF NOT EXISTS salary_slips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  month VARCHAR(7) NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  payment_status ENUM('Paid','Pending') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_slip (staff_id, month),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ============================================================
-- Module 8: Staff Leave
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  leave_type ENUM('Casual','Sick','Earned','Maternity','Paternity','Unpaid','Other') DEFAULT 'Casual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ============================================================
-- Module 9: Events Calendar
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(150),
  event_type ENUM('Academic','Sports','Cultural','Holiday','Meeting','Other') DEFAULT 'Other',
  is_holiday TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO events (id, title, description, event_date, start_time, end_time, location, event_type, is_holiday) VALUES
(1, 'Annual Sports Day', 'Track and field events for all grades', '2026-08-15', '09:00:00', '16:00:00', 'Main Ground', 'Sports', 0),
(2, 'Independence Day', 'Flag hoisting and cultural program', '2026-08-15', '08:00:00', '10:00:00', 'School Auditorium', 'Holiday', 1),
(3, 'Science Exhibition', 'Grade 3-5 project presentations', '2026-09-10', '10:00:00', '14:00:00', 'Science Lab', 'Academic', 0),
(4, 'Parent-Teacher Meeting', 'Monthly PTM for all classes', '2026-08-01', '09:00:00', '12:00:00', 'Classrooms', 'Meeting', 0),
(5, 'Annual Day', 'Cultural performances and prize distribution', '2026-12-18', '17:00:00', '20:00:00', 'School Auditorium', 'Cultural', 0);

-- ============================================================
-- Module 10: Behavior / Discipline
-- ============================================================
CREATE TABLE IF NOT EXISTS behavior_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  entry_type ENUM('Commendation','Warning','Incident','Suspension') DEFAULT 'Incident',
  title VARCHAR(200) NOT NULL,
  description TEXT,
  entry_date DATE DEFAULT (CURRENT_DATE),
  recorded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
-- Module 11: Inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(200) NOT NULL,
  category ENUM('Textbook','Sports','Furniture','Electronics','Stationery','Uniform','Other') DEFAULT 'Other',
  quantity INT DEFAULT 0,
  unit VARCHAR(50),
  min_stock INT DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  location VARCHAR(150),
  supplier VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO inventory_items (id, item_name, category, quantity, unit, min_stock, unit_cost, location, supplier) VALUES
(1, 'Football', 'Sports', 20, 'pcs', 10, 800.00, 'Store Room A', 'Sports Co.'),
(2, 'Exercise Books', 'Stationery', 500, 'pcs', 200, 25.00, 'Store Room B', 'Paper Mills Ltd'),
(3, 'Science Textbooks G3', 'Textbook', 80, 'pcs', 30, 450.00, 'Store Room C', 'Greenfield Books'),
(4, 'Whiteboard Markers', 'Stationery', 120, 'pcs', 40, 35.00, 'Store Room B', 'Office Supply Co'),
(5, 'School Uniforms', 'Uniform', 150, 'sets', 50, 900.00, 'Store Room D', 'Uniform House');

-- ============================================================
-- Module 12: Audit Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  admin_name VARCHAR(200),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
