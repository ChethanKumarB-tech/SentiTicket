import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AISLASection() {
  const [sliderPos, setSliderPos] = useState(87);

  const handleMouseMoveTrack = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  const getRiskLabel = (val) => {
    if (val >= 80) return { label: 'CRITICAL', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
    if (val >= 50) return { label: 'HIGH RISK', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
    if (val >= 25) return { label: 'MODERATE', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' };
    return { label: 'SAFE', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' };
  };

  const currentRisk = getRiskLabel(sliderPos);

  return (
    <section
      id="ai-sla"
      style={{
        padding: '120px 24px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
            MACHINE LEARNING INFERENCE
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
            Know the risk
            <br />
            before the deadline.
          </h2>
          <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.6, marginBottom: '28px' }}>
            SentiTicket continuously evaluates tickets across multivariate telemetry: ticket age,
            category baseline MTTR, assigned engineer bandwidth, and remaining SLA contractual window.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {[
              'Real-time breach likelihood forecasting (0% - 100%)',
              'Internal FastAPI Python ML microservice integration',
              'Deterministic heuristic fallback ensures 99.99% operational continuity'
            ].map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#2563EB" />
                <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500 }}>{feat}</span>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2563EB',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none'
            }}
          >
            Deploy SLA Forecast Engine <ChevronRight size={16} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.08)',
            padding: '28px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain size={20} color="#2563EB" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Live ML Inference Forecast
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: currentRisk.bg,
                color: currentRisk.color,
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                border: `1px solid ${currentRisk.border}`
              }}
            >
              {currentRisk.label}
            </span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Breach Likelihood (Hover to Simulate)
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: currentRisk.color
                }}
              >
                {sliderPos}%
              </span>
            </div>

            <div
              onMouseMove={handleMouseMoveTrack}
              style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#F1F5F9',
                borderRadius: '9999px',
                position: 'relative',
                cursor: 'ew-resize',
                overflow: 'hidden'
              }}
            >
              <motion.div
                animate={{ width: `${sliderPos}%` }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  backgroundColor: sliderPos >= 80 ? '#DC2626' : sliderPos >= 50 ? '#D97706' : '#2563EB',
                  borderRadius: '9999px'
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
