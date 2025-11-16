import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersAPI, forumAPI, therapyAPI } from '../services/dataService.js';

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

    const user = usersAPI.authenticate(email, password);
    console.log('Login attempt:', email, 'Found user:', user ? user.name : 'none');

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
    // Data initialization is now handled by the data service
    // Check for existing session
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
    // Set session expiry (24 hours from now)
    const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', sessionExpiry.toString());
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