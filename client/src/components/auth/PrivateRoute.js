import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { isVerified, isInitializing } = useSelector((state) => state.user);
  const location = useLocation();

  if (isInitializing) {
    return null; // Or a loading spinner if preferred, but usually App handles it
  }

  if (!isVerified) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 