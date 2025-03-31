-- Inserting data into the address table
INSERT INTO address (zip_code, city, street, apartment_number) VALUES
('10101', 'Tel Aviv', 'Rothschild Blvd 10', 'Apt 5'),
('20202', 'Jerusalem', 'King George St 25', 'Apt 12'),
('30303', 'Haifa', 'Ben Gurion Ave 50', 'Apt 3');

-- Inserting data into the lab table
INSERT INTO lab (lab_code, lab_name, number_of_technicians) VALUES
('LAB001', 'Central Research Lab', 15),
('LAB002', 'Microbiology Unit', 8),
('LAB003', 'Biochemistry Department', 12);

-- Inserting data into the department table
INSERT INTO department (department_number, department_phone_number, number_of_beds) VALUES
(101, '03-1234567', 30),
(102, '02-9876543', 25),
(103, '04-5551212', 40);

-- Inserting data into the medication table
INSERT INTO medication (medication_code, medication_name, price) VALUES
('MED001', 'Paracetamol', 15.50),
('MED002', 'Amoxicillin', 22.75),
('MED003', 'Ibuprofen', 18.00);

-- Inserting data into the person table (for all individuals)
INSERT INTO person (id_number, first_name, last_name, phone_number, address_zip_code) VALUES
(123456789, 'John', 'Doe', '050-1234567', '10101'), -- Patient
(987654321, 'Alice', 'Smith', '052-9876543', '20202'), -- Patient
(112233445, 'Bob', 'Johnson', '054-1122334', '30303'), -- Patient
(555666777, 'Jane', 'Doctor', '051-5556667', '10101'), -- Medical Staff
(888999000, 'Peter', 'Nurse', '053-8889990', '20202'), -- Medical Staff
(333444555, 'Sarah', 'Researcher', '055-3334445', '30303'), -- Medical Staff
(777888999, 'David', 'Nurse', '056-7778889', '30303'), -- Medical Staff (Nurse)
(666777888, 'Emily', 'Doctor', '057-6667778', '10101'), -- Medical Staff (Attending Doctor)
(444555666, 'Michael', 'Researcher', '058-4445556', '20202'), -- Medical Staff (Researcher)
(999111222, 'Rachel', 'Nurse', '059-9991112', '30303'), -- Medical Staff (Nurse)
(222333444, 'George', 'Scientist', '050-2223334', '10101'), -- Medical Staff (Researcher)
(111222333, 'Samuel', 'Doctor', '051-1112223', '20202'); -- Medical Staff (Attending Doctor) - Added missing person

-- Inserting data into the medical_staff table
INSERT INTO medical_staff (id_number, hire_date, email, salary) VALUES
(555666777, '2018-08-01', 'jane.doctor@hospital.com', 12000.00),
(888999000, '2020-01-15', 'peter.nurse@hospital.com', 8500.00),
(333444555, '2022-06-10', 'sarah.researcher@hospital.com', 10500.00),
(777888999, '2021-03-01', 'david.nurse@hospital.com', 8000.00),
(666777888, '2019-11-01', 'emily.doctor@hospital.com', 13000.00),
(444555666, '2023-01-15', 'michael.researcher@hospital.com', 11000.00),
(999111222, '2024-05-01', 'rachel.nurse@hospital.com', 8200.00),
(222333444, '2023-07-01', 'george.scientist@hospital.com', 11500.00),
(111222333, '2024-09-01', 'samuel.doctor@hospital.com', 12500.00); -- Added missing medical staff entry

-- Inserting data into the patient table
INSERT INTO patient (id_number, birth_date, blood_type) VALUES
(123456789, '1990-05-15', 'O+'),
(987654321, '1985-12-20', 'A-'),
(112233445, '2000-03-10', 'B+');

-- Inserting data into the nurse table
INSERT INTO nurse (id_number, specialization, shift_type, department_number) VALUES
(888999000, 'Cardiology', 'Day', 101),
(777888999, 'Pediatrics', 'Night', 103),
(999111222, 'Emergency', 'Evening', 102);

-- Inserting data into the research_doctor table
INSERT INTO research_doctor (id_number, research_start_date, research_field, citation_count, lab_code) VALUES
(333444555, '2023-04-01', 'Cancer Immunology', 55, 'LAB001'),
(444555666, '2024-01-01', 'Neuroscience', 30, 'LAB002'),
(222333444, '2023-09-15', 'Genetics', 70, 'LAB003');

-- Inserting data into the attending_doctor table
INSERT INTO attending_doctor (id_number, department_number) VALUES
(555666777, 101),
(666777888, 102),
(111222333, 103); -- Now this should work

-- Inserting data into the treatment table
INSERT INTO treatment (treatment_date, patient_id, attending_doctor_id) VALUES
('2025-03-28', 123456789, 555666777),
('2025-03-29', 987654321, 666777888),
('2025-03-30', 112233445, 111222333);

-- Inserting data into the staff_shift table
INSERT INTO staff_shift (shift_date, start_time, end_time, staff_id) VALUES
('2025-04-01', '08:00:00', '16:00:00', 888999000), -- Nurse Peter on day shift
('2025-04-01', '16:00:00', '00:00:00', 777888999), -- Nurse David on evening shift
('2025-04-02', '23:00:00', '07:00:00', 999111222); -- Nurse Rachel on night shift

-- Inserting data into the treatment_medication table
INSERT INTO treatment_medication (treatment_date, patient_id, attending_doctor_id, medication_code) VALUES
('2025-03-28', 123456789, 555666777, 'MED001'),
('2025-03-29', 987654321, 666777888, 'MED002'),
('2025-03-30', 112233445, 111222333, 'MED003');