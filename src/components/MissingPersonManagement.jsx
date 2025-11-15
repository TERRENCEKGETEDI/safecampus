import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const MissingPersonManagement = () => {
  const { user } = useAuth();
  const [missingReports, setMissingReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'security' || user?.role === 'admin') {
      const reports = JSON.parse(localStorage.getItem('missingReports') || '[]');
      setMissingReports(reports);
      setFilteredReports(reports);
    }
  }, [user]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReports(missingReports);
    } else {
      setFilteredReports(missingReports.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, missingReports]);

  const updateStatus = (reportId, newStatus) => {
    const updatedReports = missingReports.map(report =>
      report.id === reportId ? { ...report, status: newStatus } : report
    );
    setMissingReports(updatedReports);
    localStorage.setItem('missingReports', JSON.stringify(updatedReports));

    // Send notification to all users about missing person status update
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

    users.forEach(user => {
      notifications.push({
        id: Date.now().toString() + Math.random(),
        userId: user.id,
        message: `👤 Missing Person Update: ${updatedReports.find(r => r.id === reportId)?.friendName} status changed to "${newStatus}". ${newStatus === 'found' ? 'Person has been located safely.' : newStatus === 'critical' ? 'Urgent assistance required.' : 'Investigation ongoing.'}`,
        date: new Date().toISOString(),
        type: 'missing_person',
        read: false
      });
    });

    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const deleteReport = (reportId) => {
    if (user?.role !== 'admin') return;

    const updatedReports = missingReports.filter(report => report.id !== reportId);
    setMissingReports(updatedReports);
    localStorage.setItem('missingReports', JSON.stringify(updatedReports));
  };

  if (user?.role !== 'security' && user?.role !== 'admin') {
    return <div>Access denied. Security and Admin personnel only.</div>;
  }

  return (
    <div>
      <h2>Missing Person Reports</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="investigating">Investigating</option>
          <option value="found">Found</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <p>No missing person reports found.</p>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="report-card" style={{
              border: '1px solid #ccc',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '8px',
              backgroundColor: report.status === 'critical' ? '#ffebee' : '#f9f9f9'
            }}>
              <h3>{report.friendName}</h3>
              {report.studentNumber && <p><strong>Student Number:</strong> {report.studentNumber}</p>}
              <p><strong>Last Seen:</strong> {report.lastSeenLocation} on {report.lastSeenDate} {report.lastSeenTime && `at ${report.lastSeenTime}`}</p>
              <p><strong>Description:</strong> {report.description}</p>
              {report.contactInfo && <p><strong>Reporter Contact:</strong> {report.contactInfo}</p>}
              <p><strong>Status:</strong>
                <select
                  value={report.status}
                  onChange={(e) => updateStatus(report.id, e.target.value)}
                  style={{ marginLeft: '10px' }}
                >
                  <option value="investigating">Investigating</option>
                  <option value="found">Found</option>
                  <option value="critical">Critical</option>
                </select>
              </p>
              <p><strong>Reported:</strong> {new Date(report.createdAt).toLocaleString()}</p>
              {report.photoUrl && (
                <div>
                  <strong>Photo:</strong>
                  <br />
                  <img src={report.photoUrl} alt="Missing person" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                </div>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => deleteReport(report.id)}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete Report
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MissingPersonManagement;