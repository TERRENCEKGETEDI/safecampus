import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student',
    discreetMode: false,
    termsAccepted: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!formData.termsAccepted) {
      alert('Please accept the terms');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === formData.email);
    if (existingUser) {
      alert('Email already exists');
      return;
    }
    const newUser = {
      id: Date.now().toString(),
      email: formData.email,
      password: formData.password, // In real app, hash this
      name: formData.name,
      role: formData.role,
      discreetMode: formData.discreetMode,
      verified: false,
      created_at: new Date().toISOString(),
      therapistId: formData.role === 'student' ? '1' : null, // Assign default therapist for students
      trustedCircle: [],
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created! Please log in.');
    navigate('/login');
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
        />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="therapist">Therapist</option>
          <option value="security">Security</option>
          <option value="admin">Admin</option>
        </select>
        <label>
          <input
            type="checkbox"
            name="discreetMode"
            checked={formData.discreetMode}
            onChange={handleChange}
          />
          Enable Discreet Mode
        </label>
        <label>
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
          />
          I accept the terms and conditions
        </label>
        <button type="submit">Create Account</button>
      </form>
      <button onClick={() => navigate('/login')}>Back to Login</button>
    </div>
  );
};

export default Register;