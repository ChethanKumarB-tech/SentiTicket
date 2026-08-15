import React from 'react';
import { motion } from 'motion/react';
import { Terminal, FileCheck } from 'lucide-react';

export function AuditVisualization() {
  const auditLogs = [
    { time: '12:04:21', action: 'LOGIN_SUCCESS', role: 'ADMIN', risk: 'LOW', color: '#34D399' },
    { time: '12:04:25', action: 'TICKET_CLAIMED', role: 'AGENT', risk: 'LOW', color: '#34D399' },
    { time: '12:05:03', action: 'SLA_RISK_DETECTED', role: 'SYSTEM', risk: 'MED', color: '#FBBF24' },
    { time: '12:06:11', action: 'UNAUTHORIZED_ACCESS', role: 'CUSTOMER', risk: 'HIGH', color: '#F87171' }
  ];

  return (
    <section
      id="compliance"
      style={{
        padding: '120px 24px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '64px',
            alignItems: 'center'
          }}
        >
          <div>
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
              COMPLIANCE & TRACEABILITY
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 3.25rem)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                lineHeight: 1.06,
                color: '#0F172A',
                margin: '0 0 20px 0'
              }}
            >
              Every action recorded.
              <br />
              Verifiable audit ledger.
            </h2>
            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.6, marginBottom: '28px' }}>
              SentiTicket creates structured, tamper-evident audit logs capturing actor IDs, IP
              addresses, previous states, and timestamped payloads for complete regulatory compliance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Immutable log structure stored with indexed query support',
                'Detailed transition diffs for status, assignment, and priority',
                'Actor role snapshots preserve historical access context'
              ].map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileCheck size={18} color="#2563EB" />
                  <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              border: '1px solid #1E293B',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#0B1120',
                borderBottom: '1px solid #1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={15} color="#94A3B8" />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#E2E8F0', fontWeight: 600 }}>
                  COMPLIANCE AUDIT TELEMETRY
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                ● SYNCHRONIZED
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {auditLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#1E293B',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ color: '#64748B' }}>{log.time}</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{log.action}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#94A3B8' }}>{log.role}</span>
                    <span
                      style={{
                        color: log.color,
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}
                    >
                      {log.risk}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
