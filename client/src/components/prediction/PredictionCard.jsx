import React from 'react';
import { motion } from 'motion/react';
import { Brain, AlertTriangle, ShieldCheck, Info, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { Badge } from '../ui';
import { RiskPulse, ProgressBar } from '../motion';

export function PredictionCard({ prediction, isLoading = false, onRefresh }) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
        style={{ borderLeft: '4px solid var(--color-info)', padding: 'var(--space-5)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Brain size={22} className="animate-spin" style={{ color: 'var(--color-info)' }} />
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Analyzing SLA Risk Patterns...
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Evaluating workload, category velocity, and historical breach factors
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!prediction) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
        style={{ padding: 'var(--space-5)', border: '1px dashed var(--color-border)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Brain size={18} style={{ color: 'var(--color-slate-400)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              No ML breach prediction calculated yet.
            </span>
          </div>
          {onRefresh && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh}>
              Run AI Prediction
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const {
    breachProbability = 0,
    riskLevel = 'LOW',
    predictedResolutionHours = 0,
    riskFactors = [],
    modelVersion = 'sla-risk-v1.0'
  } = prediction;

  const displayPercent = (breachProbability * 100).toFixed(1);
  const numericPercent = Math.round(breachProbability * 100);

  const isCrit = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';

  const riskBadgeVariants = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'danger'
  };

  const riskColors = {
    LOW: 'var(--color-success)',
    MEDIUM: 'var(--color-info)',
    HIGH: 'var(--color-warning)',
    CRITICAL: 'var(--color-danger)'
  };

  const accentColor = riskColors[riskLevel] || 'var(--color-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        padding: 'var(--space-5)'
      }}
      role="region"
      aria-label="AI SLA Breach Risk Prediction"
    >
      <div className="card-header" style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={15} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Machine Learning Advisory
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              AI SLA Breach Risk
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(isCrit || isHigh) && <RiskPulse color={accentColor} size={6} />}
          <Badge variant={riskBadgeVariants[riskLevel] || 'neutral'}>
            {riskLevel} RISK ({displayPercent}%)
          </Badge>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
          <span>Predicted Breach Likelihood</span>
          <span style={{ fontWeight: 800, color: accentColor, fontVariantNumeric: 'tabular-nums' }}>{displayPercent}%</span>
        </div>
        <ProgressBar value={numericPercent} max={100} color={accentColor} height={8} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--color-slate-50)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-3)',
          fontSize: 'var(--font-size-xs)'
        }}
      >
        <div>
          <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', fontWeight: 600 }}>EST. RESOLUTION</span>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{predictedResolutionHours} hrs</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', fontWeight: 600 }}>MODEL VERSION</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{modelVersion}</span>
        </div>
      </div>

      {riskFactors.length > 0 && (
        <div style={{ backgroundColor: 'var(--color-slate-50)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Detected Risk Factors:
          </div>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {riskFactors.map((factor, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.08 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}
              >
                <span style={{ color: accentColor, fontWeight: 800, lineHeight: 1 }}>•</span>
                <span>{factor}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
        <Info size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-slate-400)' }} />
        <span>AI prediction is advisory and should support, not replace, operator judgment. Server-enforced SLA deadlines remain authoritative.</span>
      </div>
    </motion.div>
  );
}
