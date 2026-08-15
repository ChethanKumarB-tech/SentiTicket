import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, RoleBadge } from '../../components/tickets/Badges';
import { SLACountdown } from '../../components/sla/SLACountdown';
import { PredictionCard } from '../../components/prediction/PredictionCard';
import { CommentThread } from '../../components/tickets/CommentThread';
import { LoadingSkeleton, ErrorState } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, CheckCircle2, Clock, PauseCircle, RefreshCw, User, Tag, Shield, Sparkles } from 'lucide-react';
import api from '../../services/api';

export function AgentTicketWorkspace() {
  const { id } = useParams();
  const { success, error: toastError, info } = useToast();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkspace = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);
      const ticketData = ticketRes.data.data.ticket;
      setTicket(ticketData);
      setComments(commentsRes.data.data.comments || []);
      setPrediction(ticketData.latestPrediction || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load ticket workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/tickets/${id}/status`, { status: newStatus });
      setTicket(data.data.ticket);
      if (newStatus === 'IN_PROGRESS') success('Ticket status updated to IN PROGRESS.');
      else if (newStatus === 'PENDING') info('Ticket status set to PENDING (SLA clock paused).');
      else if (newStatus === 'RESOLVED') success('Ticket marked as RESOLVED.');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update status';
      toastError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    try {
      const { data } = await api.get(`/predictions/ticket/${id}`);
      setPrediction(data.data.prediction);
      success('AI SLA breach prediction updated from ML service.');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to calculate prediction';
      toastError(msg);
    } finally {
      setIsPredicting(false);
    }
  };

  if (isLoading) {
    return (\n      <DashboardLayout title="Agent Workspace">\n        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>\n          <LoadingSkeleton type="card" height="360px" />\n        </div>\n      </DashboardLayout>\n    );\n  }\n\n  if (error || !ticket) {\n    return (\n      <DashboardLayout title=\"Agent Workspace\">\n        <ErrorState message={error || 'Ticket not found'} onRetry={fetchWorkspace} />\n      </DashboardLayout>\n    );\n  }\n\n  return (\n    <DashboardLayout title={`Workspace: #${ticket.ticketId}`} subtitle={ticket.title}>\n      <div style={{ marginBottom: 'var(--space-4)' }}>\n        <Link\n          to=\"/agent/dashboard\"\n          style={{\n            display: 'inline-flex',\n            alignItems: 'center',\n            gap: 'var(--space-1)',\n            fontSize: 'var(--font-size-sm)',\n            fontWeight: 500,\n            color: 'var(--color-slate-600)'\n          }}\n        >\n          <ArrowLeft size={16} /> Back to Dashboard\n        </Link>\n      </div>\n\n      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.1fr)', gap: 'var(--space-6)' }}>\n        {/* Main Workspace Column */}\n        <div>\n          <div className=\"card\" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>\n            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>\n              <div>\n                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>\n                  #{ticket.ticketId} • {ticket.category}\n                </span>\n                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px', letterSpacing: '-0.01em' }}>\n                  {ticket.title}\n                </h2>\n              </div>\n              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>\n                <StatusBadge status={ticket.status} />\n                <PriorityBadge priority={ticket.priority} />\n              </div>\n            </div>\n\n            <div\n              style={{\n                borderTop: '1px solid var(--color-border)',\n                borderBottom: '1px solid var(--color-border)',\n                padding: 'var(--space-3) 0',\n                margin: 'var(--space-4) 0',\n                display: 'flex',\n                alignItems: 'center',\n                gap: 'var(--space-2)',\n                flexWrap: 'wrap'\n              }}\n            >\n              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginRight: '6px' }}>\n                Workflow Action:\n              </span>\n              {ticket.status !== 'IN_PROGRESS' && (\n                <Button\n                  variant=\"primary\"\n                  size=\"sm\"\n                  isLoading={isUpdatingStatus}\n                  onClick={() => handleStatusChange('IN_PROGRESS')}\n                  icon={Clock}\n                >\n                  Start Progress\n                </Button>\n              )}\n              {ticket.status !== 'PENDING' && (\n                <Button\n                  variant=\"secondary\"\n                  size=\"sm\"\n                  isLoading={isUpdatingStatus}\n                  onClick={() => handleStatusChange('PENDING')}\n                  icon={PauseCircle}\n                >\n                  Pending (Pause SLA)\n                </Button>\n              )}\n              {ticket.status !== 'RESOLVED' && (\n                <Button\n                  variant=\"secondary\"\n                  size=\"sm\"\n                  isLoading={isUpdatingStatus}\n                  onClick={() => handleStatusChange('RESOLVED')}\n                  icon={CheckCircle2}\n                  style={{ color: 'var(--color-success-text)' }}\n                >\n                  Mark Resolved\n                </Button>\n              )}\n            </div>\n\n            <div\n              style={{\n                fontSize: 'var(--font-size-sm)',\n                color: 'var(--color-text-primary)',\n                lineHeight: 1.7,\n                whiteSpace: 'pre-wrap'\n              }}\n            >\n              {ticket.description}\n            </div>\n          </div>\n\n          <CommentThread\n            ticketId={ticket._id}\n            comments={comments}\n            onCommentAdded={(c) => setComments((prev) => [...prev, c])}\n          />\n        </div>\n\n        {/* Right Sidebar */}\n        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>\n          <SLACountdown\n            deadline={ticket.slaResolutionDeadline}\n            state={ticket.slaState}\n            createdAt={ticket.createdAt}\n            resolutionTargetMinutes={ticket.slaResolutionTargetMinutes}\n          />\n\n          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>\n            <PredictionCard\n              prediction={prediction}\n              isLoading={isPredicting}\n              onRefresh={handleRunPrediction}\n            />\n            <Button\n              variant=\"secondary\"\n              size=\"sm\"\n              style={{ width: '100%' }}\n              icon={RefreshCw}\n              isLoading={isPredicting}\n              onClick={handleRunPrediction}\n            >\n              {prediction ? 'Recalculate AI Risk' : 'Run AI Breach Prediction'}\n            </Button>\n          </div>\n\n          <div className=\"card\" style={{ padding: 'var(--space-5)' }}>\n            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>\n              Requester Profile\n            </h4>\n            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>\n              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>\n                <span style={{ color: 'var(--color-text-secondary)' }}>Customer:</span>\n                <span style={{ fontWeight: 600 }}>{ticket.customerId?.firstName} {ticket.customerId?.lastName}</span>\n              </div>\n              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>\n                <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>\n                <span style={{ fontFamily: 'var(--font-family-mono)' }}>{ticket.customerId?.email}</span>\n              </div>\n              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>\n                <span style={{ color: 'var(--color-text-secondary)' }}>Created:</span>\n                <span>{new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>\n              </div>\n              <div style={{ display: 'flex', justifyContent: 'space-between' }}>\n                <span style={{ color: 'var(--color-text-secondary)' }}>Category:</span>\n                <span style={{ fontWeight: 600 }}>{ticket.category}</span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </DashboardLayout>\n  );\n}\n