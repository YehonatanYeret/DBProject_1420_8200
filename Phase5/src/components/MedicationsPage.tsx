import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { medicationsApi, Medication } from '../services/api';
import Modal from './Modal';

const MedicationsPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const data = await medicationsApi.getAll();
      setMedications(data);
    } catch (err) {
      setError('Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMedication(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setIsModalOpen(true);
  };

  const handleDelete = async (code: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await medicationsApi.delete(code);
        await fetchMedications();
      } catch (err) {
        setError('Failed to delete medication');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const medicationData = {
      medication_code: editingMedication ? editingMedication.medication_code : `MED-${Date.now()}`,
      medication_name: formData.get('medication_name') as string,
      price: parseFloat(formData.get('price') as string),
    };

    try {
      if (editingMedication) {
        await medicationsApi.update(editingMedication.medication_code, medicationData);
      } else {
        await medicationsApi.create(medicationData);
      }
      setIsModalOpen(false);
      await fetchMedications();
    } catch (err) {
      setError('Failed to save medication');
    }
  };

  const filteredMedications = medications.filter(
    (medication) =>
      medication.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.medication_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Medication
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
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Simple list for medications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredMedications.map((medication) => (
            <li key={medication.medication_code} className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-indigo-600">{medication.medication_name[0]}</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{medication.medication_name}</div>
                  <div className="text-sm text-gray-500">Code: {medication.medication_code}</div>
                  <div className="text-sm text-gray-500">Price: ${Number(medication.price).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(medication)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(medication.medication_code)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedication ? 'Edit Medication' : 'Add Medication'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="medication_name"
              className="block text-sm font-medium text-gray-700"
            >
              Medication Name
            </label>
            <input
              type="text"
              name="medication_name"
              id="medication_name"
              required
              defaultValue={editingMedication?.medication_name}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="price"
                id="price"
                step="0.01"
                min="0"
                required
                defaultValue={editingMedication?.price}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              />
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
              {editingMedication ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicationsPage;