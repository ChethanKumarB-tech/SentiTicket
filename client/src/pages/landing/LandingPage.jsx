import React, { useState } from 'react';
import { useScroll, useTransform } from 'motion/react';
import { CursorGlow } from '../../components/landing/CursorGlow';
import { InteractiveNavbar } from '../../components/landing/InteractiveNavbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { FeatureSection } from '../../components/landing/FeatureSection';
import { AISLASection } from '../../components/landing/AISLASection';
import { SecuritySection } from '../../components/landing/SecuritySection';
import { RoleSection } from '../../components/landing/RoleSection';
import { SecurityDemo } from '../../components/landing/SecurityDemo';
import { AuditVisualization } from '../../components/landing/AuditVisualization';
import { FinalCTA } from '../../components/landing/FinalCTA';
import { Shield } from 'lucide-react';

export function LandingPage() {
  const [targetFocus, setTargetFocus] = useState(null);

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.22], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.88]);
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, -28]);

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        fontFamily: 'var(--font-sans)',
        minHeight: '100vh',
        overflowX: 'hidden',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      <CursorGlow />
      <InteractiveNavbar onHoverTarget={setTargetFocus} />

      <HeroSection
        targetFocus={targetFocus}
        onHoverTarget={setTargetFocus}
        heroScale={heroScale}
        heroOpacity={heroOpacity}
        heroY={heroY}
      />

      <FeatureSection />
      <AISLASection />
      <SecuritySection />
      <RoleSection />
      <SecurityDemo />
      <AuditVisualization />
      <FinalCTA onHoverTarget={setTargetFocus} />

      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '48px 24px 36px'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Shield size={16} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              SentiTicket<span style={{ fontSize: '11px', verticalAlign: 'super' }}>®</span>
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8', marginLeft: '6px' }}>
              Enterprise SLA Intelligence
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Features', href: '#features' },
              { label: 'AI SLA', href: '#ai-sla' },
              { label: 'Security', href: '#security' },
              { label: 'Roles', href: '#roles' },
              { label: 'Compliance', href: '#compliance' },
              { label: 'Sign In', href: '/login' },
              { label: 'Get Started', href: '/register' }
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#64748B',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
            © 2026 SentiTicket. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-auth {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
