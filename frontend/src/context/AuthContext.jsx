import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const register = useCallback(
    async (userData) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/register`,
          userData
        );

        const { token, data } = response.data;
        
        setToken(token);
        setUser(data);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Registration failed';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          { email, password }
        );

        const { token, data } = response.data;
        
        setToken(token);
        setUser(data);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Login failed';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
          { currentPassword, newPassword }
        );
        
        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to change password';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCurrentUser = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`
      );
      
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    changePassword,
    getCurrentUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
