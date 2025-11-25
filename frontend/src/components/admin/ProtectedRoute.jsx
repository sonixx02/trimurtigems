import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - Wrapper component to protect admin routes
 * Checks localStorage for authentication token
 * Redirects to /login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
