import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    // Enhanced AI response
    let botResponseText = 'I\'m here to help. Please stay safe.';
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('help') || lowerInput.includes('panic')) {
      botResponseText = 'If you\'re in danger, press the panic button or contact security at 123-456-7890. You\'re not alone.';
    } else if (lowerInput.includes('report')) {
      botResponseText = 'You can submit a report anonymously. Go to the Report GBV page. Choose category, describe incident, attach media if safe.';
    } else if (lowerInput.includes('therapy') || lowerInput.includes('book')) {
      botResponseText = 'Book a therapy session from the Therapy Booking page. Select therapist, date, time, and mode (online/physical).';
    } else if (lowerInput.includes('forum')) {
      botResponseText = 'Join the community forum to connect with others. Share experiences safely.';
    } else if (lowerInput.includes('safety') || lowerInput.includes('tip')) {
      botResponseText = 'Safety tips: Walk in well-lit areas, share location with trusted contacts, avoid isolated places at night.';
    } else if (lowerInput.includes('mental') || lowerInput.includes('health')) {
      botResponseText = 'Mental health guidance: Practice self-care, talk to friends/family, seek professional help if needed. Resources available on campus.';
    } else if (lowerInput.includes('navigation') || lowerInput.includes('how')) {
      botResponseText = 'Navigate the platform: Dashboard for overview, Profile for settings, Reports for tracking incidents.';
    } else if (lowerInput.includes('emergency') || lowerInput.includes('number')) {
      botResponseText = 'Emergency numbers: Campus Security 123-456-7890, National Helpline 0800-123-456.';
    } else if (lowerInput.includes('booking') || lowerInput.includes('rule')) {
      botResponseText = 'Booking rules: Sessions can be canceled up to 24 hours before. Reschedule if needed.';
    }
    const botResponse = { text: botResponseText, sender: 'bot' };
    setMessages(prev => [...prev, botResponse]);
    setInput('');
  };

  return (
    <div>
      <h2>AI Chatbot</h2>
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chatbot;