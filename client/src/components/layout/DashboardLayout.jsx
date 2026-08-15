import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Menu, Shield, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { PageTransition, RiskPulse } from '../motion';

export function AppHeader({ title, subtitle, onToggleMobileSidebar }) {
  const { user, organization, logout } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: 'var(--shadow-xs)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          className="btn btn-ghost btn-sm mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
          style={{ display: 'none', padding: '6px' }}
        >
          <Menu size={20} />
        </motion.button>

        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success-text)',
            fontSize: '11px',
            fontWeight: 700
          }}
          className="desktop-status-pill"
        >
          <RiskPulse color="var(--color-success)" size={6} />
          <span>SLA Daemon Active</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <motion.button
            whileHover={{ scale: 1.02, color: 'var(--color-danger)' }}
            whileTap={{ scale: 0.97 }}
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={logout}
            title="Sign out securely"
            aria-label="Logout"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-slate-600)' }}
          >
            <LogOut size={15} />
            <span style={{ fontSize: 'var(--font-size-xs)' }}>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children, title, subtitle }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="main-content">
        <AppHeader
          title={title}
          subtitle={subtitle}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="page-body">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
