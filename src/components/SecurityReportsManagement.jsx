import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const SecurityReportsManagement = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    urgency: '',
    anonymous: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [internalNote, setInternalNote] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    if (user?.role === 'security') {
      const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
      setReports(allReports);
      setFilteredReports(allReports);
    }
  }, [user]);

  useEffect(() => {
    let filtered = reports.filter(report => {
      const matchesStatus = !filters.status || report.status === filters.status;
      const matchesType = !filters.type || report.type === filters.type;
      const matchesUrgency = !filters.urgency || report.severity === filters.urgency;
      const matchesAnonymous = filters.anonymous === '' || (filters.anonymous === 'anonymous' ? report.anonymous : !report.anonymous);
      const matchesLocation = !filters.location || report.location?.includes(filters.location);
      const matchesDateFrom = !filters.dateFrom || new Date(report.timestamp) >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || new Date(report.timestamp) <= new Date(filters.dateTo);
      const matchesSearch = !filters.search ||
        report.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        (report.reporterName && report.reporterName.toLowerCase().includes(filters.search.toLowerCase())) ||
        report.id.toString().includes(filters.search);

      return matchesStatus && matchesType && matchesUrgency && matchesAnonymous &&
             matchesLocation && matchesDateFrom && matchesDateTo && matchesSearch;
    });
    setFilteredReports(filtered);
  }, [filters, reports]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setInternalNote('');
    setFollowUpQuestion('');
    setNewStatus(report.status);
  };

  const handleStatusUpdate = () => {
    if (!selectedReport || !newStatus) return;

    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? { ...r, status: newStatus, lastUpdated: new Date().toISOString() } : r
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    setSelectedReport({ ...selectedReport, status: newStatus });
    alert('Report status updated successfully');
  };

  const handleAddInternalNote = () => {
    if (!selectedReport || !internalNote.trim()) return;

    const note = {
      id: Date.now().toString(),
      text: internalNote,
      author: user.name,
      timestamp: new Date().toISOString(),
      type: 'internal'
    };

    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? {
        ...r,
        internalNotes: [...(r.internalNotes || []), note]
      } : r
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    setSelectedReport({ ...selectedReport, internalNotes: [...(selectedReport.internalNotes || []), note] });
    setInternalNote('');
    alert('Internal note added');
  };

  const handleSendFollowUp = () => {
    if (!selectedReport || !followUpQuestion.trim() || selectedReport.anonymous) return;

    const question = {
      id: Date.now().toString(),
      text: followUpQuestion,
      author: user.name,
      timestamp: new Date().toISOString(),
      type: 'followup'
    };

    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? {
        ...r,
        followUps: [...(r.followUps || []), question]
      } : r
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    setSelectedReport({ ...selectedReport, followUps: [...(selectedReport.followUps || []), question] });
    setFollowUpQuestion('');

    // Send notification to student
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: selectedReport.reporterUserId,
      message: `Security has sent a follow-up question regarding your report #${selectedReport.id}`,
      date: new Date().toISOString(),
      type: 'followup'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    alert('Follow-up question sent to student');
  };

  const handleAssignToOfficer = (officerId) => {
    // Mock officer assignment - in real app, would have officer list
    const updatedReports = reports.map(r =>
      r.id === selectedReport.id ? { ...r, assignedOfficer: officerId } : r
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    setSelectedReport({ ...selectedReport, assignedOfficer: officerId });
    alert('Case assigned to officer');
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Type', 'Severity', 'Status', 'Anonymous', 'Reporter', 'Location', 'Date', 'Description'],
      ...filteredReports.map(r => [
        r.id,
        r.type,
        r.severity,
        r.status,
        r.anonymous ? 'Yes' : 'No',
        r.anonymous ? 'Anonymous' : (r.reporterName || 'Unknown'),
        r.location || 'N/A',
        new Date(r.timestamp).toLocaleDateString(),
        r.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports_export.csv';
    a.click();
  };

  if (user?.role !== 'security') {
    return <div>Access denied. Security personnel only.</div>;
  }

  return (
    <div className="security-reports">
      <h2>Incident Reports Management</h2>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarm</option>
            <option value="duplicate">Duplicate</option>
          </select>

          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">All Types</option>
            <option value="harassment">Harassment</option>
            <option value="assault">Assault</option>
            <option value="stalking">Stalking</option>
            <option value="threat">Threat</option>
            <option value="other">Other</option>
          </select>

          <select value={filters.urgency} onChange={(e) => setFilters({...filters, urgency: e.target.value})}>
            <option value="">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select value={filters.anonymous} onChange={(e) => setFilters({...filters, anonymous: e.target.value})}>
            <option value="">All Reports</option>
            <option value="anonymous">Anonymous</option>
            <option value="identified">Identified</option>
          </select>

          <input
            type="text"
            placeholder="Location zone..."
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />

          <input
            type="date"
            placeholder="From date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          />

          <input
            type="date"
            placeholder="To date"
            value={filters.dateTo}
            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          />

          <input
            type="text"
            placeholder="Search reports..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />

          <button onClick={handleExport}>Export to CSV</button>
        </div>
      </div>

      <div className="reports-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Anonymous</th>
              <th>Reporter</th>
              <th>Location</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(r => (
              <tr key={r.id} className={r.severity === 'high' ? 'urgent' : ''}>
                <td>{r.id}</td>
                <td>{r.type}</td>
                <td>{r.severity}</td>
                <td>{r.status}</td>
                <td>{r.anonymous ? 'Yes' : 'No'}</td>
                <td>{r.anonymous ? 'Anonymous' : (r.reporterName || 'Unknown')}</td>
                <td>{r.location || 'N/A'}</td>
                <td>{new Date(r.timestamp).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleViewDetails(r)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="report-details-modal">
          <h3>Report Details - ID: {selectedReport.id}</h3>

          <div className="report-info">
            <p><strong>Type:</strong> {selectedReport.type}</p>
            <p><strong>Severity:</strong> {selectedReport.severity}</p>
            <p><strong>Status:</strong> {selectedReport.status}</p>
            <p><strong>Anonymous:</strong> {selectedReport.anonymous ? 'Yes' : 'No'}</p>
            {!selectedReport.anonymous && (
              <p><strong>Reporter:</strong> {selectedReport.reporterName} ({selectedReport.studentNumber})</p>
            )}
            <p><strong>Location:</strong> {selectedReport.location || 'Not specified'}</p>
            <p><strong>Description:</strong> {selectedReport.description}</p>
            {selectedReport.suspectDetails && (
              <p><strong>Suspect Details:</strong> {selectedReport.suspectDetails}</p>
            )}
            {selectedReport.media && selectedReport.media.length > 0 && (
              <div>
                <strong>Attached Media:</strong>
                <ul>
                  {selectedReport.media.map((m, i) => (
                    <li key={i}>{m.type}: {m.filename}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="report-actions">
            <h4>Update Status</h4>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="false_alarm">False Alarm</option>
              <option value="duplicate">Duplicate</option>
            </select>
            <button onClick={handleStatusUpdate}>Update Status</button>
          </div>

          <div className="internal-notes">
            <h4>Internal Notes</h4>
            <textarea
              placeholder="Add internal note (not visible to student)..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
            <button onClick={handleAddInternalNote}>Add Note</button>

            {selectedReport.internalNotes && selectedReport.internalNotes.length > 0 && (
              <div className="notes-list">
                <h5>Previous Notes</h5>
                <ul>
                  {selectedReport.internalNotes.map(note => (
                    <li key={note.id}>
                      <strong>{note.author}</strong> ({new Date(note.timestamp).toLocaleString()}): {note.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!selectedReport.anonymous && (
            <div className="follow-up">
              <h4>Send Follow-up Question</h4>
              <textarea
                placeholder="Ask follow-up question to student..."
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
              />
              <button onClick={handleSendFollowUp}>Send Question</button>

              {selectedReport.followUps && selectedReport.followUps.length > 0 && (
                <div className="followups-list">
                  <h5>Follow-up History</h5>
                  <ul>
                    {selectedReport.followUps.map(fu => (
                      <li key={fu.id}>
                        <strong>{fu.author}</strong> ({new Date(fu.timestamp).toLocaleString()}): {fu.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="case-assignment">
            <h4>Case Assignment</h4>
            <button onClick={() => handleAssignToOfficer('officer1')}>Assign to Officer</button>
            {selectedReport.assignedOfficer && (
              <p>Assigned to: {selectedReport.assignedOfficer}</p>
            )}
          </div>

          <button onClick={() => setSelectedReport(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default SecurityReportsManagement;