import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { forumAPI, usersAPI } from '../services/dataService.js';

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', body: '', isAnonymous: false, category: 'general' });
  const [newComment, setNewComment] = useState({});
  const [postErrors, setPostErrors] = useState({});
  const [commentErrors, setCommentErrors] = useState({});

  const getUserName = (userId) => {
    if (!userId) return 'Anonymous';
    const user = usersAPI.getById(userId);
    return user ? user.name : 'Unknown User';
  };

  useEffect(() => {
    const storedPosts = forumAPI.getAllPosts();
    const storedComments = forumAPI.getAllComments();
    setPosts(Object.values(storedPosts));
    setComments(Object.values(storedComments));
  }, []);

  const validatePost = () => {
    const errors = {};
    if (!newPost.title.trim()) errors.title = 'Title is required';
    if (!newPost.body.trim()) errors.body = 'Body is required';
    setPostErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateComment = (postId) => {
    const body = newComment[postId] || '';
    if (!body.trim()) {
      setCommentErrors({ ...commentErrors, [postId]: 'Comment cannot be empty' });
      return false;
    }
    setCommentErrors({ ...commentErrors, [postId]: '' });
    return true;
  };

  const handleAddPost = () => {
    if (!validatePost()) return;
    const post = {
      ...newPost,
      id: Date.now().toString(),
      authorId: newPost.isAnonymous ? null : user?.id,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    forumAPI.createPost(post);
    const updatedPosts = [...posts, post];
    setPosts(updatedPosts);
    setNewPost({ title: '', body: '', isAnonymous: false, category: 'general' });
    setPostErrors({});
  };

  const handleAddComment = (postId) => {
    if (!validateComment(postId)) return;
    const comment = {
      id: Date.now().toString(),
      postId,
      authorId: user.id,
      body: newComment[postId] || '',
      createdAt: new Date().toISOString(),
    };
    forumAPI.createComment(comment);
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment({ ...newComment, [postId]: '' });
  };

  const handleLike = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      forumAPI.updatePost(postId, { likes: post.likes + 1 });
      const updatedPosts = posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
      setPosts(updatedPosts);
    }
  };

  const handleReport = (postId) => {
    alert('Post reported');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Community Forum</h2>

      {/* Create Post Section */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Share Your Thoughts</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="What's on your mind?"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
          />
          {postErrors.title && <span style={{ color: 'red', fontSize: '12px' }}>{postErrors.title}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Tell us more..."
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
            rows="3"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', resize: 'vertical' }}
          />
          {postErrors.body && <span style={{ color: 'red', fontSize: '12px' }}>{postErrors.body}</span>}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <option value="general">General</option>
            <option value="support">Support</option>
            <option value="advice">Advice</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={newPost.isAnonymous}
              onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
            />
            Post anonymously
          </label>
        </div>
        <button onClick={handleAddPost} disabled={!newPost.title.trim() || !newPost.body.trim()}
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          Post
        </button>
      </div>

      {/* Posts Feed */}
      <div>
        {posts.map(post => (
          <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#007bff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', marginRight: '10px' }}>
                {getUserName(post.authorId).charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{getUserName(post.authorId)}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '10px' }}>
                {post.category}
              </div>
            </div>

            {/* Post Content */}
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{post.title}</h4>
            <p style={{ margin: '0 0 15px 0', color: '#555', lineHeight: '1.5' }}>{post.body}</p>

            {/* Post Actions */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button onClick={() => handleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                👍 {post.likes} Likes
              </button>
              <button onClick={() => handleReport(post.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                🚩 Report
              </button>
            </div>

            {/* Comments Section */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ marginBottom: '15px' }}>
                <textarea
                  placeholder="Write a comment..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                  rows="2"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
                />
                {commentErrors[post.id] && <span style={{ color: 'red', fontSize: '12px' }}>{commentErrors[post.id]}</span>}
                <button onClick={() => handleAddComment(post.id)} disabled={! (newComment[post.id] || '').trim()}
                        style={{ marginTop: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                  Comment
                </button>
              </div>

              {/* Display Comments */}
              {comments.filter(c => c.postId === post.id).map(comment => (
                <div key={comment.id} style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '10px', borderLeft: '3px solid #007bff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ width: '25px', height: '25px', backgroundColor: '#6c757d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>
                      {getUserName(comment.authorId).charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{getUserName(comment.authorId)}</span>
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '0', color: '#555', fontSize: '14px' }}>{comment.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;