import React, { createContext, useContext, useState, useEffect } from 'react';
import { sampleUsers, sampleForumPosts, sampleComments, additionalAppointments, appointments } from '../components/counselingData.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize sample users if not present
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.length === 0) {
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    }

    // Initialize forum posts if not present
    const existingPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    if (existingPosts.length === 0) {
      localStorage.setItem('forumPosts', JSON.stringify(sampleForumPosts));
    }

    // Initialize comments if not present
    const existingComments = JSON.parse(localStorage.getItem('comments') || '[]');
    if (existingComments.length === 0) {
      localStorage.setItem('comments', JSON.stringify(sampleComments));
    }

    // Initialize appointments if not present
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    if (existingAppointments.length === 0) {
      localStorage.setItem('appointments', JSON.stringify([...appointments, ...additionalAppointments]));
    }

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Record login activity
    const activity = JSON.parse(localStorage.getItem(`loginActivity_${userData.id}`) || '[]');
    const loginEntry = {
      timestamp: new Date().toISOString(),
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      device: navigator.userAgent,
      location: 'Johannesburg, South Africa' // Mock location
    };
    activity.push(loginEntry);
    localStorage.setItem(`loginActivity_${userData.id}`, JSON.stringify(activity));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};