import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
      console.log('user:', user); // Debugging line to check user data
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      //const response = await api.get('/auth/me');
      const response = {
  "success": true,
  "data": {
    "id": "usr_001",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin",
    "departmentId": "treasury",
    "departmentName": "Treasury Department",
    "permissions": ["upload", "review", "approve", "manage_users"]
  }
}
console.log('Fetched user data:', response.data); // Debugging line to check fetched user data
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    //const response = await api.post('/auth/login', { email, password });
    //const { token, user } = response.data;
    const { token, user } = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_001",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "departmentId": "treasury",
      "departmentName": "Treasury Department",
      "permissions": ["upload", "review", "approve", "manage_users"]
    
  }
}

    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const hasRole = (roles) => roles?.includes(user?.role) || false;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};