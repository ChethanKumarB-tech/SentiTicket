import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge, Modal, LoadingSkeleton, ErrorState } from '../../components/ui';
import { UserPlus, UserCheck, Lock, Unlock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export function AdminUserManagement() {
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Staff Provisioning
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'AGENT', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/users?page=${page}&limit=20`);
      setUsers(data.data.users || []);
      setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {\n      setError(err.response?.data?.error?.message || 'Failed to load user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      await api.post('/users', newUser);
      setIsCreateModalOpen(false);
      const createdEmail = newUser.email;
      setNewUser({ firstName: '', lastName: '', email: '', role: 'AGENT', password: '' });
      success(`Account for ${createdEmail} provisioned successfully.`);
      fetchUsers(1);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to provision staff account';
      setModalError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async (userId, newRole, userName) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      success(`Updated ${userName || 'user'}'s role to ${newRole}.`);
      fetchUsers(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to change user role';
      toastError(msg);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      success(`${userName || 'User'} status changed to ${newStatus}.`);
      fetchUsers(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update user status';
      toastError(msg);
    }
  };

  return (
    <DashboardLayout title="Staff & User Directory" subtitle="Manage tenant members, provision staff accounts, and configure RBAC authorization roles">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Tenant Members ({pagination.total})</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Self-demotion and self-lockout are strictly prevented by security policy
            </p>
          </div>
          <Button variant="primary" icon={UserPlus} onClick={() => setIsCreateModalOpen(true)}>
            Provision Staff Account
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchUsers(pagination.page)} />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => {
                    const isSelf = u._id === currentUser?._id;
                    const fullName = `${u.firstName} ${u.lastName}`;
                    return (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {fullName}
                            {isSelf && (
                              <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 700, marginLeft: '6px' }}>
                                (You)
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--color-slate-600)' }}>
                            {u.email}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: 'auto', padding: '3px 8px', fontSize: '11px', fontWeight: 600 }}
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleChangeRole(u._id, e.target.value, fullName)}
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="AGENT">AGENT</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                            {u.status}
                          </Badge>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          {!isSelf && (
                            <Button
                              variant={u.status === 'ACTIVE' ? 'ghost' : 'secondary'}
                              size="sm"
                              icon={u.status === 'ACTIVE' ? Lock : Unlock}
                              onClick={() => handleToggleStatus(u._id, u.status, fullName)}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
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
                  Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total members)
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchUsers(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchUsers(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Provision User Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Provision New Staff Account">
        {modalError && (
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
            <span>{modalError}</span>
          </div>
        )}
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="mFirstName">First Name</label>
              <input
                id="mFirstName"
                type="text"
                required
                className="form-input"
                placeholder="Alex"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mLastName">Last Name</label>
              <input
                id="mLastName"
                type="text"
                required
                className="form-input"
                placeholder="Morgan"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mEmail">Work Email</label>
            <input
              id="mEmail"
              type="email"
              required
              className="form-input"
              placeholder="alex@company.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mRole">Assigned Role</label>
            <select
              id="mRole"
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="AGENT">Support Agent</option>
              <option value="MANAGER">Support Manager</option>
              <option value="ADMIN">Tenant Administrator</option>
              <option value="CUSTOMER">Customer User</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mPassword">Temporary Password</label>
            <input
              id="mPassword"
              type="password"
              required
              className="form-input"
              placeholder="Minimum 8 characters with upper/lower/number"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Provision Account</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
