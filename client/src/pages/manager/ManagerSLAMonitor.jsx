import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { PriorityBadge, StatusBadge } from '../../components/tickets/Badges';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/ui';
import { StaggerContainer, StaggerItem, AnimatedNumber, RiskPulse } from '../../components/motion';
import { AlertCircle, AlertTriangle, CheckCircle, PauseCircle, ArrowRight, RefreshCw, Flame, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export function ManagerSLAMonitor() {
  const [monitorData, setMonitorData] = useState(null);
  const [activeTab, setActiveTab] = useState('CRITICAL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMonitor = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);
    try {
      const { data } = await api.get('/sla/monitor');
      setMonitorData(data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load live SLA Monitor');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitor();
    const interval = setInterval(() => fetchMonitor(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Real-Time SLA Monitor">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <LoadingSkeleton type="metric" count={4} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <LoadingSkeleton type="table" count={5} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !monitorData) {
    return (
      <DashboardLayout title="Real-Time SLA Monitor">
        <ErrorState message={error || 'Failed to load SLA state'} onRetry={() => fetchMonitor(true)} />
      </DashboardLayout>
    );
  }

  const { summary = {}, tickets = {} } = monitorData;
  const currentTickets = tickets[activeTab] || [];

  return (
    <DashboardLayout title="Real-Time SLA Control Matrix" subtitle="Live tracking of authoritative SLA states, deadline consumption, and breach risks across all active queues">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          <RiskPulse color="var(--color-success)" size={7} />
          <span>Live daemon polling active (30s refresh interval)</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={isRefreshing}
          onClick={() => fetchMonitor(true)}
        >
          Refresh Live SLA State
        </Button>
      </div>

      <StaggerContainer>
        <StaggerItem>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="card"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: 'var(--space-5)',
                border: activeTab === 'CRITICAL' ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'CRITICAL' ? 'var(--color-danger-light)' : 'var(--color-surface)',
                boxShadow: activeTab === 'CRITICAL' ? 'var(--shadow-md)' : 'var(--shadow-xs)'
              }}
              onClick={() => setActiveTab('CRITICAL')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-danger-text)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                <span>CRITICAL (≥ 80% Time)</span>
                <Flame size={16} />
              </div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-danger-text)', marginTop: 'var(--space-1)' }}>
                <AnimatedNumber value={summary.criticalCount || 0} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-danger-text)', opacity: 0.9, marginTop: '2px' }}>
                Immediate escalation required
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="card"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: 'var(--space-5)',
                border: activeTab === 'AT_RISK' ? '2px solid var(--color-warning)' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'AT_RISK' ? 'var(--color-warning-light)' : 'var(--color-surface)',
                boxShadow: activeTab === 'AT_RISK' ? 'var(--shadow-md)' : 'var(--shadow-xs)'
              }}
              onClick={() => setActiveTab('AT_RISK')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-warning-text)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                <span>AT RISK (≥ 50% Time)</span>
                <AlertTriangle size={16} />
              </div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-warning-text)', marginTop: 'var(--space-1)' }}>
                <AnimatedNumber value={summary.atRiskCount || 0} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-warning-text)', opacity: 0.9, marginTop: '2px' }}>
                Window consuming rapidly
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="card"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: 'var(--space-5)',
                border: activeTab === 'BREACHED' ? '2px solid #991B1B' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'BREACHED' ? '#FEE2E2' : 'var(--color-surface)',
                boxShadow: activeTab === 'BREACHED' ? 'var(--shadow-md)' : 'var(--shadow-xs)'
              }}
              onClick={() => setActiveTab('BREACHED')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991B1B', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                <span>SLA BREACHED</span>
                <AlertCircle size={16} />
              </div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: '#991B1B', marginTop: 'var(--space-1)' }}>
                <AnimatedNumber value={summary.breachedCount || 0} />
              </div>
              <div style={{ fontSize: '11px', color: '#991B1B', opacity: 0.9, marginTop: '2px' }}>
                Contractual window exceeded
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="card"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: 'var(--space-5)',
                border: activeTab === 'SAFE' ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'SAFE' ? 'var(--color-success-light)' : 'var(--color-surface)',
                boxShadow: activeTab === 'SAFE' ? 'var(--shadow-md)' : 'var(--shadow-xs)'
              }}
              onClick={() => setActiveTab('SAFE')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-success-text)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                <span>SAFE (&lt; 50% Time)</span>
                <CheckCircle size={16} />
              </div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-success-text)', marginTop: 'var(--space-1)' }}>
                <AnimatedNumber value={summary.safeCount || 0} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-success-text)', opacity: 0.9, marginTop: '2px' }}>
                Healthy resolution buffer
              </div>
            </motion.button>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Active Cases in <span style={{ color: 'var(--color-primary)' }}>{activeTab}</span> State ({currentTickets.length})
              </h3>
            </div>

            {currentTickets.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title={`Zero Tickets in ${activeTab} State`}
                description={`There are currently no support inquiries categorized under the ${activeTab} SLA lifecycle threshold.`}
              />
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Assignee</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Authoritative Deadline</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTickets.map((t, index) => (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <td>
                          <Link to={`/manager/tickets/${t._id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)' }}>
                            #{t.ticketId}
                          </Link>
                        </td>
                        <td>
                          <Link to={`/manager/tickets/${t._id}`} style={{ color: 'var(--color-text-primary)', fontWeight: 600, display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.title}
                          </Link>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)' }}>
                            {t.assignedAgentId ? `${t.assignedAgentId.firstName} ${t.assignedAgentId.lastName}` : 'Unassigned'}
                          </span>
                        </td>
                        <td><StatusBadge status={t.status} size="sm" /></td>
                        <td><PriorityBadge priority={t.priority} size="sm" /></td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-slate-800)', fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(t.slaResolutionDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </td>
                        <td>
                          <Link to={`/manager/tickets/${t._id}`}>
                            <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                              Review Case
                            </Button>
                          </Link>
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
