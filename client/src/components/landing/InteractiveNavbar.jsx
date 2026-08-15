import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowRight, Menu, X } from 'lucide-react';

export function InteractiveNavbar({ onHoverTarget = () => {} }) {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'CUSTOMER') return '/customer/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    if (user.role === 'MANAGER') return '/manager/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #E2E8F0' : '1px solid transparent'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: '#0F172A'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Shield size={18} strokeWidth={2.4} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0F172A' }}>
            SentiTicket<span style={{ fontSize: '12px', verticalAlign: 'super', fontWeight: 500 }}>®</span>
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #DBEAFE',
              marginLeft: '2px'
            }}
          >
            ENTERPRISE
          </span>
        </Link>

        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px'
          }}
          className="desktop-nav"
        >
          {[
            { label: 'Features', href: '#features' },
            { label: 'AI SLA', href: '#ai-sla' },
            { label: 'Security', href: '#security' },
            { label: 'Roles', href: '#roles' },
            { label: 'Compliance', href: '#compliance' }
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#475569',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '16px'
          }}
          className="desktop-auth"
        >
          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              onMouseEnter={() => onHoverTarget('auth')}
              onMouseLeave={() => onHoverTarget(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              Go to Workspace <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                onMouseEnter={() => onHoverTarget('auth')}
                onMouseLeave={() => onHoverTarget(null)}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  transition: 'color 0.15s ease'
                }}
              >
                Sign In
              </Link>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  onMouseEnter={() => onHoverTarget('auth')}
                  onMouseLeave={() => onHoverTarget(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Get Started <ArrowRight size={15} />
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle Navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            cursor: 'pointer'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '68px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 49,
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: 'Features', href: '#features' },
                { label: 'AI SLA', href: '#ai-sla' },
                { label: 'Security', href: '#security' },
                { label: 'Roles', href: '#roles' },
                { label: 'Compliance', href: '#compliance' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#0F172A',
                    textDecoration: 'none',
                    padding: '8px 0'
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '16px',
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
