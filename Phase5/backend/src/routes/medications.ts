import express from 'express';
import pool from '../config/database';

const router = express.Router();

// Get all medications
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT medication_code, medication_name, price
      FROM medication
      ORDER BY medication_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single medication by code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(`
      SELECT medication_code, medication_name, price
      FROM medication
      WHERE medication_code = $1
    `, [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new medication
router.post('/', async (req, res) => {
  try {
    const { medication_code, medication_name, price } = req.body;
    
    const result = await pool.query(`
      INSERT INTO medication (medication_code, medication_name, price)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [medication_code, medication_name, price]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a medication
router.put('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { medication_name, price } = req.body;
    
    const result = await pool.query(`
      UPDATE medication
      SET medication_name = $1, price = $2
      WHERE medication_code = $3
      RETURNING *
    `, [medication_name, price, code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a medication
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await pool.query(`
      DELETE FROM medication
      WHERE medication_code = $1
      RETURNING *
    `, [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 