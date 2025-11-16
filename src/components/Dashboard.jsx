import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ reports: 0, appointments: 0, posts: 0 });
  const [assignedTherapist, setAssignedTherapist] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [reportSummary, setReportSummary] = useState({ pending: 0, resolved: 0, urgent: 0 });
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Load stats
    const reports = JSON.parse(localStorage.getItem('reports') || '[]').filter(r => r.reporter_user_id === user.id || !r.reporter_user_id);
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]').filter(a => a.student_id === user.id);
    const posts = JSON.parse(localStorage.getItem('forumPosts') || '[]').filter(p => p.author_id === user.id);
    setStats({ reports: reports.length, appointments: appointments.length, posts: posts.length });
    // Load assigned therapist for students
    if (user.role === 'student' && user.therapistId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const therapist = users.find(u => u.id === user.therapistId);
      setAssignedTherapist(therapist);
    }
    // Load notifications
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = allNotifications.filter(n => n.userId === user.id);
    setNotifications(userNotifications);
    // Load upcoming sessions
    const upcoming = appointments.filter(a => new Date(a.startTime) > new Date() && a.status === 'confirmed').slice(0, 3);
    setUpcomingSessions(upcoming);
    // Load report summary
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const urgent = reports.filter(r => r.severity === 'high' && r.status !== 'resolved').length;
    setReportSummary({ pending, resolved, urgent });
    // Load announcements
    let ann = JSON.parse(localStorage.getItem('announcements') || '[]');
    if (ann.length === 0) {
      ann = [
        { title: 'Safety Workshop', message: 'Join us for a safety awareness workshop on Friday.' },
        { title: 'Mental Health Day', message: 'Mental Health Awareness Day is coming up. Resources available.' }
      ];
      localStorage.setItem('announcements', JSON.stringify(ann));
    }
    setAnnouncements(ann);
  }, [user, navigate]);

  const handlePanic = () => {
    // Navigate to emergency support
    navigate('/emergency');
  };

  const handleImSafe = () => {
    // Send SMS to trusted circle
    alert('Safety message sent to trusted circle!');
  };

  const handleWalkWithMe = () => {
    // Start location sharing
    alert('Location sharing started for 30 minutes!');
  };

  const handleRespondToAlert = (alert) => {
    // Navigate to map or dedicated alert response page
    navigate('/map');
  };

  const handleMonitorWalkWithMe = (request) => {
    // Navigate to map to monitor
    navigate('/map');
  };

  if (!user) return <div>Loading...</div>;

  const renderSidebar = () => {
    switch (user.role) {
      case 'student':
        return (
          <>
            <Link to="/report">Submit GBV Report</Link>
            <Link to="/missing-report">Report Missing Person</Link>
            <Link to="/reports">View Reports</Link>
            <Link to="/therapy">Book Therapy</Link>
            <Link to="/mood-diary">Mood Diary</Link>
            <Link to="/self-help">Self-Help Library</Link>
            <Link to="/emergency">Emergency Support</Link>
            <Link to="/forum">Forum</Link>
            <Link to="/map">Safety Map</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/chatbot">Chatbot</Link>
            <Link to="/help">Help Center</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin-dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
          </>
        );
      case 'security':
        return (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/reports">Monitor Reports</Link>
            <Link to="/missing-persons">Missing Persons</Link>
            <Link to="/map">Live Map</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/alerts">Issue Alerts</Link>
            <Link to="/chat">Officer Chat</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/chatbot">AI Assistant</Link>
          </>
        );
      case 'therapist':
        return (
          <>
            <Link to="/therapist-dashboard">Dashboard</Link>
            <Link to="/therapist-analytics">Analytics</Link>
            <Link to="/therapy-resources">Resources</Link>
            <Link to="/profile">Profile</Link>
          </>
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (user.role) {
      case 'student':
        return (
          <>
            <h2>Welcome, {user.name}!</h2>
            <div className="stats-cards">
              <div className="card">
                <h4>My Reports</h4>
                <p>{stats.reports}</p>
              </div>
              <div className="card">
                <h4>Appointments</h4>
                <p>{stats.appointments}</p>
              </div>
              <div className="card">
                <h4>Forum Posts</h4>
                <p>{stats.posts}</p>
              </div>
            </div>
            <div className="session-summary">
              <h3>Upcoming Therapy Sessions</h3>
              {upcomingSessions.length > 0 ? (
                <ul>
                  {upcomingSessions.map(a => (
                    <li key={a.id}>{new Date(a.startTime).toLocaleString()} - {a.mode}</li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming sessions.</p>
              )}
            </div>
            <div className="report-summary">
              <h3>Report Summary</h3>
              <p>Pending: {reportSummary.pending}</p>
              <p>Resolved: {reportSummary.resolved}</p>
              <p>Urgent: {reportSummary.urgent}</p>
            </div>
            <div className="announcements">
              <h3>Announcements</h3>
              {announcements.length > 0 ? (
                <ul>
                  {announcements.map((ann, i) => (
                    <li key={i}>{ann.title}: {ann.message}</li>
                  ))}
                </ul>
              ) : (
                <p>No new announcements.</p>
              )}
            </div>
            <div className="graphs">
              <h3>Trends</h3>
              <p>Reports over time: [Mock Graph - Increasing]</p>
              <p>Usage: [Mock - High]</p>
            </div>
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button onClick={handlePanic} style={{ backgroundColor: 'red', color: 'white' }}>
                Panic
              </button>
              <button onClick={handleImSafe} style={{ backgroundColor: 'green', color: 'white' }}>
                I'm Safe
              </button>
              <button onClick={handleWalkWithMe} style={{ backgroundColor: 'blue', color: 'white' }}>
                Walk With Me
              </button>
            </div>
            <div className="notifications">
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((n, i) => (
                    <li key={i}>{n.message} - {new Date(n.date).toLocaleString()}</li>
                  ))}
                </ul>
              ) : (
                <p>No new notifications.</p>
              )}
              {assignedTherapist && (
                <p>Assigned Therapist: {assignedTherapist.name} ({assignedTherapist.email})</p>
              )}
            </div>
          </>
        );
      case 'admin':
        // Redirect to dedicated admin dashboard
        navigate('/admin-dashboard');
        return null;
      case 'security':
        const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
        const panicAlerts = JSON.parse(localStorage.getItem('panicAlerts') || '[]');
        const pendingReports = allReports.filter(r => r.status === 'pending').length;
        const inProgressReports = allReports.filter(r => r.status === 'in_progress').length;
        const resolvedReports = allReports.filter(r => r.status === 'resolved').length;
        const urgentReports = allReports.filter(r => r.severity === 'high' && r.status !== 'resolved').length;
        const activeAlerts = panicAlerts.filter(a => a.status === 'active').length;
        const walkWithMeRequests = JSON.parse(localStorage.getItem('walkWithMe') || '[]').filter(w => w.active).length;

        return (
          <>
            <h2>Security Dashboard</h2>
            <div className="stats-cards">
              <div className="card">
                <h4>Total Reports</h4>
                <p>{allReports.length}</p>
              </div>
              <div className="card">
                <h4>Pending</h4>
                <p>{pendingReports}</p>
              </div>
              <div className="card">
                <h4>In Progress</h4>
                <p>{inProgressReports}</p>
              </div>
              <div className="card">
                <h4>Resolved</h4>
                <p>{resolvedReports}</p>
              </div>
              <div className="card urgent">
                <h4>Urgent</h4>
                <p>{urgentReports}</p>
              </div>
              <div className="card alert">
                <h4>Active Alerts</h4>
                <p>{activeAlerts}</p>
              </div>
              <div className="card">
                <h4>Walk With Me</h4>
                <p>{walkWithMeRequests}</p>
              </div>
            </div>
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button onClick={() => navigate('/reports')}>Monitor Reports</button>
              <button onClick={() => navigate('/map')}>Live Map</button>
              <button onClick={() => navigate('/analytics')}>Analytics</button>
              <button onClick={() => navigate('/alerts')}>Issue Alert</button>
              <button onClick={() => navigate('/chat')}>Officer Chat</button>
            </div>
            <h3>Recent Reports</h3>
            <ul>
              {allReports.slice(-5).reverse().map(r => (
                <li key={r.id}>
                  <strong>{r.type}</strong> - {r.status}
                  {r.severity === 'high' && <span style={{color: 'red'}}> (URGENT)</span>}
                  {!r.anonymous && r.reporterName && <span> - {r.reporterName}</span>}
                </li>
              ))}
            </ul>
            <h3>Active Emergency Alerts</h3>
            {activeAlerts > 0 ? (
              <ul>
                {panicAlerts.filter(a => a.status === 'active').map(a => (
                  <li key={a.id}>
                    <strong>Alert #{a.id}</strong> at {new Date(a.timestamp).toLocaleString()}
                    <button onClick={() => handleRespondToAlert(a)}>Respond</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active emergency alerts</p>
            )}
            <h3>Active Walk With Me Requests</h3>
            {walkWithMeRequests > 0 ? (
              <ul>
                {JSON.parse(localStorage.getItem('walkWithMe') || '[]').filter(w => w.active).map(w => (
                  <li key={w.id}>
                    <strong>Request #{w.id}</strong> - Student location sharing active
                    <button onClick={() => handleMonitorWalkWithMe(w)}>Monitor</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active Walk With Me requests</p>
            )}
          </>
        );
      case 'therapist':
        // Redirect to dedicated therapist dashboard
        navigate('/therapist-dashboard');
        return null;
      default:
        return <p>Role not recognized.</p>;
    }
  };

  return (
    <div className="dashboard">
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Dashboard;