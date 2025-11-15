import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import SouthAfricaMap from './SouthAfricaMap.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const IncidentAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    urgentReports: 0,
    categoryBreakdown: {},
    locationBreakdown: {},
    monthlyTrends: [],
    weeklyStats: [],
    suspectReports: 0,
    therapyFunnel: {
      aiChats: 0,
      therapyBookings: 0,
      therapyCompleted: 0
    }
  });

  useEffect(() => {
    if (user?.role === 'security' || user?.role === 'admin') {
      const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
      setReports(allReports);
      calculateAnalytics(allReports, timeRange);
    }
  }, [user, timeRange]);

  const calculateAnalytics = (reportsData, range) => {
    const now = new Date();
    let filteredReports = reportsData;

    // Filter by time range
    if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredReports = reportsData.filter(r => new Date(r.timestamp) >= weekAgo);
    } else if (range === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredReports = reportsData.filter(r => new Date(r.timestamp) >= monthAgo);
    } else if (range === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filteredReports = reportsData.filter(r => new Date(r.timestamp) >= quarterAgo);
    }

    // Basic stats
    const totalReports = filteredReports.length;
    const resolvedReports = filteredReports.filter(r => r.status === 'resolved').length;
    const pendingReports = filteredReports.filter(r => r.status === 'pending').length;
    const urgentReports = filteredReports.filter(r => r.severity === 'high').length;

    // Category breakdown (SAPS categories)
    const categoryBreakdown = {};
    filteredReports.forEach(r => {
      categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1;
    });

    // Location breakdown
    const locationBreakdown = {};
    filteredReports.forEach(r => {
      if (r.location) {
        locationBreakdown[r.location] = (locationBreakdown[r.location] || 0) + 1;
      }
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthReports = reportsData.filter(r => {
        const reportDate = new Date(r.timestamp);
        return reportDate >= monthStart && reportDate <= monthEnd;
      });
      monthlyTrends.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        count: monthReports.length,
        resolved: monthReports.filter(r => r.status === 'resolved').length
      });
    }

    // Weekly stats (last 4 weeks)
    const weeklyStats = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekReports = reportsData.filter(r => {
        const reportDate = new Date(r.timestamp);
        return reportDate >= weekStart && reportDate <= weekEnd;
      });
      weeklyStats.push({
        week: `Week ${4 - i}`,
        count: weekReports.length,
        urgent: weekReports.filter(r => r.severity === 'high').length
      });
    }

    // Suspect reports
    const suspectReports = filteredReports.filter(r => r.suspectDetails).length;

    // Therapy funnel data
    const therapyBookings = JSON.parse(localStorage.getItem('therapyBookings') || '[]');
    const aiChats = JSON.parse(localStorage.getItem('aiChats') || '[]');
    const therapyCompleted = therapyBookings.filter(b => b.status === 'completed').length;

    setAnalytics({
      totalReports,
      resolvedReports,
      pendingReports,
      urgentReports,
      categoryBreakdown,
      locationBreakdown,
      monthlyTrends,
      weeklyStats,
      suspectReports,
      therapyFunnel: {
        aiChats: aiChats.length,
        therapyBookings: therapyBookings.length,
        therapyCompleted
      }
    });
  };

  const exportToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Reports', analytics.totalReports],
      ['Resolved Reports', analytics.resolvedReports],
      ['Pending Reports', analytics.pendingReports],
      ['Urgent Reports', analytics.urgentReports],
      ['Reports with Suspect Details', analytics.suspectReports],
      [],
      ['GBV Categories (SAPS)', 'Count'],
      ...Object.entries(analytics.categoryBreakdown),
      [],
      ['Locations', 'Count'],
      ...Object.entries(analytics.locationBreakdown),
      [],
      ['Monthly Trends', 'Total', 'Resolved'],
      ...analytics.monthlyTrends.map(m => [m.month, m.count, m.resolved]),
      [],
      ['Weekly Stats', 'Total', 'Urgent'],
      ...analytics.weeklyStats.map(w => [w.week, w.count, w.urgent]),
      [],
      ['Mental Health Funnel', 'Count'],
      ['AI Chats Used', analytics.therapyFunnel.aiChats],
      ['Therapy Booked', analytics.therapyFunnel.therapyBookings],
      ['Therapy Completed', analytics.therapyFunnel.therapyCompleted]
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    // Mock PDF export - in real app, would use a library like jsPDF
    alert('PDF export functionality would be implemented with a PDF generation library like jsPDF');
  };

  if (user?.role !== 'security' && user?.role !== 'admin') {
    return <div>Access denied. Security and Admin personnel only.</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>Incident Analytics Dashboard</h2>

      <div className="analytics-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="export-buttons">
          <button onClick={exportToCSV}>Export to CSV</button>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <p className="stat-number">{analytics.totalReports}</p>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <p className="stat-number resolved">{analytics.resolvedReports}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{analytics.pendingReports}</p>
        </div>
        <div className="stat-card">
          <h3>Urgent</h3>
          <p className="stat-number urgent">{analytics.urgentReports}</p>
        </div>
        <div className="stat-card">
          <h3>With Suspect Details</h3>
          <p className="stat-number">{analytics.suspectReports}</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Reports by GBV Category</h3>
          <div className="chart-placeholder">
            {Object.keys(analytics.categoryBreakdown).length > 0 ? (
              <Bar
                data={{
                  labels: Object.keys(analytics.categoryBreakdown),
                  datasets: [{
                    label: 'Number of Reports',
                    data: Object.values(analytics.categoryBreakdown),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'GBV Reports by Category (SAPS Official Categories)' },
                  },
                }}
              />
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Incident Reports Over Time</h3>
          <div className="chart-placeholder">
            <Line
              data={{
                labels: analytics.monthlyTrends.map(m => m.month),
                datasets: [
                  {
                    label: 'Total Reports',
                    data: analytics.monthlyTrends.map(m => m.count),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                  },
                  {
                    label: 'Resolved Reports',
                    data: analytics.monthlyTrends.map(m => m.resolved),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Monthly Incident Trends' },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Mental Health Funnel</h3>
          <div className="chart-placeholder">
            <Doughnut
              data={{
                labels: ['AI Chats Used', 'Therapy Booked', 'Therapy Completed'],
                datasets: [{
                  label: 'Students',
                  data: [
                    analytics.therapyFunnel.aiChats,
                    analytics.therapyFunnel.therapyBookings,
                    analytics.therapyFunnel.therapyCompleted
                  ],
                  backgroundColor: [
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                  ],
                  borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                  ],
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Mental Health Support Funnel' },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>South Africa Safety Map</h3>
          <div className="chart-placeholder">
            <SouthAfricaMap
              incidents={reports}
              missingPersons={JSON.parse(localStorage.getItem('missingReports') || '[]')}
              securityAlerts={JSON.parse(localStorage.getItem('panicAlerts') || '[]')}
            />
          </div>
        </div>
      </div>

      <div className="detailed-tables">
        <div className="table-section">
          <h3>Top Incident Locations</h3>
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Incident Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.locationBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([location, count]) => (
                  <tr key={location}>
                    <td>{location}</td>
                    <td>{count}</td>
                    <td>{((count / analytics.totalReports) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="table-section">
          <h3>Resolution Rate by GBV Category</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.categoryBreakdown).map(([category]) => {
                const categoryReports = reports.filter(r => r.category === category && (!timeRange || timeRange === 'all' ||
                  (timeRange === 'month' && new Date(r.timestamp) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                  (timeRange === 'week' && new Date(r.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))));
                const resolved = categoryReports.filter(r => r.status === 'resolved').length;
                return (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{categoryReports.length}</td>
                    <td>{resolved}</td>
                    <td>{categoryReports.length > 0 ? ((resolved / categoryReports.length) * 100).toFixed(1) : 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentAnalyticsDashboard;