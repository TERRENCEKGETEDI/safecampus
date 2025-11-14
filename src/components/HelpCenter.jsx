import React from 'react';

const HelpCenter = () => {
  const faqs = [
    { question: 'How do I report an incident?', answer: 'Go to the Report GBV page, fill in the details, and submit. You can remain anonymous.' },
    { question: 'How to book a therapy session?', answer: 'Visit the Therapy Booking page, select a therapist, date, time, and mode.' },
    { question: 'What if I feel unsafe?', answer: 'Use the Panic button on your dashboard or contact security at 123-456-7890.' },
    { question: 'How to change my password?', answer: 'Go to Profile > Change Password section.' },
  ];

  const emergencyContacts = [
    { name: 'Campus Security', number: '123-456-7890' },
    { name: 'National Helpline', number: '0800-123-456' },
    { name: 'Mental Health Support', number: '987-654-3210' },
  ];

  return (
    <div>
      <h2>Help Center</h2>
      <section>
        <h3>FAQs</h3>
        {faqs.map((faq, i) => (
          <div key={i}>
            <h4>{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>
      <section>
        <h3>Emergency Contacts</h3>
        <ul>
          {emergencyContacts.map((contact, i) => (
            <li key={i}>{contact.name}: {contact.number}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Mental Health Guidelines</h3>
        <p>Remember to prioritize your well-being. Seek help when needed. Resources are available on campus.</p>
      </section>
    </div>
  );
};

export default HelpCenter;