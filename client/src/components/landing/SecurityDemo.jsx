import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, Ban, CheckCircle2 } from 'lucide-react';

export function SecurityDemo() {
  const scenarios = [
    {
      actor: 'ACTOR: CUSTOMER',
      endpoint: 'GET /api/v1/users',
      status: '403 FORBIDDEN',
      explanation: 'Customer tokens attempting to query staff user directories are intercepted and denied by RBAC middleware.',
      tag: 'BOLA & Privilege Guard'
    },
    {
      actor: 'ACTOR: AGENT',
      endpoint: 'GET /api/v1/security/events',
      status: '403 FORBIDDEN',
      explanation: 'Operational engineers cannot inspect sensitive tenant security alarms or brute-force threat telemetry.',
      tag: 'Least-Privilege Enforcement'
    },
    {
      actor: 'ACTOR: TENANT B USER',
      endpoint: 'GET /api/v1/tickets/:tenant_a_id',
      status: '404 / ACCESS DENIED',
      explanation: 'EnforceTenantScope verifies organization ownership on every query. Cross-tenant IDs return 404 with zero metadata leakage.',
      tag: 'Cryptographic Tenancy'
    }
  ];

  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px' }}>
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
            SERVER-SIDE ENFORCEMENT
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
            Prove the boundary.
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6 }}>
            Security rules are strictly executed on the server. Unauthorized requests are rejected
            at the gateway before reaching application logic.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {scenarios.map((sc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #1E293B',
                color: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                  {sc.actor}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#F87171',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  {sc.status}
                </span>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  backgroundColor: '#020617',
                  padding: '12px',
                  borderRadius: '6px',
                  color: '#93C5FD',
                  marginBottom: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                {sc.endpoint}
              </div>

              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
                {sc.explanation}
              </p>

              <div style={{ fontSize: '11px', color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>
                ✓ {sc.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
