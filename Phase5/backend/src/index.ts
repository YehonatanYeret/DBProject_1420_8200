import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patientRoutes from './routes/patients';
import medicationRoutes from './routes/medications';
import departmentRoutes from './routes/departments';
import queriesRoutes from './routes/queries';
import treatmentRoutes from './routes/treatments';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/queries', queriesRoutes);
app.use('/api/treatments', treatmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 