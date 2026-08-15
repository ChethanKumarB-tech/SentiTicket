# SentiTicket — Master Project Implementation Plan & System Architecture

**Document Version:** 1.0.0  
**Author:** Lead Software Architect & Security Engineer  
**Project:** SentiTicket (Smart Support Ticketing System with SLA Prediction)  
**Status:** Architectural Blueprint & Planning Document  

---

## Table of Contents
1. [A. Product Architecture](#a-product-architecture)
2. [B. Application Modules](#b-application-modules)
3. [C. Security Architecture](#c-security-architecture)
4. [D. Database Architecture & Schema Design](#d-database-architecture--schema-design)
5. [E. REST API Architecture & Specification](#e-rest-api-architecture--specification)
6. [F. Frontend Architecture & UI/UX Design System](#f-frontend-architecture--uiux-design-system)
7. [G. Machine Learning Architecture](#g-machine-learning-architecture)
8. [H. Development Phases (Phases 1–15)](#h-development-phases)
9. [I. Technology Decisions & Rationale](#i-technology-decisions--rationale)
10. [J. Complete Project Directory Structure](#j-complete-project-directory-structure)

---

## A. Product Architecture

### 1. High-Level System Architecture Overview
SentiTicket is an enterprise-grade, multi-tenant smart support ticketing platform that merges proactive SLA lifecycle management with machine learning-driven SLA breach prediction. The system is designed following a **layered, defense-in-depth, zero-trust backend architecture** where the backend serves as the sole authoritative source of truth for identity, authorization, SLA calculations, workflow states, and data protection.

```
+----------------------------------------------------------------------------------------------------+
|                                      CLIENT TIER (React SPA)                                       |
|  - Customer Portal    - Support Agent Workspace    - Manager Dashboard    - Administrator Console  |
|  - Semantic Token Design System (Inter, WCAG 2.2 AA)  - Real-time SLA Visual Countdown Component   |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  │ HTTPS / WSS (TLS 1.3)
                                                  │ JSON REST APIs / CSRF Protected
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                 EDGE & REVERSE PROXY LAYER (Nginx)                                 |
|  - TLS Termination & HTTP/2    - Global Rate Limiting    - Security Headers (CSP, HSTS, XFO)       |
|  - Reverse Proxy Routing: / -> Frontend SPA, /api/v1 -> Node API Gateway                          |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  │ Reverse Proxy Internal Forwarding
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                               BACKEND APPLICATION TIER (Node.js / Express)                         |
|  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  |
|  │ Security & Middlewares: Helmet, RateLimiter, CORS, CookieParser, CSRF, AuditTracker          │  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Auth & RBAC Engine: JWT Verification, Refresh Token Rotation, Org Isolation, BOLA Guard      │  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Business Service Layer: Ticket Engine, SLA State Machine, Assignment Engine, Event Dispatcher│  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Data Access Layer: Mongoose ODM, Schema Validations, Safe Query Builders, Read/Write Auditing│  |
|  └──────────────────────────────────────────────────────────────────────────────────────────────┘  |
+----------------------------------------------------------------------------------------------------+
         │                                                            │
         │ Mongoose over TLS (SCRAM-SHA-256)                          │ Internal Service-to-Service REST
         │ VPC Peering / IP Whitelist                                 │ HMAC / Shared Internal Secret
         ▼                                                            ▼
+------------------------------------+                       +---------------------------------------+
|  DATA TIER (MongoDB Atlas Cluster) |                       |  ML PREDICTION TIER (Python FastAPI)  |
|  - Multi-tenant Collections        |                       |  - Internal FastAPI Microservice      |
|  - Multi-field Compound Indexes    |                       |  - scikit-learn Inference Pipeline    |
|  - Encrypted at Rest & in Transit  |                       |  - Feature Extraction & Bounds Guard  |
|  - Change Streams / TTL Indexes    |                       |  - Advisory-only Breach Probabilities |
+------------------------------------+                       +---------------------------------------+
```

### 2. Tier Details & Responsibilities
1. **React Frontend (Presentation Tier):**
   - Implements WCAG 2.2 AA compliant enterprise user interface guided strictly by `design.md`.
   - Never makes authoritative security, SLA deadline, or role-elevation decisions.
   - Consumes `/api/v1` REST endpoints; uses optimistic UI only for non-security interactions.
   - Provides accessible SLA visual countdowns and ML advisory indicators clearly separated from factual SLA states.

2. **Node.js + Express API (Application & Gateway Tier):**
   - Houses the core business logic, authoritative SLA calculation engine, multi-tenant isolation filters, RBAC permission checker, and validation pipeline.
   - Manages all CRUD operations on MongoDB Atlas via Mongoose models.
   - Acts as an authenticated, authorized, and rate-limited API gateway between clients and the internal Python ML prediction service.

3. **MongoDB Atlas (Persistence Tier):**
   - Houses organization-partitioned operational collections (`Users`, `Organizations`, `Tickets`, `Comments`, `Attachments`, `SLAPolicies`, `SLAEvents`, `AuditLogs`, `SecurityEvents`, `Sessions`, `Predictions`, `Notifications`).
   - Hardened with index-driven query optimization, field-level encryption, TTL session cleanup, and strict schema validation.

4. **Python ML Prediction Service (Advisory Prediction Tier):**
   - Lightweight FastAPI service running isolated scikit-learn models.
   - Private and inaccessible from the public internet. Accessible only through the Node.js backend with internal HMAC authorization.
   - Strict input validation against feature ranges; returns breach probability ($0.0 \le p \le 1.0$), risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and predicted resolution duration.

---

## B. Application Modules

| # | Module | Description & Capabilities | Access Level |
|---|---|---|---|
| 1 | **Authentication** | Registration, credential login, MFA (TOTP), email verification, password reset, refresh token rotation, session revocation. | Public / All Users |
| 2 | **User Management** | CRUD on user accounts, status management (Active, Suspended, Locked), role assignment, profile management. | Admin / Self-profile |
| 3 | **Organizations (Multi-Tenancy)** | Multi-tenant boundary enforcement, organization settings, domain restrictions, tenant-isolated data partitions. | Admin / System |
| 4 | **RBAC Engine** | Dynamic role & granular permission evaluation across 4 roles (`Customer`, `Agent`, `Manager`, `Admin`). | Internal Middleware |
| 5 | **Customer Portal** | Create tickets, view owned tickets, reply with customer comments, upload attachments, track SLA, view notifications. | Customer |
| 6 | **Agent Workspace** | View assigned tickets, department queue, priority triage, internal & external comments, workload visibility, SLA risk tracker. | Agent |
| 7 | **Manager Dashboard** | Team-wide ticket overview, load balancing, manual/automated agent assignments, SLA monitoring, escalation management, analytics. | Manager |
| 8 | **Admin Dashboard** | Tenant settings, user & role provisioning, SLA policy management, security event stream, immutable audit logs, system health. | Admin |
| 9 | **Ticket Management** | Complete ticket lifecycle state machine (`NEW` $\to$ `OPEN` $\to$ `IN_PROGRESS` $\to$ `PENDING` $\to$ `RESOLVED` $\to$ `CLOSED`). | All (Role-Scoped) |
| 10 | **Ticket Comments** | Public comments (customer-agent communication) and Internal comments (strictly hidden from customers via backend guards). | All (Role-Scoped) |
| 11 | **Ticket Assignment** | Priority-based, category/skill-based, and load-balanced agent assignment engine with concurrency locks. | Manager / Admin / Auto |
| 12 | **SLA Management** | Configuration of priority-based SLA response & resolution policies, working business hours, holiday calendars, warning thresholds. | Manager / Admin |
| 13 | **SLA Countdown & Calculation** | Authoritative server-side deadline calculation engine ($T_{created} + \Delta T_{policy}$) accounting for business hours and paused states. | System Engine |
| 14 | **SLA Breach Detection** | Server-side scheduled evaluation daemon detecting approaching warnings (`AT_RISK`), `CRITICAL` deadlines, and `BREACHED` states. | System Engine / Daemon |
| 15 | **SLA Escalation Engine** | Automated tier escalation, notification dispatches to managers, and priority escalation upon breach thresholds. | System Engine |
| 16 | **ML SLA Breach Prediction** | Advisory machine-learning inference pipeline predicting likelihood of SLA breach on open tickets using historical features. | Agent / Manager / Admin |
| 17 | **Notifications** | Multi-channel in-app notifications with read/unread tracking, idempotency keys, and tenant isolation. | All Users |
| 18 | **File Attachments** | Secure upload pipeline with magic byte validation, malware stub scanning, safe storage key generation, and authenticated downloads. | Authenticated Users |
| 19 | **Audit Logging** | Append-only, tamper-resistant log of all security, data modification, auth, and administrative actions. | Admin / Manager |
| 20 | **Security Monitoring** | Real-time security telemetry: failed logins, account lockouts, BOLA attempts, rate-limit abuses, suspicious token reuse. | Admin |
| 21 | **Analytics & Reporting** | Aggregated metrics: SLA compliance rates, MTTR (Mean Time to Resolution), ticket volumes, agent workload distribution, breach trends. | Manager / Admin |

---

## C. Security Architecture

### 1. Authentication & Session Security
- **Password Hashing:** Argon2id (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`) with individual cryptographic salts. Rejection of compromised/common passwords.
- **Dual-Token Session Strategy:**
  - **Access Token:** Short-lived JWT (15-minute lifespan), signed with RS256/EdDSA or high-entropy HS256 secret. Contains minimal claims: `sub` (userId), `org` (orgId), `role`, `tokenVersion`.
  - **Refresh Token:** High-entropy cryptographically random string (256-bit), stored as a SHA-256 hash in the `Session` collection with 7-day expiration. Transmitted in `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookies.
  - **Refresh Token Rotation & Reuse Detection:** Every refresh request issues a new token and invalidates the previous one. If an invalidated refresh token is reused, the entire session family for that user is immediately revoked and an `ALERT_TOKEN_REUSE` security event is triggered.
- **Multi-Factor Authentication (MFA):** TOTP (RFC 6238) with HMAC-SHA1/SHA256, 30-second step, encrypted secret storage at rest, single-use recovery backup codes.
- **Brute-Force & Lockout Controls:** Progressive delays after 3 failed attempts; temporary account lockout (15 minutes) after 5 consecutive failures per IP/account.

### 2. Authorization & Multi-Tenant Boundary Enforcement
- **Backend Authorization Authority:** All decisions occur on the server. Client-side route guards and navigation menus are strictly UX aids.
- **Organization Boundary Guard:** Every Mongoose query automatically scopes by `organizationId` derived strictly from `req.user.organizationId`. A customer or agent cannot query across tenants even if they guess an ID.
- **Broken Object-Level Authorization (BOLA / IDOR) Defense:** Every resource access (`/api/v1/tickets/:id`, `/api/v1/attachments/:id`) verifies:
  1. Resource exists.
  2. Resource belongs to `req.user.organizationId`.
  3. User has role permission (`tickets:read_all`, `tickets:read_assigned`, or `isOwner(req.user._id)`).
- **Vertical & Horizontal Privilege Escalation Protection:** Explicit field allowlists on update controllers (`PATCH /api/v1/tickets/:id`). Clients cannot modify `role`, `organizationId`, `slaDeadline`, `slaState`, `assignedAgentId`, or `customerId` through standard endpoints.

### 3. Application & Network Defense
- **Input Validation & Type Safety:** Zod schemas applied as Express middleware before controller execution. Rejects unknown fields (`strip` / `strict`), out-of-range numeric inputs, and malformed ObjectIds.
- **NoSQL Injection Prevention:** Explicit query building instead of passing raw `req.query` or `req.body` into Mongoose. Operator allowlisting prevents `$where`, `$gt`, `$ne`, `$regex` injection attacks.
- **Cross-Site Scripting (XSS) Prevention:** HTML sanitization of markdown/text content using DOMPurify/sanitize-html on the backend; React's default text node encoding on frontend; strict `Content-Security-Policy`.
- **Cross-Site Request Forgery (CSRF):** Anti-CSRF double-submit tokens or custom request header verification (`X-Requested-With` / `X-CSRF-Token`) for state-changing cookie-based requests.
- **Server-Side Request Forgery (SSRF):** Zero arbitrary URL fetching endpoints. Any webhook or outbound service call is restricted to strict internal or admin-configured allowlists.
- **Path Traversal & File Upload Security:**
  - Filenames are sanitized and mapped to UUIDv4 storage keys (`storageKey: ${orgId}/${ticketId}/${uuidv4()}.${ext}`).
  - File extension check + MIME type check + Magic number / File signature inspection (via `file-type`).
  - Strict upload size limit (max 10MB per file; max 5 files per ticket).
  - Executables (`.exe`, `.sh`, `.bat`, `.js`, `.py`, `.svg` with scripts, `.html`, `.php`) strictly rejected.
  - Stored in private object storage / local protected storage outside web root; served only through authenticated streaming endpoints with `Content-Disposition: attachment; filename="..."` and `X-Content-Type-Options: nosniff`.
- **Security Headers (Helmet):**
  - `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';`
  - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options`: `DENY`
  - `X-Content-Type-Options`: `nosniff`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
- **Secrets Management:**
  - Zero plaintext secrets in Git, Dockerfiles, or client-side bundles.
  - Runtime validation with fail-fast assertion on startup: verifies `MONGODB_URI`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `ML_SERVICE_SECRET`.
  - Development `.env` ignored in `.gitignore`; sanitized template in `.env.example`.

---

## D. Database Architecture & Schema Design

### 1. MongoDB Entity-Relationship Model
```
┌─────────────────┐       1:N       ┌────────────────────────┐
│  Organization   ├─────────────────┤         User           │
└────────┬────────┘                 └───────────┬────────────┘
         │                                      │
         │ 1:N                                  │ 1:N (as Customer or Assignee)
         ▼                                      ▼
┌─────────────────┐       1:N       ┌────────────────────────┐       1:N       ┌─────────────────┐
│   SLAPolicy     ├─────────────────┤        Ticket          ├─────────────────┤     Comment     │
└─────────────────┘                 └─────┬────────────┬─────┘                 └─────────────────┘
                                          │            │
                                      1:N │            │ 1:N
                                          ▼            ▼
                             ┌─────────────────┐  ┌─────────────────┐
                             │   Attachment    │  │   Prediction    │
                             └─────────────────┘  └─────────────────┘
```

### 2. Detailed Collection & Schema Specifications

#### Collection 1: `organizations`
- `_id`: ObjectId
- `name`: String (required, trimmed, max 100)
- `slug`: String (required, unique, lowercase, trimmed)
- `status`: String (enum: `['ACTIVE', 'SUSPENDED', 'DEACTIVATED']`)
- Indexes: `{ slug: 1 }` (unique), `{ status: 1 }`

#### Collection 2: `users`
- `_id`: ObjectId
- `organizationId`: ObjectId (ref: `Organization`, required, indexed)
- `email`: String (required, lowercase, trimmed, indexed)
- `role`: String (enum: `['CUSTOMER', 'AGENT', 'MANAGER', 'ADMIN']`, indexed)
- `status`: String (enum: `['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'SUSPENDED']`, indexed)
- Indexes: `{ organizationId: 1, email: 1 }` (unique compound index)

#### Collection 3: `tickets`
- `_id`: ObjectId
- `ticketId`: String (required, unique, format: `TICK-YYYYMM-XXXX`)
- `organizationId`: ObjectId (ref: `Organization`, required, indexed)
- `customerId`: ObjectId (ref: `User`, required, indexed)
- `assignedAgentId`: ObjectId (ref: `User`, default: null, indexed)
- `priority`: String (enum: `['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']`, indexed)
- `status`: String (enum: `['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED']`, indexed)
- `slaResolutionDeadline`: Date (authoritative server deadline, indexed)
- `slaState`: String (enum: `['SAFE', 'AT_RISK', 'CRITICAL', 'BREACHED', 'PAUSED']`, indexed)
- Indexes: `{ organizationId: 1, ticketId: 1 }` (unique)
