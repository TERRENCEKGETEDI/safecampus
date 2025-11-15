import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { therapists as dataTherapists } from './counselingData.js';

const TherapyBooking = () => {
  const { user } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('online');
  const [errors, setErrors] = useState({});
  const [rating, setRating] = useState({});

  useEffect(() => {
    // Load therapists from data
    console.log('Data therapists:', dataTherapists);
    const therapistList = dataTherapists.map(t => ({ id: t.id, name: t.name, specialty: t.specialty }));
    console.log('Therapist list:', therapistList);
    setTherapists(therapistList);
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

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'selectedTherapist':
        if (!value) error = 'Please select a therapist';
        break;
      case 'date':
        if (!value) error = 'Please select a date';
        else if (new Date(value) < new Date()) error = 'Date cannot be in the past';
        break;
      case 'time':
        if (!value) error = 'Please select a time';
        break;
      default:
        break;
    }
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    return !errors.selectedTherapist && !errors.date && !errors.time &&
           selectedTherapist && date && time;
  };

  const handleBook = () => {
    if (!isFormValid()) return;
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
        <div>
          <select value={selectedTherapist} onChange={(e) => { setSelectedTherapist(e.target.value); validateField('selectedTherapist', e.target.value); }}>
            <option value="">Select Therapist</option>
            {therapists.map(t => (
              <option key={t.id} value={t.id}>{t.name} - {t.specialty}</option>
            ))}
          </select>
          {errors.selectedTherapist && <span style={{ color: 'red' }}>{errors.selectedTherapist}</span>}
        </div>
        <div>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); validateField('date', e.target.value); }} />
          {errors.date && <span style={{ color: 'red' }}>{errors.date}</span>}
        </div>
        <div>
          <input type="time" value={time} onChange={(e) => { setTime(e.target.value); validateField('time', e.target.value); }} />
          {errors.time && <span style={{ color: 'red' }}>{errors.time}</span>}
        </div>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="online">Online</option>
          <option value="physical">Physical</option>
        </select>
        <button onClick={handleBook} disabled={!isFormValid()}>Book</button>
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