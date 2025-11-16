import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discreetMode, setDiscreetMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, authenticateUser } = useAuth();

 const validateField = (name, value) => {
   let error = '';
   const sanitizedValue = value.trim(); // Basic sanitization
    switch (name) {
      case 'email':
        if (!sanitizedValue) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(sanitizedValue)) error = 'Email is invalid';
        break;
      case 'password':
        if (!sanitizedValue) error = 'Password is required';
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
    try {
      // Authenticate user
      const user = authenticateUser(email, password);
      if (user) {
        const token = 'mock-jwt-' + user.id + '-' + Date.now();
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          // Set longer session
          localStorage.setItem('sessionExpiry', Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        } else {
          localStorage.setItem('sessionExpiry', Date.now() + 24 * 60 * 60 * 1000); // 1 day
        }
        login(user, token);
        navigate('/dashboard');
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      alert(error.message);
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
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
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