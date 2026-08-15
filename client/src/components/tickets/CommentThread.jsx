import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Badge } from '../ui';
import { Send, Lock, MessageSquare, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export function CommentThread({ ticketId, comments = [], onCommentAdded }) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isStaff = ['AGENT', 'MANAGER', 'ADMIN'].includes(user?.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        content: content.trim(),
        type: isInternal && isStaff ? 'INTERNAL' : user.role === 'CUSTOMER' ? 'CUSTOMER' : 'AGENT'
      };

      const { data } = await api.post(`/tickets/${ticketId}/comments`, payload);
      setContent('');
      setIsInternal(false);
      success(isInternal ? 'Internal staff note added.' : 'Reply posted successfully.');
      if (onCommentAdded) {
        onCommentAdded(data.data.comment);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || 'Failed to submit comment';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
          <span>Activity & Discussion ({comments.length})</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {comments.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--color-slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-xs)'
            }}
          >
            No responses on this inquiry yet. Submit a message below.
          </div>
        ) : (
          comments.map((comment, index) => {
            const isNote = comment.type === 'INTERNAL';
            const isCustomer = comment.type === 'CUSTOMER';
            const author = comment.authorId;
            const authorName = author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() : 'System';
            const authorInitial = author?.firstName ? author.firstName[0].toUpperCase() : 'U';

            return (
              <motion.div
                key={comment._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isNote ? '#FFFBEB' : isCustomer ? 'var(--color-surface)' : 'var(--color-slate-50)',
                  border: isNote ? '1px solid #FDE68A' : '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isNote ? 'var(--color-warning)' : isCustomer ? 'var(--color-slate-700)' : 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {authorInitial}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                      {authorName || 'Support User'}
                    </span>
                    <Badge variant={isNote ? 'warning' : isCustomer ? 'neutral' : 'primary'} size="sm">
                      {isNote ? 'INTERNAL NOTE' : author?.role || comment.type}
                    </Badge>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                {isNote && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: 'var(--color-warning-text)', marginBottom: '6px' }}>
                    <Lock size={11} />
                    <span>Confidential Internal Staff Note (Hidden from Customer)</span>
                  </div>
                )}

                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}
                >
                  {comment.content}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="card"
        style={{
          padding: 'var(--space-5)',
          backgroundColor: isInternal ? '#FFFBEB' : 'var(--color-surface)',
          borderColor: isInternal ? '#FDE68A' : 'var(--color-border)'
        }}
      >
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger-text)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              marginBottom: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {isStaff && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <button
              type="button"
              className={`btn btn-sm ${!isInternal ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsInternal(false)}
            >
              Public Reply (Customer Visible)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isInternal ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setIsInternal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Lock size={12} />
              <span>Internal Staff Note</span>
            </button>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
          <textarea
            required
            rows={3}
            className="form-textarea"
            placeholder={
              isInternal
                ? 'Write a private investigation note (visible only to support staff)...'
                : 'Write your message to the requester...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {isInternal ? 'Note will be logged in internal audit history' : 'Email notification will be dispatched to customer'}
          </div>
          <Button
            type="submit"
            variant={isInternal ? 'danger' : 'primary'}
            isLoading={isSubmitting}
            icon={Send}
            size="sm"
          >
            {isInternal ? 'Post Internal Note' : 'Send Public Reply'}
          </Button>
        </div>
      </form>
    </div>
  );
}
