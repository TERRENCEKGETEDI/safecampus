import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discreetMode, setDiscreetMode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
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
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <label>
          <input
            type="checkbox"
            checked={discreetMode}
            onChange={(e) => setDiscreetMode(e.target.checked)}
          />
          Discreet Mode
        </label>
        <button type="submit">Log In</button>
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