---
name: code-review-security
description: Perform secure code review for SentiTicket across React, Node.js, Express, MongoDB, Python ML, APIs, authentication, authorization and infrastructure.
---

# SentiTicket Code Review & Security Skill

## Objective

Ensure every significant SentiTicket code change is reviewed for:

- Security
- Correctness
- Authorization
- Data protection
- Maintainability
- Reliability
- Performance
- Test coverage

Security review must cover both the frontend and backend.

Never assume frontend controls provide security.

---

# 1. Code Review Principles

Every review should ask:

1. Is the code functionally correct?
2. Is authentication enforced where required?
3. Is authorization enforced server-side?
4. Is organization isolation enforced?
5. Is user input validated?
6. Can the code expose sensitive data?
7. Can the code be abused?
8. Are errors handled safely?
9. Are secrets protected?
10. Are tests included?
11. Does the change introduce a dependency?
12. Does the change affect existing security controls?
