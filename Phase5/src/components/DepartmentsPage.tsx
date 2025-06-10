import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { departmentsApi, Department } from '../services/api';
import Modal from './Modal';

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (err) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = async (number: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentsApi.delete(number);
        await fetchDepartments();
      } catch (err) {
        setError('Failed to delete department');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const departmentData = {
      department_number: editingDepartment ? editingDepartment.department_number : Number(formData.get('department_number')),
      department_phone_number: formData.get('department_phone_number') as string,
      number_of_beds: parseInt(formData.get('number_of_beds') as string),
      doctor_count: 0,
      nurse_count: 0
    };

    try {
      if (editingDepartment) {
        await departmentsApi.update(editingDepartment.department_number, departmentData);
      } else {
        await departmentsApi.create(departmentData);
      }
      setIsModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      setError('Failed to save department');
    }
  };

  const filteredDepartments = departments.filter(
    (department) =>
      department.department_number.toString().includes(searchTerm) ||
      department.department_phone_number.includes(searchTerm)
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
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Department
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
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Card grid for departments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDepartments.map((department) => (
          <div
            key={department.department_number}
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col relative transition-transform transform hover:scale-100 hover:shadow-xl border border-gray-100"
          >
            {/* Edit/Delete buttons */}
            <div className="absolute top-6 right-6 flex space-x-3">
              <button
                onClick={() => handleEdit(department)}
                className="text-blue-500 hover:text-blue-700"
                title="Edit"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(department.department_number)}
                className="text-red-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            {/* Icon and name */}
            <div className="flex items-center mb-6">
              <div className="h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center mr-5">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Department {department.department_number}</div>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">Active</span>
              </div>
            </div>
            {/* Phone, email */}
            <div className="flex flex-col gap-2 text-base text-gray-600 mb-6">
              <div><span className="font-semibold">Phone:</span> {department.department_phone_number}</div>
              <div><span className="font-semibold">Email:</span> department{department.department_number}@hospital.com</div>
            </div>
            {/* Staff count */}
            <div className="mt-auto pt-6 border-t text-base text-gray-500 font-semibold">Staff Count: {department.doctor_count + department.nurse_count}</div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!editingDepartment && (
              <div>
                <label
                  htmlFor="department_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Number
                </label>
                <input
                  type="number"
                  name="department_number"
                  id="department_number"
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="department_phone_number"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="department_phone_number"
                id="department_phone_number"
                required
                defaultValue={editingDepartment?.department_phone_number}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="number_of_beds"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Beds
              </label>
              <input
                type="number"
                name="number_of_beds"
                id="number_of_beds"
                min="0"
                required
                defaultValue={editingDepartment?.number_of_beds}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
              {editingDepartment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;