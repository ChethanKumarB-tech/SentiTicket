import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, RiskBadge } from '../../components/tickets/Badges';
import { MetricCard, LoadingSkeleton, ErrorState, EmptyState } from '../../components/ui';
import { StaggerContainer, StaggerItem, AnimatedNumber, RiskPulse } from '../../components/motion';
import { Ticket, AlertTriangle, Clock, CheckCircle2, Flame, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../../services/api';

export function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({ open: 0, critical: 0, atRisk: 0, breached: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgentDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tickets?view=my_tickets&limit=25');
      const list = data.data.tickets || [];
      setTickets(list);

      const open = list.filter((t) => ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING'].includes(t.status)).length;
      const critical = list.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
      const atRisk = list.filter((t) => t.slaState === 'AT_RISK' || t.slaState === 'CRITICAL').length;
      const breached = list.filter((t) => t.slaState === 'BREACHED').length;

      setMetrics({ open, critical, atRisk, breached });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load agent workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboard();
  }, []);

  const urgentTickets = tickets.filter(
    (t) => t.priority === 'CRITICAL' || t.slaState === 'CRITICAL' || (t.latestPrediction?.riskLevel === 'CRITICAL' || t.latestPrediction?.riskLevel === 'HIGH')
  );

  return (
    <DashboardLayout title="Agent Operational Workspace" subtitle="Triage active cases, monitor ML breach risk, and protect SLA commitments">
      <StaggerContainer>
        {/* Metric Grid */}
        {isLoading ? (
          <LoadingSkeleton type="metric" count={4} />
        ) : (
          <StaggerItem>
            <div className="metric-grid" style={{ marginBottom: 'var(--space-6)' }}>
              <MetricCard
                label="My Assigned Cases"
                value={<AnimatedNumber value={metrics.open} />}
                subtitle="Active cases in your personal queue"
                icon={Ticket}
                accentColor="var(--color-primary)"
              />
              <MetricCard
                label="Critical Urgency"
                value={<AnimatedNumber value={metrics.critical} />}
                subtitle="Highest priority cases requiring triage"
                icon={AlertTriangle}
                accentColor={metrics.critical > 0 ? 'var(--color-danger)' : undefined}
              />
              <MetricCard
                label="At-Risk SLA Window"
                value={<AnimatedNumber value={metrics.atRisk} />}
                subtitle="SLA window consuming rapidly"
                icon={Flame}
                accentColor={metrics.atRisk > 0 ? 'var(--color-warning)' : undefined}
              />
              <MetricCard
                label="SLA Breached"
                value={<AnimatedNumber value={metrics.breached} />}
                subtitle="Target resolution window exceeded"
                icon={ShieldAlert}
                accentColor={metrics.breached > 0 ? '#991B1B' : undefined}
              />
            </div>
          </StaggerItem>
        )}

        {/* Attention Required Section for High-Risk Tickets */}
        {urgentTickets.length > 0 && !isLoading && (
          <StaggerItem>
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
              style={{
                borderLeft: '4px solid var(--color-danger)',
                backgroundColor: 'var(--color-danger-subtle)',
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RiskPulse color="var(--color-danger)" size={10} />
                  <div>
                    <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-danger-text)' }}>
                      Attention Required ({urgentTickets.length} High-Risk Inquiries)
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--color-danger-text)', opacity: 0.9 }}>
                      These cases are near SLA breach limits or have high machine-learning breach likelihoods.
                    </p>
                  </div>
                </div>
                <Link to="/agent/sla-risk">
                  <Button variant="danger" size="sm" icon={Flame}>
                    Open SLA Risk Board
                  </Button>
                </Link>
              </div>
            </motion.div>
          </StaggerItem>
        )}

        {/* Priority Work Queue */}
        <StaggerItem>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Priority Action Queue</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Assigned cases sorted by urgency, authoritative SLA deadline, and AI breach risk
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Link to="/agent/queue">
                  <Button variant="secondary" size="sm" icon={Clock}>
                    Unassigned Pool
                  </Button>
                </Link>
                <Link to="/agent/sla-risk">
                  <Button variant="danger" size="sm" icon={Flame}>
                    SLA Risk Board
                  </Button>
                </Link>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton type="table" count={6} />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchAgentDashboard} />
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Queue is completely clear"
                description="You have no pending cases assigned. Check the unassigned queue to claim incoming requests."
                action={
                  <Link to="/agent/queue">
                    <Button variant="primary" icon={Ticket}>
                      Open Triage Pool
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>SLA State</th>
                      <th>AI Breach Risk</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t, index) => {
                      return (
                        <motion.tr
                          key={t._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <td>
                            <Link to={`/agent/tickets/${t._id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)' }}>
                              #{t.ticketId}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/agent/tickets/${t._id}`} style={{ color: 'var(--color-text-primary)', fontWeight: 600, display: 'block', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.title}
                            </Link>
                          </td>
                          <td>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)', fontWeight: 500 }}>
                              {t.customerId ? `${t.customerId.firstName} ${t.customerId.lastName}` : 'Customer'}
                            </span>
                          </td>
                          <td><StatusBadge status={t.status} size="sm" /></td>
                          <td><PriorityBadge priority={t.priority} size="sm" /></td>
                          <td>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color:
                                  t.slaState === 'BREACHED'
                                    ? 'var(--color-danger)'
                                    : t.slaState === 'CRITICAL'
                                    ? 'var(--color-danger)'
                                    : t.slaState === 'AT_RISK'
                                    ? 'var(--color-warning)'
                                    : 'var(--color-success)'
                              }}
                            >
                              {t.slaState}
                            </span>
                          </td>
                          <td>
                            {t.latestPrediction ? (\n                              <RiskBadge
                                riskLevel={t.latestPrediction.riskLevel}
                                probability={t.latestPrediction.breachProbability}
                                size="sm"
                              />
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pending ML</span>
                            )}
                          </td>
                          <td>
                            <Link to={`/agent/tickets/${t._id}`}>
                              <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                                Workspace
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      );
                    })}
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
