import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { MetricCard, LoadingSkeleton, ErrorState } from '../../components/ui';
import { StaggerContainer, StaggerItem, AnimatedNumber, ProgressBar, MotionCard } from '../../components/motion';
import { ShieldCheck, Clock, Users, AlertTriangle, ArrowRight, BarChart3, TrendingUp, CheckCircle2, Flame } from 'lucide-react';
import api from '../../services/api';

export function ManagerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [workloads, setWorkloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchManagerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, workloadRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/workload')
      ]);
      setAnalytics(analyticsRes.data.data);
      setWorkloads(workloadRes.data.data.workload || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load manager analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Manager Oversight Dashboard">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <LoadingSkeleton type="metric" count={4} />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <LoadingSkeleton type="card" height="260px" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout title="Manager Oversight Dashboard">
        <ErrorState message={error || 'Failed to load telemetry'} onRetry={fetchManagerData} />
      </DashboardLayout>
    );
  }

  const { metrics = {}, priorityDistribution = {}, categoryDistribution = {} } = analytics;

  return (
    <DashboardLayout title="Operations & SLA Oversight" subtitle="Real-time operational awareness, team workload balance, and SLA compliance metrics">
      <StaggerContainer>
        <StaggerItem>
          <div className="metric-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <MetricCard
              label="SLA Compliance Rate"
              value={<AnimatedNumber value={metrics.slaComplianceRate || 0} suffix="%" decimals={1} />}
              subtitle="Tickets resolved within deadline"
              icon={CheckCircle2}
              accentColor="var(--color-success)"
            />
            <MetricCard
              label="Mean Resolution Time (MTTR)"
              value={<AnimatedNumber value={metrics.averageResolutionHours || 0} suffix=" hrs" decimals={1} />}
              subtitle="Average completion velocity"
              icon={Clock}
              accentColor="var(--color-info)"
            />
            <MetricCard
              label="Critical Priority Cases"
              value={<AnimatedNumber value={metrics.criticalTickets || 0} />}
              subtitle="Highest urgency attention required"
              icon={AlertTriangle}
              accentColor={metrics.criticalTickets > 0 ? 'var(--color-danger)' : undefined}
            />
            <MetricCard
              label="Total Active Inquiries"
              value={<AnimatedNumber value={metrics.openTickets || 0} />}
              subtitle="Across all support queues"
              icon={Users}
              accentColor="var(--color-primary)"
            />
          </div>
        </StaggerItem>

        <StaggerItem>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Agent Bandwidth & Capacity</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Concurrent case allocations (Target: ≤ 10 active cases per staff)
                  </p>
                </div>
                <Link to="/manager/team">
                  <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                    Manage Staff
                  </Button>
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {workloads.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textAlign: 'center', padding: 'var(--space-4)' }}>
                    No active staff assignments detected.
                  </div>
                ) : (
                  workloads.map(({ agent, openTickets, criticalTickets, capacityPercentage, status }) => {
                    const barColor =
                      capacityPercentage >= 90
                        ? 'var(--color-danger)'
                        : capacityPercentage >= 60
                        ? 'var(--color-warning)'
                        : 'var(--color-success)';

                    return (
                      <div key={agent._id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{agent.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>({agent.role})</span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: barColor }}>
                            {openTickets} Cases ({capacityPercentage}%)
                          </span>
                        </div>
                        <ProgressBar value={capacityPercentage} max={100} color={barColor} height={6} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Case Distribution & Velocity</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Active queue composition by urgency and domain
                  </p>
                </div>
                <Link to="/manager/sla">
                  <Button variant="danger" size="sm" icon={AlertTriangle}>
                    SLA Monitor
                  </Button>
                </Link>
              </div>

              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Urgency Distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--color-danger-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: 'var(--color-danger-text)', fontWeight: 700 }}>CRITICAL</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-danger-text)' }}>{priorityDistribution.CRITICAL || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--color-warning-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: 'var(--color-warning-text)', fontWeight: 700 }}>HIGH</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-warning-text)' }}>{priorityDistribution.HIGH || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--color-info-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: 'var(--color-info-text)', fontWeight: 700 }}>MEDIUM</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-info-text)' }}>{priorityDistribution.MEDIUM || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: 'var(--color-slate-700)', fontWeight: 700 }}>LOW</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-slate-700)' }}>{priorityDistribution.LOW || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                  {Object.entries(categoryDistribution).map(([cat, count]) => (\n                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{cat}</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </DashboardLayout>
  );
}
