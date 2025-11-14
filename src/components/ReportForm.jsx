import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    anonymous: false,
    type: '',
    severity: '',
    description: '',
    locationText: '',
    immediateHelp: false,
    suspectName: '',
    suspectPhoto: null,
    evidence: [],
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Process files
    const evidenceUrls = [];
    if (formData.evidence && formData.evidence.length > 0) {
      for (let file of formData.evidence) {
        const dataUrl = await readFileAsDataURL(file);
        evidenceUrls.push(dataUrl);
      }
    }
    let suspectPhotoUrl = null;
    if (formData.suspectPhoto && formData.suspectPhoto[0]) {
      suspectPhotoUrl = await readFileAsDataURL(formData.suspectPhoto[0]);
    }

    const report = {
      ...formData,
      evidenceUrls,
      suspectPhotoUrl,
      id: Date.now().toString(),
      reporterUserId: formData.anonymous ? null : user?.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));
    // Add notification
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: user?.id,
      message: 'Your safety report has been submitted and is under review.',
      date: new Date().toISOString(),
      type: 'report'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    alert('Report submitted successfully!');
    navigate('/dashboard');
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <h2>Report GBV</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="checkbox"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleChange}
          />
          Submit Anonymously
        </label>
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="">Select Type</option>
          <option value="physical">Physical</option>
          <option value="sexual">Sexual</option>
          <option value="stalking">Stalking</option>
          <option value="cyber">Cyber</option>
          <option value="emotional">Emotional</option>
          <option value="other">Other</option>
        </select>
        <select name="severity" value={formData.severity} onChange={handleChange} required>
          <option value="">Select Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <input
          type="text"
          name="locationText"
          value={formData.locationText}
          onChange={handleChange}
          placeholder="Location"
        />
        <label>
          <input
            type="checkbox"
            name="immediateHelp"
            checked={formData.immediateHelp}
            onChange={handleChange}
          />
          Request Immediate Help
        </label>
        <input
          type="text"
          name="suspectName"
          value={formData.suspectName}
          onChange={handleChange}
          placeholder="Suspect Name (optional)"
        />
        <input
          type="file"
          name="suspectPhoto"
          onChange={handleChange}
          accept="image/*"
        />
        <input
          type="file"
          name="evidence"
          onChange={handleChange}
          multiple
          accept="image/*,video/*"
        />
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;