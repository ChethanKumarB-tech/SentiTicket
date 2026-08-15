import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, RiskBadge } from '../../components/tickets/Badges';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { StaggerContainer, StaggerItem, AnimatedNumber, MotionCard, RiskPulse, ProgressBar } from '../../components/motion';
import { Flame, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Sparkles, Clock } from 'lucide-react';
import api from '../../services/api';

export function AgentSLARiskPage() {
  const [atRiskTickets, setAtRiskTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRiskBoard = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/predictions/at-risk');
      setAtRiskTickets(data.data.atRiskTickets || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load SLA risk board');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRiskBoard();
  }, []);

  const criticalList = atRiskTickets.filter((t) => t.latestPrediction?.riskLevel === 'CRITICAL' || t.slaState === 'CRITICAL');
  const highList = atRiskTickets.filter((t) => t.latestPrediction?.riskLevel === 'HIGH' && t.slaState !== 'CRITICAL');
  const otherList = atRiskTickets.filter((t) => !['CRITICAL', 'HIGH'].includes(t.latestPrediction?.riskLevel) && t.slaState !== 'CRITICAL');

  return (
    <DashboardLayout title="SLA Risk Board" subtitle="Proactively prioritize cases with elevated machine-learning breach probability">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            High-Risk & Escalated Inquiries ({atRiskTickets.length})
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Ranked by scikit-learn ML breach risk model and server-authoritative SLA consumption
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={isRefreshing}
          onClick={() => fetchRiskBoard(true)}
        >
          Refresh Board
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchRiskBoard(true)} />
      ) : atRiskTickets.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Zero High-Risk Tickets!"
          description="All ongoing support tickets have healthy SLA windows and low AI breach likelihood."
        />
      ) : (
        <StaggerContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {atRiskTickets.map((t) => {
              const prob = t.latestPrediction ? Math.round(t.latestPrediction.breachProbability * 100) : 0;
              const isCrit = t.latestPrediction?.riskLevel === 'CRITICAL' || t.slaState === 'CRITICAL';
              const isHigh = t.latestPrediction?.riskLevel === 'HIGH';

              const accentColor = isCrit ? 'var(--color-danger)' : isHigh ? 'var(--color-warning)' : 'var(--color-info)';

              return (
                <StaggerItem key={t._id}>
                  <MotionCard
                    style={{
                      borderLeft: `4px solid ${accentColor}`,
                      padding: 'var(--space-5)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isCrit && <RiskPulse color="var(--color-danger)" size={6} />}
                          <Link to={`/agent/tickets/${t._id}`} style={{ fontWeight: 800, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)', fontSize: '13px' }}>
                            #{t.ticketId}
                          </Link>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <PriorityBadge priority={t.priority} size="sm" />
                          {t.latestPrediction && (
                            <RiskBadge riskLevel={t.latestPrediction.riskLevel} probability={t.latestPrediction.breachProbability} size="sm" />
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/agent/tickets/${t._id}`}
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          display: 'block',
                          marginBottom: 'var(--space-3)',
                          lineHeight: 1.4
                        }}
                      >
                        {t.title}
                      </Link>

                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
                          <span>AI Breach Probability</span>
                          <span style={{ fontWeight: 700, color: accentColor }}>{prob}%</span>
                        </div>
                        <ProgressBar value={prob} max={100} color={accentColor} height={5} />
                      </div>

                      {t.latestPrediction?.riskFactors?.length > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Top Risk: </span>
                          <span>{t.latestPrediction.riskFactors[0]}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Assignee: <strong style={{ color: 'var(--color-slate-700)' }}>{t.assignedAgentId?.firstName || 'Unassigned'}</strong>
                      </div>
                      <Link to={`/agent/tickets/${t._id}`}>
                        <Button variant={isCrit ? 'danger' : 'secondary'} size="sm" icon={ArrowRight} iconPosition="right">
                          Triage
                        </Button>
                      </Link>
                    </div>
                  </MotionCard>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      )}
    </DashboardLayout>
  );
}
