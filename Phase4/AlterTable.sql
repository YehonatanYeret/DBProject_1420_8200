-- alter table treatment_medication for amount

ALTER TABLE treatment_medication
ADD amount int;

UPDATE treatment_medication
SET amount = 1;