
-- 1: Delete patients who have not received treatment in the last 15 years
DELETE FROM patient
WHERE id_number NOT IN (
    SELECT DISTINCT patient_id
    FROM treatment
    WHERE treatment_date >= CURRENT_DATE - INTERVAL '15 years'
);


-- 2: Delete departments that have no doctors
DELETE FROM department
WHERE department_number NOT IN (
    SELECT DISTINCT department_number
    FROM attending_doctor
);

-- 3: Delete medications that have not been prescribed to at least 7% of patients
DELETE FROM medication
WHERE (
    SELECT COUNT(DISTINCT patient_id)
    FROM treatment_medication
    WHERE treatment_medication.medication_code = medication.medication_code
) < 0.07 * (SELECT COUNT(*) FROM patient);
