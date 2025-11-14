import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const SecurityChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineOfficers, setOnlineOfficers] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const messagesEndRef = useRef(null);

  const channels = [
    { id: 'general', name: 'General', description: 'General security discussions' },
    { id: 'emergencies', name: 'Emergencies', description: 'Emergency coordination' },
    { id: 'reports', name: 'Reports', description: 'Case discussions' },
    { id: 'shifts', name: 'Shift Handover', description: 'Shift coordination' }
  ];

  useEffect(() => {
    if (user?.role === 'security') {
      // Load messages for selected channel
      const allMessages = JSON.parse(localStorage.getItem('securityChat') || '{}');
      setMessages(allMessages[selectedChannel] || []);

      // Load online officers
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const officers = users.filter(u => u.role === 'security');
      setOnlineOfficers(officers);

      // Mark user as online
      markUserOnline();
    }
  }, [user, selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markUserOnline = () => {
    const onlineUsers = JSON.parse(localStorage.getItem('onlineSecurity') || '[]');
    const updated = [...onlineUsers.filter(u => u.id !== user.id), {
      id: user.id,
      name: user.name,
      lastSeen: new Date().toISOString()
    }];
    localStorage.setItem('onlineSecurity', JSON.stringify(updated));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      channel: selectedChannel
    };

    const allMessages = JSON.parse(localStorage.getItem('securityChat') || '{}');
    if (!allMessages[selectedChannel]) {
      allMessages[selectedChannel] = [];
    }
    allMessages[selectedChannel].push(messageData);

    localStorage.setItem('securityChat', JSON.stringify(allMessages));
    setMessages(allMessages[selectedChannel]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getQuickResponses = () => [
    '10-4, responding now',
    'Need backup at location',
    'Situation under control',
    'Requesting supervisor assistance',
    'All clear',
    'Switching to channel: emergencies'
  ];

  if (user?.role !== 'security') {
    return <div>Access denied. Security personnel only.</div>;
  }

  return (
    <div className="security-chat">
      <div className="chat-sidebar">
        <h3>Security Channels</h3>
        <div className="channels-list">
          {channels.map(channel => (
            <div
              key={channel.id}
              className={`channel-item ${selectedChannel === channel.id ? 'active' : ''}`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <h4>{channel.name}</h4>
              <p>{channel.description}</p>
            </div>
          ))}
        </div>

        <div className="online-officers">
          <h3>Online Officers ({onlineOfficers.length})</h3>
          <ul>
            {onlineOfficers.map(officer => (
              <li key={officer.id} className="officer-item">
                <span className="status-dot online"></span>
                {officer.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>{channels.find(c => c.id === selectedChannel)?.name} Channel</h2>
          <div className="channel-info">
            {channels.find(c => c.id === selectedChannel)?.description}
          </div>
        </div>

        <div className="messages-container">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages in this channel yet.</p>
                <p>Start the conversation!</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message-item ${message.senderId === user.id ? 'own' : 'other'}`}
                >
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="message-input-area">
          <div className="quick-responses">
            <h4>Quick Responses:</h4>
            <div className="quick-buttons">
              {getQuickResponses().map((response, i) => (
                <button
                  key={i}
                  onClick={() => setNewMessage(response)}
                  className="quick-response-btn"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>

          <div className="message-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${selectedChannel}...`}
              rows="2"
            />
            <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="chat-info-panel">
        <div className="channel-stats">
          <h3>Channel Stats</h3>
          <div className="stat-item">
            <span>Total Messages:</span>
            <span>{messages.length}</span>
          </div>
          <div className="stat-item">
            <span>Today's Messages:</span>
            <span>{messages.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString()).length}</span>
          </div>
          <div className="stat-item">
            <span>Active Officers:</span>
            <span>{onlineOfficers.length}</span>
          </div>
        </div>

        <div className="emergency-actions">
          <h3>Emergency Actions</h3>
          <button
            className="emergency-btn"
            onClick={() => {
              setSelectedChannel('emergencies');
              setNewMessage('🚨 EMERGENCY: All units respond immediately!');
            }}
          >
            Emergency Broadcast
          </button>
          <button
            className="alert-btn"
            onClick={() => {
              setNewMessage('🔴 ALERT: Suspicious activity reported - requesting backup');
            }}
          >
            Request Backup
          </button>
          <button
            className="status-btn"
            onClick={() => {
              setNewMessage('✅ All clear - situation resolved');
            }}
          >
            All Clear
          </button>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {messages.slice(-5).reverse().map(message => (
              <div key={message.id} className="activity-item">
                <span className="activity-sender">{message.senderName}:</span>
                <span className="activity-preview">{message.content.substring(0, 30)}...</span>
                <span className="activity-time">{formatTime(message.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityChat;