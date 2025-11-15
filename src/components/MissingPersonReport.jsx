import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MissingPersonReport = () => {
  const [formData, setFormData] = useState({
    friendName: '',
    studentNumber: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    lastSeenTime: '',
    description: '',
    contactInfo: '',
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Validate on change
    validateField(name, files ? files : value);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'friendName':
        if (!value.trim()) error = 'Friend\'s name is required';
        break;
      case 'lastSeenLocation':
        if (!value.trim()) error = 'Last seen location is required';
        break;
      case 'lastSeenDate':
        if (!value) error = 'Last seen date is required';
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
    return !errors.friendName && !errors.lastSeenLocation && !errors.lastSeenDate && !errors.description &&
            formData.friendName.trim() && formData.lastSeenLocation.trim() && formData.lastSeenDate && formData.description.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

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

    // Process photo
    let photoUrl = null;
    if (formData.photo && formData.photo[0]) {
      const dataUrl = await readFileAsDataURL(formData.photo[0]);
      photoUrl = dataUrl;
    }

    const report = {
      ...formData,
      photoUrl,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
      status: 'investigating',
      createdAt: new Date().toISOString(),
      type: 'missing_person'
    };

    const reports = JSON.parse(localStorage.getItem('missingReports') || '[]');
    reports.push(report);
    localStorage.setItem('missingReports', JSON.stringify(reports));

    // Add notification
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      message: 'Missing person report has been submitted and is under investigation.',
      date: new Date().toISOString(),
      type: 'missing_report'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    alert('Missing person report submitted successfully!');
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
      <h2>Report a Friend as Missing</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Friend's Name *</label>
          <input
            type="text"
            name="friendName"
            value={formData.friendName}
            onChange={handleChange}
            required
          />
          {errors.friendName && <span style={{ color: 'red' }}>{errors.friendName}</span>}
        </div>

        <div>
          <label>Student Number (optional)</label>
          <input
            type="text"
            name="studentNumber"
            value={formData.studentNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Last Seen Location *</label>
          <input
            type="text"
            name="lastSeenLocation"
            value={formData.lastSeenLocation}
            onChange={handleChange}
            placeholder="e.g., Library, Dorm Room 205, Campus Cafe"
            required
          />
          {errors.lastSeenLocation && <span style={{ color: 'red' }}>{errors.lastSeenLocation}</span>}
        </div>

        <div>
          <label>Last Seen Date *</label>
          <input
            type="date"
            name="lastSeenDate"
            value={formData.lastSeenDate}
            onChange={handleChange}
            required
          />
          {errors.lastSeenDate && <span style={{ color: 'red' }}>{errors.lastSeenDate}</span>}
        </div>

        <div>
          <label>Last Seen Time (optional)</label>
          <input
            type="time"
            name="lastSeenTime"
            value={formData.lastSeenTime}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what your friend was wearing, their last known activities, any concerning behavior, etc."
            required
          />
          {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
        </div>

        <div>
          <label>Your Contact Information</label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="Phone number or email for follow-up"
          />
        </div>

        <div>
          <label>Photo (optional)</label>
          <input
            type="file"
            name="photo"
            onChange={handleChange}
            accept="image/*"
          />
        </div>

        <button type="submit" disabled={!isFormValid()}>Submit Missing Person Report</button>
      </form>
    </div>
  );
};

export default MissingPersonReport;