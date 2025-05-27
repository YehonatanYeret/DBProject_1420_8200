-- This SQL script is used to add a shift for a staff member and assign a nurse to a department.
SELECT public.add_shift(
    1318589,                  -- p_staff_id
    '2025-08-05',           -- p_shift_date
    '08:00:00',             -- p_start_time
    '16:00:00'              -- p_end_time
);

CALL public.assign_nurse_to_department(
    23456,  -- p_nurse_id
    101     -- p_department_number
);
