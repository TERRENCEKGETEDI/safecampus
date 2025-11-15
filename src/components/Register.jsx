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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Validate on change
    validateField(name, type === 'checkbox' ? checked : value);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        else {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const existingUser = users.find(u => u.email === value);
          if (existingUser) error = 'Email already exists';
        }
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'termsAccepted':
        if (!value) error = 'You must accept the terms and conditions';
        break;
      default:
        break;
    }
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    return Object.values(errors).every(error => !error) &&
           formData.email && formData.password && formData.confirmPassword && formData.name && formData.termsAccepted;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
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
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created! Please log in.');
    navigate('/login');
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
        </div>
        <div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
          {errors.confirmPassword && <span style={{ color: 'red' }}>{errors.confirmPassword}</span>}
        </div>
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
        </div>
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
        <div>
          <label>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            I accept the terms and conditions
          </label>
          {errors.termsAccepted && <span style={{ color: 'red' }}>{errors.termsAccepted}</span>}
        </div>
        <button type="submit" disabled={!isFormValid()}>Create Account</button>
      </form>
      <button onClick={() => navigate('/login')}>Back to Login</button>
    </div>
  );
};

export default Register;