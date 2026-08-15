import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Shield } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="opacity-90">Manage your account information</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold">{user?.getFullName?.() || `${user?.firstName} ${user?.lastName}`}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-semibold capitalize">{user?.role}</p>
                </div>
              </div>

              {user?.studentId && (
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="font-semibold">{user?.studentId}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => navigate('/change-password')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
