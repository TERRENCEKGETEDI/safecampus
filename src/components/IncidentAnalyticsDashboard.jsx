import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const IncidentAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    urgentReports: 0,
    typeBreakdown: {},
    locationBreakdown: {},
    monthlyTrends: [],
    weeklyStats: [],
    suspectReports: 0
  });

  useEffect(() => {
    if (user?.role === 'security') {
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

    // Type breakdown
    const typeBreakdown = {};
    filteredReports.forEach(r => {
      typeBreakdown[r.type] = (typeBreakdown[r.type] || 0) + 1;
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

    setAnalytics({
      totalReports,
      resolvedReports,
      pendingReports,
      urgentReports,
      typeBreakdown,
      locationBreakdown,
      monthlyTrends,
      weeklyStats,
      suspectReports
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
      ['Incident Types', 'Count'],
      ...Object.entries(analytics.typeBreakdown),
      [],
      ['Locations', 'Count'],
      ...Object.entries(analytics.locationBreakdown),
      [],
      ['Monthly Trends', 'Total', 'Resolved'],
      ...analytics.monthlyTrends.map(m => [m.month, m.count, m.resolved]),
      [],
      ['Weekly Stats', 'Total', 'Urgent'],
      ...analytics.weeklyStats.map(w => [w.week, w.count, w.urgent])
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

  if (user?.role !== 'security') {
    return <div>Access denied. Security personnel only.</div>;
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
          <h3>Incident Types Breakdown</h3>
          <div className="chart-placeholder">
            {Object.entries(analytics.typeBreakdown).length > 0 ? (
              <ul className="type-breakdown">
                {Object.entries(analytics.typeBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => (
                    <li key={type}>
                      <span className="type-label">{type}</span>
                      <span className="type-count">{count}</span>
                      <div className="type-bar" style={{width: `${(count / analytics.totalReports) * 100}%`}}></div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Monthly Trends</h3>
          <div className="chart-placeholder">
            <div className="trend-chart">
              {analytics.monthlyTrends.map((month, i) => (
                <div key={i} className="trend-bar">
                  <div className="trend-total" style={{height: `${month.count * 10}px`}} title={`Total: ${month.count}`}></div>
                  <div className="trend-resolved" style={{height: `${month.resolved * 10}px`}} title={`Resolved: ${month.resolved}`}></div>
                  <span className="trend-label">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3>Weekly Urgent Incidents</h3>
          <div className="chart-placeholder">
            <div className="weekly-chart">
              {analytics.weeklyStats.map((week, i) => (
                <div key={i} className="weekly-bar">
                  <div className="weekly-total" style={{height: `${week.count * 8}px`}} title={`Total: ${week.count}`}></div>
                  <div className="weekly-urgent" style={{height: `${week.urgent * 8}px`}} title={`Urgent: ${week.urgent}`}></div>
                  <span className="weekly-label">{week.week}</span>
                </div>
              ))}
            </div>
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
          <h3>Resolution Rate by Type</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.typeBreakdown).map(([type]) => {
                const typeReports = reports.filter(r => r.type === type && (!timeRange || timeRange === 'all' ||
                  (timeRange === 'month' && new Date(r.timestamp) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                  (timeRange === 'week' && new Date(r.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))));
                const resolved = typeReports.filter(r => r.status === 'resolved').length;
                return (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{typeReports.length}</td>
                    <td>{resolved}</td>
                    <td>{typeReports.length > 0 ? ((resolved / typeReports.length) * 100).toFixed(1) : 0}%</td>
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