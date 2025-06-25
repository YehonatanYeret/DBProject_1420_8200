import express from 'express';
import pool from '../config/database';

const router = express.Router();

/**
 * GET /doctor-shifts
 * Returns a list of doctor shifts and the number of patients treated in each shift.
 * Each row contains shift date, start/end time, doctor info, and patient count.
 */
router.get('/doctor-shifts', async (req, res) => {
  try {
    // Query for doctor shifts and patient counts
    const result = await pool.query(`
      SELECT
        ss.shift_date,
        ss.start_time,
        ss.end_time,
        ad.id_number AS attending_doctor_id,
        p.first_name || ' ' || p.last_name AS doctor_name,
        COUNT(DISTINCT t.patient_id) AS patients_treated
      FROM staff_shift ss
      JOIN attending_doctor ad ON ss.staff_id = ad.id_number
      LEFT JOIN treatment t ON ad.id_number = t.attending_doctor_id
                            AND t.treatment_date = ss.shift_date
      JOIN person p ON ad.id_number = p.id_number
      GROUP BY ss.shift_date, ss.start_time, ss.end_time, ad.id_number, p.first_name, p.last_name
      HAVING COUNT(DISTINCT t.patient_id) > 0
      ORDER BY ss.shift_date DESC, ss.start_time;
    `);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /department-medications
 * Returns the most used medications per department.
 * Each row contains department number, medication name, and usage count.
 */
router.get('/department-medications', async (req, res) => {
  try {
    // Query for medication usage by department
    const result = await pool.query(`
      SELECT d.department_number, m.medication_name, COUNT(*) AS medication_count
      FROM treatment_medication tm
      JOIN treatment t ON tm.treatment_date = t.treatment_date
                       AND tm.patient_id = t.patient_id
                       AND tm.attending_doctor_id = t.attending_doctor_id
      JOIN attending_doctor ad ON t.attending_doctor_id = ad.id_number
      JOIN department d ON ad.department_number = d.department_number
      JOIN medication m ON tm.medication_code = m.medication_code
      GROUP BY d.department_number, m.medication_name
      ORDER BY d.department_number;
    `);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /nurses
 * Returns a list of all nurses with their names and department numbers.
 */
router.get('/nurses', async (req, res) => {
  try {
    // Query for all nurses
    const result = await pool.query(`
      SELECT n.id_number, p.first_name, p.last_name, n.department_number
      FROM nurse n
      JOIN person p ON n.id_number = p.id_number
    `);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /departments
 * Returns a list of all department numbers (for dropdowns).
 */
router.get('/departments', async (req, res) => {
  try {
    // Query for all department numbers
    const result = await pool.query(`
      SELECT department_number FROM department ORDER BY department_number
    `);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * POST /assign-nurse
 * Assigns a nurse to a department using a stored procedure.
 * Expects: { nurse_id: number, department_number: number } in body.
 */
router.post('/assign-nurse', async (req, res) => {
  const { nurse_id, department_number } = req.body;
  try {
    // Call the stored procedure to assign nurse
    await pool.query('CALL public.assign_nurse_to_department($1, $2)', [nurse_id, department_number]);
    res.json({ success: true });
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /doctors
 * Returns a list of all doctors with their names and IDs (for dropdowns).
 */
router.get('/doctors', async (req, res) => {
  try {
    // Query for all doctors
    const result = await pool.query(`
      SELECT ad.id_number, p.first_name, p.last_name
      FROM attending_doctor ad
      JOIN person p ON ad.id_number = p.id_number
    `);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /doctor-drug-usage/:doctorId
 * Returns drug usage statistics for a given doctor.
 * Params: doctorId (number)
 * Each row contains medication name and usage count.
 */
router.get('/doctor-drug-usage/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    // Query for drug usage by doctor
    const result = await pool.query(`
      SELECT 
        m.medication_name,
        COUNT(*) as usage_count
      FROM treatment_medication tm
      JOIN medication m ON tm.medication_code = m.medication_code
      WHERE tm.attending_doctor_id = $1
      GROUP BY m.medication_name
      ORDER BY usage_count DESC
    `, [doctorId]);
    res.json(result.rows);
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * POST /call-doctor-drug-usage
 * Calls the calculate_doctor_drug_usage stored procedure for a given doctor.
 * Expects: { doctorId: number } in body.
 */
router.post('/call-doctor-drug-usage', async (req, res) => {
  const { doctorId } = req.body;
  try {
    await pool.query('CALL public.calculate_doctor_drug_usage($1)', [doctorId]);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router; 