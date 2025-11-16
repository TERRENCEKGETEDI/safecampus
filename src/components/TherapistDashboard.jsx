import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const TherapistDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [notes, setNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [clientMoodHistory, setClientMoodHistory] = useState([]);
  const [sharedConversations, setSharedConversations] = useState([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const therapistAppointments = allAppointments.filter(a => a.therapistId === user.id);
    setAppointments(therapistAppointments);

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const studentUsers = allUsers.filter(u => u.role === 'student');
    setStudents(studentUsers);

    const allMessages = JSON.parse(localStorage.getItem('therapistMessages') || '[]');
    const therapistMessages = allMessages.filter(m => m.therapistId === user.id);
    setMessages(therapistMessages);

    // Load shared conversations
    const allSharedConversations = JSON.parse(localStorage.getItem('sharedConversations') || '[]');
    setSharedConversations(allSharedConversations);
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Filter by time period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        filtered = filtered.filter(a => new Date(a.startTime) >= today && new Date(a.startTime) < new Date(today.getTime() + 24 * 60 * 60 * 1000));
        break;
      case 'week':
        filtered = filtered.filter(a => new Date(a.startTime) >= today && new Date(a.startTime) < weekFromNow);
        break;
      case 'month':
        filtered = filtered.filter(a => new Date(a.startTime) >= today && new Date(a.startTime) < monthFromNow);
        break;
      default:
        break;
    }

    // Filter by status
    if (filter === 'pending') filtered = filtered.filter(a => a.status === 'requested');
    if (filter === 'completed') filtered = filtered.filter(a => a.status === 'completed');
    if (filter === 'cancelled') filtered = filtered.filter(a => a.status === 'cancelled');

    // Search by student name or booking ID
    if (searchTerm) {
      filtered = filtered.filter(a => {
        const student = students.find(s => s.id === a.studentId);
        return student && (student.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.includes(searchTerm));
      });
    }

    return filtered;
  };

  const handleAcceptSession = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'confirmed');
    // Send notification to student
    sendNotification(appointmentId, 'Your therapy session has been confirmed.');
  };

  const handleDeclineSession = (appointmentId) => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining.');
      return;
    }
    updateAppointmentStatus(appointmentId, 'declined', { declineReason });
    sendNotification(appointmentId, `Your therapy session has been declined. Reason: ${declineReason}`);
    setDeclineReason('');
    setShowModal(false);
  };

  const handleRescheduleSession = (appointmentId) => {
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select new date and time.');
      return;
    }
    const newStartTime = `${rescheduleDate}T${rescheduleTime}`;
    updateAppointmentStatus(appointmentId, 'rescheduled', { newStartTime });
    sendNotification(appointmentId, `Your therapy session has been rescheduled to ${new Date(newStartTime).toLocaleString()}`);
    setRescheduleDate('');
    setRescheduleTime('');
    setShowModal(false);
  };

  const handleCompleteSession = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'completed');
    sendNotification(appointmentId, 'Your therapy session has been marked as completed. Please rate your experience.');
  };

  const updateAppointmentStatus = (appointmentId, status, additionalData = {}) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.map(a =>
      a.id === appointmentId ? { ...a, status, ...additionalData } : a
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments.filter(a => a.therapistId === user.id));
  };

  const sendNotification = (appointmentId, message) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: appointment.studentId,
      message,
      date: new Date().toISOString(),
      type: 'appointment'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStudent) return;

    const messageData = {
      id: Date.now().toString(),
      therapistId: user.id,
      studentId: selectedStudent,
      message: newMessage,
      timestamp: new Date().toISOString(),
      fromTherapist: true
    };

    const allMessages = JSON.parse(localStorage.getItem('therapistMessages') || '[]');
    allMessages.push(messageData);
    localStorage.setItem('therapistMessages', JSON.stringify(allMessages));

    // Add notification for student
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: selectedStudent,
      message: `New message from your therapist: ${newMessage.substring(0, 50)}...`,
      date: new Date().toISOString(),
      type: 'message'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    setNewMessage('');
    loadData(); // Refresh messages
  };

  const sendAutomatedReminder = (appointmentId, reminderType) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    let message = '';
    switch (reminderType) {
      case '10min':
        message = 'Your therapy session starts in 10 minutes. Please be ready!';
        break;
      case 'confirmation':
        message = 'Please confirm your attendance for the upcoming therapy session.';
        break;
      case 'followup':
        message = 'How are you feeling after our last session? Feel free to reach out if you need support.';
        break;
      default:
        return;
    }

    // Add notification for student
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: appointment.studentId,
      message: `Automated reminder: ${message}`,
      date: new Date().toISOString(),
      type: 'reminder'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    alert('Automated reminder sent to student.');
  };

  const handleAddNotes = (appointmentId) => {
    if (!notes.trim()) return;

    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.map(a =>
      a.id === appointmentId ? {
        ...a,
        therapistNotes: notes,
        summaryNotes: a.summaryNotes || '' // Initialize if not exists
      } : a
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments.filter(a => a.therapistId === user.id));
    setNotes('');
    setShowModal(false);
  };

  const openModal = (type, appointment) => {
    setModalType(type);
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStudentNumber = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.studentNumber || 'N/A' : 'N/A';
  };

  const loadClientMoodHistory = (studentId) => {
    const moodHistory = JSON.parse(localStorage.getItem(`moodEntries_${studentId}`) || '[]');
    setClientMoodHistory(moodHistory);
  };

  const sendCopingResource = (studentId, resourceTitle) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: studentId,
      message: `Your therapist has shared a coping resource: ${resourceTitle}`,
      date: new Date().toISOString(),
      type: 'resource'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    alert('Coping resource sent to client!');
  };

  const joinVirtualSession = (appointmentId) => {
    // Mock virtual session - in real app, this would open video chat
    alert('Joining virtual session... (Demo: This would open a video chat interface)');
    // Could navigate to a video session component
  };

  const generateChatSummary = (conversation) => {
    // Simple AI summary - extract keywords and insights
    const text = conversation.toLowerCase();
    const keywords = [];
    const insights = [];

    if (text.includes('stress') || text.includes('anxiety')) keywords.push('stress/anxiety');
    if (text.includes('depression') || text.includes('sad')) keywords.push('depression');
    if (text.includes('sleep') || text.includes('insomnia')) keywords.push('sleep issues');
    if (text.includes('exam') || text.includes('study')) keywords.push('academic pressure');
    if (text.includes('relationship') || text.includes('friend')) keywords.push('relationship issues');

    if (keywords.includes('stress/anxiety')) {
      insights.push('Client shows signs of stress/anxiety. Recommend relaxation techniques.');
    }
    if (keywords.includes('depression')) {
      insights.push('Depression indicators present. Monitor closely and suggest professional help.');
    }
    if (keywords.includes('sleep issues')) {
      insights.push('Sleep disturbances mentioned. Advise sleep hygiene improvements.');
    }

    return { keywords, insights };
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="therapist-dashboard">
      <h2>Therapist Dashboard</h2>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
          <button onClick={() => setFilter('today')} className={filter === 'today' ? 'active' : ''}>Today</button>
          <button onClick={() => setFilter('week')} className={filter === 'week' ? 'active' : ''}>This Week</button>
          <button onClick={() => setFilter('month')} className={filter === 'month' ? 'active' : ''}>This Month</button>
          <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Pending</button>
          <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
          <button onClick={() => setFilter('cancelled')} className={filter === 'cancelled' ? 'active' : ''}>Cancelled</button>
        </div>
        <input
          type="text"
          placeholder="Search by student name or booking ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Appointments List */}
      <div className="appointments-section">
        <h3>Student Bookings ({filteredAppointments.length})</h3>
        {filteredAppointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map(appointment => (
              <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
                <div className="appointment-header">
                  <h4>{getStudentName(appointment.studentId)}</h4>
                  <span className="student-number">ID: {getStudentNumber(appointment.studentId)}</span>
                  <span className={`status ${appointment.status}`}>{appointment.status}</span>
                </div>
                <div className="appointment-details">
                  <p><strong>Date & Time:</strong> {new Date(appointment.startTime).toLocaleString()}</p>
                  <p><strong>Mode:</strong> {appointment.mode}</p>
                  {appointment.urgency && <p><strong>Urgency:</strong> {appointment.urgency}</p>}
                  {appointment.therapistNotes && <p><strong>Notes:</strong> {appointment.therapistNotes}</p>}
                </div>
                <div className="appointment-actions">
                  {appointment.status === 'requested' && (
                    <>
                      <button onClick={() => handleAcceptSession(appointment.id)} className="accept-btn">Accept</button>
                      <button onClick={() => openModal('decline', appointment)} className="decline-btn">Decline</button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <>
                      <button onClick={() => openModal('reschedule', appointment)} className="reschedule-btn">Reschedule</button>
                      <button onClick={() => handleCompleteSession(appointment.id)} className="complete-btn">Mark Complete</button>
                      <button onClick={() => openModal('notes', appointment)} className="notes-btn">Add Notes</button>
                    </>
                  )}
                  <button onClick={() => { setSelectedStudent(appointment.studentId); setShowModal(true); setModalType('message'); }} className="message-btn">Message Student</button>
                  <button onClick={() => sendAutomatedReminder(appointment.id, '10min')} className="reminder-btn">10min Reminder</button>
                  <button onClick={() => sendAutomatedReminder(appointment.id, 'confirmation')} className="reminder-btn">Request Confirmation</button>
                  <button onClick={() => { setSelectedStudent(appointment.studentId); setShowModal(true); setModalType('profile'); }} className="profile-btn">View Profile</button>
                  <button onClick={() => { loadClientMoodHistory(appointment.studentId); setShowModal(true); setModalType('mood-history'); }} className="mood-btn">View Mood History</button>
                  <button onClick={() => { setSelectedStudent(appointment.studentId); setShowModal(true); setModalType('send-resource'); }} className="resource-btn">Send Resource</button>
                  <button onClick={() => joinVirtualSession(appointment.id)} className="session-btn">Join Session</button>
                  <button onClick={() => { setSelectedStudent(appointment.studentId); setShowModal(true); setModalType('ai-chats'); }} className="chat-btn">View AI Chats</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for various actions */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            {modalType === 'decline' && (
              <>
                <h3>Decline Session</h3>
                <p>Reason for declining:</p>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please provide a reason..."
                />
                <button onClick={() => handleDeclineSession(selectedAppointment.id)}>Decline Session</button>
              </>
            )}
            {modalType === 'reschedule' && (
              <>
                <h3>Reschedule Session</h3>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
                <button onClick={() => handleRescheduleSession(selectedAppointment.id)}>Reschedule</button>
              </>
            )}
            {modalType === 'notes' && (
              <>
                <h3>Add Therapy Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes for this session..."
                />
                <button onClick={() => handleAddNotes(selectedAppointment.id)}>Save Notes</button>
              </>
            )}
            {modalType === 'message' && (
              <>
                <h3>Send Message to {getStudentName(selectedStudent)}</h3>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send Message</button>
              </>
            )}
            {modalType === 'profile' && (
              <>
                <h3>Student Profile: {getStudentName(selectedStudent)}</h3>
                <p><strong>Student Number:</strong> {getStudentNumber(selectedStudent)}</p>
                <p><strong>Faculty:</strong> {students.find(s => s.id === selectedStudent)?.faculty || 'N/A'}</p>
                <h4>Session History</h4>
                <ul>
                  {appointments.filter(a => a.studentId === selectedStudent).map(a => (
                    <li key={a.id}>
                      {new Date(a.startTime).toLocaleString()} - {a.status}
                      {a.therapistNotes && <p>Notes: {a.therapistNotes}</p>}
                    </li>
                  ))}
                </ul>
                <button onClick={() => {
                  // Flag as high-risk (private to therapists)
                  const student = students.find(s => s.id === selectedStudent);
                  if (student) {
                    const updatedStudents = students.map(s =>
                      s.id === selectedStudent ? { ...s, highRisk: !s.highRisk } : s
                    );
                    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
                    const updatedUsers = allUsers.map(u =>
                      u.id === selectedStudent ? { ...u, highRisk: !u.highRisk } : u
                    );
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    setStudents(updatedStudents);
                  }
                }}>
                  {students.find(s => s.id === selectedStudent)?.highRisk ? 'Unflag High Risk' : 'Flag as High Risk'}
                </button>
              </>
            )}
            {modalType === 'mood-history' && (
              <>
                <h3>Client Mood History: {getStudentName(selectedStudent)}</h3>
                {clientMoodHistory.length === 0 ? (
                  <p>No mood entries found.</p>
                ) : (
                  <div className="mood-history">
                    {clientMoodHistory.map((entry, index) => (
                      <div key={index} className="mood-entry">
                        <p><strong>Date:</strong> {entry.date}</p>
                        <p><strong>Mood:</strong> {entry.mood}/10</p>
                        <p><strong>Energy:</strong> {entry.energy}/10</p>
                        <p><strong>Anxiety:</strong> {entry.anxiety}/10</p>
                        <p><strong>Stress:</strong> {entry.stress}/10</p>
                        {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {modalType === 'send-resource' && (
              <>
                <h3>Send Coping Resource to {getStudentName(selectedStudent)}</h3>
                <div className="resource-options">
                  <button onClick={() => sendCopingResource(selectedStudent, 'Breathing Exercises for Anxiety')}>
                    Breathing Exercises for Anxiety
                  </button>
                  <button onClick={() => sendCopingResource(selectedStudent, 'Grounding Techniques')}>
                    Grounding Techniques
                  </button>
                  <button onClick={() => sendCopingResource(selectedStudent, 'Stress Management Guide')}>
                    Stress Management Guide
                  </button>
                  <button onClick={() => sendCopingResource(selectedStudent, 'Sleep Hygiene Tips')}>
                    Sleep Hygiene Tips
                  </button>
                </div>
              </>
            )}
            {modalType === 'ai-chats' && (
              <>
                <h3>AI Chat Summaries: {getStudentName(selectedStudent)}</h3>
                {sharedConversations.filter(conv => conv.userId === selectedStudent).length === 0 ? (
                  <p>No shared conversations found.</p>
                ) : (
                  <div className="ai-chat-summaries">
                    {sharedConversations.filter(conv => conv.userId === selectedStudent).map((conv, index) => {
                      const summary = generateChatSummary(conv.conversation);
                      return (
                        <div key={index} className="chat-summary">
                          <p><strong>Date:</strong> {new Date(conv.timestamp).toLocaleString()}</p>
                          <p><strong>Status:</strong> {conv.status}</p>
                          <div className="ai-insights">
                            <h4>🤖 AI Summary:</h4>
                            <p><strong>Keywords:</strong> {summary.keywords.join(', ') || 'None detected'}</p>
                            <p><strong>Insights:</strong> {summary.insights.join(' ') || 'No specific insights available.'}</p>
                          </div>
                          <details>
                            <summary>View Full Conversation</summary>
                            <pre>{conv.conversation}</pre>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistDashboard;