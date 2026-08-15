import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge, LoadingSkeleton, ErrorState } from '../../components/ui';
import { FileText, Search, Shield, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async (page = 1, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (actionFilter) params.append('action', actionFilter);

      const { data } = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(data.data.logs || []);
      setPagination(data.data.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (err) {\n      setError(err.response?.data?.error?.message || 'Failed to load audit trail');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  return (
    <DashboardLayout title="Compliance Audit Ledger" subtitle="Append-only immutable record of administrative mutations, staff provisioning, and ticket state transitions">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Immutable Audit Trail ({pagination.total})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              All administrative and security actions are cryptographically linked with authenticated actor identities and IP addresses
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '11px', fontWeight: 600 }}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Action Types</option>
              <option value="USER_PROVISIONED">USER_PROVISIONED</option>
              <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
              <option value="USER_STATUS_CHANGED">USER_STATUS_CHANGED</option>
              <option value="TICKET_CREATED">TICKET_CREATED</option>
              <option value="TICKET_STATUS_CHANGED">TICKET_STATUS_CHANGED</option>
              <option value="TICKET_PRIORITY_CHANGED">TICKET_PRIORITY_CHANGED</option>
              <option value="TICKET_ASSIGNED">TICKET_ASSIGNED</option>
              <option value="SLA_POLICY_CREATED">SLA_POLICY_CREATED</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={isRefreshing}
              onClick={() => fetchLogs(pagination.page, true)}
            >
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchLogs(pagination.page)} />
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
            No audit logs found for the selected filter.
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor Identity</th>
                    <th>Target Resource</th>
                    <th>IP Address</th>
                    <th>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <td>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)', fontVariantNumeric: 'tabular-nums' }}>
                          {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {log.action}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {log.actorId ? `${log.actorId.firstName} ${log.actorId.lastName}` : 'System Engine'}
                        </div>
                        {log.actorRole && (
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                            Role: {log.actorRole}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-700)' }}>
                          {log.resourceType} {log.resourceId ? `#${log.resourceId.slice(-6)}` : ''}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-slate-600)' }}>
                          {log.ipAddress || 'Internal'}
                        </span>
                      </td>
                      <td>
                        <Badge variant={log.result === 'SUCCESS' ? 'success' : 'danger'} size="sm">
                          {log.result}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
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
                  Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} audit entries)
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchLogs(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchLogs(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
