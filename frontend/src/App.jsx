import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ChangePassword from './pages/Auth/ChangePassword';
import Profile from './pages/Profile';

// HOD Pages
import StudentManagement from './pages/HOD/StudentManagement';
import FacultyManagement from './pages/HOD/FacultyManagement';
import BulkImportStudents from './pages/HOD/BulkImportStudents';

// Placeholder Pages
const StudentDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Student Dashboard - Coming Soon</h1></div>;
const FacultyDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Faculty Dashboard - Coming Soon</h1></div>;
const HODDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-8">HOD Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <a href="/hod/students" className="p-6 bg-blue-50 rounded-lg hover:shadow-lg transition">
        <h2 className="text-xl font-semibold text-blue-600">Student Management</h2>
      </a>
      <a href="/hod/faculty" className="p-6 bg-green-50 rounded-lg hover:shadow-lg transition">
        <h2 className="text-xl font-semibold text-green-600">Faculty Management</h2>
      </a>
      <a href="/hod/bulk-import" className="p-6 bg-purple-50 rounded-lg hover:shadow-lg transition">
        <h2 className="text-xl font-semibold text-purple-600">Bulk Import</h2>
      </a>
    </div>
  </div>
);
const Unauthorized = () => <div className="p-8 text-center"><h1 className="text-3xl font-bold text-red-600">Access Denied</h1></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Role-Specific Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod/dashboard"
            element={
              <ProtectedRoute requiredRole="hod">
                <HODDashboard />
              </ProtectedRoute>
            }
          />

          {/* HOD Routes */}
          <Route
            path="/hod/students"
            element={
              <ProtectedRoute requiredRole="hod">
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod/faculty"
            element={
              <ProtectedRoute requiredRole="hod">
                <FacultyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod/bulk-import"
            element={
              <ProtectedRoute requiredRole="hod">
                <BulkImportStudents />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
