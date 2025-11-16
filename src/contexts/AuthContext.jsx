import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { sampleUsers, sampleForumPosts, sampleComments, additionalAppointments, appointments } from '../components/counselingData.js';

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
  authenticateUser: () => null,
  hashPassword: () => ''
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  const authenticateUser = (email, password) => {
    // Rate limiting check
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    const recentAttempts = attempts.filter(a => a.email === email && new Date(a.timestamp) > new Date(Date.now() - 15 * 60 * 1000)); // 15 minutes
    if (recentAttempts.length >= 5) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hashedPassword = hashPassword(password);
    console.log('Login attempt:', email, 'Hashed password:', hashedPassword);
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    console.log('Found user:', user ? user.name : 'none');

    // Log attempt
    attempts.push({
      email,
      timestamp: new Date().toISOString(),
      success: !!user
    });
    localStorage.setItem('loginAttempts', JSON.stringify(attempts.slice(-100))); // Keep last 100 attempts

    return user || null;
  };

  useEffect(() => {
    // Initialize sample users if not present or if passwords don't match (force update)
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const needsUpdate = existingUsers.length === 0 ||
      !existingUsers.some(u => u.password === '396ce936e73c0cd7e270f1a827dc8d5e6cb11385e20e3bfc1d0ea623c135de3e');

    if (needsUpdate) {
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
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (storedToken && storedUser && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
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
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('rememberMe');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, authenticateUser, hashPassword }}>
      {children}
    </AuthContext.Provider>
  );
};