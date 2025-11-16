import React from 'react';
import { posts } from './counselingData.js';

const HelpCenter = () => {
  const faqs = [
    { question: 'How do I report an incident?', answer: 'Go to the Report GBV page, fill in the details, and submit. You can remain anonymous.' },
    { question: 'How to access support services?', answer: 'Visit the Support Services page, select a counselor, date, time, and mode.' },
    { question: 'What if I feel unsafe?', answer: 'Use the Panic button on your dashboard or contact security at 0800-SAFE-CAMPUS.' },
    { question: 'How to change my password?', answer: 'Go to Profile > Change Password section.' },
  ];

  const emergencyContacts = [
    { name: 'Campus Security', contact: 'ext. 911 or security@univ.edu' },
    { name: 'Support Services Center', contact: 'Main Campus Building, Floor 2' },
    { name: 'GBV Hotline', contact: '0800-GBV-HELP (24/7)' },
    { name: 'University Safety Office', contact: 'University of Example (safety@univ.edu)' },
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
        <h3>GBV Prevention Guidelines</h3>
        <p>Remember to prioritize your safety. Know your rights and seek help when needed. Comprehensive support resources are available on campus 24/7.</p>
      </section>
      <section>
        <h3>Safety & Support Resources</h3>
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