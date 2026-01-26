import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';

const RoleBasedRoute = ({ children, allowedRoles, requireAuth = true }) => {
  const { user, isVerified, isInitializing } = useSelector((state) => state.user);
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  // Check authentication
  if (requireAuth && !isVerified) {
    console.warn('RoleBasedRoute: Access denied - Not verified. Redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.warn(`RoleBasedRoute: Access denied - Role mismatch. User: ${user.role}, Allowed: ${allowedRoles}`);
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