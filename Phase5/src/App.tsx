import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import PatientsPage from './components/PatientsPage';
import MedicationsPage from './components/MedicationsPage';
import DepartmentsPage from './components/DepartmentsPage';
import TreatmentsPage from './components/TreatmentsPage';
import Navigation from './components/Navigation';
import QueriesSection from './components/QueriesSection';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="pt-16">
                  <div className="container mx-auto px-4">
                    <Dashboard />
                    <div className="mt-8">
                      <QueriesSection />
                    </div>
                  </div>
                </main>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="pt-16">
                  <PatientsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/medications"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="pt-16">
                  <MedicationsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="pt-16">
                  <DepartmentsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/treatments"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="pt-16">
                  <TreatmentsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;