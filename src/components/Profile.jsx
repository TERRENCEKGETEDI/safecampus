import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Profile = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    discreetMode: false,
    trustedCircle: [],
    therapistId: '',
    // Therapist-specific fields
    credentials: '',
    specialization: '',
    experience: '',
    workingHours: { start: '09:00', end: '17:00' },
    availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
    sessionMode: 'both', // online, physical, both
    bio: '',
  });
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [assignedTherapist, setAssignedTherapist] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [changePassword, setChangePassword] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        discreetMode: user.discreetMode || false,
        trustedCircle: user.trustedCircle || [],
        therapistId: user.therapistId || '',
        // Therapist-specific fields
        credentials: user.credentials || '',
        specialization: user.specialization || '',
        experience: user.experience || '',
        workingHours: user.workingHours || { start: '09:00', end: '17:00' },
        availability: user.availability || { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
        sessionMode: user.sessionMode || 'both',
        bio: user.bio || '',
      });
      // Load therapists
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const therapistList = allUsers.filter(u => u.role === 'therapist');
      setTherapists(therapistList);
      if (user.role === 'student' && user.therapistId) {
        const therapist = allUsers.find(u => u.id === user.therapistId);
        setAssignedTherapist(therapist);
      }
      // Load login activity
      const activity = JSON.parse(localStorage.getItem(`loginActivity_${user.id}`) || '[]');
      setLoginActivity(activity);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUpdate = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, ...formData } : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    alert('Profile updated');
  };

  const handleChangePassword = () => {
    if (changePassword.new !== changePassword.confirm) {
      alert('New passwords do not match');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(u => u.id === user.id);
    if (currentUser.password !== changePassword.current) {
      alert('Current password is incorrect');
      return;
    }
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, password: changePassword.new } : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setChangePassword({ current: '', new: '', confirm: '' });
    alert('Password changed successfully');
  };

  const saveTrustedCircle = (newCircle) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, trustedCircle: newCircle } : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setFormData({ ...formData, trustedCircle: newCircle });
  };

  const handleAddContact = () => {
    const updatedCircle = [...formData.trustedCircle, newContact];
    saveTrustedCircle(updatedCircle);
    setNewContact({ name: '', phone: '', email: '' });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account?')) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      logout();
    }
  };

  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <h2>Profile Management</h2>
      <div>
        <h3>Update Profile</h3>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <label>
          <input
            type="checkbox"
            name="discreetMode"
            checked={formData.discreetMode}
            onChange={handleChange}
          />
          Enable Discreet Mode
        </label>
        {user.role === 'student' && (
          <div>
            <label>Assigned Therapist:</label>
            <select
              name="therapistId"
              value={formData.therapistId}
              onChange={handleChange}
            >
              <option value="">Select Therapist</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
        )}
        {user.role === 'therapist' && (
          <div className="therapist-fields">
            <h4>Professional Information</h4>
            <div>
              <label>Professional Credentials:</label>
              <input
                type="text"
                name="credentials"
                value={formData.credentials}
                onChange={handleChange}
                placeholder="e.g., Licensed Clinical Psychologist, MA"
              />
            </div>
            <div>
              <label>Specialization:</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Anxiety, Depression, Trauma"
              />
            </div>
            <div>
              <label>Years of Experience:</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Years"
              />
            </div>
            <div>
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief professional biography"
                rows="3"
              />
            </div>

            <h4>Availability & Preferences</h4>
            <div>
              <label>Working Hours:</label>
              <input
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => setFormData({...formData, workingHours: {...formData.workingHours, start: e.target.value}})}
              />
              <span> to </span>
              <input
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => setFormData({...formData, workingHours: {...formData.workingHours, end: e.target.value}})}
              />
            </div>
            <div>
              <label>Available Days:</label>
              <div className="days-checkboxes">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={formData.availability[day]}
                      onChange={(e) => setFormData({
                        ...formData,
                        availability: {...formData.availability, [day]: e.target.checked}
                      })}
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label>Preferred Session Mode:</label>
              <select
                name="sessionMode"
                value={formData.sessionMode}
                onChange={handleChange}
              >
                <option value="online">Online Only</option>
                <option value="physical">Physical Only</option>
                <option value="both">Both Online and Physical</option>
              </select>
            </div>
          </div>
        )}
        {user.role === 'admin' && (
          <div className="admin-fields">
            <h4>Administrative Information</h4>
            <p><strong>Role:</strong> System Administrator</p>
            <p><strong>Access Level:</strong> Full System Access</p>
            <p><strong>Account Created:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            <div className="admin-notice">
              <p><em>Note: As an administrator, you have access to system-wide controls and user management. All your actions are logged for audit purposes.</em></p>
            </div>
          </div>
        )}
        <button onClick={handleUpdate}>Update Profile</button>
       </div>
       <div>
         <h3>Change Password</h3>
         <input
           type="password"
           placeholder="Current Password"
           value={changePassword.current}
           onChange={(e) => setChangePassword({ ...changePassword, current: e.target.value })}
         />
         <input
           type="password"
           placeholder="New Password"
           value={changePassword.new}
           onChange={(e) => setChangePassword({ ...changePassword, new: e.target.value })}
         />
         <input
           type="password"
           placeholder="Confirm New Password"
           value={changePassword.confirm}
           onChange={(e) => setChangePassword({ ...changePassword, confirm: e.target.value })}
         />
         <button onClick={handleChangePassword}>Change Password</button>
       </div>
       <div>
        <h3>Trusted Circle</h3>
        <ul>
          {formData.trustedCircle.map((contact, index) => (
            <li key={index}>
              {contact.name} - {contact.phone}
              {user.role === 'student' && (
                <button
                  onClick={() => {
                    const updatedCircle = formData.trustedCircle.filter((_, i) => i !== index);
                    saveTrustedCircle(updatedCircle);
                  }}
                  style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        {user.role === 'student' ? (
          <>
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
            <button onClick={handleAddContact}>Add Contact</button>
          </>
        ) : (
          <p>Trusted Circle management is only available for students.</p>
        )}
      </div>
      <div>
        <h3>Account Activity</h3>
        <p>Joined: {user.created_at}</p>
        <h4>Login History</h4>
        <ul>
          {loginActivity.slice(-5).map((login, index) => (
            <li key={index}>
              <strong>Timestamp:</strong> {new Date(login.timestamp).toLocaleString()}<br/>
              <strong>IP Address:</strong> {login.ip}<br/>
              <strong>Device:</strong> {login.device}<br/>
              <strong>Location:</strong> {login.location}
            </li>
          ))}
        </ul>
        {user.role === 'student' && formData.therapistId && (
          <p>Assigned Therapist: {therapists.find(t => t.id === formData.therapistId)?.name} ({therapists.find(t => t.id === formData.therapistId)?.email})</p>
        )}
      </div>
      <button onClick={handleDeleteAccount} style={{ backgroundColor: 'red' }}>Delete Account</button>
    </div>
  );
};

export default Profile;