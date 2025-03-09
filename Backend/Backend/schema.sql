DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    appointment_location TEXT NOT NULL,
    appointment_status TEXT CHECK(appointment_status IN ('pending', 'completed')) DEFAULT 'pending'
);

DROP TABLE IF EXISTS tasks;
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    starting_week INTEGER NOT NULL,
    ending_week INTEGER NOT NULL DEFAULT starting_week,
    task_status TEXT CHECK(task_status IN ('pending','ongoing', 'completed')) DEFAULT 'pending',
    task_priority TEXT CHECK(task_priority IN ('low', 'medium', 'high')) DEFAULT 'low',
    isOptional BOOLEAN DEFAULT FALSE
    task_status TEXT CHECK(appointment_status IN ('pending', 'completed')) DEFAULT 'pending'
);

-- Insert mock data into appointments
INSERT INTO appointments (title, content, appointment_date, appointment_time, appointment_location, appointment_status)
VALUES
('Nutrition Consultation', 'Dietary recommendations for pregnancy.', '2025-03-18', '11:00 AM', 'Wellness Clinic', 'completed'),
('Doctor Visit', 'Routine check-up with OB-GYN.', '2025-03-10', '10:30 AM', 'City Hospital', 'pending'),
('Ultrasound Scan', '20-week ultrasound scan.', '2025-03-15', '2:00 PM', 'Sunshine Medical Center', 'pending');

-- Insert mock data into tasks
INSERT INTO tasks (title, content, starting_week, ending_week, task_priority, isOptional,task_status) VALUES
-- First Trimester
('Initial Prenatal Visit', 'First doctor visit to confirm pregnancy and health check.', 4, 4, 'high', FALSE,'pending'),
('Early Ultrasound', 'Confirm pregnancy location and heartbeat.', 6, 8, 'high', FALSE,'pending'),
('Folic Acid Supplementation', 'Start folic acid for neural tube development.', 4, 12, 'high', FALSE,'pending'),
('Blood Tests', 'Check for blood type, hemoglobin, and infections.', 8, 10, 'high', FALSE,'pending'),
('Down Syndrome Screening', 'Non-invasive prenatal screening for chromosomal conditions.', 10, 12, 'medium', FALSE,'pending'),

-- Second Trimester
('NT Scan', 'Nuchal translucency scan for fetal abnormalities.', 12, 14, 'high', FALSE,'pending'),
('Gestational Diabetes Test', 'Glucose test to check blood sugar levels.', 14, 16, 'high', FALSE,'pending'),
('Detailed Anomaly Scan', '20-week scan to check fetal development.', 18, 20, 'high', FALSE,'pending'),
('Fetal Movement Monitoring', 'Track baby movements for health assessment.', 21, 24, 'medium', FALSE,'pending'),
('Iron and Calcium Supplements', 'Ensure proper bone and blood health for mother and baby.', 21, 28, 'medium', FALSE,'pending'),

-- Third Trimester
('Rh Factor Screening', 'Test if mother needs Rh immunoglobulin.', 26, 28, 'high', FALSE,'pending'),
('Glucose Tolerance Test', 'Second test if needed for gestational diabetes.', 28, 28, 'medium', FALSE,'pending'),
('Pre-Birth Vaccination', 'Tdap and flu shots for maternal and newborn protection.', 30, 32, 'high', FALSE,'pending'),
('Third-Trimester Ultrasound', 'Assess baby’s growth and position.', 30, 32, 'high', FALSE,'pending'),
('Birth Plan Discussion', 'Discuss delivery preferences with doctor.', 33, 34, 'medium', TRUE,'pending'),
('Hospital Tour', 'Visit maternity hospital to prepare for delivery.', 33, 34, 'low', TRUE,'pending'),
('Labor Signs Monitoring', 'Educate about labor contractions and when to go to hospital.', 36, 40, 'high', FALSE,'pending'),
('Final Checkups', 'Last medical assessments before labor.', 38, 40, 'high', FALSE,'pending');
