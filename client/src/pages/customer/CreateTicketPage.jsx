import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Upload, AlertCircle, CheckCircle2, FileText, X, Sparkles, Shield } from 'lucide-react';
import api from '../../services/api';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 10MB enterprise security limit.');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data } = await api.post('/tickets', formData);
      const newTicket = data.data.ticket;

      if (file && newTicket._id) {
        const uploadData = new FormData();
        uploadData.append('ticketId', newTicket._id);
        uploadData.append('file', file);

        await api.post('/attachments', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      success(`Ticket #${newTicket.ticketId} created with authoritative SLA deadline.`);
      navigate(`/customer/tickets/${newTicket._id}`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to submit support ticket. Please check your inputs.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Support Ticket" subtitle="Submit your inquiry to our intelligent support operations desk">
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
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
            <ArrowLeft size={16} /> Back to Inquiries
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
          style={{ padding: 'var(--space-8)' }}
        >
          <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              New Support Request
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Your ticket will automatically be assigned an authoritative SLA target and triaged with ML breach prediction.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-light)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--color-danger-text)',
                fontSize: 'var(--font-size-xs)'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Subject / Issue Summary <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="form-input"
                placeholder="e.g. Cannot process refunds through Stripe webhook gateway"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select id="category" name="category" className="form-select" value={formData.category} onChange={handleChange}>
                  <option value="TECHNICAL">Technical Support</option>
                  <option value="BILLING">Billing & Accounts</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                  <option value="SECURITY">Security & Access</option>
                  <option value="GENERAL">General Inquiries</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priority">Urgency / Priority</label>
                <select id="priority" name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                  <option value="LOW">Low — General question / non-urgent (24h resolution)</option>
                  <option value="MEDIUM">Medium — Standard inquiry (8h resolution)</option>
                  <option value="HIGH">High — Feature degraded / partial impact (4h resolution)</option>
                  <option value="CRITICAL">Critical — Full outage / critical path blocked (2h resolution)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Detailed Description & Reproduction Steps <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="form-textarea"
                placeholder="Provide complete context, error codes, expected outcome, or steps to reproduce the issue..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attachment (Optional, Max 10MB)</label>
              {!file ? (
                <div
                  style={{
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-slate-50)',
                    transition: 'all var(--motion-fast)'
                  }}
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <Upload size={24} style={{ margin: '0 auto var(--space-2)', color: 'var(--color-primary)' }} />
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Click to select file or drag & drop here
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    PNG, JPG, PDF, CSV, ZIP up to 10MB (Validated by magic byte security check)
                  </div>
                  <input
                    id="file-upload-input"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-subtle)',
                    border: '1px solid #BFDBFE'
                  }}
                >\n                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{file.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setFile(null)}
                    aria-label="Remove attachment"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
              <Link to="/customer/tickets">
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isLoading} icon={CheckCircle2}>
                Submit Support Ticket
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
