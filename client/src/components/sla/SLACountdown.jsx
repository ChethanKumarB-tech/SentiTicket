import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, PauseCircle, Flame } from 'lucide-react';
import { Badge } from '../ui';
import { RiskPulse } from '../motion';

/**
 * Real-time SLA Countdown Component
 * Server-enforced authoritative deadline sync with micro-animations
 */
export function SLACountdown({ deadline, state = 'SAFE', createdAt, resolutionTargetMinutes, compact = false }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isOverdue: false, totalSeconds: 0 });

  useEffect(() => {
    if (!deadline || state === 'PAUSED') return;

    function updateTimer() {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const difference = target - now;

      if (difference <= 0) {
        const overdueDiff = Math.abs(difference);
        const hours = Math.floor(overdueDiff / (1000 * 60 * 60));
        const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((overdueDiff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isOverdue: true, totalSeconds: -Math.floor(overdueDiff / 1000) });
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isOverdue: false, totalSeconds: Math.floor(difference / 1000) });
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, state]);

  const pad = (n) => String(n).padStart(2, '0');
  const timeString = `${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;

  // Status mapping
  const statusConfig = {
    SAFE: {
      variant: 'success',
      icon: CheckCircle2,
      label: 'SAFE',
      textColor: 'var(--color-success-text)',
      borderColor: 'var(--color-success-border)'
    },
    AT_RISK: {
      variant: 'warning',
      icon: AlertTriangle,
      label: 'AT RISK',
      textColor: 'var(--color-warning-text)',
      borderColor: 'var(--color-warning-border)'
    },
    CRITICAL: {
      variant: 'danger',
      icon: Flame,
      label: 'CRITICAL',
      textColor: 'var(--color-danger-text)',
      borderColor: 'var(--color-danger-border)'
    },
    BREACHED: {
      variant: 'danger',
      icon: AlertCircle,
      label: 'SLA BREACHED',
      textColor: 'var(--color-danger-text)',
      borderColor: 'var(--color-danger-border)'
    },
    PAUSED: {
      variant: 'neutral',
      icon: PauseCircle,
      label: 'SLA PAUSED',
      textColor: 'var(--color-slate-600)',
      borderColor: 'var(--color-border)'
    }
  };

  const config = statusConfig[state] || statusConfig.SAFE;
  const StateIcon = config.icon;

  let progressPercent = 0;
  if (createdAt && resolutionTargetMinutes && state !== 'PAUSED') {
    const start = new Date(createdAt).getTime();
    const totalDuration = resolutionTargetMinutes * 60 * 1000;
    const now = new Date().getTime();
    const elapsed = Math.max(0, now - start);
    progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  }

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Badge variant={config.variant} icon={StateIcon} size="sm">
          {config.label}
        </Badge>
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: timeLeft.isOverdue || state === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-text-primary)'
          }}
        >
          {state === 'PAUSED' ? 'Paused' : timeLeft.isOverdue ? `-${timeString}` : timeString}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card"
      style={{
        borderLeft: `4px solid ${
          state === 'BREACHED' || state === 'CRITICAL'
            ? 'var(--color-danger)'
            : state === 'AT_RISK'
            ? 'var(--color-warning)'
            : 'var(--color-success)'
        }`,
        backgroundColor: state === 'BREACHED' ? 'var(--color-danger-subtle)' : 'var(--color-surface)',
        padding: 'var(--space-5)'
      }}
      role="region"
      aria-label="Authoritative SLA Countdown Timer"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} style={{ color: 'var(--color-slate-500)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Authoritative SLA Target
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(state === 'CRITICAL' || state === 'BREACHED') && <RiskPulse color="var(--color-danger)" size={6} />}
          <Badge variant={config.variant} icon={StateIcon}>
            {config.label}
          </Badge>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', margin: 'var(--space-2) 0' }}>
        <span
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            fontFamily: 'var(--font-family-mono)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            color:
              state === 'BREACHED' || timeLeft.isOverdue || state === 'CRITICAL'
                ? 'var(--color-danger)'
                : 'var(--color-text-primary)'
          }}
        >
          {state === 'PAUSED' ? 'PAUSED' : timeLeft.isOverdue ? `-${timeString}` : timeString}
        </span>
        {timeLeft.isOverdue && (
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-danger)' }}>
            OVERDUE
          </span>
        )}
      </div>

      {progressPercent > 0 && state !== 'BREACHED' && (
        <div style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            <span>Target Window Used</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{progressPercent}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--color-slate-100)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                backgroundColor:
                  progressPercent >= 80 ? 'var(--color-danger)' : progressPercent >= 50 ? 'var(--color-warning)' : 'var(--color-success)'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)', fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Deadline:</span>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {deadline ? new Date(deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}\n        </span>
      </div>
    </motion.div>
  );
}
