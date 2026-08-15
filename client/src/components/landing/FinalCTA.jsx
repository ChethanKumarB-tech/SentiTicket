import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { InteractiveSentinel } from './InteractiveSentinel';
import { ArrowRight } from 'lucide-react';

export function FinalCTA({ onHoverTarget = () => { } }) {
  return (
    <section
      style={{
        padding: '140px 24px 100px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <h2
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
            fontWeight: 400,
            letterSpacing: '-0.045em',
            lineHeight: 0.96,
            color: '#0F172A',
            margin: '0 0 24px 0'
          }}
        >
          Resolve before it
          <br />
          becomes a breach.
        </h2>
        <p
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
            color: '#64748B',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto 44px'
          }}
        >
          Build a support operation that knows what needs attention before your customers do.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '64px'
          }}
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/register"
              onMouseEnter={() => onHoverTarget('cta-primary')}
              onMouseLeave={() => onHoverTarget(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                transition: 'background-color 0.15s ease'
              }}
            >
              Deploy Enterprise Support <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              onMouseEnter={() => onHoverTarget('cta-secondary')}
              onMouseLeave={() => onHoverTarget(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                padding: '16px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              Access Organization
            </Link>
          </motion.div>
        </div>

        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            position: 'relative'
          }}
        >
          <InteractiveSentinel height="420px" />
        </div>
      </div>
    </section>
  );
}
