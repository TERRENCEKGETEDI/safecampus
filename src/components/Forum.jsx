import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', body: '', isAnonymous: false, category: 'general' });
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
    const storedComments = JSON.parse(localStorage.getItem('comments') || '[]');
    setPosts(storedPosts);
    setComments(storedComments);
  }, []);

  const handleAddPost = () => {
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
  };

  const handleAddComment = (postId) => {
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
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Body"
          value={newPost.body}
          onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
        />
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
        <button onClick={handleAddPost}>Post</button>
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
              <button onClick={() => handleAddComment(post.id)}>Comment</button>
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