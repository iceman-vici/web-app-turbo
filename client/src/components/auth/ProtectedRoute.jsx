import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have the required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;