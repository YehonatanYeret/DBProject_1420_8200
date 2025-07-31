-- Assign a nurse to a department
DECLARE
    nurse_exists BOOLEAN;
    department_exists BOOLEAN;
BEGIN
    -- Check if the nurse exists
    SELECT EXISTS (
        SELECT 1 FROM nurse WHERE id_number = p_nurse_id
    ) INTO nurse_exists;

    IF NOT nurse_exists THEN
        RAISE EXCEPTION 'Nurse with ID % does not exist.', p_nurse_id;
    END IF;

    -- Check if the department exists
    SELECT EXISTS (
        SELECT 1 FROM department WHERE department_number = p_department_number
    ) INTO department_exists;

    IF NOT department_exists THEN
        RAISE EXCEPTION 'Department % does not exist.', p_department_number;
    END IF;

    -- Assign the nurse to the department
    UPDATE nurse
    SET department_number = p_department_number
    WHERE id_number = p_nurse_id;

    RAISE NOTICE 'Nurse % assigned to department % successfully.', p_nurse_id, p_department_number;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to assign nurse: %', SQLERRM;
END;


-- Update or insert medical equipment stock in a warehouse
DECLARE
    equipment_exists BOOLEAN;
    warehouse_exists BOOLEAN;
BEGIN
    -- Check if equipment exists
    SELECT EXISTS (
        SELECT 1 FROM medical_equipment WHERE equipment_id = p_equipment_id
    ) INTO equipment_exists;

    IF NOT equipment_exists THEN
        RAISE EXCEPTION 'Equipment with ID % does not exist.', p_equipment_id;
    END IF;

    -- Check if warehouse exists
    SELECT EXISTS (
        SELECT 1 FROM warehouse WHERE warehouse_id = p_warehouse_id
    ) INTO warehouse_exists;

    IF NOT warehouse_exists THEN
        RAISE EXCEPTION 'Warehouse with ID % does not exist.', p_warehouse_id;
    END IF;

    -- Try to update existing stock
    UPDATE equipment_in_stock
    SET amount = amount + p_amount
    WHERE medical_equipment_id = p_equipment_id AND warehouse_id = p_warehouse_id;

    -- If no rows were updated, insert new stock record
    IF NOT FOUND THEN
        INSERT INTO equipment_in_stock (medical_equipment_id, warehouse_id, amount)
        VALUES (p_equipment_id, p_warehouse_id, p_amount);
    END IF;
END;
