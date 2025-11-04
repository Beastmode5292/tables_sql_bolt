-- ==========================================
-- Community Center Database - Final Consolidated Schema
-- MySQL 8.x compatible
-- Contains only the tables actually being used by the application
-- ==========================================

USE railway;

-- Drop existing tables if they exist (in correct order to avoid foreign key conflicts)
DROP VIEW IF EXISTS attendance_summary;
DROP VIEW IF EXISTS class_summary;
DROP TABLE IF EXISTS class_attendance;
DROP TABLE IF EXISTS class_enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ========================
-- CORE TABLES
-- ========================

-- USERS TABLE (Core authentication and user management)
-- user_type: 'worker' = Teachers (teach classes), 'visitor' = Students (attend classes)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('visitor','worker') NOT NULL DEFAULT 'visitor', -- visitor=student, worker=teacher
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role VARCHAR(20) GENERATED ALWAYS AS (user_type) VIRTUAL
);

-- EVENTS TABLE (Calendar events management)
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(200),
    created_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_user FOREIGN KEY (created_by)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- MESSAGES TABLE (Worker-Visitor messaging system)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    subject VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    senderName VARCHAR(50) NOT NULL,
    senderUsername VARCHAR(80) NOT NULL,
    recipientWorker VARCHAR(80) NOT NULL,
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    responses TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- ========================
-- CLASS MANAGEMENT TABLES
-- ========================

-- CLASSES TABLE (Teacher's classes)
-- teacher_id references users with user_type='worker' (teachers)
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL, -- References users.id where user_type='worker'
    name VARCHAR(100) NOT NULL,
    subject ENUM('fitness', 'arts', 'education', 'social', 'senior', 'youth', 'other') NOT NULL DEFAULT 'other',
    description TEXT,
    capacity INT NOT NULL DEFAULT 20,
    schedule VARCHAR(200),
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_capacity CHECK (capacity > 0 AND capacity <= 100)
);

-- CLASS ENROLLMENTS TABLE (Students enrolled in classes)
-- student_id references users with user_type='visitor' (students) or NULL for non-registered attendees
CREATE TABLE class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NULL, -- References users.id where user_type='visitor' or NULL for non-registered
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(120),
    student_phone VARCHAR(20),
    enrollment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    status ENUM('active', 'completed', 'dropped', 'waitlist') NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_enrollments_class FOREIGN KEY (class_id)
        REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_class_enrollments_student FOREIGN KEY (student_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    UNIQUE KEY unique_class_student (class_id, student_id),
    UNIQUE KEY unique_class_student_name (class_id, student_name, student_email)
);

-- CLASS ATTENDANCE TABLE (Daily attendance records)
-- student_id references users with user_type='visitor' (students attending classes)
-- recorded_by references users with user_type='worker' (teachers taking attendance)
CREATE TABLE class_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NULL, -- References users.id where user_type='visitor' or NULL for non-registered
    student_name VARCHAR(100) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'present',
    notes TEXT,
    recorded_by INT NOT NULL, -- References users.id where user_type='worker' (teacher)
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_attendance_class FOREIGN KEY (class_id)
        REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_class_attendance_student FOREIGN KEY (student_id)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_class_attendance_recorder FOREIGN KEY (recorded_by)
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE KEY unique_class_student_date (class_id, student_id, attendance_date),
    UNIQUE KEY unique_class_student_name_date (class_id, student_name, attendance_date)
);

-- ========================
-- INDEXES FOR PERFORMANCE
-- ========================

-- Users indexes
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_type ON users(user_type);

-- Events indexes
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Messages indexes
CREATE INDEX idx_messages_senderUsername ON messages(senderUsername);
CREATE INDEX idx_messages_timestamp ON messages(`timestamp`);
CREATE INDEX idx_messages_recipientWorker ON messages(recipientWorker);

-- Class management indexes
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_subject ON classes(subject);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_status ON class_enrollments(status);
CREATE INDEX idx_class_attendance_class_id ON class_attendance(class_id);
CREATE INDEX idx_class_attendance_date ON class_attendance(attendance_date);
CREATE INDEX idx_class_attendance_student_id ON class_attendance(student_id);

-- ========================
-- USEFUL VIEWS FOR REPORTING
-- ========================

-- Class summary view with enrollment counts
CREATE VIEW class_summary AS
SELECT 
    c.id,
    c.teacher_id,
    c.name,
    c.subject,
    c.capacity,
    c.schedule,
    c.status,
    c.description,
    u.username as teacher_name,
    u.email as teacher_email,
    COUNT(DISTINCT ce.id) as enrolled_count,
    ROUND((COUNT(DISTINCT ce.id) / c.capacity) * 100, 1) as enrollment_percentage,
    c.created_at
FROM classes c
LEFT JOIN users u ON c.teacher_id = u.id
LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
WHERE c.status = 'active'
GROUP BY c.id, c.teacher_id, c.name, c.subject, c.capacity, c.schedule, c.status, c.description, u.username, u.email, c.created_at;

-- Attendance summary view by class and date
CREATE VIEW attendance_summary AS
SELECT 
    c.name as class_name,
    c.id as class_id,
    ca.attendance_date,
    COUNT(CASE WHEN ca.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ca.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN ca.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN ca.status = 'excused' THEN 1 END) as excused_count,
    COUNT(*) as total_enrolled,
    ROUND((COUNT(CASE WHEN ca.status IN ('present', 'late') THEN 1 END) / COUNT(*)) * 100, 1) as attendance_rate
FROM class_attendance ca
JOIN classes c ON ca.class_id = c.id
GROUP BY c.id, c.name, ca.attendance_date
ORDER BY ca.attendance_date DESC, c.name;

-- ========================
-- SAMPLE DATA
-- ========================

-- Users (Workers = Teachers, Visitors = Students)
INSERT INTO users (username, email, password, user_type, approved) VALUES
-- Teachers (workers)
('teacher_admin', 'teacher@community.com', 'password123', 'worker', TRUE),
-- Students (visitors)
('john_student', 'john@email.com', 'password123', 'visitor', TRUE),
('mary_student', 'mary@email.com', 'password123', 'visitor', TRUE),
('david_student', 'david@email.com', 'password123', 'visitor', TRUE),
('sarah_student', 'sarah@email.com', 'password123', 'visitor', TRUE);

-- Sample Events
INSERT INTO events (title, description, event_date, event_time, location, created_by) VALUES
('Community Breakfast', 'Monthly community breakfast for all ages', '2025-11-15', '09:00:00', 'Main Hall', 1),
('Holiday Party', 'End of year celebration', '2025-12-15', '18:00:00', 'Main Hall', 1),
('New Year Workshop', 'Goal setting for the new year', '2025-12-30', '14:00:00', 'Conference Room', 1);

-- Sample Messages (Students messaging Teachers)
INSERT INTO messages (user_id, subject, content, senderName, senderUsername, recipientWorker, `timestamp`, status, responses) VALUES
(2, 'Class Schedule Question', 'What time does the yoga class start on Mondays?', 'John Smith', 'john_student', 'teacher_admin', NOW(), 'sent', '[]'),
(3, 'Registration Help', 'I need help registering for the art class', 'Mary Johnson', 'mary_student', 'teacher_admin', NOW(), 'sent', '[]');

-- Sample Classes (Taught by Teachers for Students to attend)
INSERT INTO classes (teacher_id, name, subject, description, capacity, schedule) VALUES
(1, 'Beginner Yoga', 'fitness', 'Gentle yoga for beginners and seniors', 20, 'Mondays & Wednesdays 10-11 AM'),
(1, 'Senior Art Class', 'arts', 'Watercolor painting and drawing for seniors', 12, 'Tuesdays 2-4 PM'),
(1, 'Computer Skills', 'education', 'Basic computer and internet skills', 15, 'Thursdays 10-12 PM'),
(1, 'Youth Basketball', 'youth', 'Basketball skills and games for youth', 16, 'Saturdays 9-11 AM'),
(1, 'Book Club', 'social', 'Monthly book discussions', 10, 'First Friday of each month 7-8 PM');

-- Sample Class Enrollments (Students enrolled in Teacher's classes)
INSERT INTO class_enrollments (class_id, student_id, student_name, student_email, student_phone) VALUES
-- Beginner Yoga Class (class_id=1) - Students attending this class
(1, 2, 'John Smith', 'john@email.com', '555-0101'),
(1, 3, 'Mary Johnson', 'mary@email.com', '555-0102'),
(1, 4, 'David Wilson', 'david@email.com', '555-0103'),
(1, NULL, 'Alice Brown', 'alice@email.com', '555-0104'), -- Non-registered student
(1, NULL, 'Robert Davis', 'robert@email.com', '555-0105'), -- Non-registered student

-- Senior Art Class (class_id=2) - Students attending this class
(2, 3, 'Mary Johnson', 'mary@email.com', '555-0102'),
(2, NULL, 'Helen Wilson', 'helen@email.com', '555-0106'), -- Non-registered student
(2, NULL, 'Frank Miller', 'frank@email.com', '555-0107'), -- Non-registered student
(2, NULL, 'Betty White', 'betty@email.com', '555-0108'), -- Non-registered student

-- Computer Skills (class_id=3)
(3, 2, 'John Smith', 'john@email.com', '555-0101'),
(3, 4, 'David Wilson', 'david@email.com', '555-0103'),
(3, 5, 'Sarah Davis', 'sarah@email.com', '555-0109'),
(3, NULL, 'Tom Anderson', 'tom@email.com', '555-0110'),
(3, NULL, 'Linda Garcia', 'linda@email.com', '555-0111'),

-- Youth Basketball (class_id=4)
(4, NULL, 'Jake Martinez', 'jake@email.com', '555-0112'),
(4, NULL, 'Emma Thompson', 'emma@email.com', '555-0113'),
(4, NULL, 'Noah Rodriguez', 'noah@email.com', '555-0114'),

-- Book Club (class_id=5)
(5, 2, 'John Smith', 'john@email.com', '555-0101'),
(5, 3, 'Mary Johnson', 'mary@email.com', '555-0102'),
(5, NULL, 'Patricia Lee', 'patricia@email.com', '555-0115');

-- Sample Attendance Records (Teacher taking attendance for Students)
INSERT INTO class_attendance (class_id, student_id, student_name, attendance_date, status, recorded_by) VALUES
-- Beginner Yoga - October 28, 2025 (Monday) - Teacher (id=1) recording student attendance
(1, 2, 'John Smith', '2025-10-28', 'present', 1),
(1, 3, 'Mary Johnson', '2025-10-28', 'present', 1),
(1, 4, 'David Wilson', '2025-10-28', 'absent', 1),
(1, NULL, 'Alice Brown', '2025-10-28', 'present', 1),
(1, NULL, 'Robert Davis', '2025-10-28', 'late', 1),

-- Beginner Yoga - October 30, 2025 (Wednesday)  
(1, 2, 'John Smith', '2025-10-30', 'present', 1),
(1, 3, 'Mary Johnson', '2025-10-30', 'present', 1),
(1, 4, 'David Wilson', '2025-10-30', 'present', 1),
(1, NULL, 'Alice Brown', '2025-10-30', 'present', 1),
(1, NULL, 'Robert Davis', '2025-10-30', 'absent', 1),

-- Senior Art Class - October 29, 2025 (Tuesday)
(2, 3, 'Mary Johnson', '2025-10-29', 'present', 1),
(2, NULL, 'Helen Wilson', '2025-10-29', 'present', 1),
(2, NULL, 'Frank Miller', '2025-10-29', 'absent', 1),
(2, NULL, 'Betty White', '2025-10-29', 'present', 1),

-- Computer Skills - October 31, 2025 (Thursday)
(3, 2, 'John Smith', '2025-10-31', 'present', 1),
(3, 4, 'David Wilson', '2025-10-31', 'present', 1),
(3, 5, 'Sarah Davis', '2025-10-31', 'late', 1),
(3, NULL, 'Tom Anderson', '2025-10-31', 'present', 1),
(3, NULL, 'Linda Garcia', '2025-10-31', 'absent', 1);

-- ========================
-- VERIFICATION AND STATISTICS
-- ========================

-- Show setup completion
SELECT 'Community Center Database Setup Complete!' AS Status;

-- Show table row counts
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 
    'events' as table_name, COUNT(*) as row_count FROM events
UNION ALL
SELECT 
    'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 
    'classes' as table_name, COUNT(*) as row_count FROM classes
UNION ALL
SELECT 
    'class_enrollments' as table_name, COUNT(*) as row_count FROM class_enrollments
UNION ALL
SELECT 
    'class_attendance' as table_name, COUNT(*) as row_count FROM class_attendance;

-- Show class summary
SELECT 
    name,
    subject,
    enrolled_count,
    capacity,
    enrollment_percentage,
    teacher_name
FROM class_summary 
ORDER BY name;

-- Show recent attendance summary
SELECT 
    class_name,
    attendance_date,
    present_count,
    absent_count,
    total_enrolled,
    attendance_rate
FROM attendance_summary 
WHERE attendance_date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAYS)
ORDER BY attendance_date DESC, class_name;