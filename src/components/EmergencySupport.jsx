import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const EmergencySupport = () => {
  const { user } = useAuth();
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);

  const crisisResources = [
    {
      name: 'South African Depression and Anxiety Group (SADAG)',
      phone: '0800 567 567',
      description: '24/7 mental health support hotline'
    },
    {
      name: 'Lifeline South Africa',
      phone: '0861 322 322',
      description: 'Suicide prevention and crisis support'
    },
    {
      name: 'Mental Health Information Centre',
      phone: '021 689 9535',
      description: 'Mental health information and referrals'
    },
    {
      name: 'Campus Counseling Center',
      phone: '021 123 4567',
      description: 'Immediate campus mental health support'
    },
    {
      name: 'Emergency Services',
      phone: '10111',
      description: 'Medical emergency response'
    }
  ];

  const groundingTechniques = [
    {
      name: '5-4-3-2-1 Technique',
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      name: 'Box Breathing',
      steps: [
        'Inhale for 4 counts',
        'Hold for 4 counts',
        'Exhale for 4 counts',
        'Hold for 4 counts',
        'Repeat 4 times'
      ]
    },
    {
      name: 'Progressive Muscle Relaxation',
      steps: [
        'Tense your toes for 5 seconds, then release',
        'Move up through your body: feet, legs, stomach, chest, arms, neck, face',
        'Notice the difference between tension and relaxation'
      ]
    }
  ];

  const handlePanic = () => {
    // Send alert to emergency contacts
    const alertData = {
      userId: user.id,
      type: 'mental_health_crisis',
      location: 'Campus location', // In real app, get GPS
      timestamp: new Date().toISOString(),
      message: `${user.name} has activated emergency mental health support`
    };

    const alerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
    alerts.push({ ...alertData, id: Date.now().toString(), status: 'active' });
    localStorage.setItem('emergencyAlerts', JSON.stringify(alerts));

    setShowCrisisResources(true);
    alert('Emergency alert sent! Help is on the way. Opening crisis resources...');
  };

  const callHotline = (phone) => {
    // In a real app, this would initiate a call
    alert(`Calling ${phone}...`);
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="emergency-support">
      <h2>Emergency Mental Health Support</h2>
      <p>If you're in crisis or need immediate help, you're not alone. Help is available 24/7.</p>

      <div className="emergency-actions">
        <button
          className="panic-button"
          onClick={handlePanic}
          style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          🚨 PANIC BUTTON - Get Immediate Help
        </button>

        <button
          className="grounding-button"
          onClick={() => setShowGrounding(true)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '15px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          🧘 Quick Grounding Techniques
        </button>
      </div>

      {showCrisisResources && (
        <div className="crisis-resources-modal">
          <div className="modal-content">
            <h3>Crisis Resources - Call Now</h3>
            <div className="resources-list">
              {crisisResources.map((resource, index) => (
                <div key={index} className="resource-item">
                  <h4>{resource.name}</h4>
                  <p>{resource.description}</p>
                  <button
                    onClick={() => callHotline(resource.phone)}
                    className="call-button"
                  >
                    📞 Call {resource.phone}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCrisisResources(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showGrounding && (
        <div className="grounding-modal">
          <div className="modal-content">
            <h3>Grounding Techniques for Immediate Relief</h3>
            <div className="techniques-list">
              {groundingTechniques.map((technique, index) => (
                <div key={index} className="technique-item">
                  <h4>{technique.name}</h4>
                  <ol>
                    {technique.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <div className="breathing-exercise">
              <h4>Quick Breathing Exercise</h4>
              <p>Place one hand on your belly. Breathe in slowly through your nose for 4 counts, feeling your belly rise. Hold for 4 counts. Breathe out through your mouth for 4 counts, feeling your belly fall. Repeat 4 times.</p>
            </div>
            <button
              onClick={() => setShowGrounding(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="emergency-info">
        <h3>Remember</h3>
        <ul>
          <li>You are not alone in this</li>
          <li>It's okay to ask for help</li>
          <li>Professional help is available and effective</li>
          <li>Your feelings are valid</li>
          <li>Recovery is possible</li>
        </ul>
      </div>

      <div className="safety-plan">
        <h3>Personal Safety Plan</h3>
        <p>Consider creating a personal safety plan with:</p>
        <ul>
          <li>Warning signs that crisis is approaching</li>
          <li>Coping strategies that work for you</li>
          <li>People you can call for support</li>
          <li>Professional contacts</li>
          <li>Places you can go for safety</li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencySupport;