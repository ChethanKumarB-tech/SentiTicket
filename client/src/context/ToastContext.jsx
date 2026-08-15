import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Fixed Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100% - 40px)'
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isError = t.type === 'error';
            const isWarning = t.type === 'warning';

            const bg = 'var(--color-surface)';
            const border = isSuccess
              ? '1px solid #86EFAC'
              : isError
              ? '1px solid #FCA5A5'
              : isWarning
              ? '1px solid #FCD34D'
              : '1px solid var(--color-border)';

            const iconColor = isSuccess
              ? 'var(--color-success)'
              : isError
              ? 'var(--color-danger)'
              : isWarning
              ? 'var(--color-warning)'
              : 'var(--color-primary)';

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  pointerEvents: 'auto',
                  backgroundColor: bg,
                  border,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: iconColor, flexShrink: 0 }}>
                    {isSuccess && <CheckCircle2 size={18} />}
                    {isError && <AlertCircle size={18} />}
                    {isWarning && <AlertTriangle size={18} />}
                    {!isSuccess && !isError && !isWarning && <Info size={18} />}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                    {t.message}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-slate-400)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
