--tables and inserted values
-- CRIMINAL TABLE
CREATE TABLE Criminal (
    criminal_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    dob DATE,
    gender VARCHAR2(10),
    address VARCHAR2(200),
    phone VARCHAR2(15)
);

-- POLICE OFFICER TABLE
CREATE TABLE Police_Officer (
    officer_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    rank VARCHAR2(50),
    phone VARCHAR2(15),
    email VARCHAR2(100),
    station VARCHAR2(100)
);

-- CASES TABLE
CREATE TABLE Cases (
    case_id NUMBER PRIMARY KEY,
    court_name VARCHAR2(100),
    lawyer_assigned VARCHAR2(100),
    verdict VARCHAR2(50),
    sentence VARCHAR2(100),
    criminal_id NUMBER REFERENCES Criminal(criminal_id)
);

-- OFFENCE TABLE
CREATE TABLE Offence (
    offence_id NUMBER PRIMARY KEY,
    crime_type VARCHAR2(100),
    location VARCHAR2(100),
    data_of_offence DATE,
    description VARCHAR2(500),
    criminal_id NUMBER REFERENCES Criminal(criminal_id)
);

-- VICTIMS TABLE
CREATE TABLE Victims (
    victim_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    address VARCHAR2(200),
    contact_info VARCHAR2(15),
    offence_id NUMBER REFERENCES Offence(offence_id),
    dob DATE
);

-- WITNESSES TABLE
CREATE TABLE Witnesses (
    witness_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    contact_info VARCHAR2(15),
    statement VARCHAR2(1000),
    case_id NUMBER REFERENCES Cases(case_id)
);

-- EVIDENCES TABLE
CREATE TABLE Evidences (
    evidence_id NUMBER PRIMARY KEY,
    evidence_type VARCHAR2(100),
    description VARCHAR2(500),
    case_id NUMBER REFERENCES Cases(case_id)
);

-- PRISON TABLE
CREATE TABLE Prison (
    prison_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    location VARCHAR2(100),
    capacity NUMBER,
    inmates_count NUMBER DEFAULT 0
);

-- CASE ASSIGNMENT TABLE (OFFICER-CASE RELATION)
CREATE TABLE Case_Assignments (
    case_id NUMBER REFERENCES Cases(case_id),
    officer_id NUMBER REFERENCES Police_Officer(officer_id),
    PRIMARY KEY (case_id, officer_id)
);

CREATE TABLE Criminal_Prison_Assignment (
    criminal_id NUMBER REFERENCES Criminal(criminal_id),
    case_id NUMBER REFERENCES Cases(case_id),
    prison_id NUMBER REFERENCES Prison(prison_id),
    date_assigned DATE,
    PRIMARY KEY (criminal_id, case_id)
);

-- LOGIN USERS TABLE
CREATE TABLE Login_Users (
    username VARCHAR2(50) PRIMARY KEY,
    password_hash VARCHAR2(100),
    role VARCHAR2(20) CHECK (role IN ('admin', 'officer'))
);

-- LOG TABLES FOR TRIGGERS
CREATE TABLE officer_deletion_log (
    officer_id NUMBER,
    name VARCHAR2(100),
    deleted_on DATE
);

CREATE TABLE case_audit_log (
    case_id NUMBER,
    added_on DATE
);

CREATE TABLE sentence_log (
    case_id NUMBER,
    old_sentence VARCHAR2(100),
    new_sentence VARCHAR2(100),
    changed_on DATE
);


-- CRIMINALS
INSERT INTO Criminal VALUES (1, 'Ravi Kumar', DATE '1985-06-15', 'Male', 'Delhi', '9876543210');
INSERT INTO Criminal VALUES (2, 'Sunita Sharma', DATE '1990-03-22', 'Female', 'Mumbai', '9898989898');
INSERT INTO Criminal VALUES (3, 'Ajay Verma', DATE '1982-09-10', 'Male', 'Lucknow', '9765432109');
INSERT INTO Criminal VALUES (4, 'Neha Patil', DATE '1995-11-02', 'Female', 'Pune', '9123456780');
INSERT INTO Criminal VALUES (5, 'Rahul Mehta', DATE '1987-12-05', 'Male', 'Chennai', '9988776655');
INSERT INTO Criminal VALUES (6, 'Pooja Reddy', DATE '1992-08-08', 'Female', 'Hyderabad', '9871234567');

-- POLICE OFFICERS
INSERT INTO Police_Officer VALUES (101, 'Inspector Rajeev', 'Inspector', '9000000001', 'rajeev@police.in', 'Delhi Central');
INSERT INTO Police_Officer VALUES (102, 'SI Anjali', 'Sub-Inspector', '9000000002', 'anjali@police.in', 'Mumbai South');
INSERT INTO Police_Officer VALUES (103, 'Inspector Kiran', 'Inspector', '9000000003', 'kiran@police.in', 'Lucknow North');
INSERT INTO Police_Officer VALUES (104, 'SI Mohan', 'Sub-Inspector', '9000000004', 'mohan@police.in', 'Pune West');
INSERT INTO Police_Officer VALUES (105, 'Inspector Iqbal', 'Inspector', '9000000005', 'iqbal@police.in', 'Chennai Central');
INSERT INTO Police_Officer VALUES (106, 'SI Leela', 'Sub-Inspector', '9000000006', 'leela@police.in', 'Hyderabad East');

-- CASES
INSERT INTO Cases VALUES (201, 'Delhi High Court', 'Adv. Kapoor', 'Guilty', '7 Years Jail', 1);
INSERT INTO Cases VALUES (202, 'Mumbai Sessions', 'Adv. Rane', 'Under Trial', NULL, 2);
INSERT INTO Cases VALUES (203, 'Lucknow District', 'Adv. Yadav', 'Pending', NULL, 3);
INSERT INTO Cases VALUES (204, 'Pune Court', 'Adv. Joshi', 'Guilty', '3 Years Jail', 4);
INSERT INTO Cases VALUES (205, 'Chennai Court', 'Adv. Menon', 'Pending', NULL, 5);
INSERT INTO Cases VALUES (206, 'Hyderabad Court', 'Adv. Rao', 'Guilty', '5 Years Jail', 6);

-- OFFENCE
INSERT INTO Offence VALUES (301, 'Robbery', 'Delhi', DATE '2022-01-15', 'Bank robbery at Connaught Place.', 1);
INSERT INTO Offence VALUES (302, 'Assault', 'Mumbai', DATE '2023-03-05', 'Physical assault case in Bandra.', 2);
INSERT INTO Offence VALUES (303, 'Theft', 'Lucknow', DATE '2021-09-20', 'Bike theft near Hazratganj.', 3);
INSERT INTO Offence VALUES (304, 'Cyber Crime', 'Pune', DATE '2022-11-11', 'Phishing scam.', 4);
INSERT INTO Offence VALUES (305, 'Fraud', 'Chennai', DATE '2023-02-18', 'Bank account fraud.', 5);
INSERT INTO Offence VALUES (306, 'Kidnapping', 'Hyderabad', DATE '2021-07-10', 'Child abduction case.', 6);

-- VICTIMS
INSERT INTO Victims VALUES (401, 'Arjun Singh', 'Delhi', '9911223344', 301, DATE '1985-01-01');
INSERT INTO Victims VALUES (402, 'Meena Kumari', 'Mumbai', '9922334455', 302, DATE '1990-02-01');
INSERT INTO Victims VALUES (403, 'Raj Malhotra', 'Lucknow', '9933445566', 303, DATE '1988-05-15');
INSERT INTO Victims VALUES (404, 'Sneha Rao', 'Pune', '9944556677', 304, DATE '1991-06-20');
INSERT INTO Victims VALUES (405, 'Ankit Verma', 'Chennai', '9955667788', 305, DATE '1993-08-25');
INSERT INTO Victims VALUES (406, 'Komal Das', 'Hyderabad', '9966778899', 306, DATE '1992-11-11');

-- WITNESSES
INSERT INTO Witnesses VALUES (501, 'Deepak Sharma', '9990001111', 'Saw the robbery.', 201);
INSERT INTO Witnesses VALUES (502, 'Anil Mehta', '9991112222', 'Was present during the assault.', 202);
INSERT INTO Witnesses VALUES (503, 'Kavita Singh', '9992223333', 'Reported the theft.', 203);
INSERT INTO Witnesses VALUES (504, 'Farhan Ali', '9993334444', 'Received phishing emails.', 204);
INSERT INTO Witnesses VALUES (505, 'Rekha Jain', '9994445555', 'Gave bank fraud info.', 205);
INSERT INTO Witnesses VALUES (506, 'Rohit Das', '9995556666', 'Saw kidnapping.', 206);

-- EVIDENCES
INSERT INTO Evidences VALUES (601, 'CCTV Footage', 'Video of robbery.', 201);
INSERT INTO Evidences VALUES (602, 'Medical Report', 'Assault injury proof.', 202);
INSERT INTO Evidences VALUES (603, 'Stolen Item', 'Recovered bike.', 203);
INSERT INTO Evidences VALUES (604, 'Email Trace', 'Phishing mail headers.', 204);
INSERT INTO Evidences VALUES (605, 'Bank Statement', 'Fraudulent transfers.', 205);
INSERT INTO Evidences VALUES (606, 'CCTV Clip', 'Child abduction recording.', 206);

-- PRISON
INSERT INTO Prison VALUES (701, 'Tihar Jail', 'Delhi', 1000, 450);
INSERT INTO Prison VALUES (702, 'Arthur Road Jail', 'Mumbai', 800, 350);
INSERT INTO Prison VALUES (703, 'Lucknow Jail', 'Lucknow', 700, 300);
INSERT INTO Prison VALUES (704, 'Yerwada Jail', 'Pune', 850, 400);
INSERT INTO Prison VALUES (705, 'Puzhal Jail', 'Chennai', 600, 200);
INSERT INTO Prison VALUES (706, 'Cherlapally Jail', 'Hyderabad', 750, 350);

-- CASE ASSIGNMENTS
INSERT INTO Case_Assignments VALUES (201, 101);
INSERT INTO Case_Assignments VALUES (202, 102);
INSERT INTO Case_Assignments VALUES (203, 103);
INSERT INTO Case_Assignments VALUES (204, 104);
INSERT INTO Case_Assignments VALUES (205, 105);
INSERT INTO Case_Assignments VALUES (206, 106);

--sentenced to
INSERT INTO Criminal_Prison_Assignment VALUES (1, 201, 701, DATE '2022-01-20'); -- Ravi Kumar → Delhi → Tihar
INSERT INTO Criminal_Prison_Assignment VALUES (2, 202, 702, DATE '2023-03-10'); -- Sunita Sharma → Mumbai → Arthur Road
INSERT INTO Criminal_Prison_Assignment VALUES (3, 203, 703, DATE '2021-09-25'); -- Ajay Verma → Lucknow → Lucknow Jail
INSERT INTO Criminal_Prison_Assignment VALUES (4, 204, 704, DATE '2022-11-15'); -- Neha Patil → Pune → Yerwada
INSERT INTO Criminal_Prison_Assignment VALUES (5, 205, 705, DATE '2023-02-20'); -- Rahul Mehta → Chennai → Puzhal
INSERT INTO Criminal_Prison_Assignment VALUES (6, 206, 706, DATE '2021-07-15'); -- Pooja Reddy → Hyderabad → Cherlapally



--login authentication
CREATE OR REPLACE PROCEDURE login_user(
    p_username IN VARCHAR2,
    p_password IN VARCHAR2,
    p_role OUT VARCHAR2
) AS
    v_count NUMBER;
    v_hash VARCHAR2(100);
BEGIN
    SELECT COUNT(*), password_hash, role
    INTO v_count, v_hash, p_role
    FROM Login_Users
    WHERE username = p_username;

    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Invalid Username');
    ELSIF v_hash != STANDARD_HASH(p_password, 'SHA256') THEN
        RAISE_APPLICATION_ERROR(-20002, 'Invalid Password');
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE view_assigned_cases(p_username IN VARCHAR2) AS
    v_officer_id NUMBER;
BEGIN
    -- Get officer_id from username
    SELECT officer_id INTO v_officer_id
    FROM Police_Officer
    WHERE email = (
        SELECT username FROM Login_Users WHERE username = p_username AND role = 'officer'
    );

    FOR rec IN (
        SELECT c.case_id, c.court_name, c.lawyer_assigned, c.verdict, c.sentence
        FROM Cases c
        JOIN Case_Assignments ca ON c.case_id = ca.case_id
        WHERE ca.officer_id = v_officer_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('Case ID: ' || rec.case_id || ', Court: ' || rec.court_name ||
                             ', Lawyer: ' || rec.lawyer_assigned || ', Verdict: ' || rec.verdict ||
                             ', Sentence: ' || rec.sentence);
    END LOOP;
END;
/

CREATE OR REPLACE PROCEDURE add_officer(
    p_officer_id NUMBER,
    p_name VARCHAR2,
    p_rank VARCHAR2,
    p_phone VARCHAR2,
    p_email VARCHAR2,
    p_station VARCHAR2
) AS
BEGIN
    INSERT INTO Police_Officer VALUES(p_officer_id, p_name, p_rank, p_phone, p_email, p_station);
    INSERT INTO Login_Users VALUES(p_email, STANDARD_HASH('default123', 'SHA256'), 'officer');
END;
/

CREATE OR REPLACE PROCEDURE remove_officer(p_officer_id IN NUMBER) AS
    v_name VARCHAR2(100);
    v_email VARCHAR2(100);
BEGIN
    SELECT name, email INTO v_name, v_email FROM Police_Officer WHERE officer_id = p_officer_id;

    DELETE FROM Police_Officer WHERE officer_id = p_officer_id;
    DELETE FROM Login_Users WHERE username = v_email;

    INSERT INTO officer_deletion_log VALUES(p_officer_id, v_name, SYSDATE);
END;
/

CREATE OR REPLACE PROCEDURE add_case(
    p_case_id NUMBER,
    p_court_name VARCHAR2,
    p_lawyer VARCHAR2,
    p_verdict VARCHAR2,
    p_sentence VARCHAR2,
    p_criminal_id NUMBER
) AS
BEGIN
    INSERT INTO Cases VALUES(p_case_id, p_court_name, p_lawyer, p_verdict, p_sentence, p_criminal_id);
    INSERT INTO case_audit_log VALUES(p_case_id, SYSDATE);
END;
/

CREATE OR REPLACE PROCEDURE view_case(p_case_id IN NUMBER) AS
    v_case Cases%ROWTYPE;
BEGIN
    SELECT * INTO v_case FROM Cases WHERE case_id = p_case_id;

    DBMS_OUTPUT.PUT_LINE('Case ID: ' || v_case.case_id || ', Court: ' || v_case.court_name);
    DBMS_OUTPUT.PUT_LINE('Lawyer: ' || v_case.lawyer_assigned || ', Verdict: ' || v_case.verdict);
    DBMS_OUTPUT.PUT_LINE('Sentence: ' || v_case.sentence || ', Criminal ID: ' || v_case.criminal_id);
END;
/

CREATE OR REPLACE PROCEDURE remove_case(p_case_id IN NUMBER) AS
BEGIN
    DELETE FROM Case_Assignments WHERE case_id = p_case_id;
    DELETE FROM Evidences WHERE case_id = p_case_id;
    DELETE FROM Witnesses WHERE case_id = p_case_id;
    DELETE FROM Criminal_Prison_Assignment WHERE case_id = p_case_id;
    DELETE FROM Cases WHERE case_id = p_case_id;
END;
/

--example
-- Admin
INSERT INTO Login_Users VALUES ('admin@system.com', STANDARD_HASH('admin123', 'SHA256'), 'admin');

-- Officer (linked to Police_Officer)
-- Let's say officer_id = 107, email = 'officer7@police.in'
INSERT INTO Police_Officer VALUES (107, 'SI Arvind', 'Sub-Inspector', '9000000007', 'officer7@police.in', 'Kolkata Zone');
INSERT INTO Login_Users VALUES ('officer7@police.in', STANDARD_HASH('officer123', 'SHA256'), 'officer');


--functions and procedures
CREATE OR REPLACE PROCEDURE add_case (
    p_case_id NUMBER,
    p_court_name VARCHAR2,
    p_lawyer VARCHAR2,
    p_status VARCHAR2,
    p_sentence VARCHAR2,
    p_criminal_id NUMBER
) AS
BEGIN
    INSERT INTO Cases 
    VALUES (p_case_id, p_court_name, p_lawyer, p_status, p_sentence, p_criminal_id);
    
    DBMS_OUTPUT.PUT_LINE('Case added successfully.');
END;
/

CREATE OR REPLACE PROCEDURE assign_case_to_officer (
    p_case_id NUMBER,
    p_officer_id NUMBER
) AS
BEGIN
    INSERT INTO Case_Assignments 
    VALUES (p_case_id, p_officer_id);
    
    DBMS_OUTPUT.PUT_LINE('Case assigned to officer.');
END;
/

CREATE OR REPLACE FUNCTION count_cases_for_criminal (
    p_criminal_id NUMBER
) RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM Cases 
    WHERE criminal_id = p_criminal_id;
    
    RETURN v_count;
END;
/

CREATE OR REPLACE FUNCTION get_criminal_age (
    p_criminal_id NUMBER
) RETURN NUMBER IS
    v_dob DATE;
    v_age NUMBER;
BEGIN
    SELECT dob INTO v_dob 
    FROM Criminal 
    WHERE criminal_id = p_criminal_id;

    v_age := FLOOR(MONTHS_BETWEEN(SYSDATE, v_dob) / 12);
    
    RETURN v_age;
END;
/

CREATE OR REPLACE FUNCTION get_officer_name (
    p_officer_id NUMBER
) RETURN VARCHAR2 IS
    v_name VARCHAR2(100);
BEGIN
    SELECT name INTO v_name
    FROM Police_Officer
    WHERE officer_id = p_officer_id;

    RETURN v_name;
END;
/

CREATE OR REPLACE PROCEDURE remove_case (
    p_case_id NUMBER
) AS
BEGIN
    DELETE FROM Cases
    WHERE case_id = p_case_id;

    DBMS_OUTPUT.PUT_LINE('Case removed successfully.');
END;
/


--triggers
CREATE OR REPLACE TRIGGER trg_log_officer_deletion
AFTER DELETE ON Police_Officer
FOR EACH ROW
BEGIN
    INSERT INTO officer_deletion_log (officer_id, name, deleted_on)
    VALUES (:OLD.officer_id, :OLD.name, SYSDATE);
END;
/

CREATE OR REPLACE TRIGGER trg_log_case_insertion
AFTER INSERT ON Cases
FOR EACH ROW
BEGIN
    INSERT INTO case_audit_log (case_id, added_on)
    VALUES (:NEW.case_id, SYSDATE);
END;
/


CREATE OR REPLACE TRIGGER trg_prevent_officer_delete
BEFORE DELETE ON Police_Officer
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM Case_Assignments
    WHERE officer_id = :OLD.officer_id;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Cannot delete officer: Assigned to active cases.');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_log_sentence_change
BEFORE UPDATE OF sentence ON Cases
FOR EACH ROW
BEGIN
    INSERT INTO sentence_log (case_id, old_sentence, new_sentence, changed_on)
    VALUES (:OLD.case_id, :OLD.sentence, :NEW.sentence, SYSDATE);
END;
/

--cursors
CURSOR criminal_prison_cursor IS
SELECT c.criminal_id, c.name, p.name AS prison_name, cp.date_assigned, cs.sentence
FROM Criminal c
JOIN Criminal_Prison_Assignment cp ON c.criminal_id = cp.criminal_id
JOIN Prison p ON cp.prison_id = p.prison_id
JOIN Cases cs ON cp.case_id = cs.case_id;
 
CURSOR ongoing_cases_cursor IS
SELECT cs.case_id, cs.court_name, cs.verdict, po.name AS officer_name, po.station
FROM Cases cs
JOIN Case_Assignments ca ON cs.case_id = ca.case_id
JOIN Police_Officer po ON ca.officer_id = po.officer_id
WHERE cs.verdict IN ('Under Trial', 'Pending');

CURSOR offence_victim_cursor IS
SELECT o.offence_id, o.crime_type, o.data_of_offence, v.name AS victim_name, c.name AS criminal_name
FROM Offence o
JOIN Victims v ON o.offence_id = v.offence_id
JOIN Criminal c ON o.criminal_id = c.criminal_id;

CURSOR evidence_cursor IS
SELECT e.case_id, c.name AS criminal_name, e.evidence_type, e.description
FROM Evidences e
JOIN Cases cs ON e.case_id = cs.case_id
JOIN Criminal c ON cs.criminal_id = c.criminal_id;

CURSOR officer_deletion_audit IS
SELECT officer_id, name, deleted_on
FROM officer_deletion_log
ORDER BY deleted_on DESC;


--exception handling
CREATE OR REPLACE PROCEDURE add_case (
    p_case_id NUMBER,
    p_court_name VARCHAR2,
    p_lawyer VARCHAR2,
    p_sentence VARCHAR2,
    p_criminal_id NUMBER
) AS
BEGIN
    -- Attempt to insert the case
    INSERT INTO Cases (case_id, court_name, lawyer_assigned , sentence, criminal_id) 
    VALUES (p_case_id, p_court_name, p_lawyer, p_sentence, p_criminal_id);

    DBMS_OUTPUT.PUT_LINE('Case added successfully.');
    
EXCEPTION
    -- Handling for duplicate case IDs
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('Error: Case ID ' || p_case_id || ' already exists.');
    
    -- Handling for other general errors
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/


CREATE OR REPLACE FUNCTION get_criminal_age (
    p_criminal_id NUMBER
) RETURN NUMBER IS
    v_dob DATE;
    v_age NUMBER;
BEGIN
    -- Fetching date of birth
    SELECT dob INTO v_dob FROM Criminal WHERE criminal_id = p_criminal_id;

    -- Calculate the age
    v_age := FLOOR(MONTHS_BETWEEN(SYSDATE, v_dob)/12);
    
    RETURN v_age;

EXCEPTION
    -- Handling if criminal ID does not exist
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Error: No criminal found with ID ' || p_criminal_id);
        RETURN NULL;
    
    -- Handling for other general errors
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        RETURN NULL;
END;
/


CREATE OR REPLACE PROCEDURE remove_case (
    p_case_id NUMBER
) AS
BEGIN
    -- Attempt to delete the case
    DELETE FROM Cases WHERE case_id = p_case_id;

    -- Check if any row was deleted
    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('Error: No case found with ID ' || p_case_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Case ID ' || p_case_id || ' deleted successfully.');
    END IF;

EXCEPTION
    -- Handling for foreign key violations (if the case is referenced elsewhere)
    WHEN OTHERS THEN
        IF SQLCODE = -2292 THEN
            DBMS_OUTPUT.PUT_LINE('Error: Case ID ' || p_case_id || ' is referenced in other records and cannot be deleted.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        END IF;
END;
/


CREATE OR REPLACE TRIGGER officer_deletion_trigger
AFTER DELETE ON Police_Officer
FOR EACH ROW
DECLARE
    v_name VARCHAR2(100);
BEGIN
    -- Fetch officer details before deletion
    SELECT name INTO v_name FROM Police_Officer WHERE officer_id = :OLD.officer_id;

    -- Log the officer deletion
    INSERT INTO officer_deletion_log (officer_id, name, deleted_on)
    VALUES (:OLD.officer_id, v_name, SYSDATE);

    DBMS_OUTPUT.PUT_LINE('Officer ' || v_name || ' has been deleted and logged.');

EXCEPTION
    -- Handling if officer is not found
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Error: Officer not found during deletion.');

    -- Handling for other general errors
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

CREATE OR REPLACE TRIGGER case_audit_log_trigger
AFTER INSERT ON Cases
FOR EACH ROW
BEGIN
    -- Insert into case_audit_log after adding a new case
    INSERT INTO case_audit_log (case_id, added_on)
    VALUES (:NEW.case_id, SYSDATE);

    DBMS_OUTPUT.PUT_LINE('Audit log for case ID ' || :NEW.case_id || ' created.');

EXCEPTION
    -- Handling for issues during insertion into the audit log
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: Failed to create audit log for case ID ' || :NEW.case_id);
END;
/


--sample queries
--joins
-- 1. List criminals with their assigned prison name and location
SELECT c.name AS Criminal_Name, p.name AS Prison_Name, p.location
FROM Criminal c
JOIN Criminal_Prison_Assignment cpa ON c.criminal_id = cpa.criminal_id
JOIN Prison p ON cpa.prison_id = p.prison_id;

-- 2. List all cases with the assigned officer's name and station
SELECT ca.case_id, ca.court_name, po.name AS Officer_Name, po.station
FROM Cases ca
JOIN Case_Assignments caa ON ca.case_id = caa.case_id
JOIN Police_Officer po ON caa.officer_id = po.officer_id;

-- 3. List offences with the criminal's name and offence description
SELECT o.offence_id, o.crime_type, c.name AS Criminal_Name, o.description
FROM Offence o
JOIN Criminal c ON o.criminal_id = c.criminal_id;

-- 4. Get the list of witnesses with their statements for each case
SELECT ca.case_id, w.name AS Witness_Name, w.statement
FROM Cases ca
JOIN Witnesses w ON ca.case_id = w.case_id;

-- 5. Find all evidences related to cases handled by 'Inspector Rajeev'
SELECT e.evidence_type, e.description, ca.case_id
FROM Evidences e
JOIN Cases ca ON e.case_id = ca.case_id
JOIN Case_Assignments caa ON ca.case_id = caa.case_id
JOIN Police_Officer po ON caa.officer_id = po.officer_id
WHERE po.name = 'Inspector Rajeev';

--subqueries
-- 1. Find criminals who have more than 2 cases assigned
SELECT name
FROM Criminal
WHERE criminal_id IN (
    SELECT criminal_id
    FROM Cases
    GROUP BY criminal_id
    HAVING COUNT(case_id) > 2
);

-- 2. List cases where the officer assigned is from 'Mumbai South' station
SELECT case_id, court_name
FROM Cases
WHERE case_id IN (
    SELECT case_id
    FROM Case_Assignments caa
    JOIN Police_Officer po ON caa.officer_id = po.officer_id
    WHERE po.station = 'Mumbai South'
);

-- 3. Find witnesses who have given statements for more than one case
SELECT name
FROM Witnesses
WHERE witness_id IN (
    SELECT witness_id
    FROM Witnesses
    GROUP BY witness_id
    HAVING COUNT(DISTINCT case_id) > 1
);

-- 4. List criminals assigned to prisons located in 'Delhi'
SELECT name
FROM Criminal
WHERE criminal_id IN (
    SELECT criminal_id
    FROM Criminal_Prison_Assignment cpa
    JOIN Prison p ON cpa.prison_id = p.prison_id
    WHERE p.location = 'Delhi'
);

-- 5. Find cases with no witnesses
SELECT case_id, court_name
FROM Cases
WHERE case_id NOT IN (
    SELECT DISTINCT case_id FROM Witnesses
);

--login
-- 1. Insert a new login user
INSERT INTO Login_Users (username, password_hash, role)
VALUES ('raj.kumar@police.in', STANDARD_HASH('secure123', 'SHA256'), 'officer');


-- 2. Validate login credentials (successful login example)
SELECT role
FROM Login_Users
WHERE username = 'raj.kumar@police.in'
  AND password_hash = STANDARD_HASH('secure123', 'SHA256');


-- 3. Delete a login user
DELETE FROM Login_Users
WHERE username = 'raj.kumar@police.in';


-- 4. List all login users ordered by role and username
SELECT username, role
FROM Login_Users
ORDER BY role, username;


-- 5. PL/SQL block to handle login and output result (success or invalid)
DECLARE
    v_role Login_Users.role%TYPE;
BEGIN
    SELECT role INTO v_role
    FROM Login_Users
    WHERE username = 'raj.kumar@police.in'
      AND password_hash = STANDARD_HASH('secure123', 'SHA256');

    DBMS_OUTPUT.PUT_LINE('Login successful. Role: ' || v_role);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Invalid username or password.');
END;
/

--procedures and functions 
-- 1. Add a new case using add_case procedure
BEGIN
    add_case(
        p_case_id => 207,
        p_court_name => 'New Delhi Court',
        p_lawyer => 'Adv. Sharma',
        p_status => 'Pending',
        p_sentence => NULL,
        p_criminal_id => 3
    );
END;
/

-- 2. Assign case to an officer using assign_case_to_officer procedure
BEGIN
    assign_case_to_officer(
        p_case_id => 207,
        p_officer_id => 101
    );
END;
/

-- 3. Count total cases for a criminal using count_cases_for_criminal function
DECLARE
    v_total_cases NUMBER;
BEGIN
    v_total_cases := count_cases_for_criminal(3);
    DBMS_OUTPUT.PUT_LINE('Total cases for criminal 3: ' || v_total_cases);
END;
/

-- 4. Get criminal age using get_criminal_age function
DECLARE
    v_age NUMBER;
BEGIN
    v_age := get_criminal_age(1);
    DBMS_OUTPUT.PUT_LINE('Age of criminal 1: ' || v_age || ' years');
END;
/

-- 5. Get police officer name using get_officer_name function
DECLARE
    v_officer_name VARCHAR2(100);
BEGIN
    v_officer_name := get_officer_name(102);
    DBMS_OUTPUT.PUT_LINE('Officer name with ID 102: ' || v_officer_name);
END;
/
