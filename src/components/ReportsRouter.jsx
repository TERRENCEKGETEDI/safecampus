import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import ReportsManagement from './ReportsManagement.jsx';
import SecurityReportsManagement from './SecurityReportsManagement.jsx';

const ReportsRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'security') {
    return <SecurityReportsManagement />;
  }

  return <ReportsManagement />;
};

export default ReportsRouter;