import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usersAPI, forumAPI, therapyAPI, reportsAPI, notificationsAPI, moodAPI } from '../services/dataService.js';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [contentSubTab, setContentSubTab] = useState('forum');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    studentNumber: '',
    password: 'default123'
  });
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'article',
    category: 'general',
    content: '',
    url: ''
  });
  const [deleteReason, setDeleteReason] = useState('');
  const [therapists, setTherapists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [flaggedActivities, setFlaggedActivities] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userFilter]);

  const loadData = () => {
    const allUsers = Object.values(usersAPI.getAll());
    setUsers(allUsers);
    const therapistUsers = allUsers.filter(u => u.role === 'therapist');
    setTherapists(therapistUsers);

    const forumPosts = Object.values(forumAPI.getAllPosts());
    // Add author names to posts for display
    const postsWithAuthors = forumPosts.map(post => ({
      ...post,
      author: post.isAnonymous ? 'Anonymous' : (allUsers.find(u => u.id === post.authorId)?.name || 'Unknown User'),
      content: post.body || post.content, // Handle both body and content fields
      timestamp: post.createdAt || post.timestamp // Handle both createdAt and timestamp fields
    }));
    setPosts(postsWithAuthors);

    // Resources are not in the main data model yet, so keep using localStorage for now
    setResources(JSON.parse(localStorage.getItem('resources') || '[]'));
    setSystemSettings(JSON.parse(localStorage.getItem('systemSettings') || '{}'));
    setAuditLogs(JSON.parse(localStorage.getItem('auditLogs') || '[]'));

    // Load categories
    const allCategories = JSON.parse(localStorage.getItem('categories') || '["stress", "depression", "study", "relationships", "anxiety", "sleep", "self-esteem"]');
    setCategories(allCategories);

    // Load login attempts (mock data)
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    if (attempts.length === 0) {
      // Generate mock login attempts
      const mockAttempts = [];
      for (let i = 0; i < 20; i++) {
        mockAttempts.push({
          id: i.toString(),
          email: allUsers[Math.floor(Math.random() * allUsers.length)]?.email || 'unknown',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          success: Math.random() > 0.1,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }
      localStorage.setItem('loginAttempts', JSON.stringify(mockAttempts));
      setLoginAttempts(mockAttempts);
    } else {
      setLoginAttempts(attempts);
    }

    // Load flagged activities (mock data)
    const flagged = JSON.parse(localStorage.getItem('flaggedActivities') || '[]');
    if (flagged.length === 0) {
      const mockFlagged = [
        { id: '1', type: 'post', content: 'Inappropriate content in forum', userId: allUsers[0]?.id, timestamp: new Date().toISOString(), status: 'pending' },
        { id: '2', type: 'chat', content: 'Potential self-harm indicators', userId: allUsers[1]?.id, timestamp: new Date().toISOString(), status: 'reviewed' }
      ];
      localStorage.setItem('flaggedActivities', JSON.stringify(mockFlagged));
      setFlaggedActivities(mockFlagged);
    } else {
      setFlaggedActivities(flagged);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (userFilter !== 'all') {
      filtered = filtered.filter(u => u.role === userFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.studentNumber && u.studentNumber.includes(searchTerm))
      );
    }

    setFilteredUsers(filtered);
  };

  const logAuditAction = (action, details) => {
    const logEntry = {
      id: Date.now().toString(),
      adminId: user.id,
      adminName: user.name,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    const updatedLogs = [logEntry, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('auditLogs', JSON.stringify(updatedLogs));
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Name and email are required');
      return;
    }

    const userData = {
      ...newUser,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      suspended: false,
      isActive: true
    };

    usersAPI.create(userData);
    const updatedUsers = Object.values(usersAPI.getAll());
    setUsers(updatedUsers);

    logAuditAction('CREATE_USER', `Created user: ${userData.name} (${userData.role})`);

    setNewUser({
      name: '',
      email: '',
      role: 'student',
      studentNumber: '',
      password: 'default123'
    });
    setShowCreateUser(false);
  };

  const handleUpdateUser = (userId, updates) => {
    usersAPI.update(userId, updates);
    const updatedUsers = Object.values(usersAPI.getAll());
    setUsers(updatedUsers);

    const updatedUser = usersAPI.getById(userId);
    logAuditAction('UPDATE_USER', `Updated user: ${updatedUser.name} - ${Object.keys(updates).join(', ')}`);
  };

  const handleDeleteUser = (userId) => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    const userToDelete = usersAPI.getById(userId);
    usersAPI.delete(userId);
    const updatedUsers = Object.values(usersAPI.getAll());
    setUsers(updatedUsers);

    logAuditAction('DELETE_USER', `Deleted user: ${userToDelete.name} - Reason: ${deleteReason}`);
    setDeleteReason('');
  };

  const handleSuspendUser = (userId, suspend) => {
    handleUpdateUser(userId, { suspended: suspend });
  };

  const handleDeletePost = (postId) => {
    const post = posts.find(p => p.id === postId);
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);

    // Save back to localStorage in original format (without author and content properties)
    const originalPosts = updatedPosts.map(p => ({
      id: p.id,
      title: p.title,
      body: p.content, // Map back to body
      isAnonymous: p.isAnonymous,
      category: p.category,
      authorId: p.authorId,
      createdAt: p.timestamp, // Map back to createdAt
      likes: p.likes || 0
    }));
    localStorage.setItem('forumPosts', JSON.stringify(originalPosts));

    logAuditAction('DELETE_POST', `Deleted forum post: ${post.title}`);
  };

  const handleCreateResource = () => {
    if (!newResource.title || !newResource.content) {
      alert('Title and content are required');
      return;
    }

    const resourceData = {
      ...newResource,
      id: Date.now().toString(),
      featured: false,
      createdAt: new Date().toISOString(),
      views: 0
    };

    const updatedResources = [...resources, resourceData];
    setResources(updatedResources);
    localStorage.setItem('resources', JSON.stringify(updatedResources));

    logAuditAction('CREATE_RESOURCE', `Created resource: ${resourceData.title}`);

    setNewResource({
      title: '',
      type: 'article',
      category: 'general',
      content: '',
      url: ''
    });
    setShowCreateResource(false);
  };

  const handleFeatureResource = (resourceId, featured) => {
    const updatedResources = resources.map(r =>
      r.id === resourceId ? { ...r, featured } : r
    );
    setResources(updatedResources);
    localStorage.setItem('resources', JSON.stringify(updatedResources));

    const resource = resources.find(r => r.id === resourceId);
    logAuditAction('UPDATE_RESOURCE', `${featured ? 'Featured' : 'Unfeatured'} resource: ${resource.title}`);
  };

  const handleUpdateSystemSettings = (settings) => {
    const updatedSettings = { ...systemSettings, ...settings };
    setSystemSettings(updatedSettings);
    localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));

    logAuditAction('UPDATE_SETTINGS', `Updated system settings: ${Object.keys(settings).join(', ')}`);
  };

  const getAnalytics = () => {
    const totalUsers = users.length;
    const usersByRole = {
      student: users.filter(u => u.role === 'student').length,
      therapist: users.filter(u => u.role === 'therapist').length,
      security: users.filter(u => u.role === 'security').length,
      admin: users.filter(u => u.role === 'admin').length
    };

    const suspendedUsers = users.filter(u => u.suspended).length;
    const recentSignups = users.filter(u => {
      const signupDate = new Date(u.createdAt || u.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return signupDate > weekAgo;
    }).length;

    // Mental health specific analytics
    const appointments = Object.values(therapyAPI.getAllAppointments());
    const therapistSessions = appointments.length;

    // AI chats not in main data model yet, keep using localStorage
    const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
    const aiConversations = aiChats.length;

    // Mood entries from data service
    const moodEntries = Object.values(moodAPI.getAll()).length;

    return { totalUsers, usersByRole, suspendedUsers, recentSignups, therapistSessions, aiConversations, moodEntries };
  };

  const analytics = getAnalytics();

  if (!user || user.role !== 'admin') {
    console.log('Rendering access denied');
    return <div>Access denied. Admin privileges required.</div>;
  }

  console.log('Rendering admin dashboard');
  return (
    <div className="admin-dashboard fade-in">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p className="dashboard-subtitle">Comprehensive system management and analytics</p>
      </div>

      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
        >
          <span className="tab-icon">👥</span>
          User Management
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
        >
          <span className="tab-icon">📝</span>
          Content Moderation
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
        >
          <span className="tab-icon">⚙️</span>
          System Controls
        </button>
        <button
          onClick={() => setActiveTab('therapists')}
          className={`tab-button ${activeTab === 'therapists' ? 'active' : ''}`}
        >
          <span className="tab-icon">🩺</span>
          Therapists
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
        >
          <span className="tab-icon">🔒</span>
          Security
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
        >
          <span className="tab-icon">📋</span>
          Audit Logs
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="section-header">
            <h3>System Overview</h3>
            <p className="section-description">Real-time analytics and key performance indicators</p>
          </div>

          <div className="overview-grid">
            <div className="overview-card primary">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h4>Total Users</h4>
                <div className="metric">{analytics.totalUsers}</div>
                <span className="trend positive">+{analytics.recentSignups} this week</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">🎓</div>
              <div className="card-content">
                <h4>Students</h4>
                <div className="metric">{analytics.usersByRole.student}</div>
                <span className="percentage">{Math.round((analytics.usersByRole.student / analytics.totalUsers) * 100)}% of total</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">🩺</div>
              <div className="card-content">
                <h4>Therapists</h4>
                <div className="metric">{analytics.usersByRole.therapist}</div>
                <span className="percentage">{Math.round((analytics.usersByRole.therapist / analytics.totalUsers) * 100)}% of total</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">🛡️</div>
              <div className="card-content">
                <h4>Security Staff</h4>
                <div className="metric">{analytics.usersByRole.security}</div>
                <span className="percentage">{Math.round((analytics.usersByRole.security / analytics.totalUsers) * 100)}% of total</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <h4>Active Admins</h4>
                <div className="metric">{analytics.usersByRole.admin}</div>
                <span className="status">System operators</span>
              </div>
            </div>

            <div className="overview-card warning">
              <div className="card-icon">🚫</div>
              <div className="card-content">
                <h4>Suspended Users</h4>
                <div className="metric">{analytics.suspendedUsers}</div>
                <span className="trend negative">{analytics.suspendedUsers > 0 ? 'Requires attention' : 'All clear'}</span>
              </div>
            </div>

            <div className="overview-card success">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h4>Recent Signups</h4>
                <div className="metric">{analytics.recentSignups}</div>
                <span className="trend positive">Last 7 days</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">💬</div>
              <div className="card-content">
                <h4>Forum Activity</h4>
                <div className="metric">{posts.length}</div>
                <span className="status">Total posts</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">🩺</div>
              <div className="card-content">
                <h4>Therapy Sessions</h4>
                <div className="metric">{analytics.therapistSessions}</div>
                <span className="status">Total sessions</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">🤖</div>
              <div className="card-content">
                <h4>AI Conversations</h4>
                <div className="metric">{analytics.aiConversations}</div>
                <span className="status">Chat interactions</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h4>Mood Entries</h4>
                <div className="metric">{analytics.moodEntries}</div>
                <span className="status">Student tracking</span>
              </div>
            </div>
          </div>

          <div className="quick-actions-section">
            <h4>Quick Actions</h4>
            <div className="quick-actions-grid">
              <button className="action-btn primary" onClick={() => setActiveTab('users')}>
                <span className="btn-icon">➕</span>
                Add New User
              </button>
              <button className="action-btn secondary" onClick={() => setActiveTab('content')}>
                <span className="btn-icon">📝</span>
                Moderate Content
              </button>
              <button className="action-btn tertiary" onClick={() => setActiveTab('system')}>
                <span className="btn-icon">⚙️</span>
                System Settings
              </button>
              <button className="action-btn quaternary" onClick={() => setActiveTab('audit')}>
                <span className="btn-icon">📋</span>
                View Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="users-header">
            <h3>User Management</h3>
            <button onClick={() => setShowCreateUser(true)} className="create-user-btn">Create New User</button>
          </div>

          <div className="filters-section">
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="therapist">Therapists</option>
              <option value="security">Security</option>
              <option value="admin">Admins</option>
            </select>
            <input
              type="text"
              placeholder="Search by name, email, or student number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Student Number</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                      >
                        <option value="student">Student</option>
                        <option value="therapist">Therapist</option>
                        <option value="security">Security</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{u.studentNumber || 'N/A'}</td>
                    <td>{u.suspended ? 'Suspended' : 'Active'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleSuspendUser(u.id, !u.suspended)}
                        className={u.suspended ? 'activate-btn' : 'suspend-btn'}
                      >
                        {u.suspended ? 'Activate' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for deletion:');
                          if (reason) {
                            setDeleteReason(reason);
                            handleDeleteUser(u.id);
                          }
                        }}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showCreateUser && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowCreateUser(false)}>&times;</span>
                <h3>Create New User</h3>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="therapist">Therapist</option>
                    <option value="security">Security</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {newUser.role === 'student' && (
                  <div className="form-group">
                    <label>Student Number:</label>
                    <input
                      type="text"
                      value={newUser.studentNumber}
                      onChange={(e) => setNewUser({...newUser, studentNumber: e.target.value})}
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button onClick={handleCreateUser}>Create User</button>
                  <button onClick={() => setShowCreateUser(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="content-section">
          <h3>Content Moderation</h3>

          <div className="content-tabs">
            <button onClick={() => setContentSubTab('forum')} className={contentSubTab === 'forum' ? 'active' : ''}>Forum Posts</button>
            <button onClick={() => setContentSubTab('resources')} className={contentSubTab === 'resources' ? 'active' : ''}>Resources</button>
          </div>

          {contentSubTab === 'forum' && (
            <div className="forum-moderation">
              <h4>Forum Posts ({posts.length})</h4>
              <div className="posts-list">
                {posts.map(post => (
                  <div key={post.id} className="post-item">
                    <h5>{post.title}</h5>
                    <p>By: {post.author} | {new Date(post.timestamp).toLocaleString()}</p>
                    <p>{post.content.substring(0, 200)}...</p>
                    <div className="post-actions">
                      <button onClick={() => handleDeletePost(post.id)} className="delete-btn">Delete Post</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contentSubTab === 'resources' && (
            <div className="resources-moderation">
              <div className="resources-header">
                <h4>Educational Resources ({resources.length})</h4>
                <button onClick={() => setShowCreateResource(true)} className="create-resource-btn">Create Resource</button>
              </div>
              <div className="resources-list">
                {resources.length === 0 ? (
                  <p>No resources created yet. Click "Create Resource" to add educational content.</p>
                ) : (
                  resources.map(resource => (
                    <div key={resource.id} className="resource-item">
                      <h5>{resource.title}</h5>
                      <p>Type: {resource.type} | Category: {resource.category}</p>
                      <p>{resource.content.substring(0, 100)}...</p>
                      {resource.url && <p>URL: <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a></p>}
                      <div className="resource-actions">
                        <button
                          onClick={() => handleFeatureResource(resource.id, !resource.featured)}
                          className={resource.featured ? 'unfeature-btn' : 'feature-btn'}
                        >
                          {resource.featured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {showCreateResource && (
                <div className="modal">
                  <div className="modal-content">
                    <span className="close" onClick={() => setShowCreateResource(false)}>&times;</span>
                    <h3>Create Educational Resource</h3>
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={newResource.title}
                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        placeholder="Resource title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type:</label>
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                      >
                        <option value="article">Article</option>
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Category:</label>
                      <select
                        value={newResource.category}
                        onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                      >
                        <option value="general">General</option>
                        <option value="gbv">GBV Prevention</option>
                        <option value="mental-health">Mental Health</option>
                        <option value="campus-safety">Campus Safety</option>
                        <option value="support">Support Resources</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Content/Description:</label>
                      <textarea
                        value={newResource.content}
                        onChange={(e) => setNewResource({...newResource, content: e.target.value})}
                        placeholder="Resource description or content"
                        rows="4"
                      />
                    </div>
                    {(newResource.type === 'link' || newResource.type === 'video') && (
                      <div className="form-group">
                        <label>URL:</label>
                        <input
                          type="url"
                          value={newResource.url}
                          onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                          placeholder="https://example.com"
                        />
                      </div>
                    )}
                    <div className="form-actions">
                      <button onClick={handleCreateResource}>Create Resource</button>
                      <button onClick={() => setShowCreateResource(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'system' && (
        <div className="system-section">
          <h3>System Controls</h3>

          <div className="system-settings">
            <h4>Platform Settings</h4>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={systemSettings.emailVerification || false}
                  onChange={(e) => handleUpdateSystemSettings({ emailVerification: e.target.checked })}
                />
                Require Email Verification
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={systemSettings.anonymousReporting || true}
                  onChange={(e) => handleUpdateSystemSettings({ anonymousReporting: e.target.checked })}
                />
                Allow Anonymous Reporting
              </label>
            </div>
            <div className="setting-item">
              <label>Password Requirements:</label>
              <select
                value={systemSettings.passwordRules || 'basic'}
                onChange={(e) => handleUpdateSystemSettings({ passwordRules: e.target.value })}
              >
                <option value="basic">Basic (6+ chars)</option>
                <option value="medium">Medium (8+ chars, mixed case)</option>
                <option value="strong">Strong (12+ chars, special chars)</option>
              </select>
            </div>
          </div>

          <div className="notifications-section">
            <h4>System Notifications</h4>
            <button onClick={() => {
              const message = prompt('Notification message:');
              if (message) {
                const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                notifications.push({
                  id: Date.now().toString(),
                  message,
                  date: new Date().toISOString(),
                  type: 'system'
                });
                localStorage.setItem('notifications', JSON.stringify(notifications));
                alert('System notification sent to all users');
              }
            }}>
              Send System Notification
            </button>
          </div>
        </div>
      )}

      {activeTab === 'therapists' && (
        <div className="therapists-section">
          <h3>Therapist Management</h3>
          <div className="therapists-list">
            {therapists.map(therapist => (
              <div key={therapist.id} className="therapist-card">
                <h4>{therapist.name}</h4>
                <p>Email: {therapist.email}</p>
                <p>Specialty: {therapist.specialty || 'General'}</p>
                <div className="therapist-actions">
                  <button onClick={() => handleUpdateUser(therapist.id, { specialty: prompt('New specialty:', therapist.specialty) })}>
                    Update Specialty
                  </button>
                  <button onClick={() => handleSuspendUser(therapist.id, !therapist.suspended)}>
                    {therapist.suspended ? 'Activate' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowCreateUser(true)} className="add-therapist-btn">Add New Therapist</button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="security-section">
          <h3>Security & Monitoring</h3>

          <div className="security-tabs">
            <button onClick={() => setContentSubTab('attempts')} className={contentSubTab === 'attempts' ? 'active' : ''}>Login Attempts</button>
            <button onClick={() => setContentSubTab('flagged')} className={contentSubTab === 'flagged' ? 'active' : ''}>Flagged Activities</button>
            <button onClick={() => setContentSubTab('health')} className={contentSubTab === 'health' ? 'active' : ''}>System Health</button>
          </div>

          {contentSubTab === 'attempts' && (
            <div className="login-attempts">
              <h4>Recent Login Attempts</h4>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Timestamp</th>
                    <th>Success</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {loginAttempts.slice(0, 20).map(attempt => (
                    <tr key={attempt.id}>
                      <td>{attempt.email}</td>
                      <td>{new Date(attempt.timestamp).toLocaleString()}</td>
                      <td>{attempt.success ? '✅' : '❌'}</td>
                      <td>{attempt.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {contentSubTab === 'flagged' && (
            <div className="flagged-activities">
              <h4>Flagged Activities</h4>
              {flaggedActivities.map(activity => (
                <div key={activity.id} className="flagged-item">
                  <h5>{activity.type.toUpperCase()}: {activity.content}</h5>
                  <p>User: {users.find(u => u.id === activity.userId)?.name}</p>
                  <p>Time: {new Date(activity.timestamp).toLocaleString()}</p>
                  <p>Status: {activity.status}</p>
                  <button onClick={() => {
                    const updated = flaggedActivities.map(a =>
                      a.id === activity.id ? { ...a, status: 'reviewed' } : a
                    );
                    setFlaggedActivities(updated);
                    localStorage.setItem('flaggedActivities', JSON.stringify(updated));
                  }}>
                    Mark as Reviewed
                  </button>
                </div>
              ))}
            </div>
          )}

          {contentSubTab === 'health' && (
            <div className="system-health">
              <h4>System Health Dashboard</h4>
              <div className="health-metrics">
                <div className="metric">
                  <h5>Server Status</h5>
                  <span className="status healthy">🟢 Online</span>
                </div>
                <div className="metric">
                  <h5>Database</h5>
                  <span className="status healthy">🟢 Connected</span>
                </div>
                <div className="metric">
                  <h5>API Response Time</h5>
                  <span>245ms</span>
                </div>
                <div className="metric">
                  <h5>Active Sessions</h5>
                  <span>{users.filter(u => !u.suspended).length}</span>
                </div>
                <div className="metric">
                  <h5>Failed Logins (24h)</h5>
                  <span>{loginAttempts.filter(a => !a.success && new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}</span>
                </div>
              </div>
              <button onClick={() => alert('System backup initiated (mock)')}>Backup System Data</button>
              <button onClick={() => {
                const report = {
                  timestamp: new Date().toISOString(),
                  totalUsers: users.length,
                  activeUsers: users.filter(u => !u.suspended).length,
                  loginAttempts: loginAttempts.length,
                  flaggedActivities: flaggedActivities.length
                };
                const dataStr = JSON.stringify(report, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = 'activity_report.json';
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}>Download Activity Report</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="audit-section">
          <h3>Audit Logs</h3>
          <div className="audit-logs">
            {auditLogs.slice(0, 50).map(log => (
              <div key={log.id} className="audit-entry">
                <div className="audit-header">
                  <strong>{log.action}</strong> by {log.adminName} at {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="audit-details">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;