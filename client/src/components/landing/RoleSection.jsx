import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Gauge, UserCheck, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RoleSection() {
  const [activeTab, setActiveTab] = useState('ADMIN');

  const roles = [
    {\n      id: 'ADMIN',\n      label: 'Administrator',\n      icon: Shield,\n      title: 'Tenant Administrator Workspace',\n      desc: 'Full administrative authority over organizational staff provisioning, 4-tier SLA target rules, threat security alarms, and compliance audit trail inspection.',\n      features: [\n        'Staff & User Directory Management',\n        'Configurable 4-Tier SLA Policy Matrices',\n        'Immutable Security & Compliance Audit Log',\n        'Threat Alarm Telemetry Feed'\n      ]\n    },
    {\n      id: 'MANAGER',\n      label: 'Support Manager',\n      icon: Gauge,\n      title: 'Support Operations Manager Workspace',\n      desc: 'Operational mission control for monitoring live SLA health across all departments, balancing engineer workloads, and reallocating critical incidents.',\n      features: [\n        'Real-Time Live SLA Monitor with 30s Heartbeat',\n        'Engineer Workload & Active Bandwidth Analytics',\n        'Cross-Department Ticket Assignment & Rebalancing',\n        'SLA Breach Probability Forecasting'\n      ]\n    },
    {\n      id: 'AGENT',\n      label: 'Support Engineer',\n      icon: UserCheck,\n      title: 'Support Engineer Triage Workspace',\n      desc: 'High-velocity interface for managing assigned inquiries, claiming tickets from the triage pool, requesting AI breach forecasts, and publishing internal staff notes.',\n      features: [\n        'Priority Action Queue & Case Claiming',\n        'SLA Risk Board with Countdown Clocks',\n        'On-Demand ML Breach Forecast Predictions',\n        'Internal Staff Notes with Role Locking'\n      ]\n    },
    {\n      id: 'CUSTOMER',\n      label: 'Customer / Client',\n      icon: Users,\n      title: 'Customer Self-Service Portal',\n      desc: 'Transparent portal enabling enterprise customers to create support requests, track contractual SLA resolution deadlines, and exchange public replies with support staff.',\n      features: [\n        'Simplified Ticket Submission Workflow',\n        'Authoritative SLA Resolution Countdown Timers',\n        'Chronological Comment Threading & History',\n        'Strict BOLA/IDOR Object Isolation'\n      ]\n    }
  ];

  const current = roles.find((r) => r.id === activeTab);

  return (
    <section
      id="roles"
      style={{
        padding: '120px 24px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
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
            ROLE-BASED WORKSPACES
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
            One platform.
            <br />
            Four controlled experiences.
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6 }}>
            Each persona receives dedicated workflows tailored precisely to their operational authority.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '36px',
            flexWrap: 'wrap'
          }}
        >
          {roles.map((tab) => {
            const IconTab = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
                }}
              >
                <IconTab size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              padding: '36px',
              maxWidth: '960px',
              margin: '0 auto',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  {current.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
                  {current.desc}
                </p>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2563EB',
                    textDecoration: 'none'
                  }}
                >
                  Access Workspace <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {current.features.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#334155'
                    }}
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
