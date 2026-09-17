import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
     // fetchUser();
      //console.log('user:', user); // Debugging line to check user data
    } else {
      setLoading(false);
    }
  }, []);

//   const fetchUser = async () => {
//     try {
//       //const response = await api.get('/auth/me');
//       const response = {
//   "success": true,
//   "data": {
//     "id": "usr_001",
//     "name": "John Doe",
//     "email": "admin@example.com",
//     "role": "admin",
//     "departmentId": "treasury",
//     "departmentName": "Treasury Department",
//     "permissions": ["upload", "review", "approve", "manage_users"]
//   }
// }
// //console.log('Fetched user data:', response.data); // Debugging line to check fetched user data
//       setUser(response.data);
//     } catch (error) {
//       localStorage.removeItem('token');
//       delete api.defaults.headers.common['Authorization'];
//     } finally {
//       setLoading(false);
//     }
//   };

  const login = async (email, password) => {
    // NOTE: originally hardcoded to http://10.6.13.37:9091/api/auth/login,
    // which only exists on the internal network. Using the configured API
    // base URL instead so this works against any backend (mock or real).
    const baseUrl = process.env.REACT_APP_API_URL_BASE || process.env.REACT_APP_API_URL;
    const response = await axios.post(`${baseUrl}auth/login`, { userName: email, password });
    const { username, accessToken, refreshToken, roleId, permissions, user } = response.data;

    localStorage.setItem('token', accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    // NOTE: originally called setUser(user) where `user` was never destructured
    // from the response, so it always set the state to its own previous value
    // (null) and every route behind PrivateRoute redirected back to /login.
    setUser(user || { name: username, role: roleId, permissions });
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