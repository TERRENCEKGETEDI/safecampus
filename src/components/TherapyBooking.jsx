import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const TherapyBooking = () => {
  const { user } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('online');
  const [rating, setRating] = useState({});

  useEffect(() => {
    // Mock therapists
    const mockTherapists = [
      { id: '1', name: 'Dr. Smith' },
      { id: '2', name: 'Dr. Johnson' },
    ];
    setTherapists(mockTherapists);
    // Load appointments
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const userAppointments = allAppointments.filter(a => a.studentId === user.id).map(a => {
      if (a.status === 'completed' && !a.feedback) {
        a.feedback = 'Session went well. Continue practicing coping strategies.'; // Mock feedback
      }
      return a;
    });
    setAppointments(userAppointments);
  }, [user]);

  const handleBook = () => {
    const appointment = {
      id: Date.now().toString(),
      studentId: user.id,
      therapistId: selectedTherapist,
      startTime: `${date}T${time}`,
      endTime: `${date}T${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1]}`,
      mode: mode,
      reminders: true, // Mock reminders enabled
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    allAppointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(allAppointments));
    setAppointments([...appointments, appointment]);
    // Add notification
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId: user.id,
      message: `Therapy session booked for ${new Date(appointment.startTime).toLocaleString()}`,
      date: new Date().toISOString(),
      type: 'appointment'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    alert('Appointment booked! You will receive reminders.');
  };

  const handleCancel = (id) => {
    const updated = appointments.map(a => a.id === id ? { ...a, status: 'canceled' } : a);
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const handleRate = (id) => {
    const rate = prompt('Rate 1-5:');
    if (rate) {
      const updated = appointments.map(a => a.id === id ? { ...a, rating: parseInt(rate) } : a);
      setAppointments(updated);
      localStorage.setItem('appointments', JSON.stringify(updated));
    }
  };

  return (
    <div>
      <h2>Therapy Booking</h2>
      <div>
        <h3>Book New Session</h3>
        <select value={selectedTherapist} onChange={(e) => setSelectedTherapist(e.target.value)}>
          <option value="">Select Therapist</option>
          {therapists.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="online">Online</option>
          <option value="physical">Physical</option>
        </select>
        <button onClick={handleBook}>Book</button>
      </div>
      <div>
        <h3>My Appointments</h3>
        <ul>
          {appointments.map(a => (
            <li key={a.id}>
              {therapists.find(t => t.id === a.therapistId)?.name} - {new Date(a.startTime).toLocaleString()} - Mode: {a.mode} - Status: {a.status}
              {a.reminders && <span> (Reminders enabled)</span>}
              {a.feedback && <p>Feedback: {a.feedback}</p>}
              {a.status === 'completed' && !a.rating && <button onClick={() => handleRate(a.id)}>Rate</button>}
              {a.status === 'requested' && <button onClick={() => handleCancel(a.id)}>Cancel</button>}
              {a.rating && <span> Rating: {a.rating}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TherapyBooking;