import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Shield, AlertCircle, CheckCircle2, Sparkles, Building, UserPlus, Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await register(formData);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to create organization account. Please verify your fields.');
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
      >
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'white', textDecoration: 'none', marginBottom: 'var(--space-8)' }}>
            <div
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
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>SentiTicket</div>
              <div style={{ fontSize: '11px', color: 'var(--color-slate-400)' }}>Enterprise SLA Intelligence</div>
            </div>
          </Link>

          <div style={{ maxWidth: '440px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 'var(--space-4)' }}>
              Deploy enterprise support with proactive SLA intelligence.
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate-300)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
              Set up your organization tenant partition in seconds. Your initial account is provisioned with Administrator privileges.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-slate-200)' }}>
                <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Default 4-tier enterprise SLA policies included</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-slate-200)' }}>
                <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Isolated MongoDB multi-tenant collection partitioning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-slate-200)' }}>
                <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Continuous background SLA breach detection daemon</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-slate-500)', marginTop: 'var(--space-8)' }}>
          © 2026 SentiTicket. High-entropy hashing & zero-knowledge security standard.
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
        <div className="card" style={{ width: '100%', maxWidth: '480px', padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Create Organization Account
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Register your organization tenant to begin managing tickets and SLA policies.
            </p>
          </div>

          {errorMessage && (
            <div
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
                fontSize: 'var(--font-size-xs)'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Sarah"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Connor"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Work Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="sarah@cyberdyne.io"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="organizationName">Company / Organization Name</label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="form-input"
                placeholder="Cyberdyne Systems Inc."
                value={formData.organizationName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="••••••••••••"
                  style={{ paddingRight: '40px' }}
                  value={formData.password}
                  onChange={handleChange}
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
              <div className="form-hint">Must be at least 8 characters with upper, lower, and digit.</div>
            </div>

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
              isLoading={isLoading}
              icon={UserPlus}
            >
              Register & Initialize Tenant
            </Button>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
