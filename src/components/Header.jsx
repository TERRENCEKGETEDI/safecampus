import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import UserMenu from './UserMenu.jsx';
import NotificationBell from './NotificationBell.jsx';

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
          { to: '/report', label: 'Report GBV' },
          { to: '/missing-report', label: 'Report Missing Person', highlight: true },
          { to: '/reports', label: 'My Reports' },
          { to: '/therapy', label: 'Access Support' },
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
          { to: '/missing-persons', label: 'Missing Persons', highlight: true },
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
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''} ${link.highlight ? 'highlight' : ''}`}
                >
                  {link.label}
                  {link.highlight && <span className="highlight-indicator">★</span>}
                </Link>
              ))}
            </div>

            <UserMenu />

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
          </nav>
        )}

        {user && (
          <div className="header-right">
            <NotificationBell />
          </div>
        )}
      </div>

      {user && mobileMenuOpen && (
        <div className="mobile-nav">
          {navigationLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''} ${link.highlight ? 'highlight' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
              {link.highlight && <span className="highlight-indicator">★</span>}
            </Link>
          ))}

          {/* Mobile User Menu Options */}
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '8px', paddingTop: '8px' }}>
            <Link
              to="/profile"
              className={`mobile-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              👤 Profile
            </Link>
            <Link
              to="/help"
              className={`mobile-nav-link ${location.pathname === '/help' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ❓ Help Center
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="mobile-nav-link"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#dc2626',
                fontWeight: '600'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;