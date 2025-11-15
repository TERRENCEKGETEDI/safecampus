import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    anonymous: false,
    category: '',
    severity: '',
    description: '',
    locationText: '',
    immediateHelp: false,
    suspectName: '',
    suspectPhoto: null,
    evidence: [],
    latitude: null,
    longitude: null,
    timestamp: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
    // Validate on change
    validateField(name, type === 'file' ? files : (type === 'checkbox' ? checked : value));
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'category':
        if (!value) error = 'Please select the GBV category';
        break;
      case 'severity':
        if (!value) error = 'Please select the severity level';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required';
        else if (value.trim().length < 10) error = 'Description must be at least 10 characters';
        break;
      default:
        break;
    }
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    return !errors.category && !errors.severity && !errors.description &&
            formData.category && formData.severity && formData.description.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Get GPS location
    let latitude = null;
    let longitude = null;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (error) {
      console.log('Could not get GPS location:', error);
    }

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
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
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
        <div>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select GBV Category</option>
            <option value="Rape">Rape</option>
            <option value="Sexual Assault">Sexual Assault</option>
            <option value="Attempted Sexual Offence">Attempted Sexual Offence</option>
            <option value="Contact Sexual Offence">Contact Sexual Offence</option>
            <option value="Domestic Violence">Domestic Violence</option>
            <option value="Harassment">Harassment</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span style={{ color: 'red' }}>{errors.category}</span>}
        </div>
        <div>
          <select name="severity" value={formData.severity} onChange={handleChange} required>
            <option value="">Select Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.severity && <span style={{ color: 'red' }}>{errors.severity}</span>}
        </div>
        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
        </div>
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
        <button type="submit" disabled={!isFormValid()}>Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;