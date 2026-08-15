import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge, LoadingSkeleton, ErrorState } from '../../components/ui';
import { StaggerContainer, StaggerItem, AnimatedNumber, MotionCard } from '../../components/motion';
import { ShieldCheck, UserCheck, FolderLock, FileText, AlertOctagon, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, securityRes] = await Promise.all([
        api.get('/users?limit=5'),
        api.get('/security/events?limit=5')
      ]);
      setUsers(usersRes.data.data.users || []);
      setSecurityEvents(securityRes.data.data.events || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load tenant administration telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Tenant System Administration">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <LoadingSkeleton type="metric" count={4} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <LoadingSkeleton type="table" count={5} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Tenant System Administration">
        <ErrorState message={error} onRetry={fetchAdminData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tenant System Administration" subtitle="Configure organization security policies, staff provisioning, RBAC authorization, and compliance audit feeds">
      <StaggerContainer>
        {/* Quick Navigation Cards */}
        <StaggerItem>
          <div className="metric-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <MotionCard className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
                <div className="metric-label">
                  <span>Staff Directory</span>
                  <UserCheck size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="metric-value" style={{ color: 'var(--color-primary)' }}>
                  <AnimatedNumber value={users.length} suffix="+ Accounts" />
                </div>
                <div className="metric-subtitle">Provision and manage RBAC roles</div>
              </MotionCard>
            </Link>

            <Link to="/admin/sla-policies" style={{ textDecoration: 'none' }}>
              <MotionCard className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
                <div className="metric-label">
                  <span>SLA Policies</span>
                  <FolderLock size={18} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="metric-value" style={{ color: 'var(--color-warning-text)' }}>
                  Configured
                </div>
                <div className="metric-subtitle">Response & resolution targets matrix</div>
              </MotionCard>
            </Link>

            <Link to="/admin/audit-logs" style={{ textDecoration: 'none' }}>
              <MotionCard className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
                <div className="metric-label">
                  <span>Compliance Audit</span>
                  <FileText size={18} style={{ color: 'var(--color-info)' }} />
                </div>
                <div className="metric-value" style={{ color: 'var(--color-info-text)' }}>
                  Immutable
                </div>
                <div className="metric-subtitle">Tamper-resistant event ledger</div>
              </MotionCard>
            </Link>

            <Link to="/admin/security" style={{ textDecoration: 'none' }}>
              <MotionCard className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
                <div className="metric-label">
                  <span>Security Alarms</span>
                  <AlertOctagon size={18} style={{ color: 'var(--color-danger)' }} />
                </div>
                <div className="metric-value" style={{ color: 'var(--color-danger-text)' }}>
                  <AnimatedNumber value={securityEvents.length} suffix=" Recent" />
                </div>
                <div className="metric-subtitle">Threat telemetry and brute force monitor</div>
              </MotionCard>
            </Link>
          </div>
        </StaggerItem>

        {/* Security Telemetry Section */}
        <StaggerItem>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Security Events</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Real-time audit of authentication attempts, lockout triggers, and token family invalidations
                </p>
              </div>
              <Link to="/admin/security">
                <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                  View All Security Alarms
                </Button>
              </Link>
            </div>

            {securityEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                No recent security alerts recorded. All systems normal.
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Event Type</th>
                      <th>Severity</th>
                      <th>IP Address</th>
                      <th>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityEvents.map((evt, index) => (
                      <motion.tr
                        key={evt._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                      >
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(evt.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '11px', fontWeight: 700, color: evt.severity === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                            {evt.eventType}
                          </code>
                        </td>
                        <td>
                          <Badge
                            variant={evt.severity === 'HIGH' || evt.severity === 'CRITICAL' ? 'danger' : evt.severity === 'MEDIUM' ? 'warning' : 'neutral'}
                            size="sm"
                          >
                            {evt.severity}
                          </Badge>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px' }}>
                            {evt.ipAddress || 'Internal'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)' }}>
                            {evt.userId?.email || 'Pre-Auth / Anonymous'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </StaggerItem>
      </StaggerContainer>
    </DashboardLayout>
  );
}
