import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge, Modal, LoadingSkeleton, ErrorState } from '../../components/ui';
import { FolderLock, PlusCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export function AdminSLAPolicies() {
  const { success, error: toastError } = useToast();
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    businessHoursOnly: true,
    isDefault: false,
    priorityRules: [
      { priority: 'CRITICAL', responseTargetMinutes: 30, resolutionTargetMinutes: 120, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
      { priority: 'HIGH', responseTargetMinutes: 60, resolutionTargetMinutes: 240, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
      { priority: 'MEDIUM', responseTargetMinutes: 120, resolutionTargetMinutes: 480, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
      { priority: 'LOW', responseTargetMinutes: 240, resolutionTargetMinutes: 1440, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 }
    ]
  });

  const fetchPolicies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/sla/policies');
      setPolicies(data.data.policies || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load SLA policies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/sla/policies', newPolicy);
      setIsModalOpen(false);
      success(`SLA Policy "${newPolicy.name}" created.`);
      fetchPolicies();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create SLA policy';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="SLA Policy Configuration" subtitle="Configure authoritative SLA response and resolution time targets, threshold warnings, and business hour calendars">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Configured SLA Policy Matrices ({policies.length})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Server-authoritative targets calculate ticket deadlines automatically upon submission
            </p>
          </div>
          <Button variant="primary" icon={PlusCircle} onClick={() => setIsModalOpen(true)}>
            Create SLA Policy
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="card" count={2} height="200px" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPolicies} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {policies.map((p, pIdx) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: pIdx * 0.05 }}
                className="card"
                style={{
                  border: p.isDefault ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: p.isDefault ? 'var(--shadow-sm)' : 'none',
                  padding: 'var(--space-6)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{p.name}</h4>
                      {p.isDefault && <Badge variant="primary">DEFAULT ACTIVE POLICY</Badge>}
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>{p.status}</Badge>
                    </div>
                    {p.description && (
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-slate-100)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                    {p.businessHoursOnly ? 'Business Hours Only (9am-6pm M-F)' : '24/7 Continuous Calendar'}
                  </span>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Priority Tier</th>
                        <th>First Response Target</th>
                        <th>Resolution Target</th>
                        <th>Warning (At-Risk) Threshold</th>
                        <th>Critical Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.priorityRules?.map((rule, rIdx) => (
                        <motion.tr
                          key={rule.priority}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18, delay: rIdx * 0.04 }}
                        >
                          <td>
                            <strong style={{ color: rule.priority === 'CRITICAL' ? 'var(--color-danger-text)' : rule.priority === 'HIGH' ? 'var(--color-warning-text)' : 'inherit' }}>
                              {rule.priority}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {rule.responseTargetMinutes} mins ({Math.round((rule.responseTargetMinutes / 60) * 10) / 10}h)
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {rule.resolutionTargetMinutes} mins ({Math.round((rule.resolutionTargetMinutes / 60) * 10) / 10}h)
                            </strong>
                          </td>
                          <td>
                            <span style={{ color: 'var(--color-warning-text)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                              ≥ {rule.warningThresholdPercentage}% consumed
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--color-danger-text)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                              ≥ {rule.criticalThresholdPercentage}% consumed
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* SLA Policy Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New SLA Policy Matrix" maxWidth="600px">
        <form onSubmit={handleCreatePolicy}>
          <div className="form-group">
            <label className="form-label" htmlFor="polName">Policy Matrix Name</label>
            <input
              id="polName"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Mission-Critical Tier-1 SLA"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="polDesc">Description</label>
            <input
              id="polDesc"
              type="text"
              className="form-input"
              placeholder="Policy scope, tier agreement, or client contract details"
              value={newPolicy.description}
              onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              <input
                type="checkbox"
                checked={newPolicy.businessHoursOnly}
                onChange={(e) => setNewPolicy({ ...newPolicy, businessHoursOnly: e.target.checked })}
              />
              <span>Calculate SLA deadlines during working business hours only (pause overnight & weekends)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Save SLA Matrix</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
