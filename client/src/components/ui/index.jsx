import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export function Badge({ children, variant = 'neutral', icon: Icon, className = '', size = 'md' }) {
  const sizeStyles = size === 'sm' ? { fontSize: '10px', padding: '1px 6px' } : {};

  return (
    <span className={`badge badge-${variant} ${className}`} style={sizeStyles}>
      {Icon && <Icon size={size === 'sm' ? 10 : 12} style={{ flexShrink: 0 }} />}
      <span>{children}</span>
    </span>
  );
}

export function Spinner({ size = 24, className = '', color = 'var(--color-primary)' }) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2.5px solid var(--color-slate-200)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}
      className={className}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingSkeleton({ type = 'card', count = 1, height }) {
  if (type === 'table') {
    return (
      <div className="table-container" style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: '32px', marginBottom: 'var(--space-3)', width: '100%' }} />
        {Array.from({ length: count || 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '42px',
              marginBottom: i === count - 1 ? 0 : 'var(--space-2)',
              width: '100%',
              opacity: 1 - i * 0.12
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'metric') {
    return (
      <div className="metric-grid">
        {Array.from({ length: count || 4 }).map((_, i) => (
          <div key={i} className="card" style={{ height: '110px' }}>
            <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '12px', width: '75%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card skeleton"
          style={{ height: height || '120px', width: '100%' }}
        />
      ))}
    </div>
  );
}

export function MetricCard({ label, value, subtitle, trend, icon: Icon, accentColor, variant }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className="metric-card"
      style={{
        borderLeft: accentColor ? `3.5px solid ${accentColor}` : undefined
      }}
    >
      <div className="metric-label">
        <span>{label}</span>
        {Icon && (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-slate-100)',
              color: accentColor || 'var(--color-slate-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={15} />
          </div>
        )}
      </div>

      <div className="metric-value" style={{ color: accentColor || 'var(--color-text-primary)' }}>
        {value}
      </div>

      {subtitle && (
        <div className="metric-subtitle">
          {trend && (
            <span
              style={{
                fontWeight: 600,
                color: trend.isPositive ? 'var(--color-success-text)' : 'var(--color-danger-text)'
              }}
            >
              {trend.value}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-slate-100)',
            color: 'var(--color-slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3
        style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-1)'
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '420px',
          margin: '0 auto var(--space-5)',
          lineHeight: 1.5
        }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

export function ErrorState({ title = 'Unable to load content', message = 'Please check your connection and try again.', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-6)',
        border: '1px dashed var(--color-danger-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-danger-subtle)'
      }}
    >
      <h4
        style={{
          color: 'var(--color-danger-text)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 700,
          marginBottom: 'var(--space-1)'
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-danger-text)',
          opacity: 0.9,
          marginBottom: onRetry ? 'var(--space-4)' : 0
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </motion.div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = '540px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-6)',
              zIndex: 101
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
              <h3 className="card-title" style={{ fontSize: 'var(--font-size-lg)' }}>{title}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                aria-label="Close dialog"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: 'var(--radius-md)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: footer ? 'var(--space-6)' : 0 }}>
              {children}
            </div>

            {footer && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-2)',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--space-4)'
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', isLoading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button type="button" className={`btn btn-${confirmVariant} btn-sm`} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
