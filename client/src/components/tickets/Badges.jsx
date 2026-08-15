import React from 'react';
import { Badge } from '../ui';
import { RiskPulse } from '../motion';
import {
  CircleDot,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Shield,
  User,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const configs = {
    NEW: { variant: 'info', icon: CircleDot, label: 'NEW' },
    OPEN: { variant: 'primary', icon: CircleDot, label: 'OPEN' },
    IN_PROGRESS: { variant: 'warning', icon: Clock, label: 'IN PROGRESS' },
    PENDING: { variant: 'neutral', icon: Clock, label: 'PENDING' },
    RESOLVED: { variant: 'success', icon: CheckCircle, label: 'RESOLVED' },
    CLOSED: { variant: 'neutral', icon: XCircle, label: 'CLOSED' }
  };

  const config = configs[status] || { variant: 'neutral', label: status || 'UNKNOWN' };
  return (
    <Badge variant={config.variant} icon={config.icon} size={size}>
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority, size = 'md' }) {
  const configs = {
    LOW: { variant: 'neutral', label: 'LOW' },
    MEDIUM: { variant: 'info', label: 'MEDIUM' },
    HIGH: { variant: 'warning', icon: AlertTriangle, label: 'HIGH' },
    CRITICAL: { variant: 'danger', icon: AlertCircle, label: 'CRITICAL' }
  };

  const config = configs[priority] || { variant: 'neutral', label: priority || 'NORMAL' };
  return (
    <Badge variant={config.variant} icon={config.icon} size={size}>
      {priority === 'CRITICAL' && <RiskPulse color="var(--color-danger)" size={5} />}
      <span>{config.label}</span>
    </Badge>
  );
}

export function RiskBadge({ riskLevel, probability, size = 'md' }) {
  const configs = {
    LOW: { variant: 'success', label: 'LOW RISK' },
    MEDIUM: { variant: 'info', label: 'MEDIUM RISK' },
    HIGH: { variant: 'warning', icon: AlertTriangle, label: 'HIGH RISK' },
    CRITICAL: { variant: 'danger', icon: Flame, label: 'CRITICAL RISK' }
  };

  const config = configs[riskLevel] || { variant: 'neutral', label: riskLevel || 'UNKNOWN' };
  const probText = probability !== undefined && probability !== null ? ` (${Math.round(probability * 100)}%)` : '';

  return (
    <Badge variant={config.variant} icon={config.icon} size={size}>
      {riskLevel === 'CRITICAL' && <RiskPulse color="var(--color-danger)" size={5} />}
      <span>{config.label}{probText}</span>
    </Badge>
  );
}

export function RoleBadge({ role, size = 'md' }) {
  const configs = {
    CUSTOMER: { variant: 'neutral', icon: User, label: 'Customer' },
    AGENT: { variant: 'primary', icon: UserCheck, label: 'Support Agent' },
    MANAGER: { variant: 'warning', icon: Shield, label: 'Manager' },
    ADMIN: { variant: 'danger', icon: ShieldCheck, label: 'Administrator' }
  };

  const config = configs[role] || { variant: 'neutral', label: role };
  return (
    <Badge variant={config.variant} icon={config.icon} size={size}>
      {config.label}
    </Badge>
  );
}
