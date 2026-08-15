import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { InteractiveSentinel } from './InteractiveSentinel';
import { ArrowRight, Sparkles, ShieldAlert, Cpu } from 'lucide-react';

function useTypewriter(words, typingSpeed = 40, deletingSpeed = 25, pauseTime = 2400) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (index >= words.length) {
      setIndex(0);
      return;
    }

    const currentWord = words[index];

    if (!isDeleting && subIndex < currentWord.length) {
      const timeout = setTimeout(() => {
        setSubIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && subIndex > 0) {
      const timeout = setTimeout(() => {
        setSubIndex((prev) => prev - 1);
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && subIndex === currentWord.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timeout);
    } else if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }
  }, [subIndex, index, isDeleting, words, typingSpeed, deletingSpeed, pauseTime]);

  return { text: words[index].substring(0, subIndex), blink };
}

export function HeroSection({ targetFocus, onHoverTarget, heroScale, heroOpacity, heroY }) {
  const { text: typewriterText, blink } = useTypewriter([
    'breaches.',
    'SLAs expire.',
    'customers escalate.',
    'risk becomes reality.'
  ]);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: '130px',
        paddingBottom: '80px',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(219, 234, 254, 0.5), transparent 70%)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'inline-flex', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                }}
              >
                <Sparkles size={13} color="#2563EB" />
                <span>INTELLIGENT SUPPORT SECURITY</span>
              </div>
            </div>

            <h1
              style={{
                fontSize: 'clamp(3rem, 6.5vw, 6.2rem)',
                fontWeight: 400,
                letterSpacing: '-0.045em',
                lineHeight: 0.94,
                color: '#0F172A',
                margin: '0 0 24px 0'
              }}
            >
              Support operations,
              <br />
              before they become
              <br />
              <span
                style={{
                  color: '#2563EB',
                  fontWeight: 600,
                  display: 'inline-block',
                  minHeight: '1.05em'
                }}
              >
                {typewriterText}
                <span
                  style={{
                    display: 'inline-block',
                    width: '3px',
                    height: '0.85em',
                    backgroundColor: '#2563EB',
                    marginLeft: '4px',
                    verticalAlign: 'middle',
                    opacity: blink ? 1 : 0
                  }}
                  className="animate-blink"
                />
              </span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                color: '#64748B',
                lineHeight: 1.6,
                maxWidth: '540px',
                margin: '0 0 36px 0',
                fontWeight: 400
              }}
            >
              Intelligent ticket management with predictive SLA risk detection. Anticipate
              bottlenecks, protect contractual commitments, and prioritize what matters right now.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '40px'
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
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  Deploy Enterprise Support <ArrowRight size={17} />
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
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontSize: '15px',
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '660px',
              width: '100%'
            }}
          >
            <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <InteractiveSentinel targetFocus={targetFocus} height="680px" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
