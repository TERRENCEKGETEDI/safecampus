import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import ReportForm from './components/ReportForm.jsx';
import ReportsRouter from './components/ReportsRouter.jsx';
import IncidentAnalyticsDashboard from './components/IncidentAnalyticsDashboard.jsx';
import SecurityAlerts from './components/SecurityAlerts.jsx';
import SecurityChat from './components/SecurityChat.jsx';
import SupportServices from './components/TherapyBooking.jsx';
import TherapistDashboard from './components/TherapistDashboard.jsx';
import TherapistAnalytics from './components/TherapistAnalytics.jsx';
import TherapyResources from './components/TherapyResources.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Forum from './components/Forum.jsx';
import Map from './components/Map.jsx';
import Profile from './components/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Chatbot from './components/Chatbot.jsx';
import HelpCenter from './components/HelpCenter.jsx';
import MissingPersonReport from './components/MissingPersonReport.jsx';
import MissingPersonManagement from './components/MissingPersonManagement.jsx';
import SafetyJournal from './components/MoodDiary.jsx';
import SelfHelpLibrary from './components/SelfHelpLibrary.jsx';
import EmergencySupport from './components/EmergencySupport.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute requiredRole="student"><ReportForm /></ProtectedRoute>} />
              <Route path="/missing-report" element={<ProtectedRoute requiredRole="student"><MissingPersonReport /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsRouter /></ProtectedRoute>} />
              <Route path="/therapy" element={<ProtectedRoute requiredRole="student"><SupportServices /></ProtectedRoute>} />
              <Route path="/therapist-dashboard" element={<ProtectedRoute requiredRole="therapist"><TherapistDashboard /></ProtectedRoute>} />
              <Route path="/therapist-analytics" element={<ProtectedRoute requiredRole="therapist"><TherapistAnalytics /></ProtectedRoute>} />
              <Route path="/therapy-resources" element={<ProtectedRoute requiredRole="therapist"><TherapyResources /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['security', 'admin']}><IncidentAnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute requiredRole="security"><SecurityAlerts /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute requiredRole="security"><SecurityChat /></ProtectedRoute>} />
              <Route path="/missing-persons" element={<ProtectedRoute allowedRoles={['security', 'admin']}><MissingPersonManagement /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
              <Route path="/mood-diary" element={<ProtectedRoute requiredRole="student"><SafetyJournal /></ProtectedRoute>} />
              <Route path="/self-help" element={<ProtectedRoute requiredRole="student"><SelfHelpLibrary /></ProtectedRoute>} />
              <Route path="/emergency" element={<ProtectedRoute requiredRole="student"><EmergencySupport /></ProtectedRoute>} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Placeholder components
function Home() {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Welcome to SafeCampus</h1>
        <p>A comprehensive Gender-Based Violence Prevention and Safety System for campus communities.</p>
        <p>Empowering students and staff with tools for incident reporting, survivor support resources, safety awareness campaigns, and emergency response coordination.</p>
        <div className="hero-buttons">
          <button onClick={() => window.location.href='/register'}>Sign Up</button>
          <button onClick={() => window.location.href='/login'}>Login</button>
        </div>
      </section>
      <nav className="landing-nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <section id="about" className="about">
        <h2>About SafeCampus</h2>
        <p>SafeCampus provides a comprehensive safety ecosystem for preventing and responding to gender-based violence. Our platform enables confidential incident reporting, connects survivors with essential resources, facilitates awareness campaigns, and coordinates emergency response efforts to create safer campus environments.</p>
      </section>
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>For support or reporting concerns, contact our 24/7 safety hotline at 0800-SAFE-CAMPUS or email safety@safecampus.edu</p>
      </section>
    </div>
  );
}



export default App;