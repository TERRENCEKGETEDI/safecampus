import React from 'react';
import { posts } from './counselingData.js';

const HelpCenter = () => {
  const faqs = [
    { question: 'How do I report an incident?', answer: 'Go to the Report GBV page, fill in the details, and submit. You can remain anonymous.' },
    { question: 'How to book a therapy session?', answer: 'Visit the Therapy Booking page, select a therapist, date, time, and mode.' },
    { question: 'What if I feel unsafe?', answer: 'Use the Panic button on your dashboard or contact security at 123-456-7890.' },
    { question: 'How to change my password?', answer: 'Go to Profile > Change Password section.' },
  ];

  const emergencyContacts = [
    { name: 'Campus Security', contact: 'ext. 911 or security@univ.edu' },
    { name: 'Counseling Center', contact: 'Main Campus Building, Floor 2' },
    { name: 'University Name', contact: 'University of Example (Univ.edu)' },
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
            <li key={i}>{contact.name}: {contact.contact}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Mental Health Guidelines</h3>
        <p>Remember to prioritize your well-being. Seek help when needed. Resources are available on campus.</p>
      </section>
      <section>
        <h3>Counseling Center Blog Posts</h3>
        {posts.map((post, i) => (
          <div key={i} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h4>{post.title}</h4>
            <p><strong>By:</strong> {post.author} | <strong>Posted:</strong> {post.date}</p>
            <p>{post.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HelpCenter;