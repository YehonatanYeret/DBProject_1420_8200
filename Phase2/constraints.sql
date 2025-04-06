-- 1. Address Table Constraints
ALTER TABLE address
    ADD CONSTRAINT chk_zip_code_format CHECK (zip_code ~ '^[0-9]{5}$');  -- ZIP code must be exactly 5 digits


-- 2. Lab Table Constraints
ALTER TABLE lab
    ADD CONSTRAINT chk_lab_num_technicians CHECK (number_of_technicians >= 1);  -- Must have at least one technician


-- 3. Department Table Constraints
ALTER TABLE department
    ADD CONSTRAINT chk_department_beds CHECK (number_of_beds >= 0);  -- Number of beds cannot be negative
ALTER TABLE department
    ADD CONSTRAINT chk_department_phone_length CHECK (LENGTH(department_phone_number) >= 7);  -- Minimal phone length


-- 4. Medication Table Constraints
ALTER TABLE medication
    ADD CONSTRAINT chk_medication_price_positive CHECK (price > 0);  -- Price must be positive
ALTER TABLE medication
    ADD CONSTRAINT chk_medication_name_length CHECK (LENGTH(medication_name) >= 2);  -- Medication name should be at least 2 characters


-- 5. Person Table Constraints
ALTER TABLE person
    ADD CONSTRAINT chk_id_number_range CHECK (id_number > 0 AND id_number < 9999999999);  -- Validate id_number within a realistic range


-- 6. Patient Table Constraints
ALTER TABLE patient
    ADD CONSTRAINT chk_birth_date_not_future CHECK (birth_date <= CURRENT_DATE);  -- Birth dates cannot be in the future
ALTER TABLE patient
    ADD CONSTRAINT chk_valid_blood_type CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'A2-', 'A1+'));  -- Only allow valid blood types


-- 7. Medical Staff Table Constraints
ALTER TABLE medical_staff
    ADD CONSTRAINT chk_hire_date_not_future CHECK (hire_date <= CURRENT_DATE);  -- Hire date cannot be in the future
ALTER TABLE medical_staff
    ADD CONSTRAINT chk_salary_minimum CHECK (salary >= 5000);  -- Ensure a minimum salary (example value)
ALTER TABLE medical_staff
    ADD CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');  -- Validate email format


-- 8. Nurse Table Constraints
ALTER TABLE nurse
    ADD CONSTRAINT chk_valid_shift_type CHECK (shift_type IN ('day', 'night'));  -- Only valid shift types


-- 9. Research Doctor Table Constraints
ALTER TABLE research_doctor
    ADD CONSTRAINT chk_citation_count_non_negative CHECK (citation_count >= 0);  -- Citation count cannot be negative


-- 10. Treatment Medication Table Constraints
ALTER TABLE treatment_medication
    ADD CONSTRAINT chk_medication_code_format CHECK (medication_code ~ '^[A-Za-z0-9\-]+$');  -- Example format: alphanumeric with dashes


