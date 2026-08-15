import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { StaggerContainer, StaggerItem } from '../../components/motion';
import { Shield, KeyRound, AlertCircle, Eye, EyeOff, Lock, CheckCircle2, Sparkles, Building } from 'lucide-react';

export function LoginPage() {
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [mfaChallengeToken, setMfaChallengeToken] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login({ email, password, organizationSlug: organizationSlug.trim() || undefined });
      if (result.requiresMfa) {
        setMfaChallengeToken(result.mfaToken);
      } else {
        const role = result.user.role;
        if (role === 'CUSTOMER') navigate('/customer/dashboard');
        else if (role === 'AGENT') navigate('/agent/dashboard');
        else if (role === 'MANAGER') navigate('/manager/dashboard');
        else if (role === 'ADMIN') navigate('/admin/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await verifyMfa(mfaChallengeToken, totpCode);
      const role = user.role;
      if (role === 'CUSTOMER') navigate('/customer/dashboard');
      else if (role === 'AGENT') navigate('/agent/dashboard');
      else if (role === 'MANAGER') navigate('/manager/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Invalid 6-digit TOTP verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        backgroundColor: 'var(--color-background)'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-slate-900)',
          color: 'white',
          padding: 'var(--space-10) var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        className="auth-sidebar-panel"
      >
        <StaggerContainer delay={0.05} stagger={0.08}>
          <StaggerItem>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', color: 'white', textDecoration: 'none', marginBottom: 'var(--space-8)' }}>
              <motion.div
                whileHover={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
                }}
              >
                ST
              </motion.div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>SentiTicket</div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate-400)' }}>Enterprise SLA Intelligence</div>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <div style={{ maxWidth: '440px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 'var(--space-4)' }}>
                Proactive support operations before SLAs are breached.
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-slate-300)', lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>
                Experience automated SLA deadline tracking, machine learning breach forecasts, and seamless role-based ticket resolution.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>Authoritative SLA Lifecycle</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-slate-400)' }}>Server-enforced deadlines with business hours computation.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>AI Breach Likelihood Forecasts</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-slate-400)' }}>Predictive ML analysis identifies bottleneck risks in real time.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>Zero-Trust Tenant Boundaries</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-slate-400)' }}>Cryptographic session tokens and immutable compliance audits.</div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <div style={{ fontSize: '11px', color: 'var(--color-slate-500)', marginTop: 'var(--space-8)' }}>
          © 2026 SentiTicket. Protected by Argon2id & ASVS Level 2 Security Controls.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--space-6)',
          backgroundColor: 'var(--color-background)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="card"
          style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)' }}
        >
          <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              {mfaChallengeToken ? 'Two-Factor Verification' : 'Sign in to SentiTicket'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {mfaChallengeToken
                ? 'Enter the 6-digit TOTP code generated by your authenticator app.'
                : 'Enter your work credentials to access your support workspace.'}
            </p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: 'var(--color-danger-light)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: 'var(--color-danger-text)',
                  fontSize: 'var(--font-size-xs)',
                  overflow: 'hidden'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!mfaChallengeToken ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Work Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="form-input"
                    placeholder="••••••••••••"
                    style={{ paddingRight: '40px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-slate-400)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="orgSlug">
                  Organization Slug <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional for Multi-Tenant)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="orgSlug"
                    type="text"
                    className="form-input"
                    placeholder="e.g. acme-corp"
                    value={organizationSlug}
                    onChange={(e) => setOrganizationSlug(e.target.value)}
                  />
                </div>
                <div className="form-hint">Leave blank to auto-detect organization from your email domain.</div>
              </div>

              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                isLoading={isLoading}
                icon={Lock}
              >
                Sign In to Workspace
              </Button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Need an account for your organization?{' '}
                <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  Register Organization
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="totpCode" style={{ textAlign: 'center' }}>
                  6-Digit Security Code
                </label>
                <input
                  id="totpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  className="form-input"
                  placeholder="000000"
                  style={{
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-family-mono)'
                  }}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                />
                <div className="form-hint" style={{ textAlign: 'center' }}>
                  Check your Google Authenticator or 1Password app
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                isLoading={isLoading}
                icon={KeyRound}
              >
                Verify Code & Enter
              </Button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', marginTop: 'var(--space-3)' }}
                onClick={() => setMfaChallengeToken(null)}
              >
                Cancel and Return to Sign In
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
