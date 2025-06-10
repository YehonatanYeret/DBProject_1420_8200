-- Create the function to calculate doctor drug usage
CREATE OR REPLACE FUNCTION public.calculate_doctor_drug_usage(p_doctor_id BIGINT)
RETURNS TABLE (
    medication_name VARCHAR(50),
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.medication_name,
        COUNT(*) as usage_count
    FROM treatment_medication tm
    JOIN medication m ON tm.medication_code = m.medication_code
    WHERE tm.attending_doctor_id = p_doctor_id
    GROUP BY m.medication_name
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- This Sql file is used to calculate doctor drug usage and update equipment stock.
SELECT public.calculate_doctor_drug_usage(
	3593165
)

CALL public.update_equipment_stock(
    1,      -- p_equipment_id
    2,      -- p_warehouse_id
    10      -- p_amount
)