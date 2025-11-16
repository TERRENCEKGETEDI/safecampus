import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  const detectKeywords = (message) => {
    const lowerMessage = message.toLowerCase();
    const keywords = [];
    if (['therapy', 'book', 'therapist', 'counseling', 'session', 'appointment', 'schedule'].some(w => lowerMessage.includes(w))) keywords.push('therapy');
    if (['report', 'gbv', 'incident', 'complaint', 'missing', 'person'].some(w => lowerMessage.includes(w))) keywords.push('report');
    if (['password', 'reset', 'login', 'forgot', 'change'].some(w => lowerMessage.includes(w))) keywords.push('password');
    if (['profile', 'account', 'settings', 'update', 'info'].some(w => lowerMessage.includes(w))) keywords.push('profile');
    if (['forum', 'community', 'peer', 'share', 'discuss'].some(w => lowerMessage.includes(w))) keywords.push('forum');
    if (['map', 'location', 'find', 'store', 'directions', 'navigate'].some(w => lowerMessage.includes(w))) keywords.push('map');
    if (['help center', 'faq', 'questions', 'guide', 'tutorial'].some(w => lowerMessage.includes(w))) keywords.push('help');
    if (['safety', 'tip', 'secure', 'danger', 'threat'].some(w => lowerMessage.includes(w))) keywords.push('safety');
    if (['mental', 'health', 'wellbeing', 'anxious', 'stressed'].some(w => lowerMessage.includes(w))) keywords.push('mental_health');
    return keywords;
  };

  const getUserHistory = () => {
    const userId = JSON.parse(localStorage.getItem('user') || 'null')?.id;
    if (!userId) return {};
    const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
    const userChats = aiChats.filter(chat => chat.userId === userId);
    const history = {};
    userChats.forEach(chat => {
      if (chat.keywords) {
        chat.keywords.forEach(kw => {
          history[kw] = (history[kw] || 0) + 1;
        });
      }
    });
    return history;
  };

  const startTyping = (fullContent) => {
    setIsTyping(true);
    setTypingText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullContent.text.length) {
        setTypingText(prev => prev + fullContent.text[index]);
        index++;
        // Autoscroll to bottom during typing
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
        const botMessage = { sender: 'AxonCare AI', content: fullContent, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, botMessage]);
      }
    }, 25);
  };

  const getFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    const history = getUserHistory();

    // Analyze the message for emotional distress indicators
    const distressIndicators = ['overwhelmed', 'anxious', 'scared', 'worried', 'stressed', 'depressed', 'sad', 'angry', 'confused', 'lost', 'alone'];
    const hasDistress = distressIndicators.some(word => lowerMessage.includes(word));

    // Analyze for safety concerns
    const safetyKeywords = ['danger', 'threat', 'unsafe', 'attack', 'assault', 'harassment', 'stalking', 'abuse'];
    const hasSafetyConcern = safetyKeywords.some(word => lowerMessage.includes(word));

    // Analyze for help-seeking behavior
    const helpKeywords = ['help', 'support', 'advice', 'guidance', 'talk', 'listen'];
    const seekingHelp = helpKeywords.some(word => lowerMessage.includes(word));

    // Keywords for therapy booking
    const therapyKeywords = ['therapy', 'book', 'therapist', 'counseling', 'session', 'appointment', 'schedule'];
    const hasTherapy = therapyKeywords.some(word => lowerMessage.includes(word));

    // Keywords for reporting
    const reportKeywords = ['report', 'gbv', 'incident', 'complaint', 'missing', 'person'];
    const hasReport = reportKeywords.some(word => lowerMessage.includes(word));

    // Keywords for password reset
    const passwordKeywords = ['password', 'reset', 'login', 'forgot', 'change'];
    const hasPassword = passwordKeywords.some(word => lowerMessage.includes(word));

    // Keywords for profile
    const profileKeywords = ['profile', 'account', 'settings', 'update', 'info'];
    const hasProfile = profileKeywords.some(word => lowerMessage.includes(word));

    // Keywords for forum
    const forumKeywords = ['forum', 'community', 'peer', 'share', 'discuss'];
    const hasForum = forumKeywords.some(word => lowerMessage.includes(word));

    // Keywords for map/store locator
    const mapKeywords = ['map', 'location', 'find', 'store', 'directions', 'navigate'];
    const hasMap = mapKeywords.some(word => lowerMessage.includes(word));

    // Keywords for help center
    const helpCenterKeywords = ['help center', 'faq', 'questions', 'guide', 'tutorial'];
    const hasHelpCenter = helpCenterKeywords.some(word => lowerMessage.includes(word));

    if (lowerMessage.includes('help') || lowerMessage.includes('panic')) {
      return {
        text: `**What I detected:** You mentioned needing help or mentioned panic, which could indicate an emergency situation.

**Why I recommend this:** Immediate action is crucial in emergency situations to ensure your safety.

**Evidence-based suggestion:** If you're in danger, press the panic button or contact security at 123-456-7890 immediately. You are not alone - help is available 24/7.`,
        buttons: []
      };
    } else if (hasReport) {
      return {
        text: `**What I detected:** You're asking about reporting, which shows awareness of safety procedures.

**Why I recommend this:** Reporting incidents allows for proper investigation and support services to be provided.

**Evidence-based suggestion:** You can submit a report anonymously through our secure system. Select the appropriate category from our SAPS-aligned options, describe the incident clearly, and attach any evidence if it's safe to do so.`,
        buttons: [
          { label: 'Report Incident', route: '/report' },
          { label: 'Report Missing Person', route: '/missing-report' },
          { label: 'Track Reports', route: '/reports' }
        ]
      };
    } else if (hasTherapy) {
      return {
        text: `**What I detected:** You're inquiring about mental health support services.

**Why I recommend this:** Professional therapy has been shown in numerous studies (including meta-analyses in the Journal of Consulting and Clinical Psychology) to be effective for processing trauma and building coping skills.

**Evidence-based suggestion:** Book a therapy session from the Therapy Booking page. Select a therapist, preferred date and time, and choose your preferred mode (online for convenience or in-person for direct support).`,
        buttons: [
          { label: 'Book Therapy', route: '/therapy' },
          { label: 'View Resources', route: '/therapy-resources' }
        ]
      };
    } else if (hasPassword) {
      return {
        text: `**What I detected:** You're having trouble with your account access.

**Why I recommend this:** Secure account management is essential for protecting your personal information and ensuring continued access to support services.

**Evidence-based suggestion:** Use our secure password reset feature to regain access to your account. Follow the prompts to verify your identity and set a new password.`,
        buttons: [
          { label: 'Reset Password', route: '/profile' }, // Assuming profile has password reset
          { label: 'Contact Support', route: '/help' }
        ]
      };
    } else if (hasProfile) {
      return {
        text: `**What I detected:** You're interested in managing your account settings.

**Why I recommend this:** Keeping your profile up to date ensures you receive personalized support and notifications.

**Evidence-based suggestion:** Update your profile information, manage notifications, and adjust privacy settings as needed.`,
        buttons: [
          { label: 'View Profile', route: '/profile' }
        ]
      };
    } else if (hasForum) {
      return {
        text: `**What I detected:** You're looking for community connection and peer support.

**Why I recommend this:** Research from the American Psychological Association shows that connecting with others who have similar experiences can reduce feelings of isolation and provide practical coping strategies.

**Evidence-based suggestion:** Join our moderated community forum to connect with others in a safe, supportive environment. Share experiences anonymously if preferred, and access peer support while maintaining your privacy.`,
        buttons: [
          { label: 'Join Forum', route: '/forum' }
        ]
      };
    } else if (lowerMessage.includes('safety') || lowerMessage.includes('tip') || lowerMessage.includes('secure')) {
      return {
        text: `**What I detected:** You're seeking safety information and prevention strategies.

**Why I recommend this:** Safety planning is a key component of trauma-informed care, supported by research from organizations like RAINN (Rape, Abuse & Incest National Network).

**Evidence-based suggestion:** Follow these evidence-based safety tips: Walk in well-lit, populated areas, share your location with trusted contacts through our "Walk With Me" feature, avoid isolated places at night, and trust your instincts about unsafe situations.`,
        buttons: [
          { label: 'View Map', route: '/map' },
          { label: 'Safety Alerts', route: '/alerts' }
        ]
      };
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('health') || lowerMessage.includes('wellbeing')) {
      return {
        text: `**What I detected:** You're asking about mental health and wellbeing, which is an important step toward self-care.

**Why I recommend this:** Mental health support is crucial for overall wellbeing, with studies showing that early intervention can prevent escalation of symptoms (World Health Organization research).

**Evidence-based suggestion:** Practice self-care through grounding techniques, talk openly with trusted friends or family, and consider professional help. Our campus has licensed therapists available, and resources like the 3-minute breathing exercise have scientific backing for reducing anxiety.`,
        buttons: [
          { label: 'Book Therapy', route: '/therapy' },
          { label: 'View Resources', route: '/therapy-resources' }
        ]
      };
    } else if (hasDistress) {
      return {
        text: `**What I detected:** Your message contains words indicating emotional distress or overwhelm.

**Why I recommend this:** When feeling overwhelmed, simple, evidence-based techniques can help regulate your nervous system and provide immediate relief.

**Evidence-based suggestion:** Try the 3-minute breathing technique: Inhale for 4 counts, hold for 4, exhale for 4. This diaphragmatic breathing has been scientifically proven to activate the parasympathetic nervous system and reduce stress hormones.`,
        buttons: [
          { label: 'Book Therapy', route: '/therapy' },
          { label: 'Join Forum', route: '/forum' }
        ]
      };
    } else if (hasSafetyConcern) {
      return {
        text: `**What I detected:** Your message mentions safety concerns or potential threats.

**Why I recommend this:** Addressing safety concerns promptly can prevent escalation and ensure your wellbeing.

**Evidence-based suggestion:** Document any incidents safely, use our reporting system if appropriate, and consider speaking with a trusted adult or counselor. Remember that your safety is the top priority.`,
        buttons: [
          { label: 'Report Incident', route: '/report' },
          { label: 'Emergency Contacts', route: '/help' }
        ]
      };
    } else if (seekingHelp) {
      return {
        text: `**What I detected:** You're reaching out for support and guidance.

**Why I recommend this:** Seeking help is a sign of strength and self-awareness, and connecting with appropriate resources can provide the support you need.

**Evidence-based suggestion:** I'm here to listen and help connect you with the right resources. Whether it's immediate safety concerns, mental health support, or general guidance, our campus community is here to support you.`,
        buttons: [
          { label: 'Get Help', route: '/help' },
          { label: 'Book Therapy', route: '/therapy' }
        ]
      };
    } else if (lowerMessage.includes('navigation') || lowerMessage.includes('how') || lowerMessage.includes('use')) {
      return {
        text: `**What I detected:** You're asking about how to use the platform effectively.

**Why I recommend this:** Understanding available tools and resources empowers you to access help when needed.

**Evidence-based suggestion:** Navigate the platform using: Dashboard for overview, Profile for settings, Reports for tracking incidents, Therapy for booking sessions, and Map for safety planning. Each section is designed for easy access to support services.`,
        buttons: [
          { label: 'Dashboard', route: '/dashboard' },
          { label: 'Help Center', route: '/help' }
        ]
      };
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('number') || lowerMessage.includes('contact')) {
      return {
        text: `**What I detected:** You're seeking emergency contact information.

**Why I recommend this:** Having emergency contacts readily available is a key safety planning strategy recommended by crisis intervention experts.

**Evidence-based suggestion:** Emergency numbers: Campus Security 123-456-7890 (available 24/7), National Helpline 0800-123-456 for additional support. Keep these numbers saved in your phone for quick access.`,
        buttons: [
          { label: 'View Map', route: '/map' },
          { label: 'Safety Alerts', route: '/alerts' }
        ]
      };
    } else if (hasMap) {
      return {
        text: `**What I detected:** You're looking for location-based services or navigation assistance.

**Why I recommend this:** Knowing your surroundings and having access to maps can enhance personal safety and help you find resources quickly.

**Evidence-based suggestion:** Use our interactive campus map to locate safe routes, find nearby resources, and get directions to important locations.`,
        buttons: [
          { label: 'View Campus Map', route: '/map' }
        ]
      };
    } else if (hasHelpCenter) {
      return {
        text: `**What I detected:** You're seeking information or guidance from our help resources.

**Why I recommend this:** Accessing FAQs and guides can provide quick answers and help you navigate the platform more effectively.

**Evidence-based suggestion:** Browse our comprehensive help center for FAQs, tutorials, and contact information.`,
        buttons: [
          { label: 'Help Center', route: '/help' }
        ]
      };
    } else if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      const personalizedButtons = [
        { label: 'Book Therapy', route: '/therapy' },
        { label: 'Report Incident', route: '/report' },
        { label: 'View Map', route: '/map' }
      ];
      if (history.therapy > 0) {
        personalizedButtons.unshift({ label: 'Book Another Session', route: '/therapy' });
      }
      if (history.report > 0) {
        personalizedButtons.push({ label: 'Track Reports', route: '/reports' });
      }
      if (history.forum > 0) {
        personalizedButtons.push({ label: 'Join Forum', route: '/forum' });
      }
      return {
        text: `**What I detected:** You're initiating a conversation, which shows you're taking a positive step toward accessing support.

**Why I recommend this:** Starting conversations about safety and wellbeing helps build awareness and connection.

**Evidence-based suggestion:** Hello! Welcome back to SafeCampus. I'm here to help you with safety concerns, reporting, mental health support, and campus resources. How can I assist you today?`,
        buttons: personalizedButtons
      };
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        text: `**What I detected:** You're expressing gratitude, which is important for maintaining positive social connections.

**Why I recommend this:** Expressing thanks helps build and maintain supportive relationships.

**Evidence-based suggestion:** You're welcome! Stay safe and don't hesitate to reach out anytime - support is always available when you need it.`,
        buttons: []
      };
    } else {
      // Fallback with suggestions
      return {
        text: `**What I detected:** Your message doesn't match specific safety or support categories I'm trained to recognize.

**Why I recommend this:** I'm designed to provide safety-focused, evidence-based guidance for campus wellbeing.

**Evidence-based suggestion:** I'm here to help with safety concerns, reporting incidents, mental health support, therapy booking, and campus resources. Could you tell me more about what you're looking for assistance with today?`,
        buttons: [
          { label: 'Book Therapy', route: '/therapy' },
          { label: 'Report Incident', route: '/report' },
          { label: 'Help Center', route: '/help' },
          { label: 'View Map', route: '/map' }
        ]
      };
    }
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isStreaming) return;

    const userMessage = { sender: 'You', content: { text: message, buttons: [] }, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Use fallback response with typing effect
    setTimeout(() => {
      const fallbackContent = getFallbackResponse(message);

      // Store conversation for analytics and personalization
      const userId = JSON.parse(localStorage.getItem('user') || 'null')?.id;
      const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
      aiChats.push({
        userId,
        timestamp: new Date().toISOString(),
        messageCount: 1,
        keywords: detectKeywords(message) // Store keywords for personalization
      });
      localStorage.setItem('aiChats', JSON.stringify(aiChats));

      setIsStreaming(false);
      startTyping(fallbackContent);
    }, 2000);
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
        const parsedMessages = JSON.parse(savedMessages);
        // Migrate old messages to new format
        const migratedMessages = parsedMessages.map(msg => {
          if (msg.content) {
            return msg;
          } else {
            return {
              ...msg,
              content: { text: msg.text, buttons: [] }
            };
          }
        });
        setMessages(migratedMessages);
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
    <div style={{ padding: '10px', height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={chatBoxRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          padding: '10px',
          border: '1px solid #ccc',
          marginBottom: '10px',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              margin: '10px 0',
              display: 'flex',
              justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start'
            }}
          >
            <div>
              <div
                style={{
                  maxWidth: '80%',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  backgroundColor: msg.sender === 'You' ? '#c8e6c9' : '#f3e5f5',
                  color: '#333',
                  whiteSpace: 'pre-line',
                  wordWrap: 'break-word'
                }}
              >
                <strong style={{ fontSize: '0.9em', color: msg.sender === 'You' ? '#1976d2' : '#666' }}>
                  {msg.sender}
                </strong>
                <div style={{ marginTop: '5px' }}>
                  {msg.content.text.split('**').map((part, index) =>
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                  )}
                </div>
              </div>
              {msg.content.buttons && msg.content.buttons.length > 0 && (
                <div style={{ marginTop: '10px', textAlign: msg.sender === 'You' ? 'right' : 'left' }}>
                  {msg.content.buttons.map((btn, btnIndex) => (
                    <button
                      key={btnIndex}
                      onClick={() => navigate(btn.route)}
                      style={{
                        padding: '5px 10px',
                        marginRight: '5px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: '#f0f0f0'
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div
            style={{
              margin: '10px 0',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <div>
              <div
                style={{
                  maxWidth: '80%',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  backgroundColor: '#f3e5f5',
                  color: '#333',
                  whiteSpace: 'pre-line',
                  wordWrap: 'break-word'
                }}
              >
                <strong style={{ fontSize: '0.9em', color: '#666' }}>
                  AxonCare AI
                </strong>
                <div style={{ marginTop: '5px' }}>
                  {typingText.split('**').map((part, index) =>
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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