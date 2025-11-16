import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const SelfHelpLibrary = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedArticles, setSavedArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📚' },
    { id: 'stress', name: 'Stress Management', icon: '😰' },
    { id: 'depression', name: 'Depression', icon: '😢' },
    { id: 'study', name: 'Study Pressure', icon: '📖' },
    { id: 'relationships', name: 'Relationships', icon: '💕' },
    { id: 'anxiety', name: 'Anxiety', icon: '😨' },
    { id: 'sleep', name: 'Sleep Issues', icon: '😴' },
    { id: 'self-esteem', name: 'Self-Esteem', icon: '🌟' }
  ];

  const articles = [
    {
      id: 1,
      title: '10 Breathing Techniques for Instant Stress Relief',
      category: 'stress',
      content: 'Deep breathing exercises can activate your body\'s relaxation response...',
      aiGenerated: true,
      techniques: ['4-7-8 Breathing', 'Box Breathing', 'Diaphragmatic Breathing']
    },
    {
      id: 2,
      title: 'Understanding and Managing Depression Symptoms',
      category: 'depression',
      content: 'Depression affects millions. Here are evidence-based strategies...',
      aiGenerated: true,
      techniques: ['Cognitive Behavioral Techniques', 'Exercise', 'Social Support']
    },
    {
      id: 3,
      title: 'Balancing Study and Mental Health',
      category: 'study',
      content: 'Academic pressure is real. Learn to manage your time effectively...',
      aiGenerated: true,
      techniques: ['Pomodoro Technique', 'Active Recall', 'Mindfulness Breaks']
    },
    {
      id: 4,
      title: 'Building Healthy Relationships on Campus',
      category: 'relationships',
      content: 'College relationships can be complex. Here\'s how to navigate them...',
      aiGenerated: true,
      techniques: ['Communication Skills', 'Boundary Setting', 'Conflict Resolution']
    },
    {
      id: 5,
      title: 'Overcoming Test Anxiety',
      category: 'anxiety',
      content: 'Test anxiety is common but manageable. Try these proven methods...',
      aiGenerated: true,
      techniques: ['Visualization', 'Positive Self-Talk', 'Preparation Strategies']
    },
    {
      id: 6,
      title: 'Improving Sleep Quality for Better Mental Health',
      category: 'sleep',
      content: 'Good sleep is crucial for mental wellness. Here are sleep hygiene tips...',
      aiGenerated: true,
      techniques: ['Sleep Schedule', 'Relaxation Routines', 'Environment Optimization']
    },
    {
      id: 7,
      title: 'Building Self-Confidence and Self-Esteem',
      category: 'self-esteem',
      content: 'Self-esteem affects every aspect of life. Learn to cultivate it...',
      aiGenerated: true,
      techniques: ['Positive Affirmations', 'Achievement Tracking', 'Self-Compassion']
    }
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`savedArticles_${user.id}`) || '[]');
    setSavedArticles(saved);
  }, [user.id]);

  const toggleSaveArticle = (articleId) => {
    let updatedSaved;
    if (savedArticles.includes(articleId)) {
      updatedSaved = savedArticles.filter(id => id !== articleId);
    } else {
      updatedSaved = [...savedArticles, articleId];
    }
    setSavedArticles(updatedSaved);
    localStorage.setItem(`savedArticles_${user.id}`, JSON.stringify(updatedSaved));
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="self-help-library">
      <h2>Self-Help Library</h2>
      <p>Discover AI-generated coping techniques and mental health resources tailored for students.</p>

      <div className="library-controls">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      <div className="articles-list">
        {filteredArticles.map(article => (
          <div key={article.id} className="article-card">
            <div className="article-header">
              <h3>{article.title}</h3>
              <button
                className={`save-btn ${savedArticles.includes(article.id) ? 'saved' : ''}`}
                onClick={() => toggleSaveArticle(article.id)}
              >
                {savedArticles.includes(article.id) ? '❤️' : '🤍'}
              </button>
            </div>
            <p className="article-content">{article.content}</p>
            <div className="article-techniques">
              <h4>AI-Recommended Techniques:</h4>
              <ul>
                {article.techniques.map((technique, index) => (
                  <li key={index}>{technique}</li>
                ))}
              </ul>
            </div>
            {article.aiGenerated && (
              <span className="ai-badge">🤖 AI-Generated</span>
            )}
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <p className="no-results">No articles found matching your criteria.</p>
      )}

      <div className="library-stats">
        <h3>Your Reading Progress</h3>
        <p>Saved Articles: {savedArticles.length}</p>
        <p>Categories Explored: {new Set(articles.filter(a => savedArticles.includes(a.id)).map(a => a.category)).size}</p>
      </div>
    </div>
  );
};

export default SelfHelpLibrary;