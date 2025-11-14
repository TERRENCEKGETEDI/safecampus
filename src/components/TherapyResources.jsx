import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const TherapyResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'article',
    content: '',
    tags: '',
    url: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    const allResources = JSON.parse(localStorage.getItem('therapyResources') || '[]');
    setResources(allResources);
  };

  const handleAddResource = () => {
    if (!newResource.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const resource = {
      id: Date.now().toString(),
      ...newResource,
      therapistId: user.id,
      createdAt: new Date().toISOString(),
      tags: newResource.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      views: 0
    };

    const allResources = JSON.parse(localStorage.getItem('therapyResources') || '[]');
    allResources.push(resource);
    localStorage.setItem('therapyResources', JSON.stringify(allResources));

    setResources(allResources);
    setNewResource({
      title: '',
      type: 'article',
      content: '',
      tags: '',
      url: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      const updatedResources = resources.filter(r => r.id !== resourceId);
      localStorage.setItem('therapyResources', JSON.stringify(updatedResources));
      setResources(updatedResources);
    }
  };

  const handleUpdateResource = (resourceId, updates) => {
    const updatedResources = resources.map(r =>
      r.id === resourceId ? { ...r, ...updates } : r
    );
    localStorage.setItem('therapyResources', JSON.stringify(updatedResources));
    setResources(updatedResources);
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'article': return '📖';
      case 'link': return '🔗';
      default: return '📄';
    }
  };

  return (
    <div className="therapy-resources">
      <h2>Therapy Resource Management</h2>

      <div className="resources-header">
        <button onClick={() => setShowAddForm(!showAddForm)} className="add-resource-btn">
          {showAddForm ? 'Cancel' : 'Add New Resource'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-resource-form">
          <h3>Add New Resource</h3>
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
          <div className="form-group">
            <label>Tags (comma-separated):</label>
            <input
              type="text"
              value={newResource.tags}
              onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
              placeholder="exam stress, anxiety, depression"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddResource} className="save-btn">Save Resource</button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <div className="resources-list">
        <h3>Your Resources ({resources.length})</h3>
        {resources.length === 0 ? (
          <p>No resources added yet. Click "Add New Resource" to get started.</p>
        ) : (
          <div className="resources-grid">
            {resources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-header">
                  <span className="resource-icon">{getResourceTypeIcon(resource.type)}</span>
                  <h4>{resource.title}</h4>
                  <div className="resource-actions">
                    <button onClick={() => handleDeleteResource(resource.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
                <div className="resource-content">
                  <p>{resource.content}</p>
                  {resource.url && (
                    <p><a href={resource.url} target="_blank" rel="noopener noreferrer">View Resource</a></p>
                  )}
                </div>
                <div className="resource-tags">
                  {resource.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="resource-stats">
                  <span>Views: {resource.views || 0}</span>
                  <span>Created: {new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resource-analytics">
        <h3>Resource Engagement</h3>
        <div className="analytics-summary">
          <div className="analytic-item">
            <h4>Total Resources</h4>
            <p>{resources.length}</p>
          </div>
          <div className="analytic-item">
            <h4>Total Views</h4>
            <p>{resources.reduce((sum, r) => sum + (r.views || 0), 0)}</p>
          </div>
          <div className="analytic-item">
            <h4>Most Popular Tag</h4>
            <p>
              {(() => {
                const tagCounts = {};
                resources.forEach(r => {
                  r.tags?.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                  });
                });
                const mostPopular = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
                return mostPopular ? mostPopular[0] : 'None';
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyResources;