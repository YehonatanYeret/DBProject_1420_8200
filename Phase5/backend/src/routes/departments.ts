import express from 'express';
import pool from '../config/database';

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.department_number, d.department_phone_number, d.number_of_beds,
             COUNT(DISTINCT ad.id_number) as doctor_count,
             COUNT(DISTINCT n.id_number) as nurse_count
      FROM department d
      LEFT JOIN attending_doctor ad ON d.department_number = ad.department_number
      LEFT JOIN nurse n ON d.department_number = n.department_number
      GROUP BY d.department_number, d.department_phone_number, d.number_of_beds
      ORDER BY d.department_number
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single department by number
router.get('/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const result = await pool.query(`
      SELECT d.department_number, d.department_phone_number, d.number_of_beds,
             COUNT(DISTINCT ad.id_number) as doctor_count,
             COUNT(DISTINCT n.id_number) as nurse_count
      FROM department d
      LEFT JOIN attending_doctor ad ON d.department_number = ad.department_number
      LEFT JOIN nurse n ON d.department_number = n.department_number
      WHERE d.department_number = $1
      GROUP BY d.department_number, d.department_phone_number, d.number_of_beds
    `, [number]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new department
router.post('/', async (req, res) => {
  try {
    const { department_number, department_phone_number, number_of_beds } = req.body;
    
    const result = await pool.query(`
      INSERT INTO department (department_number, department_phone_number, number_of_beds)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [department_number, department_phone_number, number_of_beds]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a department
router.put('/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const { department_phone_number, number_of_beds } = req.body;
    
    const result = await pool.query(`
      UPDATE department
      SET department_phone_number = $1, number_of_beds = $2
      WHERE department_number = $3
      RETURNING *
    `, [department_phone_number, number_of_beds, number]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a department
router.delete('/:number', async (req, res) => {
  try {
    const { number } = req.params;
    
    const result = await pool.query(`
      DELETE FROM department
      WHERE department_number = $1
      RETURNING *
    `, [number]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 