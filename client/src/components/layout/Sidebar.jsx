import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  Shield,
  FileText,
  Settings,
  UserCheck,
  FolderLock,
  Flame,
  LifeBuoy,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../tickets/Badges';

export function Sidebar({ isMobileOpen = false, onMobileClose }) {
  const { user, organization } = useAuth();
  const location = useLocation();
  const role = user?.role || 'CUSTOMER';

  const navItemsByRole = {
    CUSTOMER: [
      { to: '/customer/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/customer/tickets', label: 'My Tickets', icon: Ticket },
      { to: '/customer/tickets/new', label: 'Submit Ticket', icon: PlusCircle }
    ],
    AGENT: [
      { to: '/agent/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/agent/tickets', label: 'My Assigned Tickets', icon: Ticket },
      { to: '/agent/queue', label: 'Triage Queue', icon: Clock },
      { to: '/agent/sla-risk', label: 'SLA Risk Board', icon: Flame }
    ],
    MANAGER: [
      { to: '/manager/dashboard', label: 'Operations Overview', icon: LayoutDashboard },
      { to: '/manager/tickets', label: 'All Cases', icon: Ticket },
      { to: '/manager/sla', label: 'Real-Time SLA Monitor', icon: AlertTriangle },
      { to: '/manager/team', label: 'Team Capacity & Load', icon: Users }
    ],
    ADMIN: [
      { to: '/admin/dashboard', label: 'Administration', icon: LayoutDashboard },
      { to: '/admin/users', label: 'User Directory', icon: UserCheck },
      { to: '/admin/sla-policies', label: 'SLA Policies', icon: FolderLock },
      { to: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
      { to: '/admin/security', label: 'Security Alarms', icon: Shield }
    ]
  };

  const navItems = navItemsByRole[role] || navItemsByRole.CUSTOMER;

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <motion.div
            whileHover={{ rotate: [-4, 4, 0], scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '-0.02em',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
            }}
          >
            ST
          </motion.div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              SentiTicket
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', maxWidth: '135px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {organization?.name || 'Enterprise Ops'}
            </div>
          </div>
        </div>

        {isMobileOpen && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role Workspace Indicator */}
      <div style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-slate-50)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Workspace
          </span>
          <RoleBadge role={role} size="sm" />
        </div>
      </div>

      {/* Navigation Links with animated active pill */}
      <nav style={{ padding: 'var(--space-4) var(--space-3)', flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

            return (\n              <li key={item.to} style={{ position: 'relative' }}>
                <NavLink
                  to={item.to}
                  onClick={() => {
                    if (isMobileOpen && onMobileClose) onMobileClose();
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-slate-600)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    zIndex: 1
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'var(--color-primary-subtle)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--color-primary)',
                        zIndex: -1
                      }}
                    />
                  )}
                  <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                  </motion.div>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Profile */}
      <motion.div
        whileHover={{ backgroundColor: 'var(--color-slate-100)' }}
        transition={{ duration: 0.15 }}
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-slate-50)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-slate-700)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.email}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <aside
        style={{
          width: '260px',
          flexShrink: 0
        }}
        className="desktop-sidebar"
        aria-label="Main Navigation"
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(3px)'
              }}
              onClick={onMobileClose}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: '260px',
                zIndex: 100,
                boxShadow: 'var(--shadow-xl)'
              }}
              className="mobile-sidebar-open"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
