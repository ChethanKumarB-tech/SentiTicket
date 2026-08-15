import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/tickets/Badges';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { Clock, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export function AgentQueuePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [queueTickets, setQueueTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tickets?isAssigned=false');
      setQueueTickets(data.data.tickets || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load unassigned triage pool');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleClaimTicket = async (ticketId, ticketNum) => {
    setClaimingId(ticketId);
    try {
      await api.post(`/tickets/${ticketId}/claim`);
      setQueueTickets((prev) => prev.filter((t) => t._id !== ticketId));
      success(`Ticket #${ticketNum || ''} claimed and added to your active queue.`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to claim ticket';
      toastError(msg);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <DashboardLayout title="Unassigned Triage Pool" subtitle="Incoming enterprise support requests awaiting agent assignment">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Open Inquiries Pool ({queueTickets.length})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Claim cases directly to add them to your active personal queue
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchQueue} />
        ) : queueTickets.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Triage Pool is Completely Clear!"
            description="There are currently zero unassigned tickets awaiting attention. All incoming cases are under active management."
          />
        ) : (\n          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>SLA Target</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queueTickets.map((t, index) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <td>
                      <Link to={`/agent/tickets/${t._id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)' }}>
                        #{t.ticketId}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/agent/tickets/${t._id}`} style={{ color: 'var(--color-text-primary)', fontWeight: 600, display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </Link>
                    </td>
                    <td><span style={{ fontSize: '11px', color: 'var(--color-slate-600)' }}>{t.category}</span></td>
                    <td><PriorityBadge priority={t.priority} size=\"sm\" /></td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-slate-700)', fontVariantNumeric: 'tabular-nums' }}>
                        {Math.round(t.slaResolutionTargetMinutes / 60)}h target
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={UserCheck}
                        isLoading={claimingId === t._id}
                        onClick={() => handleClaimTicket(t._id, t.ticketId)}
                      >
                        Claim Case
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
