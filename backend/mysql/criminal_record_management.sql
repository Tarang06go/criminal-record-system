DROP DATABASE IF EXISTS criminal_record_management_system;
CREATE DATABASE criminal_record_management_system;
USE criminal_record_management_system;

CREATE TABLE criminals (
  criminal_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  address VARCHAR(200) NOT NULL,
  phone VARCHAR(15) NOT NULL
);

CREATE TABLE police_officers (
  officer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  officer_rank VARCHAR(50) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  station VARCHAR(100) NOT NULL
);

CREATE TABLE cases (
  case_id INT AUTO_INCREMENT PRIMARY KEY,
  court_name VARCHAR(100) NOT NULL,
  lawyer_assigned VARCHAR(100) NOT NULL,
  verdict VARCHAR(50) NOT NULL,
  sentence VARCHAR(100) DEFAULT NULL,
  criminal_id INT NOT NULL,
  officer_id INT DEFAULT NULL,
  CONSTRAINT fk_cases_criminal
    FOREIGN KEY (criminal_id) REFERENCES criminals(criminal_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_cases_officer
    FOREIGN KEY (officer_id) REFERENCES police_officers(officer_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE offences (
  offence_id INT AUTO_INCREMENT PRIMARY KEY,
  crime_type VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  date_of_offence DATE NOT NULL,
  description VARCHAR(500) NOT NULL,
  criminal_id INT NOT NULL,
  CONSTRAINT fk_offences_criminal
    FOREIGN KEY (criminal_id) REFERENCES criminals(criminal_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE victims (
  victim_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  contact_info VARCHAR(15) NOT NULL,
  offence_id INT NOT NULL,
  dob DATE NOT NULL,
  CONSTRAINT fk_victims_offence
    FOREIGN KEY (offence_id) REFERENCES offences(offence_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE witnesses (
  witness_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(15) NOT NULL,
  statement TEXT NOT NULL,
  case_id INT NOT NULL,
  CONSTRAINT fk_witnesses_case
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE evidences (
  evidence_id INT AUTO_INCREMENT PRIMARY KEY,
  evidence_type VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  case_id INT NOT NULL,
  CONSTRAINT fk_evidences_case
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE prisons (
  prison_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  inmates_count INT NOT NULL DEFAULT 0,
  CHECK (capacity >= 0),
  CHECK (inmates_count >= 0),
  CHECK (inmates_count <= capacity)
);

CREATE TABLE case_assignments (
  case_id INT NOT NULL,
  officer_id INT NOT NULL,
  PRIMARY KEY (case_id, officer_id),
  CONSTRAINT fk_case_assignments_case
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_case_assignments_officer
    FOREIGN KEY (officer_id) REFERENCES police_officers(officer_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE criminal_prison_assignments (
  criminal_id INT NOT NULL,
  case_id INT NOT NULL,
  prison_id INT NOT NULL,
  date_assigned DATE NOT NULL,
  PRIMARY KEY (criminal_id, case_id),
  CONSTRAINT fk_cpa_criminal
    FOREIGN KEY (criminal_id) REFERENCES criminals(criminal_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_cpa_case
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_cpa_prison
    FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE login_users (
  username VARCHAR(100) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'officer') NOT NULL
);

CREATE TABLE officer_deletion_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  deleted_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_audit_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  added_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sentence_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  old_sentence VARCHAR(100) DEFAULT NULL,
  new_sentence VARCHAR(100) DEFAULT NULL,
  changed_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO criminals (criminal_id, name, dob, gender, address, phone) VALUES
  (1, 'Ravi Kumar', '1985-06-15', 'Male', 'Delhi', '9876543210'),
  (2, 'Sunita Sharma', '1990-03-22', 'Female', 'Mumbai', '9898989898'),
  (3, 'Ajay Verma', '1982-09-10', 'Male', 'Lucknow', '9765432109'),
  (4, 'Neha Patil', '1995-11-02', 'Female', 'Pune', '9123456780'),
  (5, 'Rahul Mehta', '1987-12-05', 'Male', 'Chennai', '9988776655'),
  (6, 'Pooja Reddy', '1992-08-08', 'Female', 'Hyderabad', '9871234567');

INSERT INTO police_officers (officer_id, name, officer_rank, phone, email, station) VALUES
  (101, 'Inspector Rajeev', 'Inspector', '9000000001', 'rajeev@police.in', 'Delhi Central'),
  (102, 'SI Anjali', 'Sub-Inspector', '9000000002', 'anjali@police.in', 'Mumbai South'),
  (103, 'Inspector Kiran', 'Inspector', '9000000003', 'kiran@police.in', 'Lucknow North'),
  (104, 'SI Mohan', 'Sub-Inspector', '9000000004', 'mohan@police.in', 'Pune West'),
  (105, 'Inspector Iqbal', 'Inspector', '9000000005', 'iqbal@police.in', 'Chennai Central'),
  (106, 'SI Leela', 'Sub-Inspector', '9000000006', 'leela@police.in', 'Hyderabad East'),
  (107, 'SI Arvind', 'Sub-Inspector', '9000000007', 'officer7@police.in', 'Kolkata Zone');

INSERT INTO cases (case_id, court_name, lawyer_assigned, verdict, sentence, criminal_id, officer_id) VALUES
  (201, 'Delhi High Court', 'Adv. Kapoor', 'Guilty', '7 Years Jail', 1, 101),
  (202, 'Mumbai Sessions', 'Adv. Rane', 'Under Trial', NULL, 2, 102),
  (203, 'Lucknow District', 'Adv. Yadav', 'Pending', NULL, 3, 103),
  (204, 'Pune Court', 'Adv. Joshi', 'Guilty', '3 Years Jail', 4, 104),
  (205, 'Chennai Court', 'Adv. Menon', 'Pending', NULL, 5, 105),
  (206, 'Hyderabad Court', 'Adv. Rao', 'Guilty', '5 Years Jail', 6, 106);

INSERT INTO offences (offence_id, crime_type, location, date_of_offence, description, criminal_id) VALUES
  (301, 'Robbery', 'Delhi', '2022-01-15', 'Bank robbery at Connaught Place.', 1),
  (302, 'Assault', 'Mumbai', '2023-03-05', 'Physical assault case in Bandra.', 2),
  (303, 'Theft', 'Lucknow', '2021-09-20', 'Bike theft near Hazratganj.', 3),
  (304, 'Cyber Crime', 'Pune', '2022-11-11', 'Phishing scam.', 4),
  (305, 'Fraud', 'Chennai', '2023-02-18', 'Bank account fraud.', 5),
  (306, 'Kidnapping', 'Hyderabad', '2021-07-10', 'Child abduction case.', 6);

INSERT INTO victims (victim_id, name, address, contact_info, offence_id, dob) VALUES
  (401, 'Arjun Singh', 'Delhi', '9911223344', 301, '1985-01-01'),
  (402, 'Meena Kumari', 'Mumbai', '9922334455', 302, '1990-02-01'),
  (403, 'Raj Malhotra', 'Lucknow', '9933445566', 303, '1988-05-15'),
  (404, 'Sneha Rao', 'Pune', '9944556677', 304, '1991-06-20'),
  (405, 'Ankit Verma', 'Chennai', '9955667788', 305, '1993-08-25'),
  (406, 'Komal Das', 'Hyderabad', '9966778899', 306, '1992-11-11');

INSERT INTO witnesses (witness_id, name, contact_info, statement, case_id) VALUES
  (501, 'Deepak Sharma', '9990001111', 'Saw the robbery.', 201),
  (502, 'Anil Mehta', '9991112222', 'Was present during the assault.', 202),
  (503, 'Kavita Singh', '9992223333', 'Reported the theft.', 203),
  (504, 'Farhan Ali', '9993334444', 'Received phishing emails.', 204),
  (505, 'Rekha Jain', '9994445555', 'Gave bank fraud info.', 205),
  (506, 'Rohit Das', '9995556666', 'Saw kidnapping.', 206);

INSERT INTO evidences (evidence_id, evidence_type, description, case_id) VALUES
  (601, 'CCTV Footage', 'Video of robbery.', 201),
  (602, 'Medical Report', 'Assault injury proof.', 202),
  (603, 'Stolen Item', 'Recovered bike.', 203),
  (604, 'Email Trace', 'Phishing mail headers.', 204),
  (605, 'Bank Statement', 'Fraudulent transfers.', 205),
  (606, 'CCTV Clip', 'Child abduction recording.', 206);

INSERT INTO prisons (prison_id, name, location, capacity, inmates_count) VALUES
  (701, 'Tihar Jail', 'Delhi', 1000, 450),
  (702, 'Arthur Road Jail', 'Mumbai', 800, 350),
  (703, 'Lucknow Jail', 'Lucknow', 700, 300),
  (704, 'Yerwada Jail', 'Pune', 850, 400),
  (705, 'Puzhal Jail', 'Chennai', 600, 200),
  (706, 'Cherlapally Jail', 'Hyderabad', 750, 350);

INSERT INTO case_assignments (case_id, officer_id) VALUES
  (201, 101),
  (202, 102),
  (203, 103),
  (204, 104),
  (205, 105),
  (206, 106);

INSERT INTO criminal_prison_assignments (criminal_id, case_id, prison_id, date_assigned) VALUES
  (1, 201, 701, '2022-01-20'),
  (2, 202, 702, '2023-03-10'),
  (3, 203, 703, '2021-09-25'),
  (4, 204, 704, '2022-11-15'),
  (5, 205, 705, '2023-02-20'),
  (6, 206, 706, '2021-07-15');

-- ✅ PLAIN TEXT PASSWORDS (no hashing — for demo/simplicity)
-- admin@system.com  → admin123
-- all officers      → default123
-- officer7          → officer123
INSERT INTO login_users (username, password_hash, role) VALUES
  ('admin@system.com', 'admin123', 'admin'),
  ('rajeev@police.in', 'default123', 'officer'),
  ('anjali@police.in', 'default123', 'officer'),
  ('kiran@police.in', 'default123', 'officer'),
  ('mohan@police.in', 'default123', 'officer'),
  ('iqbal@police.in', 'default123', 'officer'),
  ('leela@police.in', 'default123', 'officer'),
  ('officer7@police.in', 'officer123', 'officer');

INSERT INTO case_audit_log (case_id, added_on) VALUES
  (201, NOW()), (202, NOW()), (203, NOW()),
  (204, NOW()), (205, NOW()), (206, NOW());
