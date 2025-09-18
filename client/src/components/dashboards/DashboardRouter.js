import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import CADashboard from './CADashboard';
import FinancialPlannerDashboard from './FinancialPlannerDashboard';
import { Spin } from 'antd';

const DashboardRouter = () => {
  const { user, token } = useSelector((state) => state.user);

  // Show loading if authentication is being checked
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'ca':
      return <CADashboard />;
    case 'financial_planner':
      return <FinancialPlannerDashboard />;
    case 'admin':
      // Admin users can see the user dashboard by default
      // You can create a separate AdminDashboard component later
      return <UserDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

export default DashboardRouter;