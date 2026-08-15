import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/tickets/Badges';
import { SLACountdown } from '../../components/sla/SLACountdown';
import { CommentThread } from '../../components/tickets/CommentThread';
import { LoadingSkeleton, ErrorState } from '../../components/ui';
import { ArrowLeft, Paperclip, Download, User, Calendar, Tag, Clock, Shield } from 'lucide-react';
import api from '../../services/api';

export function CustomerTicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ticketRes, commentsRes] = await Promise.all([\n        api.get(`/tickets/${id}`),\n        api.get(`/tickets/${id}/comments`)\n      ]);
      setTicket(ticketRes.data.data.ticket);
      setComments(commentsRes.data.data.comments || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Ticket Inquiry">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <LoadingSkeleton type="card" height="300px" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardLayout title="Ticket Inquiry">
        <ErrorState message={error || 'Support ticket not found'} onRetry={fetchDetails} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Inquiry #${ticket.ticketId}`} subtitle={ticket.title}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link
          to="/customer/tickets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            color: 'var(--color-slate-600)'
          }}
        >
          <ArrowLeft size={16} /> Back to My Tickets
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)', gap: 'var(--space-6)' }}>
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  #{ticket.ticketId} • {ticket.category}
                </span>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px', letterSpacing: '-0.01em' }}>
                  {ticket.title}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap'
              }}
            >
              {ticket.description}
            </div>
          </div>

          <CommentThread ticketId={ticket._id} comments={comments} onCommentAdded={handleCommentAdded} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <SLACountdown
            deadline={ticket.slaResolutionDeadline}
            state={ticket.slaState}
            createdAt={ticket.createdAt}
            resolutionTargetMinutes={ticket.slaResolutionTargetMinutes}
          />

          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
              Inquiry Metadata
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                <StatusBadge status={ticket.status} size="sm" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Priority:</span>
                <PriorityBadge priority={ticket.priority} size="sm" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Assigned Agent:</span>
                <span style={{ fontWeight: 600 }}>
                  {ticket.assignedAgentId ? `${ticket.assignedAgentId.firstName} ${ticket.assignedAgentId.lastName}` : 'Unassigned (In Triage)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Created:</span>
                <span>{new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Last Activity:</span>
                <span>{new Date(ticket.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
