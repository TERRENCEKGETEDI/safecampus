import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { reportsAPI } from '../services/dataService.js';

const ReportsManagement = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [followUpResponse, setFollowUpResponse] = useState('');

  useEffect(() => {
    const allReports = reportsAPI.getAll();
    const incidentReports = Object.values(allReports.incident_reports || {});
    const securityReports = Object.values(allReports.security_reports || {});
    const missingPersonReports = Object.values(allReports.missing_person_reports || {});

    const allReportList = [...incidentReports, ...securityReports, ...missingPersonReports];

    // Filter based on user role
    let userReports = allReportList;
    if (user.role === 'student') {
      userReports = allReportList.filter(r => r.reporterUserId === user.id || !r.reporterUserId);
    }
    setReports(userReports);
    setFilteredReports(userReports);
  }, [user]);

  useEffect(() => {
    let filtered = reports.filter(r => {
      // Handle different description field names
      const description = r.description || r.personDescription || '';
      const status = r.status || 'active';

      return description.toLowerCase().includes(search.toLowerCase()) &&
             (filter === '' || status === filter);
    });
    setFilteredReports(filtered);
  }, [search, filter, reports]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleExport = () => {
    const csvData = [
      ['ID', 'Type', 'Priority/Severity', 'Status', 'Description', 'Reported By', 'Reported At'],
      ...filteredReports.map(r => [
        r.id,
        r.type || 'Missing Person',
        r.severity || r.priority || 'N/A',
        r.status || 'active',
        (r.description || r.personDescription || '').replace(/"/g, '""'), // Escape quotes
        r.reportedBy || 'Anonymous',
        r.reportedAt ? new Date(r.reportedAt).toLocaleString() : 'N/A'
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    // Find the report to determine its type
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Determine collection path
    let collectionPath;
    if (report.category === 'harassment' || report.category === 'theft' || report.category === 'medical_emergency' || report.category === 'assault' || report.category === 'vandalism') {
      collectionPath = 'incident_reports';
    } else if (report.type === 'suspicious_activity' || report.type === 'facility_issue') {
      collectionPath = 'security_reports';
    } else if (report.personName) {
      collectionPath = 'missing_person_reports';
    } else {
      collectionPath = 'incident_reports';
    }

    reportsAPI.delete(collectionPath, reportId);

    // Update local state
    const updatedReports = reports.filter(r => r.id !== reportId);
    setReports(updatedReports);
    setFilteredReports(updatedReports);
    alert('Report deleted successfully');
  };

  const handleRespond = () => {
    if (!selectedReport || !followUpResponse.trim()) return;

    // Determine report type and update appropriate collection
    let collectionPath;
    if (selectedReport.category === 'harassment' || selectedReport.category === 'theft' || selectedReport.category === 'medical_emergency' || selectedReport.category === 'assault' || selectedReport.category === 'vandalism') {
      collectionPath = 'incident_reports';
    } else if (selectedReport.type === 'suspicious_activity' || selectedReport.type === 'facility_issue') {
      collectionPath = 'security_reports';
    } else if (selectedReport.personName) {
      // Missing person report
      collectionPath = 'missing_person_reports';
    } else {
      collectionPath = 'incident_reports'; // fallback
    }

    // Create appropriate update structure
    let updateData;
    if (selectedReport.personName) {
      // Missing person report - add to updates array
      updateData = {
        ...selectedReport,
        updates: [...(selectedReport.updates || []), {
          update: followUpResponse,
          by: user.id,
          timestamp: new Date().toISOString()
        }],
        updatedAt: new Date().toISOString()
      };
    } else {
      // Regular report - add to responses array
      updateData = {
        ...selectedReport,
        responses: [...(selectedReport.responses || []), {
          text: followUpResponse,
          date: new Date().toISOString(),
          by: user.id
        }],
        updatedAt: new Date().toISOString()
      };
    }

    reportsAPI.update(collectionPath, selectedReport.id, updateData);

    // Update local state
    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? updateData : r
    );
    setReports(updatedReports);
    setFollowUpResponse('');
    alert('Update submitted successfully');
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
              <td>{r.type || 'Missing Person'}</td>
              <td>{r.severity || r.priority || 'N/A'}</td>
              <td>{r.status || 'active'}</td>
              <td>{r.description || r.personDescription || 'N/A'}</td>
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
          <p><strong>ID:</strong> {selectedReport.id}</p>
          <p><strong>Type:</strong> {selectedReport.type || 'Missing Person'}</p>
          <p><strong>Priority/Severity:</strong> {selectedReport.severity || selectedReport.priority || 'N/A'}</p>
          <p><strong>Status:</strong> {selectedReport.status || 'active'}</p>
          <p><strong>Description:</strong> {selectedReport.description || selectedReport.personDescription || 'N/A'}</p>

          {selectedReport.personName && (
            <div>
              <h4>Missing Person Information</h4>
              <p><strong>Name:</strong> {selectedReport.personName}</p>
              <p><strong>Age:</strong> {selectedReport.personAge}</p>
              <p><strong>Last Seen:</strong> {selectedReport.lastSeen?.location?.description} at {new Date(selectedReport.lastSeen?.time).toLocaleString()}</p>
              <p><strong>Circumstances:</strong> {selectedReport.lastSeen?.circumstances}</p>
            </div>
          )}

          {selectedReport.location && (
            <div>
              <h4>Location Information</h4>
              <p><strong>Building:</strong> {selectedReport.location.building}</p>
              <p><strong>Floor:</strong> {selectedReport.location.floor}</p>
              <p><strong>Description:</strong> {selectedReport.location.description}</p>
            </div>
          )}

          {selectedReport.reportedBy && (
            <p><strong>Reported By:</strong> {selectedReport.reportedBy}</p>
          )}

          {selectedReport.reportedAt && (
            <p><strong>Reported At:</strong> {new Date(selectedReport.reportedAt).toLocaleString()}</p>
          )}

          {(selectedReport.responses || selectedReport.updates) && (
            <div>
              <h4>Updates & Communications</h4>
              <ul>
                {(selectedReport.responses || selectedReport.updates || []).map((item, i) => (
                  <li key={i}>
                    {new Date(item.date || item.timestamp).toLocaleString()}: {item.text || item.update}
                    {item.by && ` (by ${item.by})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <textarea
            placeholder="Add update or response..."
            value={followUpResponse}
            onChange={(e) => setFollowUpResponse(e.target.value)}
          />
          <button onClick={handleRespond}>Submit Update</button>
          <button onClick={() => setSelectedReport(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;