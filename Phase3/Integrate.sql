-- Connect to the database
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- define a foreign server pointing to the other database
CREATE SERVER other_db
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (
    host 'localhost',
    port '5432',
    dbname 'Medicines'
  );

-- map a local user to a remote user
CREATE USER MAPPING FOR current_user
  SERVER other_db
  OPTIONS (
    user 'yehonatan',
    password '12345678'
  );
CREATE SCHEMA IF NOT EXISTS foreign_schema;
IMPORT FOREIGN SCHEMA public
FROM SERVER other_db
INTO foreign_schema;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';


-- Update Department Table

ALTER TABLE Department
ADD COLUMN Name VARCHAR(100),
ADD COLUMN Emergency_level INT,
ADD CHECK(Emergency_level BETWEEN 1 AND 5);

UPDATE Department
SET Name = (ARRAY[
        'Emergency', 'Surgery', 'Pediatrics', 'Cardiology', 'Neurology',
        'Orthopedics', 'Oncology', 'ICU', 'Internal Medicine', 'Dermatology',
        'Psychiatry', 'Radiology', 'Maternity', 'Geriatrics', 'ENT',
        'Urology', 'Gastroenterology', 'Rehabilitation'])[floor(random()*18+1)],
Emergency_level = floor(random()*5+1);


-- create Order Table with fk to Deparment
CREATE TABLE Orders (
    Order_Id INT NOT NULL,
    Department_number INT NOT NULL,
    Order_Date DATE NOT NULL,
    PRIMARY KEY (Department_number, Order_Id),
    FOREIGN KEY (Department_number) REFERENCES Department(Department_number) ON DELETE CASCADE
);


INSERT INTO Orders (department_number, order_id, order_date)
SELECT d.department_number, fo.order_id, fo.order_date
FROM foreign_schema."Order" fo
JOIN Department d ON d.department_number = fo.department_id;

SELECT * FROM foreign_schema.Drug_order_item;
select * from medication;

-- Create Drag_order_item Table
CREATE TABLE Drug_order_item (
    Order_Id INT NOT NULL,
    Department_number INT NOT NULL,
    Drug_Id VARCHAR(50) NOT NULL,
    Amount INT CHECK (Amount > 0),
    Is_urgent BOOLEAN NOT NULL,
    Status VARCHAR(50) NOT NULL,
    PRIMARY KEY (Order_Id, Department_number, Drug_Id),
    FOREIGN KEY (Order_Id, Department_number) REFERENCES Orders(Order_Id, Department_number) ON DELETE CASCADE,
    FOREIGN KEY (Drug_Id) REFERENCES medication(medication_code) ON DELETE CASCADE
);

WITH
orders_rows AS (
    SELECT order_id, department_number, ROW_NUMBER() OVER () AS rn
    FROM Orders
),
medications_rows AS (
    SELECT medication_code, ROW_NUMBER() OVER () AS rn
    FROM Medication
),
foreign_rows AS (
    SELECT amount, is_urgent, status, ROW_NUMBER() OVER () AS rn
    FROM foreign_schema.Drug_order_item
)

INSERT INTO Drug_order_item
SELECT
    o.order_id,
    o.department_number,
    m.medication_code,
    f.amount,
    f.is_urgent,
    f.status
FROM orders_rows o
JOIN medications_rows m ON o.rn = m.rn
JOIN foreign_rows f ON o.rn = f.rn;

-- Alter Medication Table

SELECT * from medication

ALTER TABLE Medication
ADD COLUMN Shelf_life INT CHECK (Shelf_life >= 0),
ADD COLUMN Is_frozen BOOLEAN DEFAULT false,
ADD COLUMN Popularity_score DECIMAL(3,2) CHECK (Popularity_score >= 0 AND Popularity_score <= 5);

UPDATE Medication
SET
  Shelf_life = FLOOR(random() * 365),
  Is_frozen = (random() < 0.5),
  Popularity_score = ROUND((random() * 5)::numeric, 2);

-- Warehouse Table

CREATE TABLE Warehouse (
    Warehouse_Id INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Active_hours VARCHAR(50)
);

INSERT INTO Warehouse
(SELECT * FROM foreign_schema.warehouse);

WITH addr AS (
  SELECT zip_code, ROW_NUMBER() OVER () AS rn
  FROM Address
),
wh AS (
  SELECT ctid AS warehouse_ctid, ROW_NUMBER() OVER () AS rn
  FROM Warehouse
)
UPDATE Warehouse
SET location = addr.zip_code
FROM addr
JOIN wh ON addr.rn = wh.rn
WHERE Warehouse.ctid = wh.warehouse_ctid;


-- Medical Equipment Warehouse

CREATE TABLE Medical_equipment_warehouse (
    Warehouse_Id INT PRIMARY KEY,
    Storage_place DECIMAL(10,2) CHECK (Storage_place >= 0),
    Stock_period INT CHECK (Stock_period >= 0),
    FOREIGN KEY (Warehouse_Id) REFERENCES Warehouse(Warehouse_Id) ON DELETE CASCADE
);

INSERT INTO Medical_equipment_warehouse
(SELECT * FROM foreign_schema.Medical_equipment_warehouse);

-- Drugs Warehouse

CREATE TABLE Drugs_warehouse (
    Warehouse_Id INT PRIMARY KEY,
    Has_frozen_area BOOLEAN NOT NULL,
    Daily_drug_audit_time TIME NOT NULL,
    FOREIGN KEY (Warehouse_Id) REFERENCES Warehouse(Warehouse_Id) ON DELETE CASCADE
);

INSERT INTO Drugs_warehouse
(SELECT * FROM foreign_schema.Drugs_warehouse);

-- Medical Equipment

CREATE TABLE Medical_Equipment (
    Medical_Equipment_Id INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Emergency_use BOOLEAN NOT NULL,
    Device_category VARCHAR(50) NOT NULL,
    Requires_building BOOLEAN NOT NULL,
    Volume DECIMAL(10,2) CHECK (Volume >= 0)
);

INSERT INTO Medical_Equipment
(SELECT * FROM foreign_schema.Medical_Equipment);

-- Equipment Order Item

CREATE TABLE Equipment_order_item (
    Medical_Equipment_Id INT NOT NULL,
    Order_Id INT NOT NULL,
    Department_number INT NOT NULL,
    Is_urgent BOOLEAN NOT NULL,
    Amount INT CHECK (Amount > 0),
    Need_to_be_built BOOLEAN NOT NULL,
    Status VARCHAR(50) NOT NULL,
    PRIMARY KEY (Medical_Equipment_Id, Order_Id, Department_number),
    FOREIGN KEY (Medical_Equipment_Id) REFERENCES Medical_Equipment(Medical_Equipment_Id) ON DELETE CASCADE,
    FOREIGN KEY (Order_Id, Department_number) REFERENCES Orders(Order_Id, Department_number) ON DELETE CASCADE
);

INSERT INTO Equipment_order_item
(SELECT * FROM foreign_schema.Equipment_order_item);


-- Drug In Stock

CREATE TABLE Drug_in_stock (
    Drug_Id VARCHAR(50) NOT NULL,
    Warehouse_Id INT NOT NULL,
    Since DATE NOT NULL,
    Amount INT CHECK (Amount >= 0),
    PRIMARY KEY (Drug_Id, Warehouse_Id, Since),
    FOREIGN KEY (Drug_Id) REFERENCES Medication(Medication_code) ON DELETE CASCADE,
    FOREIGN KEY (Warehouse_Id) REFERENCES Warehouse(Warehouse_Id) ON DELETE CASCADE
);

WITH med AS (
  SELECT medication_code AS drug_id, ROW_NUMBER() OVER () AS rn
  FROM Medication
),
src AS (
  SELECT warehouse_id, since, amount, ROW_NUMBER() OVER () AS rn
  FROM foreign_schema.Drug_in_stock
)
INSERT INTO Drug_in_stock (Drug_Id, Warehouse_Id, Since, Amount)
SELECT
  med.drug_id,
  src.warehouse_id,
  src.since,
  src.amount
FROM med
JOIN src ON med.rn = src.rn;

-- Equipment In Stock

CREATE TABLE Equipment_in_stock (
    Medical_Equipment_Id INT NOT NULL,
    Warehouse_Id INT NOT NULL,
    Amount INT CHECK (Amount >= 0),
    PRIMARY KEY (Medical_Equipment_Id, Warehouse_Id),
    FOREIGN KEY (Medical_Equipment_Id) REFERENCES Medical_Equipment(Medical_Equipment_Id) ON DELETE CASCADE,
    FOREIGN KEY (Warehouse_Id) REFERENCES Warehouse(Warehouse_Id) ON DELETE CASCADE
);


INSERT INTO Equipment_in_stock
(SELECT * FROM foreign_schema.Equipment_in_stock);


-- Logistic Worker

CREATE TABLE Logistic_worker (
    ID_number INT PRIMARY KEY,
	FOREIGN KEY (ID_number) REFERENCES Medical_staff(ID_number) ON DELETE CASCADE
);


INSERT INTO person (id_number, first_name, last_name, phone_number, address_zip_code)
SELECT
  400000000 + s,
  (ARRAY['Daniel', 'Jonathan', 'Michael', 'David', 'Itay', 'Amit', 'Noa', 'Yael', 'Lior', 'Tamar'])[floor(random()*10)+1],
  (ARRAY['Levi', 'Cohen', 'Mizrahi', 'Peretz', 'Biton', 'Shalev', 'Kaplan', 'Goldberg', 'Rosen', 'Bar'])[floor(random()*10)+1],
  '05' || LPAD((FLOOR(random()*10000000))::TEXT, 8, '0'),
  (SELECT zip_code FROM address ORDER BY random() LIMIT 1)
FROM generate_series(1, 400) AS s;

INSERT INTO medical_staff (id_number, hire_date, email, salary)
SELECT
  400000000 + s,
  CURRENT_DATE - (s || ' days')::INTERVAL,
  LOWER((ARRAY['daniel', 'jonathan', 'michael', 'david', 'itay', 'amit', 'noa', 'yael', 'lior', 'tamar'])[floor(random()*10)+1]) || s || '@med.com',
  ROUND(((random() * 8000) + 7000)::numeric, 2)
FROM generate_series(1, 400) AS s;


INSERT INTO logistic_worker
SELECT 400000000 + s
FROM generate_series(1, 400) AS s;

-- Has Access

CREATE TABLE Has_access (
    ID_number INT NOT NULL,
    Warehouse_Id INT NOT NULL,
    Level INT CHECK (Level BETWEEN 1 AND 5),
    PRIMARY KEY (ID_number, Warehouse_Id),
    FOREIGN KEY (ID_number) REFERENCES Logistic_worker(ID_number) ON DELETE CASCADE,
    FOREIGN KEY (Warehouse_Id) REFERENCES Warehouse(Warehouse_Id) ON DELETE CASCADE
);

INSERT INTO Has_access (ID_number, Warehouse_Id, Level)
SELECT
  lw.ID_number,
  fa.Warehouse_Id,
  fa.Level
FROM (
  SELECT ID_number, ROW_NUMBER() OVER (ORDER BY ID_number) AS rn
  FROM Logistic_worker
) lw
JOIN (
  SELECT Warehouse_Id, Level, ROW_NUMBER() OVER (ORDER BY Warehouse_Id) AS rn
  FROM foreign_schema.Has_access
) fa
ON lw.rn = fa.rn;



