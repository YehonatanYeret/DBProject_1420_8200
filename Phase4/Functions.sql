-- Add a new shift for a medical staff member

DECLARE
    overlapping_shift RECORD;
    staff_exists BOOLEAN;
BEGIN
    -- 1. Check if staff exists
    SELECT EXISTS (
        SELECT 1 FROM medical_staff WHERE id_number = p_staff_id
    ) INTO staff_exists;

    IF NOT staff_exists THEN
        RAISE EXCEPTION 'Staff member with ID % does not exist', p_staff_id;
    END IF;

    -- 2. Check that shift date is today or future
    IF p_shift_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Shift date % is in the past', p_shift_date;
    END IF;

    -- 3. Check end time after start time
    IF p_end_time <= p_start_time THEN
        RAISE EXCEPTION 'Shift end time (%) must be after start time (%)', p_end_time, p_start_time;
    END IF;

    -- 4. Check for overlapping shifts for this staff on this date
    SELECT 1 INTO overlapping_shift
    FROM staff_shift ss
    WHERE ss.staff_id = p_staff_id
      AND ss.shift_date = p_shift_date
      AND (p_start_time < ss.end_time AND p_end_time > ss.start_time)
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'Shift overlaps with existing shift on % for staff ID %', p_shift_date, p_staff_id;
    END IF;

    -- 5. Insert the new shift
    INSERT INTO staff_shift (shift_date, start_time, end_time, staff_id)
    VALUES (p_shift_date, p_start_time, p_end_time, p_staff_id);

	RETURN format('Shift added for staff ID %s on %s from %s to %s',
	              p_staff_id, p_shift_date, p_start_time, p_end_time);


EXCEPTION
    WHEN OTHERS THEN
		RETURN format('Failed to add shift: %s', SQLERRM);
END;


-- Calculate total medication usage by a doctor

DECLARE
    total_usage INT;
BEGIN
    SELECT COALESCE(SUM(mi."amount"), 0)
    INTO total_usage
    FROM "treatment_medication" AS ma
    JOIN "treatment_medication" mi
        ON ma."treatment_date" = mi."treatment_date"
       AND ma."medication_code" = mi."medication_code"
    WHERE ma."attending_doctor_id" = p_doctor_id;

    RETURN total_usage;
END;

-- Retrieve medications prescribed to a patient

DECLARE
    cur refcursor:= 'ref_cursor';
BEGIN
    OPEN cur FOR
    SELECT tm.medication_code, m.medication_name, tm.amount
    FROM treatment_medication tm
    JOIN medication m ON tm.medication_code = m.medication_code
    WHERE tm.patient_id = p_patient_id;

    RETURN cur;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error retrieving medications: %', SQLERRM;
        RETURN NULL;
END;
