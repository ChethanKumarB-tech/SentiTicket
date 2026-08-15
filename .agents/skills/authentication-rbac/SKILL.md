---
name: authentication-rbac
description: Implement secure authentication, session management, MFA and role-based authorization for SentiTicket.
---

# SentiTicket Authentication & RBAC Skill

## Objective

Implement authentication and authorization for SentiTicket using secure, server-side controls.

The backend is always the final authority for identity, roles, permissions and resource access.

Never trust security-sensitive values supplied by the frontend.

---

# 1. User Roles

SentiTicket has four primary roles:

- Customer
- Agent
- Manager
- Admin

Use least privilege.

### Customer

Can:

- Create tickets
- View own tickets
- Update permitted information on own tickets
- Add customer comments
- Upload permitted attachments
- View permitted ticket history
- Receive notifications
- Manage own profile
- Manage own sessions

Cannot:

- View other customers' tickets
- Assign tickets
- Change system SLA policies
- Change roles
- Access administrative dashboards
- View internal comments
- Access other organizations' data

### Agent

Can:

- View tickets assigned to them
- Work on authorized tickets
- Add permitted comments
- Change permitted ticket statuses
- View relevant SLA information
- View workload
- Receive assignments
- View authorized customer information

Cannot:

- Change user roles
- Modify system security settings
- Modify protected SLA policies
- Access unrelated organizations
- View unauthorized tickets
- Override security controls

### Manager

Can:

- View authorized organizational tickets
- Assign/reassign tickets
- Manage agent workload
- Configure authorized SLA policies
- View SLA performance
- View prediction dashboards
- Escalate tickets
- View authorized audit information

Cannot:

- Change global security settings unless explicitly permitted
- Change admin accounts
- Grant themselves additional privileges

### Admin

Can:

- Manage users
- Manage roles
- Manage organizations
- Manage system settings
- Manage security settings
- Manage SLA configuration
- View security/audit dashboards
- Manage authorized system integrations

All administrative actions must be audited.

---

# 2. Authentication Architecture

Use:

- Secure password hashing
- Short-lived access tokens
- Secure refresh-token mechanism
- Email verification
- Password reset
- MFA when enabled
- Login rate limiting
- Brute-force protection
- Session management

Authentication must happen on the server.

Never authenticate users only in React.
