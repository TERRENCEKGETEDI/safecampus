import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};