import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', body: '', isAnonymous: false, category: 'general' });
  const [newComment, setNewComment] = useState({});
  const [postErrors, setPostErrors] = useState({});
  const [commentErrors, setCommentErrors] = useState({});

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    const storedComments = JSON.parse(localStorage.getItem('comments') || '[]');
    setPosts(storedPosts);
    setComments(storedComments);
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
    const updatedPosts = [...posts, post];
    setPosts(updatedPosts);
    localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
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
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem('comments', JSON.stringify(updatedComments));
    setNewComment({ ...newComment, [postId]: '' });
  };

  const handleLike = (postId) => {
    const updatedPosts = posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
    setPosts(updatedPosts);
    localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
  };

  const handleReport = (postId) => {
    alert('Post reported');
  };

  return (
    <div>
      <h2>Community Forum</h2>
      <div>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          {postErrors.title && <span style={{ color: 'red' }}>{postErrors.title}</span>}
        </div>
        <div>
          <textarea
            placeholder="Body"
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
          />
          {postErrors.body && <span style={{ color: 'red' }}>{postErrors.body}</span>}
        </div>
        <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
          <option value="general">General</option>
          <option value="support">Support</option>
          <option value="advice">Advice</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={newPost.isAnonymous}
            onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
          />
          Anonymous
        </label>
        <button onClick={handleAddPost} disabled={!newPost.title.trim() || !newPost.body.trim()}>Post</button>
      </div>
      <div>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <small>Category: {post.category} | Likes: {post.likes} | {post.createdAt}</small>
            <button onClick={() => handleLike(post.id)}>Like</button>
            <button onClick={() => handleReport(post.id)}>Report</button>
            <div>
              <textarea
                placeholder="Add comment"
                value={newComment[post.id] || ''}
                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
              />
              {commentErrors[post.id] && <span style={{ color: 'red' }}>{commentErrors[post.id]}</span>}
              <button onClick={() => handleAddComment(post.id)} disabled={! (newComment[post.id] || '').trim()}>Comment</button>
            </div>
            <div>
              {comments.filter(c => c.postId === post.id).map(comment => (
                <div key={comment.id} style={{ marginLeft: '20px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
                  <p>{comment.body}</p>
                  <small>{comment.createdAt}</small>
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