import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { notificationsAPI, therapyAPI, usersAPI } from '../services/dataService.js';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Check for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      // Send automated mental health notifications
      sendAutomatedNotifications();
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = () => {
    const userNotifications = notificationsAPI.getUserNotifications(user.id)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.isRead && !n.read).length);
  };

  const markAsRead = (notificationId) => {
    notificationsAPI.markAsRead(notificationId);
    loadNotifications();
  };

  const markAllAsRead = () => {
    const userNotifications = notificationsAPI.getUserNotifications(user.id);
    userNotifications.forEach(notification => {
      if (!notification.isRead && !notification.read) {
        notificationsAPI.markAsRead(notification.id);
      }
    });
    loadNotifications();
  };

  const deleteNotification = (notificationId) => {
    // For this demo, we'll just mark as read since we don't have a delete API
    // In a real implementation, you'd have a delete endpoint
    notificationsAPI.markAsRead(notificationId);
    loadNotifications();
  };

  const sendAutomatedNotifications = () => {
    if (!user || user.role !== 'student') return;

    const now = new Date();
    const today = now.toDateString();

    // Send mood check-in reminder if not done today
    const moodCheckinSent = localStorage.getItem(`moodCheckinSent_${user.id}_${today}`);
    if (!moodCheckinSent) {
      sendNotification(user.id, 'How are you feeling today? Take a moment to log your mood in the diary.', 'mood-checkin');
      localStorage.setItem(`moodCheckinSent_${user.id}_${today}`, 'true');
    }

    // Check for upcoming appointments and send reminders
    const appointments = Object.values(therapyAPI.getAllAppointments());
    const userAppointments = appointments.filter(a => a.studentId === user.id && a.status === 'confirmed');
    userAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
      const timeDiff = appointmentDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Send reminder 24 hours before
      if (hoursDiff <= 24 && hoursDiff > 23) {
        const reminderSent = localStorage.getItem(`reminderSent_${appointment.id}`);
        if (!reminderSent) {
          sendNotification(user.id, `Reminder: You have a therapy session tomorrow at ${appointment.time}`, 'reminder', true);
          localStorage.setItem(`reminderSent_${appointment.id}`, 'true');
        }
      }
    });

    // Send daily motivation (random chance to avoid spam)
    const motivationSent = localStorage.getItem(`motivationSent_${user.id}_${today}`);
    if (!motivationSent && Math.random() < 0.3) { // 30% chance
      const quotes = [
        "You are stronger than you think. Keep going! 🌟",
        "Every small step counts towards better mental health. 💪",
        "Your feelings are valid. You're not alone in this journey. 🤝",
        "Self-care is not selfish, it's necessary. Take care of yourself today. 🌸"
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      sendNotification(user.id, randomQuote, 'motivation');
      localStorage.setItem(`motivationSent_${user.id}_${today}`, 'true');
    }
  };

  const sendNotification = (userId, message, type, sendEmail = false) => {
    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      title: getNotificationTitle(type),
      message,
      priority: getNotificationPriority(type),
      category: getNotificationCategory(type),
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      actionUrl: getNotificationActionUrl(type),
      metadata: {}
    };

    notificationsAPI.create(notification);

    if (sendEmail) {
      sendEmailNotification(userId, message, type);
    }
  };

  const getNotificationTitle = (type) => {
    const titles = {
      'mood-checkin': 'Daily Mood Check-in',
      'reminder': 'Appointment Reminder',
      'motivation': 'Daily Motivation'
    };
    return titles[type] || 'Notification';
  };

  const getNotificationPriority = (type) => {
    const priorities = {
      'emergency': 'critical',
      'reminder': 'medium',
      'mood-checkin': 'low',
      'motivation': 'low'
    };
    return priorities[type] || 'medium';
  };

  const getNotificationCategory = (type) => {
    const categories = {
      'mood-checkin': 'wellness',
      'reminder': 'therapy',
      'motivation': 'wellness'
    };
    return categories[type] || 'system';
  };

  const getNotificationActionUrl = (type) => {
    const urls = {
      'mood-checkin': '/mood-diary',
      'reminder': '/therapy/appointments'
    };
    return urls[type] || null;
  };

  const sendEmailNotification = (userId, message, type) => {
    // Mock email sending - in real app, this would call an email service
    const recipient = usersAPI.getById(userId);
    if (recipient) {
      console.log(`📧 EMAIL SENT to ${recipient.email}: ${message}`);
      // In demo, show alert
      if (Math.random() < 0.1) { // 10% chance to show demo email
        alert(`📧 Demo Email Sent: ${message}`);
      }
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'loadshedding': return '⚡';
      case 'emergency': return '🚨';
      case 'security': return '🛡️';
      case 'missing_person': return '👤';
      case 'report': return '📋';
      case 'appointment': return '📅';
      case 'therapy': return '🧠';
      case 'message': return '💬';
      case 'reminder': return '⏰';
      case 'system': return '⚙️';
      case 'mood-checkin': return '📊';
      case 'motivation': return '🌟';
      case 'resource': return '📚';
      default: return '🔔';
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (!user) return null;

  return (
    <div className="notification-bell" style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: 'clamp(35px, 8vw, 40px)',
          height: 'clamp(35px, 8vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: 'clamp(16px, 4vw, 18px)',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 'clamp(-6px, -2vw, -8px)',
            right: 'clamp(-6px, -2vw, -8px)',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: 'clamp(18px, 4vw, 20px)',
            height: 'clamp(18px, 4vw, 20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            fontWeight: 'bold',
            border: '2px solid white',
            zIndex: 10
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: 'min(420px, 85vw)',
          maxWidth: '90vw',
          maxHeight: 'min(500px, 70vh)',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1300,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: 'clamp(10px, 3%, 15px)',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: 'clamp(14px, 4vw, 16px)',
              fontWeight: '600'
            }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(3px, 1%, 4px) clamp(6px, 2%, 8px)',
                  borderRadius: '4px',
                  fontSize: 'clamp(10px, 3vw, 12px)',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter */}
          <div style={{
            padding: 'clamp(8px, 3%, 10px) clamp(12px, 3%, 15px)',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: 'clamp(4px, 1%, 5px)',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: 'clamp(12px, 3vw, 14px)'
              }}
            >
              <option value="all">All Notifications</option>
              <option value="loadshedding">Loadshedding Alerts</option>
              <option value="emergency">Emergency Alerts</option>
              <option value="security">Security Updates</option>
              <option value="missing_person">Missing Persons</option>
              <option value="report">Report Updates</option>
              <option value="appointment">Appointments</option>
              <option value="therapy">Therapy Sessions</option>
              <option value="message">Messages</option>
              <option value="reminder">Reminders</option>
              <option value="mood-checkin">Mood Check-ins</option>
              <option value="motivation">Motivational Quotes</option>
              <option value="resource">Resources</option>
              <option value="system">System Updates</option>
            </select>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: 'min(350px, 50vh)',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                padding: 'clamp(15px, 5%, 20px)',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 'clamp(12px, 4vw, 14px)'
              }}>
                No notifications found
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: 'clamp(10px, 3%, 12px) clamp(12px, 3%, 15px)',
                    borderBottom: '1px solid #f1f5f9',
                    background: notification.read ? 'white' : '#eff6ff',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'clamp(8px, 2%, 10px)',
                    width: '100%'
                  }}>
                    <span style={{
                      fontSize: 'clamp(16px, 5vw, 18px)',
                      flexShrink: 0,
                      marginTop: 'clamp(1px, 0.5%, 2px)'
                    }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={{
                      flex: 1,
                      minWidth: 0,
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      overflow: 'hidden'
                    }}>
                      <p style={{
                        margin: '0 0 clamp(3px, 1%, 4px) 0',
                        fontSize: 'clamp(12px, 4vw, 14px)',
                        fontWeight: notification.read ? 'normal' : '600',
                        color: '#1f2937',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto'
                      }}>
                        {notification.message}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: 'clamp(10px, 3vw, 12px)',
                        color: '#6b7280',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {new Date(notification.date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: 'clamp(14px, 4vw, 16px)',
                        padding: 'clamp(1px, 0.5%, 2px)',
                        borderRadius: '2px',
                        flexShrink: 0,
                        alignSelf: 'flex-start',
                        marginTop: 'clamp(1px, 0.5%, 2px)'
                      }}
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1299
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;