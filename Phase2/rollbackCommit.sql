-- 1. Rollback the last commit (insert new person and then rollback)
COMMIT;

SELECT *
FROM person
WHERE id_number = '1111111';

INSERT INTO person (id_number, first_name, last_name, phone_number, address_zip_code)
VALUES ('1111111', 'Yehonatan', 'Yeret', '123-456-789', '59487');

SELECT *
FROM person
WHERE id_number = '1111111';

ROLLBACK;

SELECT *
FROM person
WHERE id_number = '1111111';

-- 2. Commit the changes (insert new person and then commit)

COMMIT;

SELECT *
FROM person
WHERE id_number = '1111111';

INSERT INTO person (id_number, first_name, last_name, phone_number, address_zip_code)
VALUES ('1111111', 'Yehonatan', 'Yeret', '123-456-789', '59487');

SELECT *
FROM person
WHERE id_number = '1111111';

COMMIT;

SELECT *
FROM person
WHERE id_number = '1111111';

