import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  style = {},
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      whileHover={disabled || isLoading ? undefined : { y: -1, scale: 1.01 }}
      whileTap={disabled || isLoading ? undefined : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} className="animate-spin" />
          <span>{typeof children === 'string' ? 'Processing...' : children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />}
        </>
      )}
    </motion.button>
  );
}
