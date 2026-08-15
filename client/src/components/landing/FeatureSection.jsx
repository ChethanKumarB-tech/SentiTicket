import React, { useState } from 'react';
import { motion } from 'motion/react';

export function FeatureSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      num: '01',
      title: 'Predictive SLA Intelligence',
      desc: 'Machine learning continuously calculates breach likelihood before deadlines expire. Evaluate agent workload, category baselines, and historical resolution duration.',
      tag: 'AI Breach Forecaster'
    },
    {
      num: '02',
      title: 'Role-Based Operations',
      desc: 'Every user sees only the capabilities required for their role. Strict RBAC ensures customers, agents, managers, and administrators operate with least-privilege boundaries.',
      tag: '4-Tier RBAC Architecture'
    },
    {
      num: '03',
      title: 'Multi-Tenant Security',
      desc: 'Cryptographic organization boundaries prevent cross-tenant data access. Server-enforced tenancy guarantees zero data leakage between customer accounts.',
      tag: 'Cryptographic Tenant Isolation'
    },
    {
      num: '04',
      title: 'Security Monitoring & Audit',
      desc: 'Immutable audit trails and real-time security event alarms. Every status transition, assignment change, and authentication attempt is cryptographically verifiable.',
      tag: 'Zero-Trust Telemetry'
    }
  ];

  return (
    <section
      id="features"
      style={{
        padding: '120px 24px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #F1F5F9'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ maxWidth: '720px', marginBottom: '72px' }}>
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
            SYSTEM CAPABILITIES
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
            Support intelligence,
            <br />
            without the blind spots.
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6 }}>
            From ticket creation to SLA resolution, SentiTicket combines operational intelligence
            with enterprise security.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {features.map((feat, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <motion.div
                key={feat.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  borderTop: '1px solid #E2E8F0',
                  padding: '48px 0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '32px',
                  alignItems: 'baseline',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
                    <motion.span
                      animate={{ x: isHovered ? 4 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: '#2563EB'
                      }}
                    >
                      {feat.num}
                    </motion.span>
                    <motion.h3
                      animate={{ x: isHovered ? 6 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: '22px',
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        color: '#0F172A',
                        margin: 0
                      }}
                    >
                      {feat.title}
                    </motion.h3>
                  </div>
                </div>

                <div style={{ maxWidth: '580px' }}>
                  <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '12px' }}>
                    {feat.desc}
                  </p>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: isHovered ? '#EFF6FF' : '#F8FAFC',
                      color: isHovered ? '#2563EB' : '#64748B',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: isHovered ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {feat.tag}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
