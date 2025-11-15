import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="user-menu" ref={menuRef} style={{ position: 'relative' }}>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-menu-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '25px',
          padding: '6px 12px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        title="User Menu"
      >
        {/* User Avatar/Icon */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        {/* User Name (truncated on small screens) */}
        <span style={{
          fontWeight: '500',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {user.name}
        </span>

        {/* Role Badge */}
        <span className={`role-badge role-${user.role}`} style={{
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '10px'
        }}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>

        {/* Dropdown Arrow */}
        <span style={{
          fontSize: '12px',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="user-menu-dropdown"
          style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            width: 'min(280px, 85vw)',
            maxWidth: '320px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 1100,
            overflow: 'hidden'
          }}
        >
          {/* User Info Header */}
          <div style={{
            padding: 'clamp(12px, 5%, 16px)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{
              width: 'clamp(40px, 15%, 50px)',
              height: 'clamp(40px, 15%, 50px)',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(16px, 6vw, 20px)',
              fontWeight: 'bold',
              margin: '0 auto clamp(6px, 3%, 8px)'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{
              fontSize: 'clamp(14px, 5vw, 16px)',
              fontWeight: '600',
              marginBottom: 'clamp(3px, 1%, 4px)'
            }}>
              {user.name}
            </div>
            <div style={{
              fontSize: 'clamp(10px, 4vw, 12px)',
              opacity: 0.9,
              display: 'inline-block',
              padding: 'clamp(2px, 0.5%, 8px)',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px'
            }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: 'clamp(6px, 2%, 8px) 0' }}>
            {/* Menu Options */}
            <button
              onClick={handleProfileClick}
              style={{
                width: '100%',
                padding: 'clamp(10px, 3%, 12px) clamp(12px, 4%, 16px)',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 4vw, 14px)',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 3%, 12px)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: 'clamp(14px, 5vw, 16px)' }}>👤</span>
              View Profile
            </button>

            <button
              onClick={handleProfileClick}
              style={{
                width: '100%',
                padding: 'clamp(10px, 3%, 12px) clamp(12px, 4%, 16px)',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 4vw, 14px)',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 3%, 12px)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: 'clamp(14px, 5vw, 16px)' }}>⚙️</span>
              Settings
            </button>

            <button
              onClick={() => navigate('/help')}
              style={{
                width: '100%',
                padding: 'clamp(10px, 3%, 12px) clamp(12px, 4%, 16px)',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 4vw, 14px)',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 3%, 12px)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: 'clamp(14px, 5vw, 16px)' }}>❓</span>
              Help Center
            </button>
          </div>

          {/* Logout Button */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            padding: 'clamp(6px, 2%, 8px)'
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: 'clamp(10px, 3%, 12px)',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 4vw, 14px)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(6px, 2%, 8px)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.background = '#dc2626'}
            >
              <span style={{ fontSize: 'clamp(14px, 5vw, 16px)' }}>🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1099
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserMenu;