import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export function CursorGlow() {
  const [visible, setVisible] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { damping: 28, stiffness: 220 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 220 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHoveringButton(true);
      } else {
        setIsHoveringButton(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [visible, mouseX, mouseY]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: springX,
        top: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: isHoveringButton ? '80px' : '48px',
        height: isHoveringButton ? '80px' : '48px',
        borderRadius: '50%',
        background: isHoveringButton
          ? 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)'
          : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.04) 50%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease'
      }}
    />
  );
}
