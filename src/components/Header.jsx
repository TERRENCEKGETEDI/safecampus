import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isHomePage = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const getNavigationLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/report', label: 'Report Incident' },
          { to: '/reports', label: 'My Reports' },
          { to: '/therapy', label: 'Book Therapy' },
          { to: '/forum', label: 'Community Forum' },
          { to: '/map', label: 'Safety Map' },
          { to: '/chatbot', label: 'AI Assistant' },
          { to: '/help', label: 'Help Center' }
        ];
      case 'admin':
        return [
          { to: '/admin-dashboard', label: 'Admin Dashboard' },
          { to: '/profile', label: 'Profile' }
        ];
      case 'security':
        return [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/reports', label: 'Monitor Reports' },
          { to: '/map', label: 'Live Map' },
          { to: '/analytics', label: 'Analytics' },
          { to: '/alerts', label: 'Issue Alerts' },
          { to: '/chat', label: 'Officer Chat' },
          { to: '/profile', label: 'Profile' }
        ];
      case 'therapist':
        return [
          { to: '/therapist-dashboard', label: 'Dashboard' },
          { to: '/therapist-analytics', label: 'Analytics' },
          { to: '/therapy-resources', label: 'Resources' },
          { to: '/profile', label: 'Profile' }
        ];
      default:
        return [];
    }
  };

  const navigationLinks = getNavigationLinks();

  return (
    <header className="App-header">
      <div className="header-content">
        <div className="header-left">
          {!isHomePage && !isAuthPage && (
            <button
              onClick={handleBack}
              className="back-button"
              title="Go Back"
            >
              ← Back
            </button>
          )}
          <Link to="/" className="logo-link">
            <h1>SafeCampus</h1>
            <p>GBV Prevention & Reporting System</p>
          </Link>
        </div>

        {user && (
          <nav className="header-nav">
            <div className="nav-links">
              {navigationLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="user-info">
              <span className="welcome-text">Welcome, {user.name}</span>
              <span className={`role-badge role-${user.role}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
          </nav>
        )}
      </div>

      {user && mobileMenuOpen && (
        <div className="mobile-nav">
          {navigationLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;