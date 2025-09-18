import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';

const RoleBasedRoute = ({ children, allowedRoles, requireAuth = true }) => {
  const { user, token } = useSelector((state) => state.user);
  const location = useLocation();

  // Check authentication
  if (requireAuth && (!user || !token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle={`You don't have permission to access this page. Required roles: ${allowedRoles.join(', ')}`}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  return children;
};

export default RoleBasedRoute;