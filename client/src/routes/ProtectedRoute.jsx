import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';

export function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect user to their own role dashboard if unauthorized for this route
    if (user.role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    if (user.role === 'AGENT') return <Navigate to="/agent/dashboard" replace />;
    if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
