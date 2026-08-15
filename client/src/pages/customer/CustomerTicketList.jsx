import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/tickets/Badges';
import { SLACountdown } from '../../components/sla/SLACountdown';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { PlusCircle, Search, Filter, Ticket, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export function CustomerTicketList() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (search.trim()) params.append('search', search.trim());

      const { data } = await api.get(`/tickets?${params.toString()}`);
      setTickets(data.data.tickets || []);
      setPagination(data.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets(1);
  };

  return (
    <DashboardLayout title="My Support Tickets" subtitle="View, track, and manage all your ongoing inquiries">
      <div className=\"card\">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-2)', flex: '1 1 280px', maxWidth: '400px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by ID or Subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" icon={Search}>
              Search
            </Button>
          </form>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select className="form-select" style={{ width: 'auto' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <Link to="/customer/tickets/new">
              <Button variant="primary" icon={PlusCircle}>
                New Ticket
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchTickets(pagination.page)} />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No support tickets match your filters"
            description="Try clearing your search or status filters to view all your tickets."
            action={
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(statusFilter || priorityFilter || search) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStatusFilter('');
                      setPriorityFilter('');
                      setSearch('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Link to="/customer/tickets/new">
                  <Button variant="primary" icon={PlusCircle}>
                    Create Ticket
                  </Button>
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>SLA Deadline</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, index) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <td>
                        <Link to={`/customer/tickets/${t._id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)' }}>
                          #{t.ticketId}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/customer/tickets/${t._id}`} style={{ color: 'var(--color-text-primary)', fontWeight: 600, display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.title}
                        </Link>
                      </td>
                      <td><span style={{ fontSize: '11px', color: 'var(--color-slate-600)' }}>{t.category}</span></td>
                      <td><StatusBadge status={t.status} size="sm" /></td>
                      <td><PriorityBadge priority={t.priority} size="sm" /></td>
                      <td>
                        <SLACountdown
                          deadline={t.slaResolutionDeadline}
                          state={t.slaState}
                          compact
                        />
                      </td>
                      <td><span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{new Date(t.createdAt).toLocaleDateString()}</span></td>
                      <td>
                        <Link to={`/customer/tickets/${t._id}`}>
                          <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                            View
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                  Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total tickets)
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchTickets(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchTickets(pagination.page + 1)}
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
