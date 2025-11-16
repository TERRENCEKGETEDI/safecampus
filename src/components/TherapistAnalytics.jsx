import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TherapistAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [trends, setTrends] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = () => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const therapistAppointments = allAppointments.filter(a => a.therapistId === user.id);

    // Calculate workload stats
    const now = new Date();
    const thisWeek = therapistAppointments.filter(a => {
      const appointmentDate = new Date(a.startTime);
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return appointmentDate >= weekStart;
    });

    const thisMonth = therapistAppointments.filter(a => {
      const appointmentDate = new Date(a.startTime);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return appointmentDate >= monthStart;
    });

    const onlineSessions = therapistAppointments.filter(a => a.mode === 'online');
    const physicalSessions = therapistAppointments.filter(a => a.mode === 'physical');

    // Unique students helped
    const uniqueStudents = new Set(therapistAppointments.map(a => a.studentId)).size;

    setStats({
      totalSessions: therapistAppointments.length,
      sessionsThisWeek: thisWeek.length,
      sessionsThisMonth: thisMonth.length,
      completedSessions: therapistAppointments.filter(a => a.status === 'completed').length,
      onlineSessions: onlineSessions.length,
      physicalSessions: physicalSessions.length,
      uniqueStudents,
      pendingSessions: therapistAppointments.filter(a => a.status === 'requested').length,
      confirmedSessions: therapistAppointments.filter(a => a.status === 'confirmed').length
    });

    // Load campus mental health trends (mock data for now)
    const allStudentAppointments = allAppointments.filter(a => {
      const studentUsers = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'student');
      return studentUsers.some(s => s.id === a.studentId);
    });

    // Mock trends data
    setTrends({
      anxietyLevels: 'Moderate increase (+15% this month)',
      burnoutPatterns: 'High among engineering students',
      peakBookingTimes: 'Monday 2-4 PM, Wednesday 10 AM-12 PM',
      commonReasons: ['Exam stress', 'Relationship issues', 'Anxiety', 'Depression']
    });

    // Generate chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString());
    }

    // Session count over last 7 days (mock data)
    const sessionCounts = last7Days.map(() => Math.floor(Math.random() * 5) + 1);

    // Mood trends from clients (mock data)
    const moodTrends = {
      labels: last7Days,
      datasets: [
        {
          label: 'Average Client Mood',
          data: last7Days.map(() => Math.floor(Math.random() * 5) + 4), // 4-8 range
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Anxiety Levels',
          data: last7Days.map(() => Math.floor(Math.random() * 4) + 2), // 2-5 range
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };

    // Session types pie chart
    const sessionTypesData = {
      labels: ['Online', 'Physical', 'Completed', 'Pending'],
      datasets: [{
        data: [onlineSessions.length, physicalSessions.length, therapistAppointments.filter(a => a.status === 'completed').length, therapistAppointments.filter(a => a.status === 'requested').length],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      }],
    };

    setChartData({
      moodTrends,
      sessionTypesData,
      sessionCounts
    });
  };

  return (
    <div className="therapist-analytics">
      <h2>Analytics & Insights</h2>

      <div className="stats-section">
        <h3>Your Workload Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Sessions</h4>
            <p className="stat-number">{stats.totalSessions}</p>
          </div>
          <div className="stat-card">
            <h4>Sessions This Week</h4>
            <p className="stat-number">{stats.sessionsThisWeek}</p>
          </div>
          <div className="stat-card">
            <h4>Sessions This Month</h4>
            <p className="stat-number">{stats.sessionsThisMonth}</p>
          </div>
          <div className="stat-card">
            <h4>Completed Sessions</h4>
            <p className="stat-number">{stats.completedSessions}</p>
          </div>
          <div className="stat-card">
            <h4>Online Sessions</h4>
            <p className="stat-number">{stats.onlineSessions}</p>
          </div>
          <div className="stat-card">
            <h4>Physical Sessions</h4>
            <p className="stat-number">{stats.physicalSessions}</p>
          </div>
          <div className="stat-card">
            <h4>Unique Students Helped</h4>
            <p className="stat-number">{stats.uniqueStudents}</p>
          </div>
          <div className="stat-card">
            <h4>Pending Sessions</h4>
            <p className="stat-number">{stats.pendingSessions}</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <h3>Data Visualizations</h3>
        <div className="charts-grid">
          <div className="chart-card">
            <h4>Client Mood Trends</h4>
            {chartData.moodTrends ? <Line data={chartData.moodTrends} /> : <p>Loading chart...</p>}
          </div>
          <div className="chart-card">
            <h4>Session Types Distribution</h4>
            {chartData.sessionTypesData ? <Pie data={chartData.sessionTypesData} /> : <p>Loading chart...</p>}
          </div>
        </div>
      </div>

      <div className="trends-section">
        <h3>Campus Mental Health Trends</h3>
        <div className="trends-grid">
          <div className="trend-card">
            <h4>Anxiety Levels</h4>
            <p>{trends.anxietyLevels}</p>
          </div>
          <div className="trend-card">
            <h4>Burnout Patterns</h4>
            <p>{trends.burnoutPatterns}</p>
          </div>
          <div className="trend-card">
            <h4>Peak Booking Times</h4>
            <p>{trends.peakBookingTimes}</p>
          </div>
          <div className="trend-card">
            <h4>Common Appointment Reasons</h4>
            <ul>
              {trends.commonReasons?.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <h3>Reports & Downloads</h3>
        <div className="report-actions">
          <button onClick={() => {
            // Mock download functionality
            const data = `Therapist Workload Report\n\nTotal Sessions: ${stats.totalSessions}\nSessions This Week: ${stats.sessionsThisWeek}\nSessions This Month: ${stats.sessionsThisMonth}\nCompleted: ${stats.completedSessions}\nOnline: ${stats.onlineSessions}\nPhysical: ${stats.physicalSessions}\nUnique Students: ${stats.uniqueStudents}`;
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'therapist-workload-report.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Download Attendance Report
          </button>
          <button onClick={() => {
            // Mock session report
            const data = `Session Details Report\n\n${JSON.stringify(stats, null, 2)}`;
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'session-details-report.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Download Session Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistAnalytics;