import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge, LoadingSkeleton, ErrorState, EmptyState } from '../../components/ui';
import { StaggerContainer, StaggerItem, RiskPulse } from '../../components/motion';
import { ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw, Filter } from 'lucide-react';
import api from '../../services/api';

export function AdminSecurityEvents() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [severityFilter, setSeverityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async (page = 1, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (severityFilter) params.append('severity', severityFilter);

      const { data } = await api.get(`/security/events?${params.toString()}`);
      setEvents(data.data.events || []);
      setPagination(data.data.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load security alarms feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, [severityFilter]);

  return (
    <DashboardLayout title="Security Alarm Feed" subtitle="Real-time threat monitoring telemetry covering failed authentication attempts, lockout triggers, and session token rotation anomalies">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Threat Monitoring Feed ({pagination.total})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Detects brute force attacks, session family invalidation, and unauthorized access attempts
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--color-slate-400)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '11px', fontWeight: 600 }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={isRefreshing}
              onClick={() => fetchEvents(pagination.page, true)}
            >
              Refresh Feed
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchEvents(pagination.page)} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Security Alarms Recorded"
            description="Zero threat anomalies or failed authentication spikes recorded for the selected filter."
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={severityFilter + pagination.page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="table-container"
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Alarm Event Type</th>
                    <th>Severity</th>
                    <th>IP Address</th>
                    <th>Subject User</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt, index) => {
                    const isCrit = evt.severity === 'CRITICAL';
                    return (
                      <motion.tr
                        key={evt._id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                      >
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)', fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(evt.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </td>
                        <td>
                          <code
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isCrit ? 'var(--color-danger)' : 'var(--color-text-primary)'
                            }}
                          >
                            {evt.eventType}
                          </code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isCrit && <RiskPulse color="var(--color-danger)" size={5} />}
                            <Badge
                              variant={
                                evt.severity === 'CRITICAL' || evt.severity === 'HIGH'
                                  ? 'danger'
                                  : evt.severity === 'MEDIUM'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {evt.severity}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-slate-700)' }}>
                            {evt.ipAddress || 'Internal Gateway'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-600)' }}>
                            {evt.userId?.email || 'Anonymous / Pre-Auth'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && !isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-4)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <div>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} security events)
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchEvents(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchEvents(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
