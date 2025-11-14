import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const ReportsManagement = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [followUpResponse, setFollowUpResponse] = useState('');

  useEffect(() => {
    const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
    // Filter based on user role
    let userReports = allReports;
    if (user.role === 'student') {
      userReports = allReports.filter(r => r.reporterUserId === user.id || !r.reporterUserId);
    }
    setReports(userReports);
    setFilteredReports(userReports);
  }, [user]);

  useEffect(() => {
    let filtered = reports.filter(r =>
      r.description.toLowerCase().includes(search.toLowerCase()) &&
      (filter === '' || r.status === filter)
    );
    setFilteredReports(filtered);
  }, [search, filter, reports]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleRespond = () => {
    if (!selectedReport || !followUpResponse.trim()) return;
    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? { ...r, responses: [...(r.responses || []), { text: followUpResponse, date: new Date().toISOString() }] } : r
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    setFollowUpResponse('');
    alert('Response submitted');
  };

  return (
    <div>
      <h2>{user.role === 'student' ? 'My Reports' : 'Reports Management'}</h2>
      <div>
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        {user.role !== 'student' && <button onClick={handleExport}>Export to CSV</button>}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.type}</td>
              <td>{r.severity}</td>
              <td>{r.status}</td>
              <td>{r.description}</td>
              <td>
                <button onClick={() => handleViewDetails(r)}>View Details</button>
                {user.role !== 'student' && <button onClick={() => handleDelete(r.id)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedReport && (
        <div>
          <h3>Report Details</h3>
          <p><strong>Type:</strong> {selectedReport.type}</p>
          <p><strong>Severity:</strong> {selectedReport.severity}</p>
          <p><strong>Status:</strong> {selectedReport.status}</p>
          <p><strong>Description:</strong> {selectedReport.description}</p>
          {selectedReport.responses && selectedReport.responses.length > 0 && (
            <div>
              <h4>Follow-up Communications</h4>
              <ul>
                {selectedReport.responses.map((resp, i) => (
                  <li key={i}>{new Date(resp.date).toLocaleString()}: {resp.text}</li>
                ))}
              </ul>
            </div>
          )}
          <textarea
            placeholder="Respond to follow-up..."
            value={followUpResponse}
            onChange={(e) => setFollowUpResponse(e.target.value)}
          />
          <button onClick={handleRespond}>Submit Response</button>
          <button onClick={() => setSelectedReport(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;