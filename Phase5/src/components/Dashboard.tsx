import React, { useState, useEffect } from 'react';
import { Users, Pill, Building2, Bed } from 'lucide-react';
import { patientsApi, medicationsApi, departmentsApi } from '../services/api';

interface DashboardStats {
  totalPatients: number;
  totalMedications: number;
  totalDepartments: number;
  averageBedsPerDepartment: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalMedications: 0,
    totalDepartments: 0,
    averageBedsPerDepartment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, medications, departments] = await Promise.all([
          patientsApi.getAll(),
          medicationsApi.getAll(),
          departmentsApi.getAll(),
        ]);

        const totalBeds = departments.reduce(
          (sum, dept) => sum + dept.number_of_beds,
          0
        );

        setStats({
          totalPatients: patients.length,
          totalMedications: medications.length,
          totalDepartments: departments.length,
          averageBedsPerDepartment:
            departments.length > 0
              ? Math.round((totalBeds / departments.length) * 10) / 10
              : 0,
        });
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Medications',
      value: stats.totalMedications,
      icon: Pill,
      color: 'bg-green-500',
    },
    {
      title: 'Total Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg. Beds per Department',
      value: stats.averageBedsPerDepartment,
      icon: Bed,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`${card.color} rounded-md p-3 text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;