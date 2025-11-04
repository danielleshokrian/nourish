import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hasToken = !!localStorage.getItem('token');

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (isAuthenticated || hasToken) ? children : <Navigate to="/login" />;
};

export default PrivateRoute;