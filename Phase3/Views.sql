-- 1. View on the access of the logistic worker to the warehouse
CREATE VIEW Logistic_Worker_Access AS
SELECT
    p.ID_number,
    CONCAT(p.First_name, ' ', p.Last_name) AS Full_Name,
    w.Warehouse_Id,
    w.Name AS Warehouse_Name,
    w.Active_hours,
    ha.Level
FROM
    Person p
    JOIN Logistic_worker lw ON p.ID_number = lw.ID_number
    JOIN Has_access ha ON lw.ID_number = ha.ID_number
    JOIN Warehouse w ON ha.Warehouse_Id = w.Warehouse_Id;

-- 1.1. Logistic worker access to the warehouse with level 5(full access)
SELECT *
FROM Logistic_Worker_Access
WHERE Level = 5;

-- 1.2. Count of workers in each warehouse
SELECT
    Warehouse_Name,
    COUNT(DISTINCT ID_number) AS Num_Workers
FROM Logistic_Worker_Access
GROUP BY Warehouse_Name;

-- 2. View of treatment details by doctor
CREATE VIEW Treatments_By_Doctor AS
SELECT
    p_patient.ID_number AS Patient_ID,
    p_patient.First_Name AS Patient_First_Name,
    p_patient.Last_Name AS Patient_Last_Name,
    t.Treatment_Date,
    p_doctor.First_Name AS Doctor_First_Name,
    p_doctor.Last_Name AS Doctor_Last_Name
FROM
    Treatment t
JOIN Patient pat ON t.Patient_ID = pat.ID_number
JOIN Person p_patient ON pat.ID_number = p_patient.ID_number
JOIN Attending_doctor ad ON t.attending_doctor_id = ad.ID_number
JOIN Person p_doctor ON ad.ID_number = p_doctor.ID_number;

-- 2.1. Count of treatments by doctor
SELECT Doctor_First_Name, Doctor_Last_Name, COUNT(*) AS Treatment_Count
FROM Treatments_By_Doctor
GROUP BY Doctor_First_Name, Doctor_Last_Name
ORDER BY Treatment_Count DESC;

-- 2.2. Count of unique patients treated by each doctor (and only those with more than 3 unique patients)

SELECT Doctor_First_Name, Doctor_Last_Name, COUNT(DISTINCT Patient_ID) AS Unique_Patients
FROM Treatments_By_Doctor
GROUP BY Doctor_First_Name, Doctor_Last_Name
HAVING COUNT(DISTINCT Patient_ID) > 3;





