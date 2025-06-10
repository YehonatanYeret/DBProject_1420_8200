import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stethoscope, Pill, UserPlus, Syringe } from 'lucide-react';

interface DoctorShift {
  shift_date: string;
  start_time: string;
  end_time: string;
  attending_doctor_id: string;
  doctor_name: string;
  patients_treated: number;
}

interface MedicationUsage {
  department_number: number;
  medication_name: string;
  medication_count: number;
}

interface DrugUsage {
  medication_name: string;
  usage_count: number;
}

interface Nurse {
  id_number: string;
  first_name: string;
  last_name: string;
  department_number: number;
}

interface Department {
  department_number: number;
}

interface Doctor {
  id_number: string;
  first_name: string;
  last_name: string;
}

const QueriesSection: React.FC = () => {
  const [doctorsOnShift, setDoctorsOnShift] = useState<DoctorShift[]>([]);
  const [medicationUsage, setMedicationUsage] = useState<MedicationUsage[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [doctorDrugUsage, setDoctorDrugUsage] = useState<DrugUsage[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState({
    doctors: true,
    medications: true,
    nurseAssignment: true,
    drugUsage: true
  });

  useEffect(() => {
    // Fetch initial data
    fetchDoctorsOnShift();
    fetchMedicationUsage();
    fetchNurses();
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDoctorsOnShift = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/queries/doctor-shifts');
      setDoctorsOnShift(response.data);
    } catch (err) {
      setError('Failed to fetch doctors on shift');
    }
  };

  const fetchMedicationUsage = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/queries/department-medications');
      setMedicationUsage(response.data);
    } catch (err) {
      setError('Failed to fetch medication usage');
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/queries/nurses');
      setNurses(response.data);
    } catch (err) {
      setError('Failed to fetch nurses');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/queries/departments');
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/queries/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const handleAssignNurse = async () => {
    if (!selectedNurse || !selectedDepartment) {
      setError('Please select both nurse and department');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/queries/assign-nurse', {
        nurse_id: selectedNurse,
        department_number: selectedDepartment
      });
      setError('');
    } catch (err) {
      setError('Failed to assign nurse');
    }
    setLoading(false);
  };

  const handleCalculateDrugUsage = async () => {
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/queries/doctor-drug-usage/${selectedDoctor}`);
      setDoctorDrugUsage(response.data);
      setError('');
    } catch (err) {
      setError('Failed to calculate drug usage');
    }
    setLoading(false);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-8 bg-gray-50 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 tracking-tight">Hospital Analytics Dashboard</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Doctors on Shift Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative">
          <div className="absolute -top-5 left-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 rounded-full p-2 shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </span>
          </div>
          <div
            className="flex justify-between items-center cursor-pointer mt-2 mb-1"
            onClick={() => toggleSection('doctors')}
          >
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">Doctors on Shift</h3>
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.doctors ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.doctors && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {doctorsOnShift.map((doctor, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-1">
                  <span className="font-medium text-gray-900">{doctor.doctor_name}</span>
                  <span className="text-sm text-gray-600">Patients treated: {doctor.patients_treated}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Medication Usage Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative">
          <div className="absolute -top-5 left-4 flex items-center">
            <span className="bg-green-100 text-green-600 rounded-full p-2 shadow-sm">
              <Pill className="w-6 h-6" />
            </span>
          </div>
          <div
            className="flex justify-between items-center cursor-pointer mt-2 mb-1"
            onClick={() => toggleSection('medications')}
          >
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">Medication Usage by Department</h3>
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.medications ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.medications && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {medicationUsage.map((med, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-1">
                  <span className="font-medium text-gray-900">{med.medication_name}</span>
                  <span className="text-sm text-gray-600">Department: {med.department_number} | Usage: {med.medication_count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Nurse Assignment Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative">
          <div className="absolute -top-5 left-4 flex items-center">
            <span className="bg-purple-100 text-purple-600 rounded-full p-2 shadow-sm">
              <UserPlus className="w-6 h-6" />
            </span>
          </div>
          <div
            className="flex justify-between items-center cursor-pointer mt-2 mb-1"
            onClick={() => toggleSection('nurseAssignment')}
          >
            <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">Assign Nurse to Department</h3>
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.nurseAssignment ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.nurseAssignment && (
            <div className="mt-4 space-y-4">
              <select
                value={selectedNurse}
                onChange={(e) => setSelectedNurse(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 focus:ring-2 focus:ring-purple-200 bg-gray-50"
              >
                <option key="default-nurse" value="">Select Nurse</option>
                {nurses.map((nurse) => (
                  <option key={`nurse-${nurse.id_number}`} value={nurse.id_number}>
                    {nurse.first_name} {nurse.last_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 focus:ring-2 focus:ring-purple-200 bg-gray-50"
              >
                <option key="default-dept" value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={`dept-${dept.department_number}`} value={dept.department_number}>
                    Department {dept.department_number}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignNurse}
                disabled={loading}
                className="w-full bg-purple-100 text-purple-800 py-2 rounded-lg font-semibold hover:bg-purple-200 focus:ring-2 focus:ring-purple-300 transition disabled:bg-gray-200 disabled:text-gray-400"
              >
                {loading ? 'Assigning...' : 'Assign Nurse'}
              </button>
            </div>
          )}
        </div>
        {/* Doctor Drug Usage Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative">
          <div className="absolute -top-5 left-4 flex items-center">
            <span className="bg-yellow-100 text-yellow-600 rounded-full p-2 shadow-sm">
              <Syringe className="w-6 h-6" />
            </span>
          </div>
          <div
            className="flex justify-between items-center cursor-pointer mt-2 mb-1"
            onClick={() => toggleSection('drugUsage')}
          >
            <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">Doctor Drug Usage</h3>
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.drugUsage ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.drugUsage && (
            <div className="mt-4 space-y-4">
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full p-2 rounded border border-gray-200 focus:ring-2 focus:ring-yellow-100 bg-gray-50"
              >
                <option key="default-doctor" value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={`doctor-${doctor.id_number}`} value={doctor.id_number}>
                    {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCalculateDrugUsage}
                disabled={loading}
                className="w-full bg-yellow-100 text-yellow-800 py-2 rounded-lg font-semibold hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-200 transition disabled:bg-gray-200 disabled:text-gray-400"
              >
                {loading ? 'Calculating...' : 'Calculate Usage'}
              </button>
              {doctorDrugUsage.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {doctorDrugUsage.map((drug, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-1">
                      <span className="font-medium text-gray-900">{drug.medication_name}</span>
                      <span className="text-sm text-gray-600">Usage count: {drug.usage_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueriesSection; 