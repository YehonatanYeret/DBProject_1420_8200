import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Types
export interface Patient {
  id_number: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date: string;
  blood_type: string;
  city: string;
  street: string;
  apartment_number: number;
  address_zip_code: string;
}

export interface Medication {
  medication_code: string;
  medication_name: string;
  price: number;
}

export interface Department {
  department_number: number;
  department_phone_number: string;
  number_of_beds: number;
  doctor_count: number;
  nurse_count: number;
}

// Patients API
export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const response = await axios.get(`${API_BASE_URL}/patients`);
    return response.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await axios.get(`${API_BASE_URL}/patients/${id}`);
    return response.data;
  },

  create: async (patient: Omit<Patient, 'id_number'>): Promise<Patient> => {
    const response = await axios.post(`${API_BASE_URL}/patients`, patient);
    return response.data;
  },

  update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    const response = await axios.put(`${API_BASE_URL}/patients/${id}`, patient);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/patients/${id}`);
  },
};

// Medications API
export const medicationsApi = {
  getAll: async (): Promise<Medication[]> => {
    const response = await axios.get(`${API_BASE_URL}/medications`);
    return response.data;
  },

  getByCode: async (code: string): Promise<Medication> => {
    const response = await axios.get(`${API_BASE_URL}/medications/${code}`);
    return response.data;
  },

  create: async (medication: Omit<Medication, 'medication_code'>): Promise<Medication> => {
    const response = await axios.post(`${API_BASE_URL}/medications`, medication);
    return response.data;
  },

  update: async (code: string, medication: Partial<Medication>): Promise<Medication> => {
    const response = await axios.put(`${API_BASE_URL}/medications/${code}`, medication);
    return response.data;
  },

  delete: async (code: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/medications/${code}`);
  },
};

// Departments API
export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await axios.get(`${API_BASE_URL}/departments`);
    return response.data;
  },

  getByNumber: async (number: number): Promise<Department> => {
    const response = await axios.get(`${API_BASE_URL}/departments/${number}`);
    return response.data;
  },

  create: async (department: Omit<Department, 'department_number'>): Promise<Department> => {
    const response = await axios.post(`${API_BASE_URL}/departments`, department);
    return response.data;
  },

  update: async (number: number, department: Partial<Department>): Promise<Department> => {
    const response = await axios.put(`${API_BASE_URL}/departments/${number}`, department);
    return response.data;
  },

  delete: async (number: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/departments/${number}`);
  },
};

export default axios; 