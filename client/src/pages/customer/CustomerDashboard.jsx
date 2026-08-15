import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/tickets/Badges';
import { SLACountdown } from '../../components/sla/SLACountdown';
import { MetricCard, LoadingSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { StaggerContainer, StaggerItem, AnimatedNumber, MotionCard } from '../../components/motion';
import api from '../../services/api';
import { Ticket, PlusCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, open: 0, atRisk: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tickets?limit=8');
      const ticketList = data.data.tickets || [];
      setTickets(ticketList);

      const total = data.data.pagination?.total || ticketList.length;
      const open = ticketList.filter((t) => ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING'].includes(t.status)).length;
      const atRisk = ticketList.filter((t) => ['AT_RISK', 'CRITICAL', 'BREACHED'].includes(t.slaState)).length;
      const resolved = ticketList.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

      setMetrics({ total, open, atRisk, resolved });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout title="Customer Support Portal" subtitle="Track your active inquiries, SLA targets, and updates">
      <StaggerContainer>
        {isLoading ? (
          <LoadingSkeleton type="metric" count={3} />
        ) : (
          <StaggerItem>
            <div className="metric-grid" style={{ marginBottom: 'var(--space-6)' }}>
              <MetricCard
                label="Active Inquiries"
                value={<AnimatedNumber value={metrics.open} />}
                subtitle="Tickets currently in progress with support staff"
                icon={Clock}
                accentColor="var(--color-primary)"
              />
              <MetricCard
                label="Near SLA / Urgent"
                value={<AnimatedNumber value={metrics.atRisk} />}
                subtitle="Receiving high-priority agent attention"
                icon={AlertTriangle}
                accentColor={metrics.atRisk > 0 ? 'var(--color-warning)' : undefined}
              />
              <MetricCard
                label="Resolved Inquiries"
                value={<AnimatedNumber value={metrics.resolved} />}
                subtitle="Successfully completed requests"
                icon={CheckCircle2}
                accentColor="var(--color-success)"
              />
            </div>
          </StaggerItem>
        )}

        <StaggerItem>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Support Inquiries</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Live status and authoritative SLA resolution countdowns for your submitted cases
                </p>
              </div>
              <Link to="/customer/tickets/new">
                <Button variant="primary" icon={PlusCircle}>
                  Submit New Ticket
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <LoadingSkeleton type="table" count={5} />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchDashboardData} />
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No support tickets found"
                description="You do not have any open inquiries. Need assistance with an enterprise feature or account?"
                action={
                  <Link to="/customer/tickets/new">
                    <Button variant="primary" icon={PlusCircle}>
                      Create Your First Ticket
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
                      <th>Title & Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>SLA Deadline</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t, index) => (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                      >
                        <td>
                          <Link to={`/customer/tickets/${t._id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)' }}>
                            #{t.ticketId}
                          </Link>
                        </td>
                        <td>
                          <Link to={`/customer/tickets/${t._id}`} style={{ color: 'var(--color-text-primary)', fontWeight: 600, display: 'block', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.title}
                          </Link>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--color-slate-600)', fontWeight: 500 }}>
                            {t.category}
                          </span>
                        </td>
                        <td><StatusBadge status={t.status} size="sm" /></td>
                        <td><PriorityBadge priority={t.priority} size="sm" /></td>
                        <td>
                          <SLACountdown
                            deadline={t.slaResolutionDeadline}
                            state={t.slaState}
                            compact
                          />
                        </td>
                        <td>
                          <Link to={`/customer/tickets/${t._id}`}>
                            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                              View
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
