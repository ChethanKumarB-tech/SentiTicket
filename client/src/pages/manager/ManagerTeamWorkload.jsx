import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge, LoadingSkeleton, ErrorState, EmptyState } from '../../components/ui';
import { ProgressBar } from '../../components/motion';
import { Users, AlertTriangle, CheckCircle, ShieldAlert, RefreshCw, UserCheck } from 'lucide-react';
import api from '../../services/api';

export function ManagerTeamWorkload() {
  const [workloads, setWorkloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkloads = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/analytics/workload');
      setWorkloads(data.data.workload || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load team workload telemetry');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  return (
    <DashboardLayout title="Support Team Bandwidth & Capacity" subtitle="Monitor agent case volume, active load balance, and mitigate burnout risks">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Active Staff Allocations ({workloads.length})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Target concurrent bandwidth threshold: 10 active cases per support engineer
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={() => fetchWorkloads(true)}
          >
            Refresh Workload
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchWorkloads(true)} />
        ) : workloads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Staff Accounts Found"
            description="There are currently no support agent accounts provisioned for this organization."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Role</th>
                  <th>Active Cases</th>
                  <th>Critical Priority</th>
                  <th>At-Risk SLA</th>
                  <th>Capacity Bandwidth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workloads.map(({ agent, openTickets, criticalTickets, atRiskTickets, capacityPercentage, status }, index) => {
                  const barColor =
                    capacityPercentage >= 90
                      ? 'var(--color-danger)'
                      : capacityPercentage >= 60
                      ? 'var(--color-warning)'
                      : 'var(--color-success)';

                  return (
                    <motion.tr
                      key={agent._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{agent.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{agent.email}</div>
                      </td>
                      <td>
                        <Badge variant="neutral" size="sm">
                          {agent.role}
                        </Badge>
                      </td>
                      <td><strong style={{ fontSize: 'var(--font-size-md)', fontVariantNumeric: 'tabular-nums' }}>{openTickets}</strong></td>
                      <td>
                        <span
                          style={{
                            color: criticalTickets > 0 ? 'var(--color-danger-text)' : 'inherit',
                            fontWeight: criticalTickets > 0 ? 800 : 400,
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {criticalTickets}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: atRiskTickets > 0 ? 'var(--color-warning-text)' : 'inherit',
                            fontWeight: atRiskTickets > 0 ? 800 : 400,
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {atRiskTickets}
                        </span>
                      </td>
                      <td>
                        <div style={{ width: '160px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{capacityPercentage}% Capacity</span>
                          </div>
                          <ProgressBar value={capacityPercentage} max={100} color={barColor} height={6} />
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={status === 'OVERLOADED' ? 'danger' : status === 'OPTIMAL' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {status}
                        </Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
