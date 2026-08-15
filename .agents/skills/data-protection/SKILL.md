---
name: data-protection
description: Protect SentiTicket customer, employee, ticket, authentication, SLA, ML and operational data through minimization, access control, encryption, retention and secure deletion.
---

# SentiTicket Data Protection Skill

## Objective

Protect all data handled by SentiTicket throughout its lifecycle:

    Collection
        ↓
    Processing
        ↓
    Storage
        ↓
    Transmission
        ↓
    Backup
        ↓
    Retention
        ↓
    Deletion

Apply least privilege and data minimization everywhere.

---

# 1. Data Classification

Classify application data according to sensitivity.

Suggested categories:

## Public
Information intentionally available publicly.

## Internal
Normal operational information.

## Confidential
Information requiring access control (Ticket descriptions, Internal comments, SLA info, Customer info).

## Highly Sensitive
Information requiring stronger protection (Password hashes, Authentication tokens, MFA secrets, API keys, DB credentials).

Never expose highly sensitive information through normal APIs.
