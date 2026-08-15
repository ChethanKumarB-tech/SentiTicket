---
name: audit-monitoring
description: Implement secure audit logging, security event monitoring, suspicious activity detection, alerts, dashboards and centralized observability for SentiTicket.
---

# SentiTicket Audit & Monitoring Skill

## Objective

Provide reliable visibility into security, authentication, authorization, ticket workflow, SLA, ML, API and infrastructure events.

The monitoring system must help answer:

- Who performed an action?
- What action was performed?
- Which resource was affected?
- When did it happen?
- Was it successful?
- Which organization was involved?
- Was the activity suspicious?
- What security response is required?

Audit logging must never become a source of sensitive-data leakage.

---

# 1. Audit Logging Principles

Audit logs must be:

- Structured
- Consistent
- Timestamped
- Access-controlled
- Tamper-resistant where practical
- Searchable
- Organization-aware
- Privacy-aware

Do not log sensitive secrets.

---

# 2. Security Events

Record important security events such as:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
ACCOUNT_LOCKED
ACCOUNT_SUSPENDED
PASSWORD_CHANGED
PASSWORD_RESET_REQUESTED
PASSWORD_RESET_COMPLETED
EMAIL_VERIFIED
MFA_ENABLED
MFA_DISABLED
SESSION_CREATED
SESSION_REVOKED
```
