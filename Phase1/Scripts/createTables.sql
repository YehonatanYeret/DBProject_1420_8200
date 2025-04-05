-- 1. טבלת כתובות
CREATE TABLE address (
    zip_code VARCHAR(30) PRIMARY KEY,
    city VARCHAR(50) NOT NULL,
    street VARCHAR(150) NOT NULL,
    apartment_number VARCHAR(30)
);

-- 2. טבלת מעבדות
CREATE TABLE lab (
    lab_code VARCHAR(30) PRIMARY KEY,
    lab_name VARCHAR(100) NOT NULL,
    number_of_technicians INTEGER NOT NULL
);

-- 3. טבלת מחלקות
CREATE TABLE department (
    department_number BIGINT PRIMARY KEY,
    department_phone_number VARCHAR(20) NOT NULL,
    number_of_beds INTEGER NOT NULL
);

-- 4. טבלת תרופות
CREATE TABLE medication (
    medication_code VARCHAR(50) PRIMARY KEY,
    medication_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

-- 5. טבלת בסיס לאנשים (ישות-על)
CREATE TABLE person (
    id_number BIGINT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address_zip_code VARCHAR(20) NOT NULL,
    FOREIGN KEY (address_zip_code) REFERENCES address(zip_code) ON DELETE RESTRICT
);

-- 6. טבלת מטופלים (תת-ישות של Person)
CREATE TABLE patient (
    id_number BIGINT PRIMARY KEY,
    birth_date DATE NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    FOREIGN KEY (id_number) REFERENCES person(id_number) ON DELETE CASCADE
);

-- 7. טבלת צוות רפואי (ישות-על וגם תת-ישות של Person)
CREATE TABLE medical_staff (
    id_number BIGINT PRIMARY KEY,
    hire_date DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (id_number) REFERENCES person(id_number) ON DELETE CASCADE
);

-- 8. טבלת אחיות (תת-ישות של Medical Staff)
CREATE TABLE nurse (
    id_number BIGINT PRIMARY KEY,
    specialization VARCHAR(100) NOT NULL,
    shift_type VARCHAR(50) NOT NULL,
    department_number BIGINT NOT NULL,
    FOREIGN KEY (id_number) REFERENCES medical_staff(id_number) ON DELETE CASCADE,
    FOREIGN KEY (department_number) REFERENCES department(department_number) ON DELETE RESTRICT
);

-- 9. טבלת רופאים חוקרים (תת-ישות של Medical Staff)
CREATE TABLE research_doctor (
    id_number BIGINT PRIMARY KEY,
    research_start_date DATE NOT NULL,
    research_field VARCHAR(255) NOT NULL,
    citation_count INTEGER NOT NULL DEFAULT 0,
    lab_code VARCHAR(30) NOT NULL,
    FOREIGN KEY (id_number) REFERENCES medical_staff(id_number) ON DELETE CASCADE,
    FOREIGN KEY (lab_code) REFERENCES lab(lab_code) ON DELETE RESTRICT
);

-- 10. טבלת רופאים מטפלים (תת-ישות של Medical Staff)
CREATE TABLE attending_doctor (
    id_number BIGINT PRIMARY KEY,
    department_number BIGINT NOT NULL,
    FOREIGN KEY (id_number) REFERENCES medical_staff(id_number) ON DELETE CASCADE,
    FOREIGN KEY (department_number) REFERENCES department(department_number) ON DELETE RESTRICT
);

-- 11. טבלת טיפולים (ישות חלשה התלויה ב-Patient ו-Attending Doctor)
CREATE TABLE treatment (
    treatment_date DATE NOT NULL,
    patient_id BIGINT NOT NULL,
    attending_doctor_id BIGINT NOT NULL,
    PRIMARY KEY (treatment_date, patient_id, attending_doctor_id),
    FOREIGN KEY (patient_id) REFERENCES patient(id_number) ON DELETE CASCADE,
    FOREIGN KEY (attending_doctor_id) REFERENCES attending_doctor(id_number) ON DELETE RESTRICT
);

-- 12. טבלת קישור: צוות במשמרת (Staff on Shift - M:N)
CREATE TABLE staff_shift (
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    staff_id BIGINT NOT NULL,
    PRIMARY KEY (shift_date, start_time, end_time, staff_id)
);

-- 13. טבלת קישור: תרופות בטיפול (Medications Administered - M:N)
CREATE TABLE treatment_medication (
    treatment_date DATE NOT NULL,
    patient_id BIGINT NOT NULL,
    attending_doctor_id BIGINT NOT NULL,
    medication_code VARCHAR(50),
    PRIMARY KEY (treatment_date, patient_id, attending_doctor_id, medication_code),
    FOREIGN KEY (treatment_date, patient_id, attending_doctor_id) REFERENCES treatment(treatment_date, patient_id, attending_doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (medication_code) REFERENCES medication(medication_code) ON DELETE SET NULL
);