const API_BASE = 'http://127.0.0.1:5000/api/v1';

const testResults = [];

function recordTest(category, testName, passed, details = '') {
  testResults.push({ category, testName, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${category}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;\n  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const res = await fetch(url, config);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}

  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('===========================================================');
  console.log('STARTING COMPLETE ROLE-BASED AUTHENTICATION & SECURITY TEST');
  console.log('===========================================================\\n');

  const uniqueSuffix = Date.now().toString().slice(-6);
  const orgName = `TestEnterprise_${uniqueSuffix}`;

  let adminToken, managerToken, agentToken, customerToken;
  let adminUser, managerUser, agentUser, customerUser;
  let tenantOrg;

  // PHASE 1: ADMIN REGISTRATION & AUTHENTICATION
  try {
    const adminRegRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        organizationName: orgName,
        email: `admin_${uniqueSuffix}@sentiticket.local`,
        password: 'AdminPassword123!',
        firstName: 'Diana',
        lastName: 'Prince'
      }
    });

    adminToken = adminRegRes.data?.data?.accessToken;
    adminUser = adminRegRes.data?.data?.user;
    tenantOrg = adminRegRes.data?.data?.organization;

    recordTest('ADMIN AUTH', 'Admin Organization Registration', adminUser?.role === 'ADMIN', `Role: ${adminUser?.role}`);
    recordTest('ADMIN AUTH', 'Session Persistence Token Exists', !!adminToken);

    const adminMeRes = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('ADMIN AUTH', 'Admin Identity Verification via /auth/me', adminMeRes.data?.data?.user?.role === 'ADMIN', `Email: ${adminMeRes.data?.data?.user?.email}`);
  } catch (err) {
    recordTest('ADMIN AUTH', 'Admin Registration', false, err.message);
  }

  // PHASE 2: ADMIN PROVISIONING OF MANAGER, AGENT, CUSTOMER
  try {
    const mgrRes = await apiRequest('/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        email: `manager_${uniqueSuffix}@sentiticket.local`,
        password: 'ManagerPassword123!',
        firstName: 'Bruce',
        lastName: 'Wayne',
        role: 'MANAGER'
      }
    });
    managerUser = mgrRes.data?.data?.user;
    recordTest('STAFF PROVISIONING', 'Admin Provisions MANAGER Account', managerUser?.role === 'MANAGER');

    const agentRes = await apiRequest('/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        email: `agent_${uniqueSuffix}@sentiticket.local`,
        password: 'AgentPassword123!',
        firstName: 'Clark',
        lastName: 'Kent',
        role: 'AGENT'
      }
    });
    agentUser = agentRes.data?.data?.user;
    recordTest('STAFF PROVISIONING', 'Admin Provisions AGENT Account', agentUser?.role === 'AGENT');

    const custRes = await apiRequest('/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        email: `customer_${uniqueSuffix}@sentiticket.local`,
        password: 'CustomerPassword123!',
        firstName: 'Barry',
        lastName: 'Allen',
        role: 'CUSTOMER'
      }
    });
    customerUser = custRes.data?.data?.user;
    recordTest('STAFF PROVISIONING', 'Admin Provisions CUSTOMER Account', customerUser?.role === 'CUSTOMER');
  } catch (err) {
    recordTest('STAFF PROVISIONING', 'Staff Provisioning', false, err.message);
  }

  // PHASE 3: AUTHENTICATE ALL ROLES INDIVIDUALLY
  try {
    const mgrLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: `manager_${uniqueSuffix}@sentiticket.local`,
        password: 'ManagerPassword123!'
      }
    });
    managerToken = mgrLoginRes.data?.data?.accessToken;
    recordTest('MANAGER AUTH', 'Manager Login & JWT Generation', mgrLoginRes.data?.data?.user?.role === 'MANAGER');

    const mgrMe = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    recordTest('MANAGER AUTH', 'Manager /auth/me Identity Check', mgrMe.data?.data?.user?.role === 'MANAGER');
  } catch (err) {
    recordTest('MANAGER AUTH', 'Manager Authentication', false, err.message);
  }

  try {
    const agentLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: `agent_${uniqueSuffix}@sentiticket.local`,
        password: 'AgentPassword123!'
      }
    });
    agentToken = agentLoginRes.data?.data?.accessToken;
    recordTest('AGENT AUTH', 'Agent Login & JWT Generation', agentLoginRes.data?.data?.user?.role === 'AGENT');

    const agentMe = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    recordTest('AGENT AUTH', 'Agent /auth/me Identity Check', agentMe.data?.data?.user?.role === 'AGENT');
  } catch (err) {
    recordTest('AGENT AUTH', 'Agent Authentication', false, err.message);
  }

  try {
    const custLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: `customer_${uniqueSuffix}@sentiticket.local`,
        password: 'CustomerPassword123!'
      }
    });
    customerToken = custLoginRes.data?.data?.accessToken;
    recordTest('CUSTOMER AUTH', 'Customer Login & JWT Generation', custLoginRes.data?.data?.user?.role === 'CUSTOMER');

    const custMe = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    recordTest('CUSTOMER AUTH', 'Customer /auth/me Identity Check', custMe.data?.data?.user?.role === 'CUSTOMER');
  } catch (err) {
    recordTest('CUSTOMER AUTH', 'Customer Authentication', false, err.message);
  }

  // PHASE 4: WORKFLOW & FUNCTIONAL VERIFICATION PER ROLE
  let createdTicketId, createdTicketNum;

  try {
    const ticketRes = await apiRequest('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: `Checkout Payment Error ${uniqueSuffix}`,
        description: 'Customer unable to finalize enterprise subscription checkout',
        category: 'BILLING',
        priority: 'HIGH'
      }
    });
    createdTicketId = ticketRes.data?.data?.ticket?._id;
    createdTicketNum = ticketRes.data?.data?.ticket?.ticketId;
    recordTest('CUSTOMER WORKFLOW', 'Customer Submits Support Ticket', !!createdTicketId, `Ticket #${createdTicketNum}`);

    const myTicketsRes = await apiRequest('/tickets', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    recordTest('CUSTOMER WORKFLOW', 'Customer Retrieves Own Tickets List', (myTicketsRes.data?.data?.tickets?.length || 0) > 0);

    const commentRes = await apiRequest(`/tickets/${createdTicketId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        content: 'Here is an update on the checkout error from customer side',
        type: 'CUSTOMER'
      }
    });
    recordTest('CUSTOMER WORKFLOW', 'Customer Adds Public Comment', commentRes.status === 201);
  } catch (err) {\n    recordTest('CUSTOMER WORKFLOW', 'Customer Operations', false, err.message);
  }

  try {
    const queueRes = await apiRequest('/tickets?isAssigned=false', {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    recordTest('AGENT WORKFLOW', 'Agent Views Triage Queue', queueRes.status === 200);

    const claimRes = await apiRequest(`/tickets/${createdTicketId}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    recordTest('AGENT WORKFLOW', 'Agent Claims Ticket Assignment', claimRes.status === 200);

    const statusRes = await apiRequest(`/tickets/${createdTicketId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${agentToken}` },
      body: { status: 'IN_PROGRESS' }
    });
    recordTest('AGENT WORKFLOW', 'Agent Updates Ticket Status to IN_PROGRESS', statusRes.data?.data?.ticket?.status === 'IN_PROGRESS');

    const staffNoteRes = await apiRequest(`/tickets/${createdTicketId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
      body: {
        content: 'Internal agent triage note: checking payment gateway logs',
        type: 'INTERNAL'
      }
    });
    recordTest('AGENT WORKFLOW', 'Agent Adds Internal Staff Note', staffNoteRes.status === 201);

    const mlRes = await apiRequest(`/predictions/ticket/${createdTicketId}`, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    recordTest('AGENT WORKFLOW', 'Agent Requests AI SLA Breach Forecast', mlRes.status === 200, `Risk: ${mlRes.data?.data?.prediction?.riskLevel}`);

    const riskBoardRes = await apiRequest('/predictions/at-risk', {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    recordTest('AGENT WORKFLOW', 'Agent Accesses SLA Risk Board Feed', riskBoardRes.status === 200);
  } catch (err) {
    recordTest('AGENT WORKFLOW', 'Agent Operations', false, err.message);
  }

  try {
    const slaMonitorRes = await apiRequest('/sla/monitor', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    recordTest('MANAGER WORKFLOW', 'Manager Real-Time SLA Monitor (/sla/monitor)', slaMonitorRes.status === 200);

    const workloadRes = await apiRequest('/analytics/workload', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    recordTest('MANAGER WORKFLOW', 'Manager Team Bandwidth & Capacity (/analytics/workload)', workloadRes.status === 200);

    const analyticsRes = await apiRequest('/analytics/overview', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    recordTest('MANAGER WORKFLOW', 'Manager Operations Overview (/analytics/overview)', analyticsRes.status === 200);
  } catch (err) {
    recordTest('MANAGER WORKFLOW', 'Manager Operations', false, err.message);
  }

  try {
    const usersRes = await apiRequest('/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('ADMIN WORKFLOW', 'Admin Reads User Directory (/users)', usersRes.status === 200);

    const slaPolRes = await apiRequest('/sla/policies', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('ADMIN WORKFLOW', 'Admin Reads SLA Policies (/sla/policies)', slaPolRes.status === 200);

    const auditRes = await apiRequest('/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('ADMIN WORKFLOW', 'Admin Reads Compliance Audit Trail (/audit-logs)', auditRes.status === 200);

    const secRes = await apiRequest('/security/events', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('ADMIN WORKFLOW', 'Admin Reads Threat Monitoring Feed (/security/events)', secRes.status === 200);
  } catch (err) {
    recordTest('ADMIN WORKFLOW', 'Admin Operations', false, err.message);
  }

  // PHASE 5: CROSS-ROLE RBAC SECURITY & RESTRICTION TESTS
  const custUsers = await apiRequest('/users', { headers: { Authorization: `Bearer ${customerToken}` } });
  recordTest('CROSS-ROLE RBAC', 'Customer Denied Access to /users', custUsers.status === 403, `Status: ${custUsers.status}`);

  const custSec = await apiRequest('/security/events', { headers: { Authorization: `Bearer ${customerToken}` } });
  recordTest('CROSS-ROLE RBAC', 'Customer Denied Access to /security/events', custSec.status === 403, `Status: ${custSec.status}`);

  const custAudit = await apiRequest('/audit-logs', { headers: { Authorization: `Bearer ${customerToken}` } });
  recordTest('CROSS-ROLE RBAC', 'Customer Denied Access to /audit-logs', custAudit.status === 403, `Status: ${custAudit.status}`);

  const agentUsers = await apiRequest('/users', { headers: { Authorization: `Bearer ${agentToken}` } });
  recordTest('CROSS-ROLE RBAC', 'Agent Denied Access to /users', agentUsers.status === 403, `Status: ${agentUsers.status}`);

  const agentSec = await apiRequest('/security/events', { headers: { Authorization: `Bearer ${agentToken}` } });
  recordTest('CROSS-ROLE RBAC', 'Agent Denied Access to /security/events', agentSec.status === 403, `Status: ${agentSec.status}`);

  const mgrSec = await apiRequest('/security/events', { headers: { Authorization: `Bearer ${managerToken}` } });
  recordTest('CROSS-ROLE RBAC', 'Manager Denied Access to /security/events', mgrSec.status === 403, `Status: ${mgrSec.status}`);

  const mgrProv = await apiRequest('/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: {
      email: 'illegal@sentiticket.local',
      password: 'Pass12345678!',
      firstName: 'Hacker',
      lastName: 'Unauthorized',
      role: 'ADMIN'
    }
  });
  recordTest('CROSS-ROLE RBAC', 'Manager Denied User Provisioning Privileges', mgrProv.status === 403, `Status: ${mgrProv.status}`);

  // PHASE 6: MULTI-TENANT ISOLATION TEST
  const tenantBRes = await apiRequest('/auth/register', {
    method: 'POST',
    body: {
      organizationName: `OrgB_${uniqueSuffix}`,
      email: `admin_orgb_${uniqueSuffix}@sentiticket.local`,
      password: 'AdminPassword123!',
      firstName: 'Bruce',
      lastName: 'Banner'
    }
  });
  const tenantBToken = tenantBRes.data?.data?.accessToken;

  const crossTenantTicket = await apiRequest(`/tickets/${createdTicketId}`, {
    headers: { Authorization: `Bearer ${tenantBToken}` }
  });
  recordTest('MULTI-TENANCY', 'Cross-Tenant Ticket Access Denied (Isolation)', crossTenantTicket.status === 404 || crossTenantTicket.status === 403, `Status: ${crossTenantTicket.status}`);

  console.log('\\n===========================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===========================================================');
}

runTests();
