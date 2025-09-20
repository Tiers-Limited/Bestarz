import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext.jsx';


const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      provider: '/provider/dashboard',
      client: '/client/dashboard'
    };
    
    const redirectTo = dashboardRoutes[user?.role] || '/signin';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;