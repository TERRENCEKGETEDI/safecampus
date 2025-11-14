import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const SecurityAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    type: 'general',
    scope: 'campus',
    zone: '',
    priority: 'medium',
    scheduled: false,
    scheduleTime: '',
    recurring: false,
    recurringType: 'daily'
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'security') {
      const storedAlerts = JSON.parse(localStorage.getItem('securityAlerts') || '[]');
      setAlerts(storedAlerts);
    }
  }, [user]);

  const campusZones = [
    'North Campus',
    'South Campus',
    'East Campus',
    'West Campus',
    'Library Area',
    'Student Center',
    'Residential Area',
    'Sports Complex',
    'Parking Areas'
  ];

  const handleCreateAlert = () => {
    if (!newAlert.title.trim() || !newAlert.message.trim()) {
      alert('Please fill in title and message');
      return;
    }

    const alertData = {
      id: Date.now().toString(),
      ...newAlert,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      status: newAlert.scheduled ? 'scheduled' : 'active',
      sentAt: newAlert.scheduled ? null : new Date().toISOString()
    };

    const updatedAlerts = [...alerts, alertData];
    setAlerts(updatedAlerts);
    localStorage.setItem('securityAlerts', JSON.stringify(updatedAlerts));

    // Send notification to students (mock)
    if (!newAlert.scheduled) {
      sendAlertToStudents(alertData);
    }

    setNewAlert({
      title: '',
      message: '',
      type: 'general',
      scope: 'campus',
      zone: '',
      priority: 'medium',
      scheduled: false,
      scheduleTime: '',
      recurring: false,
      recurringType: 'daily'
    });
    setShowCreateForm(false);
    alert('Alert created successfully');
  };

  const sendAlertToStudents = (alert) => {
    // Mock sending alerts to students
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.role === 'student');

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    students.forEach(student => {
      // Check if alert is zone-based and student is in that zone (mock logic)
      if (alert.scope === 'campus' || (alert.scope === 'zone' && isStudentInZone(student, alert.zone))) {
        notifications.push({
          id: Date.now().toString() + Math.random(),
          userId: student.id,
          message: `SECURITY ALERT: ${alert.title} - ${alert.message}`,
          date: new Date().toISOString(),
          type: 'security_alert',
          priority: alert.priority
        });
      }
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const isStudentInZone = (student, zone) => {
    // Mock zone checking - in real app, would check student's current location
    return true; // For demo purposes
  };

  const handleCancelAlert = (alertId) => {
    const updatedAlerts = alerts.map(a =>
      a.id === alertId ? { ...a, status: 'cancelled' } : a
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('securityAlerts', JSON.stringify(updatedAlerts));
  };

  const handleDeleteAlert = (alertId) => {
    const updatedAlerts = alerts.filter(a => a.id !== alertId);
    setAlerts(updatedAlerts);
    localStorage.setItem('securityAlerts', JSON.stringify(updatedAlerts));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'scheduled') return alert.status === 'scheduled';
    if (filter === 'expired') return alert.status === 'cancelled';
    return true;
  });

  if (user?.role !== 'security') {
    return <div>Access denied. Security personnel only.</div>;
  }

  return (
    <div className="security-alerts">
      <h2>Campus Alerts & Broadcasts</h2>

      <div className="alerts-controls">
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Alert'}
        </button>

        <div className="filter-controls">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Alerts</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Cancelled</option>
          </select>
        </div>
      </div>

      {showCreateForm && (
        <div className="alert-form">
          <h3>Create New Alert</h3>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newAlert.title}
              onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
              placeholder="Alert title"
              required
            />
          </div>

          <div className="form-group">
            <label>Message:</label>
            <textarea
              value={newAlert.message}
              onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
              placeholder="Alert message"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type:</label>
              <select value={newAlert.type} onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}>
                <option value="general">General</option>
                <option value="emergency">Emergency</option>
                <option value="safety">Safety</option>
                <option value="weather">Weather</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority:</label>
              <select value={newAlert.priority} onChange={(e) => setNewAlert({...newAlert, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Scope:</label>
              <select value={newAlert.scope} onChange={(e) => setNewAlert({...newAlert, scope: e.target.value})}>
                <option value="campus">Campus-wide</option>
                <option value="zone">Zone-based</option>
              </select>
            </div>

            {newAlert.scope === 'zone' && (
              <div className="form-group">
                <label>Zone:</label>
                <select value={newAlert.zone} onChange={(e) => setNewAlert({...newAlert, zone: e.target.value})}>
                  <option value="">Select Zone</option>
                  {campusZones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={newAlert.scheduled}
                onChange={(e) => setNewAlert({...newAlert, scheduled: e.target.checked})}
              />
              Schedule for later
            </label>
          </div>

          {newAlert.scheduled && (
            <div className="form-row">
              <div className="form-group">
                <label>Schedule Time:</label>
                <input
                  type="datetime-local"
                  value={newAlert.scheduleTime}
                  onChange={(e) => setNewAlert({...newAlert, scheduleTime: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newAlert.recurring}
                    onChange={(e) => setNewAlert({...newAlert, recurring: e.target.checked})}
                  />
                  Recurring
                </label>
              </div>

              {newAlert.recurring && (
                <div className="form-group">
                  <label>Recurring Type:</label>
                  <select value={newAlert.recurringType} onChange={(e) => setNewAlert({...newAlert, recurringType: e.target.value})}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button onClick={handleCreateAlert}>Create Alert</button>
            <button onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="alerts-list">
        <h3>Active Alerts ({filteredAlerts.length})</h3>

        {filteredAlerts.length === 0 ? (
          <p>No alerts found</p>
        ) : (
          <div className="alerts-grid">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.priority} ${alert.status}`}>
                <div className="alert-header">
                  <h4>{alert.title}</h4>
                  <span className={`status-badge ${alert.status}`}>{alert.status}</span>
                </div>

                <p className="alert-message">{alert.message}</p>

                <div className="alert-meta">
                  <span>Type: {alert.type}</span>
                  <span>Scope: {alert.scope === 'campus' ? 'Campus-wide' : `Zone: ${alert.zone}`}</span>
                  <span>Priority: {alert.priority}</span>
                  <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                  {alert.sentAt && <span>Sent: {new Date(alert.sentAt).toLocaleString()}</span>}
                </div>

                {alert.scheduled && alert.scheduleTime && (
                  <div className="alert-schedule">
                    <strong>Scheduled for:</strong> {new Date(alert.scheduleTime).toLocaleString()}
                    {alert.recurring && <span> ({alert.recurringType})</span>}
                  </div>
                )}

                <div className="alert-actions">
                  {alert.status === 'active' && (
                    <button onClick={() => handleCancelAlert(alert.id)}>Cancel Alert</button>
                  )}
                  <button onClick={() => handleDeleteAlert(alert.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-alerts">
        <h3>Quick Safety Tips</h3>
        <div className="quick-tips">
          <button onClick={() => {
            setNewAlert({
              title: 'Safety Reminder',
              message: 'Remember to walk in well-lit areas and stay aware of your surroundings.',
              type: 'safety',
              scope: 'campus',
              zone: '',
              priority: 'low',
              scheduled: false,
              scheduleTime: '',
              recurring: false,
              recurringType: 'daily'
            });
            setShowCreateForm(true);
          }}>
            Send Safety Reminder
          </button>

          <button onClick={() => {
            setNewAlert({
              title: 'Emergency Drill',
              message: 'Emergency evacuation drill will begin in 5 minutes. Please proceed to designated assembly areas.',
              type: 'emergency',
              scope: 'campus',
              zone: '',
              priority: 'high',
              scheduled: false,
              scheduleTime: '',
              recurring: false,
              recurringType: 'daily'
            });
            setShowCreateForm(true);
          }}>
            Emergency Drill Alert
          </button>

          <button onClick={() => {
            setNewAlert({
              title: 'Suspicious Activity',
              message: 'Security has been notified of suspicious activity in the area. Please be vigilant.',
              type: 'safety',
              scope: 'zone',
              zone: 'Student Center',
              priority: 'medium',
              scheduled: false,
              scheduleTime: '',
              recurring: false,
              recurringType: 'daily'
            });
            setShowCreateForm(true);
          }}>
            Report Suspicious Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;