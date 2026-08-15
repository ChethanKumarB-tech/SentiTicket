import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const motionTransitions = {
  micro: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  normal: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  page: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring', stiffness: 400, damping: 28 }
};

export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={motionTransitions.page}
      className={className}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, delay = 0.05, stagger = 0.06, className = '', style = {} }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', style = {} }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.99 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}

export function MotionCard({ children, className = 'card', style = {}, onClick, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.008, transition: { duration: 0.18, ease: 'easeOut' } } : undefined}
      whileTap={onClick ? { scale: 0.995 } : undefined}
      className={className}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({ value, duration = 800, suffix = '', prefix = '', decimals = 0 }) {
  const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (numericTarget - startValue) * easeOutProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    startTimeRef.current = null;
    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [numericTarget, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export function RiskPulse({ color = 'var(--color-danger)', size = 8 }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size
      }}
    >
      <motion.span
        animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: color
        }}
      />
      <span
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block'
        }}
      />
    </span>
  );
}

export function ProgressBar({ value = 0, max = 100, color = 'var(--color-primary)', height = 6, backgroundColor = 'var(--color-slate-100)' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      style={{
        width: '100%',
        height,
        backgroundColor,
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: 'var(--radius-full)'
        }}
      />
    </div>
  );
}
