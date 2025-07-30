-- 1: Doctor Shifts and Number of Treated Patients
SELECT
    ss.shift_date,
    ss.start_time,
    ss.end_time,
    ad.id_number AS attending_doctor_id,
    p.first_name || ' ' || p.last_name AS doctor_name,
    COUNT(DISTINCT t.patient_id) AS patients_treated
FROM staff_shift ss
JOIN attending_doctor ad ON ss.staff_id = ad.id_number
LEFT JOIN treatment t ON ad.id_number = t.attending_doctor_id
                      AND t.treatment_date = ss.shift_date
JOIN person p ON ad.id_number = p.id_number
GROUP BY ss.shift_date, ss.start_time, ss.end_time, ad.id_number, p.first_name, p.last_name
HAVING COUNT(DISTINCT t.patient_id) > 0
ORDER BY ss.shift_date DESC, ss.start_time;

-- 2: Most Common Blood Type per Department
SELECT department_number, blood_type, blood_type_count
FROM (
    SELECT
        ad.department_number,
        p.blood_type,
        COUNT(*) AS blood_type_count
    FROM treatment t
    JOIN patient p ON t.patient_id = p.id_number
    JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
    GROUP BY ad.department_number, p.blood_type
) AS blood_type_counts
WHERE (department_number, blood_type_count) IN (
    SELECT department_number, MAX(blood_type_count)
    FROM (
        SELECT
            ad.department_number,
            p.blood_type,
            COUNT(*) AS blood_type_count
        FROM treatment t
        JOIN patient p ON t.patient_id = p.id_number
        JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
        GROUP BY ad.department_number, p.blood_type
    ) AS inner_blood_type_counts
    GROUP BY department_number
)
ORDER BY department_number;

-- 3: Most Frequently Treated Blood Type
SELECT blood_type, COUNT(*) AS treatment_count
FROM treatment t
JOIN patient p ON t.patient_id = p.id_number
GROUP BY blood_type
ORDER BY treatment_count DESC
LIMIT 1;

-- 4: Top 3 Research Doctors Hired in the Last 5 Years
SELECT p.id_number, first_name, last_name, citation_count
FROM research_doctor rd
JOIN medical_staff ms ON rd.id_number = ms.id_number
JOIN person p ON ms.id_number = p.id_number
WHERE EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM ms.hire_date) <= 5
ORDER BY citation_count DESC
LIMIT 3;

-- 5: Most Used Medications per Department
SELECT d.department_number, m.medication_name, COUNT(*) AS medication_count
FROM treatment_medication tm
JOIN treatment t ON tm.treatment_date = t.treatment_date
                 AND tm.patient_id = t.patient_id
                 AND tm.attending_doctor_id = t.attending_doctor_id
JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
JOIN department d ON ad.department_number = d.department_number
JOIN medication m ON tm.medication_code = m.medication_code
GROUP BY d.department_number, m.medication_name
ORDER BY d.department_number;

-- 6: Doctors with More Than 10 Treatments in One Day
SELECT ad.id_number AS doctor_id, ad.department_number, t.treatment_date, COUNT(*) AS treatments_count
FROM treatment t
JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
GROUP BY ad.id_number, t.treatment_date, ad.department_number
HAVING COUNT(*) > 10;

-- 7: Patients with the Highest Number of Treatments
SELECT p.first_name, p.last_name, t.patient_id, COUNT(*) AS treatments_count
FROM treatment t
JOIN person p ON t.patient_id = p.id_number
GROUP BY t.patient_id, p.first_name, p.last_name
ORDER BY treatments_count DESC;

-- 8: Department with the Most Patients in the Last 6 Months
SELECT
    d.department_number,
    COUNT(DISTINCT t.patient_id) AS total_patients
FROM treatment t
JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
JOIN department d ON ad.department_number = d.department_number
WHERE t.treatment_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY d.department_number
ORDER BY total_patients DESC
LIMIT 1;
