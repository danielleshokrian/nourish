import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hasToken = !!localStorage.getItem('token');

  // Show minimal loading state only if no token exists
  // If token exists, allow rendering while auth check completes in background
  if (loading && !hasToken) {
    return (
      <div className="loading-screen" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        Loading...
      </div>
    );
  }

  // If we have a token but auth is still loading, render optimistically
  // The API calls will handle 401 errors and redirect if needed
  if (hasToken && loading) {
    return children;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;