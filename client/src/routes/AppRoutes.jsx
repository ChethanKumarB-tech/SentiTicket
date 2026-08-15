import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Landing Page
import { LandingPage } from '../pages/landing/LandingPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { CustomerTicketList } from '../pages/customer/CustomerTicketList';
import { CreateTicketPage } from '../pages/customer/CreateTicketPage';
import { CustomerTicketDetails } from '../pages/customer/CustomerTicketDetails';

// Agent Pages
import { AgentDashboard } from '../pages/agent/AgentDashboard';
import { AgentTicketWorkspace } from '../pages/agent/AgentTicketWorkspace';
import { AgentQueuePage } from '../pages/agent/AgentQueuePage';
import { AgentSLARiskPage } from '../pages/agent/AgentSLARiskPage';

// Manager Pages
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { ManagerSLAMonitor } from '../pages/manager/ManagerSLAMonitor';
import { ManagerTeamWorkload } from '../pages/manager/ManagerTeamWorkload';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUserManagement } from '../pages/admin/AdminUserManagement';
import { AdminSLAPolicies } from '../pages/admin/AdminSLAPolicies';
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs';
import { AdminSecurityEvents } from '../pages/admin/AdminSecurityEvents';

export function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'CUSTOMER') return '/customer/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    if (user.role === 'MANAGER') return '/manager/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/tickets" element={<CustomerTicketList />} />
        <Route path="/customer/tickets/new" element={<CreateTicketPage />} />
        <Route path="/customer/tickets/:id" element={<CustomerTicketDetails />} />
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['AGENT', 'MANAGER', 'ADMIN']} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/tickets" element={<CustomerTicketList />} />
        <Route path="/agent/tickets/:id" element={<AgentTicketWorkspace />} />
        <Route path="/agent/queue" element={<AgentQueuePage />} />
        <Route path="/agent/sla-risk" element={<AgentSLARiskPage />} />
      </Route>

      {/* Manager Routes */}
      <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} />}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/tickets" element={<CustomerTicketList />} />
        <Route path="/manager/tickets/:id" element={<AgentTicketWorkspace />} />
        <Route path="/manager/sla" element={<ManagerSLAMonitor />} />
        <Route path="/manager/team" element={<ManagerTeamWorkload />} />
        <Route path="/manager/analytics" element={<ManagerDashboard />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/sla-policies" element={<AdminSLAPolicies />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/security" element={<AdminSecurityEvents />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
