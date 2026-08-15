import React from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, Building2, Terminal, Activity, Brain } from 'lucide-react';

export function SecuritySection() {
  const pillars = [
    {
      icon: Lock,
      num: '01',
      title: 'Authentication & Session Security',
      items: ['JWT Access & Refresh Token Rotation', 'Argon2id Password Hashing with Salt', 'TOTP MFA Verification Engine']
    },
    {
      icon: ShieldCheck,
      num: '02',
      title: 'Granular Role-Based Authorization',
      items: ['4 Distinct Roles (Admin, Manager, Agent, Customer)', 'Least-Privilege Route Middleware', 'Strict BOLA/IDOR Object Guards']
    },
    {
      icon: Building2,
      num: '03',
      title: 'Multi-Tenant Isolation',
      items: ['Organization-Scoped Database Queries', 'Cross-Tenant Zero Data Leakage Defense', 'Cryptographic ID Matching']
    },
    {
      icon: Terminal,
      num: '04',
      title: 'API & Gateway Protection',
      items: ['Zod Schema Input Sanitization', 'Tiered IP Rate Limiting (Strict/Auth/Moderate)', 'Security Headers & CORS Defense']
    },
    {
      icon: Activity,
      num: '05',
      title: 'Monitoring & Telemetry',
      items: ['Real-Time Security Alarms', 'Suspicious Activity Detection & Lockout', 'Immutable Compliance Audit Logs']
    },
    {
      icon: Brain,
      num: '06',
      title: 'AI & Model Security',
      items: ['Shared Secret Inter-Service Auth', 'Model Response Bounds Validation', 'Graceful Heuristic Fallback Engine']
    }
  ];

  return (
    <section
      id="security"
      style={{
        padding: '120px 24px',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ maxWidth: '720px', marginBottom: '64px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#2563EB',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ZERO-TRUST ARCHITECTURE
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 400,
              letterSpacing: '-0.035em',
              lineHeight: 1.04,
              color: '#0F172A',
              margin: '0 0 16px 0'
            }}
          >
            Security follows every request.
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6 }}>
            Engineered following OWASP Top 10 guidelines, NIST access-control principles, and strict
            multi-tenant isolation at the database layer.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '64px'
          }}
        >
          {pillars.map((pillar, i) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={pillar.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB'
                    }}
                  >
                    <IconComp size={18} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                    {pillar.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
                  {pillar.title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pillar.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
