import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discreetMode, setDiscreetMode] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        break;
      default:
        break;
    }
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    return !errors.email && !errors.password && email && password;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const token = 'mock-jwt-' + user.id;
      login(user, token);
      navigate('/dashboard');
    } else {
      alert('Invalid email or password');
    }
  };

  const handleForgotPassword = () => {
    const resetEmail = prompt('Enter your email to reset password:');
    if (resetEmail) {
      // Simulate sending reset email
      alert('Password reset link sent to ' + resetEmail);
    }
  };

  return (
    <div className="fade-in">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value); }}
            placeholder="Email"
            required
          />
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
            placeholder="Password"
            required
          />
          {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
        </div>
        <label>
          <input
            type="checkbox"
            checked={discreetMode}
            onChange={(e) => setDiscreetMode(e.target.checked)}
          />
          Discreet Mode
        </label>
        <button type="submit" disabled={!isFormValid()}>Log In</button>
      </form>
      <div className="form-actions">
        <button onClick={() => navigate('/register')} className="secondary-btn">
          Create Account
        </button>
        <button onClick={handleForgotPassword} className="link-btn">
          Forgot Password
        </button>
      </div>
    </div>
  );
};

export default Login;