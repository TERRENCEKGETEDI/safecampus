import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatBoxRef = useRef(null);

  const getFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    // Analyze the message for emotional distress indicators
    const distressIndicators = ['overwhelmed', 'anxious', 'scared', 'worried', 'stressed', 'depressed', 'sad', 'angry', 'confused', 'lost', 'alone'];
    const hasDistress = distressIndicators.some(word => lowerMessage.includes(word));

    // Analyze for safety concerns
    const safetyKeywords = ['danger', 'threat', 'unsafe', 'attack', 'assault', 'harassment', 'stalking', 'abuse'];
    const hasSafetyConcern = safetyKeywords.some(word => lowerMessage.includes(word));

    // Analyze for help-seeking behavior
    const helpKeywords = ['help', 'support', 'advice', 'guidance', 'talk', 'listen'];
    const seekingHelp = helpKeywords.some(word => lowerMessage.includes(word));

    if (lowerMessage.includes('help') || lowerMessage.includes('panic')) {
      return `**What I detected:** You mentioned needing help or mentioned panic, which could indicate an emergency situation.

**Why I recommend this:** Immediate action is crucial in emergency situations to ensure your safety.

**Evidence-based suggestion:** If you're in danger, press the panic button or contact security at 123-456-7890 immediately. You are not alone - help is available 24/7.`;
    } else if (lowerMessage.includes('report') || lowerMessage.includes('gbv')) {
      return `**What I detected:** You're asking about reporting, which shows awareness of safety procedures.

**Why I recommend this:** Reporting incidents allows for proper investigation and support services to be provided.

**Evidence-based suggestion:** You can submit a report anonymously through our secure system. Go to the Report GBV page, select the appropriate category from our SAPS-aligned options, describe the incident clearly, and attach any evidence if it's safe to do so.`;
    } else if (lowerMessage.includes('therapy') || lowerMessage.includes('book') || lowerMessage.includes('therapist')) {
      return `**What I detected:** You're inquiring about mental health support services.

**Why I recommend this:** Professional therapy has been shown in numerous studies (including meta-analyses in the Journal of Consulting and Clinical Psychology) to be effective for processing trauma and building coping skills.

**Evidence-based suggestion:** Book a therapy session from the Therapy Booking page. Select a therapist, preferred date and time, and choose your preferred mode (online for convenience or in-person for direct support).`;
    } else if (lowerMessage.includes('forum') || lowerMessage.includes('community')) {
      return `**What I detected:** You're looking for community connection and peer support.

**Why I recommend this:** Research from the American Psychological Association shows that connecting with others who have similar experiences can reduce feelings of isolation and provide practical coping strategies.

**Evidence-based suggestion:** Join our moderated community forum to connect with others in a safe, supportive environment. Share experiences anonymously if preferred, and access peer support while maintaining your privacy.`;
    } else if (lowerMessage.includes('safety') || lowerMessage.includes('tip') || lowerMessage.includes('secure')) {
      return `**What I detected:** You're seeking safety information and prevention strategies.

**Why I recommend this:** Safety planning is a key component of trauma-informed care, supported by research from organizations like RAINN (Rape, Abuse & Incest National Network).

**Evidence-based suggestion:** Follow these evidence-based safety tips: Walk in well-lit, populated areas, share your location with trusted contacts through our "Walk With Me" feature, avoid isolated places at night, and trust your instincts about unsafe situations.`;
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('health') || lowerMessage.includes('wellbeing')) {
      return `**What I detected:** You're asking about mental health and wellbeing, which is an important step toward self-care.

**Why I recommend this:** Mental health support is crucial for overall wellbeing, with studies showing that early intervention can prevent escalation of symptoms (World Health Organization research).

**Evidence-based suggestion:** Practice self-care through grounding techniques, talk openly with trusted friends or family, and consider professional help. Our campus has licensed therapists available, and resources like the 3-minute breathing exercise have scientific backing for reducing anxiety.`;
    } else if (hasDistress) {
      return `**What I detected:** Your message contains words indicating emotional distress or overwhelm.

**Why I recommend this:** When feeling overwhelmed, simple, evidence-based techniques can help regulate your nervous system and provide immediate relief.

**Evidence-based suggestion:** Try the 3-minute breathing technique: Inhale for 4 counts, hold for 4, exhale for 4. This diaphragmatic breathing has been scientifically proven to activate the parasympathetic nervous system and reduce stress hormones.`;
    } else if (hasSafetyConcern) {
      return `**What I detected:** Your message mentions safety concerns or potential threats.

**Why I recommend this:** Addressing safety concerns promptly can prevent escalation and ensure your wellbeing.

**Evidence-based suggestion:** Document any incidents safely, use our reporting system if appropriate, and consider speaking with a trusted adult or counselor. Remember that your safety is the top priority.`;
    } else if (seekingHelp) {
      return `**What I detected:** You're reaching out for support and guidance.

**Why I recommend this:** Seeking help is a sign of strength and self-awareness, and connecting with appropriate resources can provide the support you need.

**Evidence-based suggestion:** I'm here to listen and help connect you with the right resources. Whether it's immediate safety concerns, mental health support, or general guidance, our campus community is here to support you.`;
    } else if (lowerMessage.includes('navigation') || lowerMessage.includes('how') || lowerMessage.includes('use')) {
      return `**What I detected:** You're asking about how to use the platform effectively.

**Why I recommend this:** Understanding available tools and resources empowers you to access help when needed.

**Evidence-based suggestion:** Navigate the platform using: Dashboard for overview, Profile for settings, Reports for tracking incidents, Therapy for booking sessions, and Map for safety planning. Each section is designed for easy access to support services.`;
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('number') || lowerMessage.includes('contact')) {
      return `**What I detected:** You're seeking emergency contact information.

**Why I recommend this:** Having emergency contacts readily available is a key safety planning strategy recommended by crisis intervention experts.

**Evidence-based suggestion:** Emergency numbers: Campus Security 123-456-7890 (available 24/7), National Helpline 0800-123-456 for additional support. Keep these numbers saved in your phone for quick access.`;
    } else if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return `**What I detected:** You're initiating a conversation, which shows you're taking a positive step toward accessing support.

**Why I recommend this:** Starting conversations about safety and wellbeing helps build awareness and connection.

**Evidence-based suggestion:** Hello! Welcome to SafeCampus. I'm here to help you with safety concerns, reporting, mental health support, and campus resources. How can I assist you today?`;
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return `**What I detected:** You're expressing gratitude, which is important for maintaining positive social connections.

**Why I recommend this:** Expressing thanks helps build and maintain supportive relationships.

**Evidence-based suggestion:** You're welcome! Stay safe and don't hesitate to reach out anytime - support is always available when you need it.`;
    } else {
      return `**What I detected:** Your message doesn't match specific safety or support categories I'm trained to recognize.

**Why I recommend this:** I'm designed to provide safety-focused, evidence-based guidance for campus wellbeing.

**Evidence-based suggestion:** I'm here to help with safety concerns, reporting incidents, mental health support, therapy booking, and campus resources. Could you tell me more about what you're looking for assistance with today?`;
    }
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isStreaming) return;

    const userMessage = { sender: 'You', text: message, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Set a timeout for 5 seconds
    const timeoutId = setTimeout(() => {
      const fallbackMessage = { sender: 'AxonCare AI', text: getFallbackResponse(message), timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, fallbackMessage]);

      // Store conversation for analytics (only counts, no content)
      const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
      aiChats.push({
        userId: JSON.parse(localStorage.getItem('user') || 'null')?.id,
        timestamp: new Date().toISOString(),
        messageCount: 1 // Just count interactions, don't store content for privacy
      });
      localStorage.setItem('aiChats', JSON.stringify(aiChats));

      setIsStreaming(false);
    }, 5000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key'
        },
        body: JSON.stringify({ prompt: message })
      });

      clearTimeout(timeoutId); // Clear timeout if response received

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: 'AxonCare AI', text: data.response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMessage]);

      // Store conversation for analytics (only counts, no content)
      const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
      aiChats.push({
        userId: JSON.parse(localStorage.getItem('user') || 'null')?.id,
        timestamp: new Date().toISOString(),
        messageCount: 1 // Just count interactions, don't store content for privacy
      });
      localStorage.setItem('aiChats', JSON.stringify(aiChats));
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout on error
      // If error, the timeout will have already added the fallback
      if (!isStreaming) return; // Avoid duplicate if timeout already handled
      const errorMessage = { sender: 'AxonCare AI', text: getFallbackResponse(message), timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);

      // Store conversation for analytics even on error
      const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
      aiChats.push({
        userId: JSON.parse(localStorage.getItem('user') || 'null')?.id,
        timestamp: new Date().toISOString(),
        messageCount: 1
      });
      localStorage.setItem('aiChats', JSON.stringify(aiChats));

      console.error('Error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change (only if there are messages)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  return (
    <div style={{ padding: '10px', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={chatBoxRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          padding: '10px',
          border: '1px solid #ccc',
          marginBottom: '10px'
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: '10px 0' }}>
            <strong>{msg.sender}:</strong>
            <div style={{ marginTop: '5px', whiteSpace: 'pre-line' }}>
              {msg.text.split('**').map((part, index) =>
                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            borderRadius: '10px',
            border: '1px solid #ccc',
            resize: 'none',
            overflow: 'hidden'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming}
          style={{
            padding: '10px 20px',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '10px',
            border: '1px solid #ccc',
            cursor: isStreaming ? 'not-allowed' : 'pointer',
            marginLeft: '10px'
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
};

export default Chatbot;