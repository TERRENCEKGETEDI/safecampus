import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import ReportsManagement from './ReportsManagement.jsx';
import SecurityReportsManagement from './SecurityReportsManagement.jsx';

const ReportsRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'security' || user?.role === 'admin') {
    return <SecurityReportsManagement />;
  }

  if (user?.role === 'therapist') {
    return <div>Access denied. Therapists cannot view incident reports.</div>;
  }

  return <ReportsManagement />;
};

export default ReportsRouter;