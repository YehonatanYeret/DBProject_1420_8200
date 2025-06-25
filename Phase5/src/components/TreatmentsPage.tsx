import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Calendar, User, Stethoscope, Pill } from 'lucide-react';
import { treatmentsApi, patientsApi, doctorsApi, medicationsApi, Treatment, Patient, Doctor, Medication } from '../services/api';
import Modal from './Modal';

const TreatmentsPage: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [newTreatmentDate, setNewTreatmentDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [treatmentsData, patientsData, doctorsData, medicationsData] = await Promise.all([
        treatmentsApi.getAll(),
        patientsApi.getAll(),
        doctorsApi.getAll(),
        medicationsApi.getAll()
      ]);
      setTreatments(treatmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setMedications(medicationsData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTreatment(null);
    setNewTreatmentDate('');
    setIsModalOpen(true);
  };

  const handleEdit = (treatment: Treatment) => {
    console.log('Editing treatment:', treatment);
    console.log('Treatment date:', treatment.treatment_date);
    console.log('Formatted date for input:', formatDateForInput(treatment.treatment_date));
    setEditingTreatment(treatment);
    setIsModalOpen(true);
  };

  const handleDelete = async (treatment: Treatment) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        await treatmentsApi.delete(
          ensureDatabaseDateFormat(treatment.treatment_date), 
          treatment.patient_id, 
          treatment.attending_doctor_id
        );
        await fetchData();
      } catch (err) {
        setError('Failed to delete treatment');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const treatment_date = editingTreatment
      ? formData.get('treatment_date') as string
      : newTreatmentDate;
    const treatmentData = {
      treatment_date: formatDateForDatabase(treatment_date),
      patient_id: formData.get('patient_id') as string,
      attending_doctor_id: formData.get('attending_doctor_id') as string,
      medications: formData.getAll('medications') as string[]
    };

    try {
      if (editingTreatment) {
        await treatmentsApi.update(
          ensureDatabaseDateFormat(editingTreatment.treatment_date),
          editingTreatment.patient_id,
          editingTreatment.attending_doctor_id,
          treatmentData.medications
        );
      } else {
        await treatmentsApi.create(treatmentData);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setError('Failed to save treatment');
    }
  };

  const filteredTreatments = treatments.filter(
    (treatment) =>
      treatment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.treatment_date.includes(searchTerm)
  );

  // Helper to format date as YYYY-MM-DD for HTML input
  function formatDateForInput(dateString: string | undefined) {
    if (!dateString) return '';
    // Convert from MM/DD/YYYY to YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  }

  // Helper to format date as MM/DD/YYYY for database
  function formatDateForDatabase(dateString: string) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  // Helper to ensure date is in MM/DD/YYYY format for API calls
  function ensureDatabaseDateFormat(dateString: string): string {
    // If it's already in MM/DD/YYYY format, return as is
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    // If it's an ISO date or other format, convert to MM/DD/YYYY
    return formatDateForDatabase(dateString);
  }

  // Helper to display date in readable format
  function formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    // Handle ISO format (e.g., 2025-11-17T22:00:00.000Z)
    if (dateString.includes('T')) {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    // Handle MM/DD/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString();
    }
    return dateString;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <div className="sm:flex sm:items-center sm:justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Treatments</h1>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Treatment
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-14 pr-4 py-4 text-lg border-gray-300 rounded-lg bg-white shadow-md"
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Treatments list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTreatments.map((treatment) => (
            <li key={`${treatment.treatment_date}-${treatment.patient_id}-${treatment.attending_doctor_id}`} className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{treatment.patient_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Patient ID: {treatment.patient_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{treatment.doctor_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          Doctor ID: {treatment.attending_doctor_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Department: {treatment.department_number}</div>
                        <div className="text-sm text-gray-500">Date: {formatDateForDisplay(treatment.treatment_date)}</div>
                      </div>
                    </div>
                    {treatment.medications && treatment.medications.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Pill className="h-4 w-4 mr-1" />
                          Medications: {treatment.medications.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(treatment)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(treatment)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTreatment ? 'Edit Treatment' : 'Add Treatment'}
      >
        {editingTreatment && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only medications can be updated for existing treatments. Date, patient, and doctor cannot be changed.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="treatment_date"
                className="block text-sm font-medium text-gray-700"
              >
                Treatment Date
              </label>
              {editingTreatment ? (
                <div className="mt-1 p-2 bg-gray-100 rounded text-gray-700">
                  {formatDateForDisplay(editingTreatment.treatment_date)}
                </div>
              ) : (
                <input
                  type="date"
                  name="treatment_date"
                  id="treatment_date"
                  required
                  value={newTreatmentDate}
                  onChange={e => setNewTreatmentDate(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              )}
            </div>
            <div>
              <label
                htmlFor="patient_id"
                className="block text-sm font-medium text-gray-700"
              >
                Patient
              </label>
              <select
                name="patient_id"
                id="patient_id"
                required
                disabled={!!editingTreatment}
                defaultValue={editingTreatment?.patient_id || ''}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id_number} value={patient.id_number}>
                    {patient.first_name} {patient.last_name} (ID: {patient.id_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="attending_doctor_id"
                className="block text-sm font-medium text-gray-700"
              >
                Attending Doctor
              </label>
              <select
                name="attending_doctor_id"
                id="attending_doctor_id"
                required
                disabled={!!editingTreatment}
                defaultValue={editingTreatment?.attending_doctor_id || ''}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id_number} value={doctor.id_number}>
                    {doctor.first_name} {doctor.last_name} (ID: {doctor.id_number})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medications (Optional)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {medications.map((medication) => (
                <label key={medication.medication_code} className="flex items-center">
                  <input
                    type="checkbox"
                    name="medications"
                    value={medication.medication_code}
                    defaultChecked={editingTreatment?.medications?.includes(medication.medication_code) || false}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {medication.medication_name} ({medication.medication_code})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingTreatment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TreatmentsPage; 