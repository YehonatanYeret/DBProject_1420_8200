-- update the salary of all medical staff who are research doctors with more than 300 citations
UPDATE medical_staff
SET salary = salary * 1.05
WHERE staff_id IN (
    SELECT staff_id
    FROM research_doctor
    WHERE citation_count > 300
);

-- Update the price of medications that are prescribed more than 20 times
UPDATE medication
SET price = price * 1.05
WHERE medication_code IN (
    SELECT medication_code
    FROM treatment_medication
    GROUP BY medication_code
    HAVING COUNT(*) > 20
);

-- Update the number of beds in departments when the number of night shift nurses
-- is more than half of the total number of beds in that department
UPDATE department
SET number_of_beds = number_of_beds * 1.5
WHERE department_id IN (
    SELECT d.department_id
    FROM department d
    JOIN nurse n ON d.department_id = n.department_id
    WHERE n.shift_type = 'night'
    GROUP BY d.department_id, d.number_of_beds
    HAVING d.number_of_beds < 0.5 * COUNT(n.nurse_id)
);

