-- This Sql file is used to calculate doctor drug usage and update equipment stock.
SELECT public.calculate_doctor_drug_usage(
	3593165
)

CALL public.update_equipment_stock(
    1,      -- p_equipment_id
    2,      -- p_warehouse_id
    10      -- p_amount
)