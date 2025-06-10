import express from 'express';
import pool from '../config/database';

const router = express.Router();

/**
 * GET /
 * Returns all patients with their personal and address details.
 */
router.get('/', async (req, res) => {
  try {
    // Query for all patients with joined person and address info
    const result = await pool.query(`
      SELECT p.id_number, p.first_name, p.last_name, p.phone_number,
             pt.birth_date, pt.blood_type,
             a.city, a.street, a.apartment_number,
             p.address_zip_code
      FROM patient pt
      JOIN person p ON pt.id_number = p.id_number
      JOIN address a ON p.address_zip_code = a.zip_code
      ORDER BY p.last_name, p.first_name
    `);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:id
 * Returns a single patient by ID, including personal and address details.
 * Params: id (number)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Query for a single patient by ID
    const result = await pool.query(`
      SELECT p.id_number, p.first_name, p.last_name, p.phone_number,
             pt.birth_date, pt.blood_type,
             a.city, a.street, a.apartment_number
      FROM patient pt
      JOIN person p ON pt.id_number = p.id_number
      JOIN address a ON p.address_zip_code = a.zip_code
      WHERE p.id_number = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      // Patient not found
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    // Error handling
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /
 * Creates a new patient. Expects patient and address info in the request body.
 * Body: { id_number, first_name, last_name, phone_number, address_zip_code, birth_date, blood_type, city, street, apartment_number }
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      id_number,
      first_name,
      last_name,
      phone_number,
      address_zip_code,
      birth_date,
      blood_type,
      city = 'Unknown',
      street = 'Unknown',
      apartment_number = 1
    } = req.body;

    // Check if address exists
    const addressResult = await client.query(
      'SELECT * FROM address WHERE zip_code = $1',
      [address_zip_code]
    );
    if (addressResult.rows.length === 0) {
      // Insert new address if not exists
      await client.query(
        'INSERT INTO address (zip_code, city, street, apartment_number) VALUES ($1, $2, $3, $4)',
        [address_zip_code, city, street, apartment_number]
      );
    }

    // Insert into person table
    await client.query(`
      INSERT INTO person (id_number, first_name, last_name, phone_number, address_zip_code)
      VALUES ($1, $2, $3, $4, $5)
    `, [id_number, first_name, last_name, phone_number, address_zip_code]);

    // Insert into patient table
    await client.query(`
      INSERT INTO patient (id_number, birth_date, blood_type)
      VALUES ($1, $2, $3)
    `, [id_number, birth_date, blood_type]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Patient created successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    // Error handling
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * PUT /:id
 * Updates a patient by ID. Expects updated info in the request body.
 * Params: id (number)
 * Body: { first_name, last_name, phone_number, address_zip_code, birth_date, blood_type }
 */
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone_number,
      address_zip_code,
      birth_date,
      blood_type
    } = req.body;

    // Update person table
    await client.query(`
      UPDATE person
      SET first_name = $1, last_name = $2, phone_number = $3, address_zip_code = $4
      WHERE id_number = $5
    `, [first_name, last_name, phone_number, address_zip_code, id]);

    // Update patient table
    await client.query(`
      UPDATE patient
      SET birth_date = $1, blood_type = $2
      WHERE id_number = $3
    `, [birth_date, blood_type, id]);

    await client.query('COMMIT');
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    // Error handling
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /:id
 * Deletes a patient by ID.
 * Params: id (number)
 */
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    // Delete from patient table (will cascade to person table)
    await client.query('DELETE FROM patient WHERE id_number = $1', [id]);
    
    await client.query('COMMIT');
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    // Error handling
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router; 