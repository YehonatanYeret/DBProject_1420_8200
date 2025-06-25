import express from 'express';
import pool from '../config/database';

const router = express.Router();

/**
 * GET /
 * Returns all treatments with patient and doctor information.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.treatment_date,
        t.patient_id,
        t.attending_doctor_id,
        p.first_name || ' ' || p.last_name AS patient_name,
        d.first_name || ' ' || d.last_name AS doctor_name,
        dept.department_number,
        ARRAY_AGG(tm.medication_code) FILTER (WHERE tm.medication_code IS NOT NULL) AS medications
      FROM treatment t
      JOIN person p ON t.patient_id = p.id_number
      JOIN person d ON t.attending_doctor_id = d.id_number
      JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
      JOIN department dept ON ad.department_number = dept.department_number
      LEFT JOIN treatment_medication tm ON t.treatment_date = tm.treatment_date 
                                        AND t.patient_id = tm.patient_id 
                                        AND t.attending_doctor_id = tm.attending_doctor_id
      GROUP BY t.treatment_date, t.patient_id, t.attending_doctor_id, p.first_name, p.last_name, d.first_name, d.last_name, dept.department_number
      ORDER BY t.treatment_date DESC, p.last_name, p.first_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:date/:patientId/:doctorId
 * Returns a single treatment by composite key.
 */
router.get('/:date/:patientId/:doctorId', async (req, res) => {
  try {
    const { date, patientId, doctorId } = req.params;
    const decodedDate = decodeURIComponent(date);
    const result = await pool.query(`
      SELECT 
        t.treatment_date,
        t.patient_id,
        t.attending_doctor_id,
        p.first_name || ' ' || p.last_name AS patient_name,
        d.first_name || ' ' || d.last_name AS doctor_name,
        dept.department_number,
        ARRAY_AGG(tm.medication_code) FILTER (WHERE tm.medication_code IS NOT NULL) AS medications
      FROM treatment t
      JOIN person p ON t.patient_id = p.id_number
      JOIN person d ON t.attending_doctor_id = d.id_number
      JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
      JOIN department dept ON ad.department_number = dept.department_number
      LEFT JOIN treatment_medication tm ON t.treatment_date = tm.treatment_date 
                                        AND t.patient_id = tm.patient_id 
                                        AND t.attending_doctor_id = tm.attending_doctor_id
      WHERE t.treatment_date = $1 AND t.patient_id = $2 AND t.attending_doctor_id = $3
      GROUP BY t.treatment_date, t.patient_id, t.attending_doctor_id, p.first_name, p.last_name, d.first_name, d.last_name, dept.department_number
    `, [decodedDate, patientId, doctorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /
 * Creates a new treatment with optional medications.
 * Body: { treatment_date, patient_id, attending_doctor_id, medications: [] }
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { treatment_date, patient_id, attending_doctor_id, medications = [] } = req.body;

    // Check if treatment already exists
    const existingTreatment = await client.query(`
      SELECT 1 FROM treatment 
      WHERE treatment_date = $1 AND patient_id = $2 AND attending_doctor_id = $3
    `, [treatment_date, patient_id, attending_doctor_id]);

    if (existingTreatment.rows.length > 0) {
      return res.status(400).json({ error: 'Treatment already exists for this date, patient, and doctor' });
    }

    // Insert treatment
    await client.query(`
      INSERT INTO treatment (treatment_date, patient_id, attending_doctor_id)
      VALUES ($1, $2, $3)
    `, [treatment_date, patient_id, attending_doctor_id]);

    // Insert medications if provided
    if (medications.length > 0) {
      for (const medicationCode of medications) {
        await client.query(`
          INSERT INTO treatment_medication (treatment_date, patient_id, attending_doctor_id, medication_code)
          VALUES ($1, $2, $3, $4)
        `, [treatment_date, patient_id, attending_doctor_id, medicationCode]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Treatment created successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * PUT /:date/:patientId/:doctorId
 * Updates a treatment by composite key.
 * Body: { medications: [] }
 */
router.put('/:date/:patientId/:doctorId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { date, patientId, doctorId } = req.params;
    const decodedDate = decodeURIComponent(date);
    const { medications = [] } = req.body;

    // Check if treatment exists
    const existingTreatment = await client.query(`
      SELECT 1 FROM treatment 
      WHERE treatment_date = $1 AND patient_id = $2 AND attending_doctor_id = $3
    `, [decodedDate, patientId, doctorId]);

    if (existingTreatment.rows.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    // Remove existing medications
    await client.query(`
      DELETE FROM treatment_medication 
      WHERE treatment_date = $1 AND patient_id = $2 AND attending_doctor_id = $3
    `, [decodedDate, patientId, doctorId]);

    // Insert new medications if provided
    if (medications.length > 0) {
      for (const medicationCode of medications) {
        await client.query(`
          INSERT INTO treatment_medication (treatment_date, patient_id, attending_doctor_id, medication_code)
          VALUES ($1, $2, $3, $4)
        `, [decodedDate, patientId, doctorId, medicationCode]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Treatment updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /:date/:patientId/:doctorId
 * Deletes a treatment by composite key.
 */
router.delete('/:date/:patientId/:doctorId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { date, patientId, doctorId } = req.params;
    const decodedDate = decodeURIComponent(date);

    // Delete treatment (will cascade to treatment_medication)
    const result = await client.query(`
      DELETE FROM treatment 
      WHERE treatment_date = $1 AND patient_id = $2 AND attending_doctor_id = $3
    `, [decodedDate, patientId, doctorId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting treatment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router; 