# HostelHub v2.1 - Enterprise Hostel Management System
### Master Project Blueprint & Architecture Document

**Institution:** PCET's Pimpri Chinchwad College of Engineering (PCCOE), Nigdi, Pune  
**Department:** Computer Engineering  
**Project By:** Piyush Rajkumar Patil · Pranali Rajendra Patil · Sayali Rajesh Pawar  
**Guide:** Prof. Shraddha Ovale  
**Document Version:** 2.1 - Production Blueprint  
**Date:** May 2026  
**Status:** Pre-Implementation (Documentation Phase Complete)

---

## Table of Contents

1. [Executive Summary & Change Log](#1-executive-summary--change-log)
2. [What's Wrong With v1 - Honest Audit](#2-whats-wrong-with-v1--honest-audit)
3. [Project Identity & Vision](#3-project-identity--vision)
4. [System Architecture](#4-system-architecture)
5. [Role & Permission Matrix (v2.1)](#5-role--permission-matrix-v21)
6. [Feature Modules - Complete with Edge Cases](#6-feature-modules--complete-with-edge-cases)
   - 6.1 Authentication & Session Management
   - 6.2 Admin Module - Full Privileges & Edge Cases
   - 6.3 Warden Module - Full Privileges & Edge Cases
   - 6.4 Student Module - Full Privileges & Edge Cases
   - 6.5 Website Administrator Module
   - 6.6 QR-Based IN Movement Verification
   - 6.7 Room Allocation System (Complete State Machine)
   - 6.8 Movement Log System
   - 6.9 Leave Management System
   - 6.10 Complaint Management System
   - 6.11 Analytics & Reporting - All Dashboards
   - 6.12 Notification & Cron Job System
   - 6.13 Audit Log System
   - 6.14 SEO & Public Pages
7. [Database Schema Design (v2.1)](#7-database-schema-design-v21)
8. [Redis Caching Architecture](#8-redis-caching-architecture)
9. [Cron Job System](#9-cron-job-system)
10. [API Design](#10-api-design)
11. [Frontend Architecture & Pages](#11-frontend-architecture--pages)
12. [Security Architecture](#12-security-architecture)
13. [Design System & UI Guidelines](#13-design-system--ui-guidelines)
14. [Folder Structure](#14-folder-structure)
15. [Tech Stack & Library Decisions](#15-tech-stack--library-decisions)
16. [Hosting & Infrastructure](#16-hosting--infrastructure)
17. [Scalability Design (1000+ Concurrent Users)](#17-scalability-design-1000-concurrent-users)
18. [CI/CD & DevOps](#18-cicd--devops)
19. [Testing Strategy - Full Coverage](#19-testing-strategy--full-coverage)
20. [SEO Strategy](#20-seo-strategy)
21. [Future Scope & Advancement](#21-future-scope--advancement)
22. [Development Roadmap (Sprints)](#22-development-roadmap-sprints)
23. [Copyright & Legal](#23-copyright--legal)

---

## 1. Executive Summary & Change Log

HostelHub v2.1 is a **production-grade, enterprise-quality, scalable Hostel Management System** built exclusively for PCCOE's girls' hostel. It digitizes every physical register, paper form, and manual workflow into a secure, fast, and transparent web platform - designed to handle **1000+ concurrent users**, with Redis-powered caching, scheduled cron jobs, QR-verified movement check-ins, deep analytics, and a dedicated Website Administrator role.

### v2.1 Changes from v2.0

| Change | Details |
|--------|---------|
| ✅ Added | Redis caching layer for sessions, rate limits, analytics cache |
| ✅ Added | Cron job system (8 scheduled jobs with BullMQ + Redis) |
| ✅ Added | QR code verification for student IN movement |
| ✅ Added | Website Administrator role (site analytics + QA testing) |
| ✅ Added | All admin edge cases and full privilege documentation |
| ✅ Added | All warden edge cases and full privilege documentation |
| ✅ Added | All student edge cases and full privilege documentation |
| ✅ Added | Comprehensive analytics for Admin and Warden |
| ✅ Added | SEO strategy (meta, sitemap, structured data, SSR-ready) |
| ✅ Added | Scalability architecture for 1000+ concurrent users |
| ✅ Added | Full testing strategy (unit, integration, E2E, load tests) |
| ✅ Added | Professional design system with PCCOE theme + animations |
| ✅ Added | Dark/Light theme toggle |
| ✅ Added | Future scope section |

### v2.0 vs v2.1 vs v1 Comparison

| Dimension | v1 | v2.0 | v2.1 |
|-----------|----|----|-----|
| Architecture | Flat | Service/Repo | Service/Repo + Redis |
| Auth | Basic JWT | Access+Refresh | Access+Refresh+Redis Sessions |
| Caching | None | None | Redis (multi-layer) |
| Background Jobs | None | None | BullMQ + 8 cron jobs |
| Movement Verification | None | Basic log | QR scan verification |
| Analytics | Basic | Charts | Deep analytics, exportable |
| Roles | 3 | 4 | 4 (Admin/Warden/Student/WebAdmin) |
| SEO | None | None | Full SEO strategy |
| Concurrency | ~50 | ~200 | 1000+ |
| Testing | None | Jest+Vitest | Jest+Vitest+Playwright+k6 |

---

## 2. What's Wrong With v1 - Honest Audit

### 2.1 Architecture Problems

**Problem: Flat controller → database pattern**
```
// v1 (bad) - business logic inside controller
router.post('/leave', async (req, res) => {
  const leave = await Leave.create(req.body); // direct ORM in controller
  res.json(leave);
});
```
**Why it's bad:** Untestable. Any DB change requires touching controllers. No isolation.

**v2.1 solution:**
```
Route → Controller (parse + respond) 
      → Service (business logic, transactions)
        → Repository (Sequelize only)
          → MySQL + Redis
```

**Problem: `sync({ force: true })` risk**  
Any server restart with this flag drops all tables. Catastrophic in production.  
**Fix:** Sequelize CLI migrations only. No sync calls anywhere.

**Problem: No service layer means no transactions**  
When allocating a room (update student, update room occupancy, create allocation record), if step 2 fails, step 1 is already committed - corrupted data.  
**Fix:** All multi-step operations wrapped in `sequelize.transaction()`.

### 2.2 Security Problems

- No rate limiting on `/auth/login` → brute force possible
- No Helmet.js → missing XSS, clickjacking, MIME sniffing protections
- CORS set to `*` → any website can call your API with a student's credentials
- No refresh token → either users are perpetually logged in with old tokens, or kicked out every 15 min
- Likely `.env` was committed at some point (student project habit)
- No input sanitization (SQL injection via ORM is unlikely but parameter pollution is real)
- File uploads with no type/size validation

### 2.3 Frontend Problems

- No centralized axios instance - every component calls API differently
- No token refresh interceptor - users hit 401 and see broken UI instead of auto-refresh
- No React Query - data refetched on every mount, no caching, stale data everywhere
- No error boundaries - one component crash crashes the whole app
- No loading skeleton states - users see blank page during data fetch
- State scattered via prop drilling and local useState

### 2.4 Database Problems

- No indexes on FK columns → JOINs are full table scans
- No soft deletes → deleted records leave orphaned FK references
- No UUID primary keys → sequential IDs expose record counts (`/leave/1`, `/leave/2`...)
- No audit trail → no accountability for who changed what
- N+1 problem → fetching rooms then fetching students in a loop
- No DB constraints (unique, not null, check) - only application-level

### 2.5 Operational Problems

- No logging → production debugging is completely blind
- No health check → load balancer can't verify server is alive
- No Docker → works on my machine, breaks on server
- No CI/CD → manual deployments, no automated tests before deploy
- No monitoring → you don't know when things fail until users complain

---

## 3. Project Identity & Vision

### 3.1 Product Name
**HostelHub** - *by PCCOE*

### 3.2 Taglines
- Primary: *"Smart Hostel. Zero Paperwork. Full Transparency."*
- Secondary: *"Every decision tracked. Every student accounted for."*

### 3.3 Core Philosophy

| Principle | Meaning |
|-----------|---------|
| **Transparency** | Every decision is visible, traceable, and documented |
| **Fairness** | Merit-based allocation with zero scope for favoritism |
| **Accountability** | Full audit trail - who did what, when, from where |
| **Simplicity** | Complex workflows made one-click simple |
| **Trust** | Parents and students trust the system over human discretion |

### 3.4 Target Users & Scale

| Role | Estimated Count | Peak Usage |
|------|----------------|-----------|
| Admin | 2 | Low frequency, high impact |
| Warden | 4–6 | Daily, moderate frequency |
| Student | 300–500 | Daily, high frequency |
| Website Admin | 1–2 | Periodic monitoring |
| **Total Concurrent** | **~1000** | Allocation window peak |

---

## 4. System Architecture

### 4.1 High-Level Architecture (v2.1)

```
┌───────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                               │
│         React 18 + TypeScript + Vite (Vercel CDN)                │
│   [Public/SEO Pages] [Student App] [Warden App] [Admin App]      │
│                      [WebAdmin Console]                            │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTPS / REST (TLS 1.3)
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                             │
│              Node.js 20 + Express 4 (Render)                     │
│                                                                    │
│  Helmet → CORS → Rate Limiter → Request Logger → Auth → RBAC     │
│                        → Zod Validator                            │
│                                                                    │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐    │
│  │ Controllers  │ → │  Services   │ → │    Repositories     │    │
│  │ (thin layer) │   │ (biz logic) │   │  (DB access only)   │    │
│  └─────────────┘   └─────────────┘   └──────────┬──────────┘    │
│                                                   │               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    CACHE LAYER (Redis)                       │ │
│  │  Sessions | Rate Limits | Analytics | OTP | QR Tokens       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 JOB QUEUE (BullMQ + Redis)                   │ │
│  │  Email Queue | Notification Queue | Report Generation Queue  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │ Sequelize ORM
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                 │
│                    MySQL 8 (PlanetScale)                          │
│  Users | Students | Rooms | Allocations | Leaves | Complaints    │
│  MovementLogs | AuditLogs | Notifications | Sessions | QRTokens  │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 Request Lifecycle (Full)

```
Incoming HTTP Request
       │
       ├─ 1. Helmet (adds 11 security headers)
       ├─ 2. CORS (whitelist: vercel domain only)
       ├─ 3. Rate Limiter (Redis-backed, per IP)
       ├─ 4. Compression (gzip)
       ├─ 5. Body Parser (limit: 10kb, except uploads)
       ├─ 6. Request Logger (Winston - assigns requestId UUID)
       ├─ 7. authenticate() - verify JWT access token
       ├─ 8. authorize(role) - RBAC check
       ├─ 9. validate(zodSchema) - body/params/query validation
       │
       ├─ Controller (parse request, call service)
       │     └─ Service (business logic)
       │           ├─ Redis Cache check (read path)
       │           └─ Repository (Sequelize)
       │                 └─ MySQL (PlanetScale)
       │                       └─ Result → Cache → Controller
       │
       └─ Global Error Handler
             └─ Formatted error response (never exposes stack in prod)
```

### 4.3 Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│                    LOGIN FLOW                        │
│                                                     │
│  POST /auth/login                                   │
│   ├─ Zod validate body                             │
│   ├─ Find user by email                            │
│   ├─ bcrypt.compare(password, hash)                │
│   ├─ Check failed attempt count (Redis)            │
│   │   └─ > 5 attempts in 15min → lock account     │
│   ├─ Generate Access Token (JWT, 15min)            │
│   ├─ Generate Refresh Token (JWT, 7d)              │
│   ├─ Hash refresh token → store in DB + Redis      │
│   ├─ Set Refresh Token in httpOnly, secure cookie  │
│   ├─ Log auth event to audit_logs                  │
│   └─ Return { accessToken, user }                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  TOKEN REFRESH FLOW                  │
│                                                     │
│  POST /auth/refresh                                 │
│   ├─ Read refresh token from httpOnly cookie       │
│   ├─ Verify JWT signature                          │
│   ├─ Check token in Redis (fast) + DB (authoritative)│
│   ├─ Rotate: invalidate old token, issue new pair  │
│   └─ Return new { accessToken }                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    LOGOUT FLOW                       │
│                                                     │
│  POST /auth/logout                                  │
│   ├─ Invalidate refresh token in DB                │
│   ├─ Delete from Redis cache                       │
│   ├─ Clear httpOnly cookie                         │
│   └─ Log logout event                              │
│                                                     │
│  POST /auth/logout-all                              │
│   ├─ Delete ALL refresh tokens for user            │
│   ├─ Flush all user sessions from Redis            │
│   └─ Log event                                     │
└─────────────────────────────────────────────────────┘
```

---

## 5. Role & Permission Matrix (v2.1)

### 5.1 Roles (Updated)

| Role | Code | Description | Dashboard |
|------|------|-------------|-----------|
| Super Admin | `ADMIN` | Full system control | Full admin portal |
| Warden | `WARDEN` | Daily operations | Warden portal |
| Student | `STUDENT` | Self-service | Student portal |
| Website Admin | `WEB_ADMIN` | Site analytics, QA testing | WebAdmin console |

> ⚠️ **Maintenance Staff role removed.** Complaint resolution is handled offline by warden and physical staff. Warden updates complaint status after offline resolution.

### 5.2 Complete Permission Matrix

| Feature | ADMIN | WARDEN | STUDENT | WEB_ADMIN |
|---------|:-----:|:------:|:-------:|:---------:|
| **AUTHENTICATION** |||||
| Login / Logout | ✅ | ✅ | ✅ | ✅ |
| Logout from all devices | ✅ | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ | ✅ |
| Reset any user's password | ✅ | ❌ | ❌ | ❌ |
| View active sessions | ✅ | ✅ | ✅ | ❌ |
| Force expire any session | ✅ | ❌ | ❌ | ❌ |
| **USER MANAGEMENT** |||||
| Create student accounts | ✅ | ✅ | ❌ | ❌ |
| Create warden accounts | ✅ | ❌ | ❌ | ❌ |
| Create WebAdmin accounts | ✅ | ❌ | ❌ | ❌ |
| Bulk import students (CSV) | ✅ | ❌ | ❌ | ❌ |
| Edit any user's profile | ✅ | ❌ | ❌ | ❌ |
| Edit student profile | ✅ | ✅ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ |
| Deactivate / Reactivate account | ✅ | ❌ | ❌ | ❌ |
| Permanently delete account | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ✅ | ❌ | ❌ |
| Search / filter students | ✅ | ✅ | ❌ | ❌ |
| Export student list (CSV) | ✅ | ✅ | ❌ | ❌ |
| View student full history | ✅ | ✅ | ❌ | ❌ |
| Change any user's role | ✅ | ❌ | ❌ | ❌ |
| **ROOM MANAGEMENT** |||||
| Create / edit rooms | ✅ | ❌ | ❌ | ❌ |
| Delete / archive rooms | ✅ | ❌ | ❌ | ❌ |
| Mark room as Maintenance | ✅ | ✅ | ❌ | ❌ |
| View all rooms + occupants | ✅ | ✅ | ❌ | ❌ |
| View room grid/map | ✅ | ✅ | ❌ | ❌ |
| Manually assign student to room | ✅ | ❌ | ❌ | ❌ |
| Manually de-allocate student | ✅ | ❌ | ❌ | ❌ |
| Swap two students' rooms | ✅ | ❌ | ❌ | ❌ |
| **ALLOCATION CYCLE** |||||
| Create new allocation cycle | ✅ | ❌ | ❌ | ❌ |
| Advance cycle status | ✅ | ❌ | ❌ | ❌ |
| Upload SGPA data (CSV) | ✅ | ❌ | ❌ | ❌ |
| Generate merit list | ✅ | ❌ | ❌ | ❌ |
| Edit eligibility criteria | ✅ | ❌ | ❌ | ❌ |
| Extend allocation deadlines | ✅ | ❌ | ❌ | ❌ |
| Override merit list rank | ✅ | ❌ | ❌ | ❌ |
| Close / cancel cycle | ✅ | ❌ | ❌ | ❌ |
| View merit list | ✅ | ✅ | ✅* | ❌ |
| Submit hostel preference | ❌ | ❌ | ✅* | ❌ |
| Select room from available | ❌ | ❌ | ✅* | ❌ |
| Decline allocated slot | ❌ | ❌ | ✅* | ❌ |
| View allocation history | ✅ | ✅ | ✅** | ❌ |
| Export allocation report | ✅ | ✅ | ❌ | ❌ |
| **MOVEMENT LOGS** |||||
| Log OUT movement | ❌ | ❌ | ✅ | ❌ |
| Log IN movement (self, QR required) | ❌ | ❌ | ✅ | ❌ |
| Generate session QR for IN scan | ❌ | ✅ | ❌ | ❌ |
| View all movement logs | ✅ | ✅ | ❌ | ❌ |
| View own movement history | ❌ | ❌ | ✅ | ❌ |
| Mark student as overdue | ✅ | ✅ | ❌ | ❌ |
| Edit / correct a movement entry | ✅ | ❌ | ❌ | ❌ |
| Delete movement entry | ✅ | ❌ | ❌ | ❌ |
| Export movement logs (CSV/PDF) | ✅ | ✅ | ❌ | ❌ |
| **LEAVE MANAGEMENT** |||||
| Apply for leave | ❌ | ❌ | ✅ | ❌ |
| Cancel pending leave | ❌ | ❌ | ✅ | ❌ |
| Approve / Reject leave | ✅ | ✅ | ❌ | ❌ |
| Revoke approved leave | ✅ | ✅ | ❌ | ❌ |
| View all leave requests | ✅ | ✅ | ❌ | ❌ |
| View own leave requests | ❌ | ❌ | ✅ | ❌ |
| Edit leave policy | ✅ | ❌ | ❌ | ❌ |
| Export leave data (CSV/PDF) | ✅ | ✅ | ❌ | ❌ |
| **COMPLAINTS** |||||
| Submit complaint | ❌ | ❌ | ✅ | ❌ |
| View own complaints | ❌ | ❌ | ✅ | ❌ |
| Reopen closed complaint (once, 7d) | ❌ | ❌ | ✅ | ❌ |
| Update complaint status | ✅ | ✅ | ❌ | ❌ |
| Add internal warden note | ✅ | ✅ | ❌ | ❌ |
| Resolve complaint | ✅ | ✅ | ❌ | ❌ |
| View all complaints | ✅ | ✅ | ❌ | ❌ |
| Delete complaint | ✅ | ❌ | ❌ | ❌ |
| Export complaints | ✅ | ✅ | ❌ | ❌ |
| **ANALYTICS** |||||
| Full hostel analytics dashboard | ✅ | ✅ | ❌ | ❌ |
| Website analytics | ✅ | ❌ | ❌ | ✅ |
| Export any report | ✅ | ✅ | ❌ | ❌ |
| View system health metrics | ✅ | ❌ | ❌ | ✅ |
| **NOTIFICATIONS** |||||
| Broadcast notice (all students) | ✅ | ✅ | ❌ | ❌ |
| Broadcast notice (year/branch group) | ✅ | ✅ | ❌ | ❌ |
| View own notifications | ✅ | ✅ | ✅ | ✅ |
| Delete own notifications | ✅ | ✅ | ✅ | ❌ |
| **AUDIT LOGS** |||||
| View full audit trail | ✅ | ❌ | ❌ | ❌ |
| Filter/search audit logs | ✅ | ❌ | ❌ | ❌ |
| Export audit logs | ✅ | ❌ | ❌ | ❌ |
| **SYSTEM SETTINGS** |||||
| Academic year management | ✅ | ❌ | ❌ | ❌ |
| System-wide settings | ✅ | ❌ | ❌ | ❌ |
| Email template management | ✅ | ❌ | ❌ | ❌ |
| Leave policy configuration | ✅ | ❌ | ❌ | ❌ |
| Cron job status & control | ✅ | ❌ | ❌ | ❌ |
| Redis cache management | ✅ | ❌ | ❌ | ❌ |
| **WEBSITE ADMIN** |||||
| Page performance metrics | ❌ | ❌ | ❌ | ✅ |
| API response time tracking | ❌ | ❌ | ❌ | ✅ |
| User flow analytics | ❌ | ❌ | ❌ | ✅ |
| Error rate monitoring | ❌ | ❌ | ❌ | ✅ |
| Run functional test suite | ❌ | ❌ | ❌ | ✅ |
| SEO health checker | ❌ | ❌ | ❌ | ✅ |
| Broken link detector | ❌ | ❌ | ❌ | ✅ |
| Lighthouse score runner | ❌ | ❌ | ❌ | ✅ |

*Only during active allocation window for eligible students  
**Own allocation history only

---

## 6. Feature Modules - Complete with Edge Cases

---

### 6.1 Authentication & Session Management

#### Core Features
- Email + password login
- bcrypt password hashing (cost factor 12)
- Access Token: JWT, 15 min expiry, signed with `ACCESS_SECRET`
- Refresh Token: JWT, 7 days, signed with `REFRESH_SECRET` (different key), stored hashed in DB, cached in Redis
- httpOnly + Secure + SameSite=Strict cookie for refresh token
- Auto token refresh via axios interceptor on frontend

#### Edge Cases Covered

| Edge Case | Handling |
|-----------|---------|
| Wrong password | Generic "Invalid credentials" (never reveal which field is wrong) |
| Non-existent email | Same generic message (prevents user enumeration) |
| 5 consecutive failed attempts | Account temporarily locked for 15 minutes (tracked in Redis) |
| Lockout during lockout window | Reset timer on each attempt during lockout |
| Admin resets password for locked user | Clears lockout counter in Redis |
| Login from new device while logged in elsewhere | Both sessions valid (multi-device) |
| Refresh token used twice (replay attack) | Detect reuse → invalidate ALL user tokens → force re-login |
| Expired refresh token | Return 401, redirect to login |
| Tampered JWT | Signature verification fails, 401 returned |
| Deactivated account login attempt | "Account deactivated. Contact admin." |
| Password reset link expiry | OTP expires in 15 min (Redis TTL) |
| Password changed while logged in on another device | Old refresh tokens remain valid until expiry (7d) OR admin revokes all |
| Student account with no profile created | Login succeeds, prompts profile completion |
| Role changed while user is logged in | Next API call returns 403 if new role lacks permission; re-login required |

#### Password Policy
- Minimum 8 characters
- At least 1 uppercase, 1 number
- No common passwords (checked against top-1000 list)
- Cannot reuse last 3 passwords

---

### 6.2 Admin Module - Full Privileges & Edge Cases

The Admin has **unrestricted access** to everything. Below are all admin capabilities organized by domain with edge cases documented.

#### A. User & Account Management

**Full Capabilities:**
- Create accounts for students, wardens, web admins
- Bulk import students via CSV (up to 500 rows per import)
- Edit any user's profile data (name, email, branch, year, phone, emergency contacts)
- Change any user's role
- Deactivate account (soft disable - user cannot log in, data preserved)
- Reactivate account
- Reset any user's password (sends reset email to user)
- Force logout any user (revoke all refresh tokens)
- Permanently delete account (soft delete with 30-day recovery window)
- View login history for any user
- View active sessions for any user

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Admin tries to delete their own account | ❌ Blocked - at least one ADMIN must exist |
| Admin imports CSV with duplicate PRN | Row skipped, error logged, report shown |
| Admin imports CSV with missing required fields | Row skipped, error row returned in report |
| Admin deactivates a student with pending leave | Leave request auto-cancelled, student notified |
| Admin deactivates a student currently signed OUT | Warden notified of signed-out deactivated student |
| Admin deactivates warden who has pending leaves to approve | Those leaves re-assigned to next available warden or flagged |
| Admin changes student's year (e.g., 2nd → 3rd year) | Current allocation preserved; reflected in next cycle |
| Admin changes student's branch | Purely informational, no functional effect |
| Admin resets password for student | Token valid 15 min, email sent; admin sees "Reset sent" confirmation |
| Bulk import with 501+ rows | Returns error: "Max 500 rows per import" |
| Admin creates student with email already existing | Returns conflict error with existing account details |
| Admin tries to create second admin | ✅ Allowed; multiple admins supported |

#### B. Room Management

**Full Capabilities:**
- Create rooms (number, floor, block, capacity 1–3)
- Edit room details (number, floor, block)
- Change room capacity (with constraints)
- Mark room as Under Maintenance (students cannot be assigned)
- Restore room from Maintenance
- Archive room permanently
- View room grid (all rooms, color-coded by status)
- View room occupants (current and historical)
- Manually assign any student to any room (override allocation)
- Manually remove any student from a room
- Swap two students between rooms
- Move all students from one room to another

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Admin reduces room capacity below current occupancy | ❌ Blocked - "Remove occupants first" |
| Admin marks occupied room as Maintenance | ❌ Blocked - "Reassign occupants first" |
| Admin assigns 4th student to capacity-3 room | ❌ Blocked regardless of admin override |
| Admin assigns student already in another room | ❌ Blocked - "Student already allocated to Room X. Remove first." |
| Admin assigns student during active allocation cycle | ✅ Allowed with warning: "Allocation cycle active" |
| Admin swaps two students in same room | No-op - system detects same room, warns admin |
| Admin archives room with historical allocations | ✅ Allowed - historical data preserved, room removed from active list |
| Admin manually assigns student mid-cycle | Allocation recorded as MANUAL_OVERRIDE in audit log |

#### C. Allocation Cycle Management

**Full Capabilities:**
- Create new academic year
- Set academic year as active
- Create allocation cycle for active year
- Configure: preference deadline, selection deadline, SGPA cutoff, reserved seats for 1st year
- Advance cycle through all states manually
- Rewind cycle to previous state (emergency)
- Upload SGPA data (CSV) and regenerate merit list at any time
- Override a student's rank in merit list
- Add a student to merit list manually
- Remove a student from merit list
- Extend any deadline
- Assign room to student manually bypassing merit list
- Close cycle early
- Cancel cycle entirely (with confirmation)
- View full allocation statistics per cycle

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Admin creates cycle when another is active | ❌ Blocked - "Close existing cycle first" |
| Admin uploads SGPA with student PRN not in system | Row skipped, flagged in import report |
| Admin uploads SGPA during ROOM_SELECTION phase | Regenerates merit list, already-selected rooms preserved |
| Student selected room before SGPA re-upload makes them ineligible | Admin sees conflict flag; can override or keep selection |
| Admin extends deadline after it passed | ✅ Allowed - deadline updated, notifications sent |
| Admin advances cycle with no eligible students | Warning shown: "0 eligible students - confirm advance?" |
| Admin cancels active cycle | All pending preferences/selections cleared, notification sent to all students |
| Admin rewinds cycle state | Triggers confirmation, audit log records rewind reason |
| Admin overrides merit rank | Original rank preserved in `original_rank` column, override noted |
| First-year students have no SGPA | They are handled separately in FIRST_YEAR_ALLOCATION phase |
| Student declined but admin re-adds them | Re-adds to merit list at same rank; student notified |
| All eligible students declined | Cycle can advance with 0 selections; admin warned |

#### D. System Settings & Configuration

**Full Capabilities:**
- Configure leave policy (max days per type per semester)
- Configure SGPA cutoff default
- Configure room capacity default
- Manage email templates (leave approval, rejection, allocation result)
- View all cron job statuses (running/paused/failed)
- Manually trigger any cron job
- Pause / resume cron jobs
- View Redis cache stats (hit rate, memory, keys)
- Flush specific cache keys
- View server health dashboard (CPU, memory, DB connection pool)
- View all active WebSocket connections (if implemented later)

#### E. Analytics & Reporting (Admin)

See Section 6.11 for full analytics specification.

#### F. Admin Edge Cases - Security & Access

| Scenario | System Behavior |
|----------|----------------|
| Admin API calls without valid token | 401 Unauthorized |
| Admin uses another admin's account | Each admin has individual account - shared accounts prohibited |
| Admin tries to view audit log of their own actions | ✅ Allowed - admins are not exempt from their own audit trail |
| Admin force-logs-out a warden with pending actions | Warden session terminated; pending actions remain for next login |
| Two admins editing same student simultaneously | Last-write-wins with optimistic locking warning |

---

### 6.3 Warden Module - Full Privileges & Edge Cases

#### A. Movement Monitoring

**Full Capabilities:**
- View live dashboard of all current OUT movements (students outside hostel right now)
- View overdue students (past expected return time) - highlighted in red
- Generate session QR code for verifying student IN movements
- Mark any student as overdue manually
- View full movement log with filters (date, student, status)
- Export movement logs (CSV, PDF)

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Student scans QR but QR is expired (>30 min) | ❌ Scan rejected - "QR expired. Ask warden to regenerate." |
| Student tries to scan QR from another session/warden | ❌ Rejected - each QR is session-specific |
| Student logged OUT twice without logging IN | System flags: "Duplicate OUT detected" - second entry blocked |
| Student never logs IN after going OUT | Cron job flags as overdue after expected return; warden notified |
| Warden generates QR while no students are signed OUT | QR still generated; any student can use it to check in |
| Student OUT entry has no expected return time | System sets default +4 hours; warden notified |
| Multiple students trying to check in simultaneously | Queue system - each scan processed independently |
| Warden marks student as returned manually (offline) | Creates IN movement entry with `manually_confirmed=true` flag |

#### B. Leave Request Management

**Full Capabilities:**
- View all pending leave requests sorted by submission date
- Filter by: type, student year, branch, date range, status
- Approve with optional note
- Reject with mandatory rejection reason
- Revoke an approved leave (with reason - e.g., emergency)
- View leave calendar (calendar view of all approved leaves by date)
- Export leaves (CSV/PDF)

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Student applies for leave but is currently OUT | System warns warden: "Student is currently signed out" |
| Warden approves leave that overlaps with another approved leave | System detects overlap and warns warden before confirming |
| Student cancels leave after warden approved | ✅ Allowed - leave status set to CANCELLED; warden notified |
| Warden revokes leave on the day of travel | ✅ Allowed - student notified via in-app + email |
| Warden rejects leave with no reason entered | ❌ Blocked - rejection reason is mandatory |
| Two wardens approving same leave simultaneously | First approval succeeds; second gets "Already processed" message |
| Leave application for dates in the past | ❌ Blocked at validation layer (from_date ≥ today) |
| Student applies for > max days (per policy) | ❌ Blocked - "Maximum X days allowed for HOME leave" |
| Student applies for emergency leave last-minute | ✅ Allowed - all leave types accept same-day application |

#### C. Complaint Management

**Full Capabilities:**
- View all open complaints sorted by date + SLA urgency
- Filter by: category, status, date
- Update complaint status: OPEN → IN_PROGRESS → RESOLVED
- Add internal notes (visible only to admin and warden)
- Close resolved complaint
- Flag complaint as escalated (appears highlighted in admin view too)
- View SLA timer for each complaint (days since opened)
- Export complaints

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Same complaint submitted twice by same student | System detects similar description + category → warns "Possible duplicate" |
| Student reopens complaint warden already resolved | Status reverts to OPEN; warden re-notified |
| Complaint escalated but no action for 7 days | Cron job auto-notifies all wardens and admin |
| Warden tries to close IN_PROGRESS complaint without note | ❌ Blocked - resolution note required |
| Complaint older than 30 days still OPEN | Auto-escalated by cron job; shown in admin dashboard |
| Photo attachment is malicious file type | ❌ Rejected at upload - only jpg/png/webp accepted, MIME type validated |

#### D. Student Profile Access

**Full Capabilities:**
- View any student's full profile
- View student's room
- View student's leave history
- View student's movement history
- View student's complaint history
- Create / edit student profile
- Upload/update student photo

---

### 6.4 Student Module - Full Privileges & Edge Cases

#### A. Movement Log

**Full Capabilities:**
- Log OUT: enter destination, reason, expected return time
- Log IN: scan warden-generated QR code to confirm physical return
- View own movement history (paginated)
- View current OUT status (if currently outside)

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Student tries to log OUT while already signed OUT | ❌ Blocked - "You have an open OUT entry. Log IN first." |
| Student tries to log OUT without specifying destination | ❌ Blocked - validation error |
| Student tries to log IN without scanning QR | ❌ Blocked - QR scan is mandatory for IN entry |
| Student submits expired QR | ❌ Rejected - "QR expired. Contact warden." |
| Student is on approved leave and tries to log OUT | ✅ Allowed - movement log is independent of leave |
| Student returns much later than expected | System auto-marks as overdue; warden already notified by cron |
| Network drops during QR scan | Frontend retries; backend is idempotent (same scan token = same result) |
| Student scans QR multiple times | First scan creates IN entry; subsequent scans return "Already checked in" |

#### B. Leave Request

**Full Capabilities:**
- Submit leave request with type, dates, reason, emergency contact
- View own leave history (all statuses)
- Cancel a pending leave
- View approved leave reference number
- Receive in-app + email notification on approval/rejection

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Student applies for leave when leave is already pending | ❌ Blocked - "You have a pending leave. Wait for decision." |
| Student applies for leave during exam period (if configured) | System warns: "Leave during exam period - subject to strict review" |
| Student cancels a leave after warden approved | ✅ Allowed (up to departure date) - warden notified |
| Student's leave is approved but they never left | No automatic effect; movement logs remain independent |
| Student misses return date of approved leave | Cron job flags - warden notified next morning |

#### C. Complaint Submission

**Full Capabilities:**
- Submit complaint with category, title, description, optional photo
- View own complaints with current status
- Receive status update notifications
- Reopen a CLOSED complaint once within 7 days of closing

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Student submits complaint with only 2 words in description | ❌ Blocked - min 20 characters |
| Student uploads photo > 5MB | ❌ Blocked - "Max file size 5MB" |
| Student uploads non-image file disguised as .jpg | ❌ Blocked - MIME type validated server-side |
| Student reopens complaint after 7 days | ❌ Blocked - "Reopen window expired. Submit a new complaint." |
| Student submits > 5 complaints in one day | ⚠️ Rate-limited - "Daily complaint limit reached" |

#### D. Room Allocation (Student Actions)

**Full Capabilities (during active cycle):**
- View current allocation cycle status
- Submit hostel preference (Yes/No) before deadline
- View own merit rank and eligibility
- Select room from available rooms (during selection window)
- Decline allocated slot (removes from merit list; next student gets chance)
- View selected/allocated room details
- View roommates

**Edge Cases:**

| Scenario | System Behavior |
|----------|----------------|
| Student submits preference after deadline | ❌ Blocked - "Preference submission closed" |
| Student views merit list before it's published | ❌ Blocked - merit list hidden until ROOM_SELECTION phase |
| Student tries to select room when their turn hasn't come | ❌ Blocked - selection window not open for them yet |
| Student's selection window expires (didn't act in time) | System auto-advances to next eligible student; warden + student notified |
| Student selects room then immediately tries to re-select | ❌ Blocked - "You have already selected a room" |
| Student declines → is below the seat cutoff | Student confirmed as not getting hostel; notified |
| Student declines → next ranked student gets the chance | Cron job triggers next student's selection window |
| Student's SGPA data missing from admin upload | Merit entry marked PENDING; admin warned |

#### E. Student Profile

**Full Capabilities:**
- View own profile (personal info, photo, room, PRN, branch, year)
- Edit own contact number, emergency contacts
- Change password
- Download hostel ID card (PDF with QR code)
- View notification history

---

### 6.5 Website Administrator Module

A new, specialized role for monitoring the HostelHub platform's technical health, usage analytics, and quality assurance. This role cannot access hostel data (leave, rooms, students) - it is purely a technical oversight role.

#### A. Website Analytics Dashboard

**Metrics tracked:**
- Daily / Weekly / Monthly active users
- Page view counts per route
- Average session duration
- Bounce rate per page
- Most-used features (which API endpoints are called most)
- Device breakdown (mobile vs desktop)
- Browser breakdown
- Geographic distribution (city-level)
- Referral sources (how users arrived)
- User retention rate

#### B. Performance Monitoring

**Metrics tracked:**
- API endpoint response times (P50, P95, P99)
- Slow query log (queries > 500ms)
- Redis cache hit rate
- Database connection pool utilization
- Memory and CPU usage trends
- Error rate per endpoint
- 4xx and 5xx rate trends
- Uptime percentage (last 30/60/90 days)

**Views:**
- Real-time performance graph (last 30 minutes)
- Historical trends (daily/weekly/monthly)
- Alerts panel (threshold breaches)

#### C. QA Testing Console

The WebAdmin can run automated test suites directly from the dashboard.

**Test categories available:**

| Test Suite | What it tests |
|------------|--------------|
| Auth Flow Test | Login → Refresh → Logout cycle |
| Student Journey Test | Login → Submit leave → Check notification |
| Warden Journey Test | Login → Approve leave → Update complaint |
| Admin Journey Test | Login → Create user → Assign room |
| QR Flow Test | Generate QR → Simulate scan → Verify IN entry |
| Allocation Cycle Test | Create cycle → Upload SGPA → Generate merit list |
| API Contract Test | All endpoints return correct response schema |
| Rate Limit Test | Verify rate limiting is active |
| Security Header Test | Verify Helmet headers present |
| Broken Link Scanner | Scan all frontend routes for dead links |

**Test results:**
- Pass/Fail with duration
- Error details on failure
- Historical test run log
- Export test report (PDF)

#### D. SEO Health Dashboard

- Current meta tags for each page
- Missing alt tags
- Page title lengths
- Canonical URL check
- Sitemap validity
- robots.txt status
- Lighthouse score runner (Performance, Accessibility, SEO, Best Practices)
- Open Graph tag checker

---

### 6.6 QR-Based IN Movement Verification

This is a critical security feature. When a student returns to the hostel, they must scan a QR code generated by the warden's device to confirm physical presence. This prevents students from logging IN from outside the hostel.

#### Flow

```
WARDEN ACTION:
1. Warden opens "Gate QR" page on their device
2. System generates a time-limited QR code (valid 30 minutes)
3. QR encodes a signed JWT: { sessionId, wardenId, issuedAt, expiresAt }
4. QR displayed on warden's screen / printed at gate
5. Warden can refresh QR anytime (previous QR immediately invalidated)

STUDENT ACTION:
1. Student returns to hostel gate
2. Opens HostelHub on phone → "Log IN" → "Scan QR"
3. Camera scans QR code
4. Frontend sends: { qrToken, studentId, accessToken }
5. Backend validates:
   - QR token signature (tamper-proof)
   - QR not expired (check Redis TTL)
   - QR not already used by this student (prevent double scan)
   - Student has an open OUT entry (must have logged OUT first)
6. If valid: creates IN movement entry, clears open OUT
7. If invalid: returns specific error (expired / already used / no open OUT)
```

#### QR Token Design

```typescript
// QR Token Payload (signed by WARDEN_QR_SECRET)
interface QRPayload {
  sessionId: string;     // UUID - unique per QR generation
  wardenId: string;      // Who generated it
  hostelId: string;      // Which hostel (for future multi-hostel)
  issuedAt: number;      // Unix timestamp
  expiresAt: number;     // Unix timestamp (issuedAt + 30min)
}
```

#### Redis Keys for QR

```
qr:session:{sessionId}     → "valid" (TTL: 30min)
qr:used:{sessionId}:{studentId} → "1" (TTL: 30min) - prevents double scan
```

#### Edge Cases

| Scenario | Handling |
|----------|---------|
| Warden refreshes QR mid-session | Old sessionId invalidated in Redis immediately |
| Student scans valid QR but has no open OUT entry | ❌ "No open OUT movement found. Log OUT first." |
| Student uses screenshot of old QR | ❌ Redis TTL expired - "QR expired" |
| Student attempts to reuse same QR after successful scan | ❌ Redis key `qr:used:{sessionId}:{studentId}` present - rejected |
| Warden's device has no internet | Graceful error - warden shown offline message; student cannot check in digitally (escalate to manual via admin later) |
| Multiple students scan same QR simultaneously | Each scan is student-specific; all valid if QR not expired |
| QR scanned by someone not a student in the system | Auth check fails - must be logged in as valid STUDENT |

---

### 6.7 Room Allocation System - Complete State Machine

```
State Diagram:

 [DRAFT] ──────────────────────────────────────────────► CANCELLED (admin cancels)
    │
    ▼ Admin publishes cycle
 [PREFERENCE_COLLECTION]
    │  Students submit: "I want hostel / I don't want hostel"
    │  Deadline enforced by cron job
    │
    ▼ Admin advances (or auto-advance on deadline)
 [MERIT_GENERATION]
    │  Admin uploads SGPA CSV
    │  System generates ranked merit list
    │  Only students who said YES to hostel, sorted by SGPA desc
    │  Total eligible = min(want_hostel_count, available_seats)
    │  Students below seat count → WAITLISTED
    │
    ▼ Admin publishes merit list
 [ROOM_SELECTION]
    │  Students receive notification of their rank + eligibility
    │  In rank order, each student gets selection window (48 hours)
    │  Student can:
    │    - Select available room → status: SELECTED
    │    - Decline → status: DECLINED, next student gets window
    │    - Expire (no action) → status: EXPIRED, next student gets window
    │  WAITLISTED students move up if ELIGIBLE slots open from declines
    │
    ▼ All eligible students processed
 [FIRST_YEAR_ALLOCATION]
    │  Admin allocates 1st year students to reserved rooms
    │  Can be by SGPA (if available) or manual admin assignment
    │
    ▼ Admin closes cycle
 [CLOSED]
    All allocations finalized, notifications sent, allocation records created
```

---

### 6.8 Movement Log System

#### Gate Pass Reference Format
```
GP-{YEAR}-{MMDD}-{5-digit-random}
Example: GP-2026-0512-48391
```

#### Movement Entry States

```
Student logs OUT → Entry created (status: OPEN, type: OUT)
    │
    ├─ Student scans QR → IN entry created, OPEN entry closed
    │
    └─ Cron job detects overdue → Entry flagged OVERDUE
          └─ Warden manually confirms return → Entry closed, OVERDUE noted
```

---

### 6.9 Leave Management System

#### Leave Reference Format
```
LV-{YEAR}-{STUDENT_PRN}-{3-digit-seq}
Example: LV-2026-123B1B220-001
```

#### Leave Status Timeline

```
PENDING ──► APPROVED ──► (student leaves / returns)
        └──► REJECTED
        └──► CANCELLED (by student, before departure date)

APPROVED ──► REVOKED (by warden/admin, with reason)
```

---

### 6.10 Complaint Management System

#### Complaint Status Timeline

```
OPEN ──► IN_PROGRESS ──► RESOLVED ──► CLOSED
                                │
                                └──► Student reopens (once, within 7d) ──► OPEN
```

#### SLA Policy (configurable by admin)

| Priority | Category | SLA Target |
|----------|----------|-----------|
| Critical | Security | 24 hours |
| High | Infrastructure (electrical, plumbing) | 48 hours |
| Medium | Cleanliness, Noise | 72 hours |
| Low | Other | 7 days |

Cron job escalates any complaint breaching SLA.

---

### 6.11 Analytics & Reporting - All Dashboards

#### Admin Analytics Dashboard

**Section 1: Overview KPIs (Real-time)**
- Total students currently in hostel
- Total students currently OUT
- Overdue movements (count, names)
- Pending leave requests
- Open complaints
- Rooms available / occupied / under maintenance
- Current month leave approval rate %

**Section 2: Occupancy Analytics**
- Occupancy rate trend (daily, weekly, monthly, yearly) - line chart
- Room occupancy heatmap by floor and block
- Rooms by status distribution - donut chart
- Average room occupancy per floor
- Peak vs off-peak occupancy periods

**Section 3: Movement Analytics**
- Daily OUT movement count (last 30 days) - bar chart
- Hourly distribution of OUT movements (peak exit times) - heatmap
- Average time outside hostel per student
- Overdue movement trend (last 90 days)
- Movements by day of week
- Students with most OUT movements (top 10)
- Students with most overdue incidents (top 10)

**Section 4: Leave Analytics**
- Leave requests per month - bar chart
- Leave by type distribution - pie chart
- Approval rate trend
- Average leave duration by type
- Top leave reasons (word cloud / bar chart)
- Students with most leave requests
- Leave during exam periods (if exam dates configured)
- Rejected leave trend

**Section 5: Complaint Analytics**
- Complaints by category - bar chart
- Complaints by status - donut chart
- Average resolution time (days) by category
- SLA breach rate - trend line
- Complaint volume by month
- Most common complaint categories
- Students who submitted most complaints
- Escalated complaint trend

**Section 6: Allocation Analytics**
- Merit list statistics per cycle (total eligible, selected, declined, waitlisted)
- SGPA distribution histogram
- Room fill rate per cycle
- Year-wise occupancy breakdown
- Branch-wise occupancy breakdown
- Acceptance rate per cycle

**Section 7: User Activity Analytics**
- Daily active users (students / wardens)
- Login frequency per user
- Feature usage breakdown (which modules used most)

**Section 8: Export Center**
- Export any dataset as CSV or PDF
- Schedule recurring reports (weekly/monthly email to admin)
- Download full audit log (date range)

---

#### Warden Analytics Dashboard

**Section 1: Live Operations**
- Students currently OUT (real-time list)
- Overdue students
- Pending leave queue (count + list)
- Open complaints (count + SLA status)

**Section 2: Movement**
- Daily movement count (last 14 days)
- Overdue incidents (last 30 days)
- Currently absent by year (1st/2nd/3rd/4th)

**Section 3: Leave**
- Pending leaves with age (days since submitted)
- Approved leaves this month
- Rejection rate this month
- Upcoming departures (next 7 days)

**Section 4: Complaints**
- Open complaints by category
- Complaints awaiting warden action (SLA urgency)
- Resolution time this month vs last month

---

#### Website Admin Analytics Dashboard

**Section 1: Traffic**
- DAU / WAU / MAU
- Page views by route
- New vs returning users
- Session duration distribution

**Section 2: Performance**
- API response time distribution (P50/P95/P99)
- Slowest endpoints
- Error rate by endpoint
- Database query performance

**Section 3: System Health**
- Server uptime
- Redis hit rate
- Memory / CPU trend
- Active DB connections

**Section 4: QA**
- Last test run results
- Test pass rate trend
- Broken links list

---

### 6.12 Notification & Cron Job System

#### Notification Channels
1. **In-app** - notification bell in header (real-time via polling or SSE)
2. **Email** - via Nodemailer + Brevo SMTP
3. **Future:** Push notifications (PWA) - stubbed for later

#### Notification Types

| Event | Recipients | Channel |
|-------|-----------|---------|
| Leave approved | Student | In-app + Email |
| Leave rejected | Student | In-app + Email |
| Leave revoked | Student | In-app + Email |
| Complaint status updated | Student | In-app |
| Room selected successfully | Student | In-app + Email |
| Merit list published | All eligible students | In-app + Email |
| Allocation cycle opened | All students | In-app + Email |
| Selection window opens (student's turn) | Specific student | In-app + Email |
| Selection window expiring in 6h | Specific student | In-app + Email |
| Student overdue | Warden | In-app + Email |
| Complaint SLA breached | Warden + Admin | In-app |
| Broadcast notice | Target group | In-app + Email |
| Password reset | User | Email only |
| Account created | New user | Email only |
| Account deactivated | User | Email only |

---

#### Cron Job System (BullMQ + Redis)

BullMQ runs on top of Redis and handles all background jobs with retry logic, delays, and scheduling.

**8 Scheduled Cron Jobs:**

---

**Job 1: Overdue Movement Scanner**
```
Schedule: Every 30 minutes
Purpose: Detect students who logged OUT but haven't returned past expected time
Logic:
  1. Find all movement logs with type=OUT, no corresponding IN, past expected_return
  2. Set is_overdue=true on each
  3. Create notification for all wardens: "X students overdue"
  4. Skip if already flagged
Retry: 3 attempts, 1min delay
```

**Job 2: Leave Return Scanner**
```
Schedule: Every day at 8:00 AM
Purpose: Check if students with approved leave have returned (leave end date passed)
Logic:
  1. Find approved leaves where to_date < today and no IN movement after leave end
  2. Notify warden: "Student X's leave ended yesterday - no return logged"
  3. Create flag on leave record
Retry: 2 attempts
```

**Job 3: Selection Window Expiry Handler**
```
Schedule: Every 15 minutes (during active ROOM_SELECTION cycle only)
Purpose: Process expired selection windows, advance to next student
Logic:
  1. Find merit entries where selection_expires_at < now and status=PENDING
  2. Set status=EXPIRED
  3. Notify student: "Your selection window expired"
  4. Find next eligible student, open their window
  5. Notify next student
Retry: 5 attempts (critical job)
```

**Job 4: Selection Window Reminder**
```
Schedule: Every 1 hour (during active ROOM_SELECTION cycle only)
Purpose: Remind students their selection window closes in 6 hours
Logic:
  1. Find merit entries where selection_expires_at is 6 hours away and status=PENDING
  2. Send in-app + email reminder
Retry: 2 attempts
```

**Job 5: SLA Complaint Escalator**
```
Schedule: Every day at 9:00 AM
Purpose: Escalate complaints that have breached SLA
Logic:
  1. Find open complaints older than SLA threshold (by category)
  2. Set is_escalated=true
  3. Notify all wardens and admin
  4. Creates audit log entry for escalation
Retry: 3 attempts
```

**Job 6: Preference Deadline Handler**
```
Schedule: Every 30 minutes (during PREFERENCE_COLLECTION phase)
Purpose: Enforce preference submission deadline
Logic:
  1. Check if current time > preference_deadline for active cycle
  2. If yes, advance cycle to MERIT_GENERATION
  3. Set all unresponded students' preference to NULL (treated as "no response")
  4. Notify admin
Retry: 5 attempts
```

**Job 7: Weekly Analytics Report Generator**
```
Schedule: Every Monday at 7:00 AM
Purpose: Generate and email weekly summary to admin and wardens
Logic:
  1. Compute last week's: leave count, movement count, complaint count, overdue count
  2. Generate PDF report (using Puppeteer headless)
  3. Email to admin + wardens
  4. Store report in audit system
Retry: 2 attempts
```

**Job 8: Account Cleanup**
```
Schedule: Every day at 2:00 AM
Purpose: Clean up expired tokens and soft-deleted records
Logic:
  1. Delete refresh_tokens where expires_at < now
  2. Delete QR session tokens from Redis (already handled by TTL but cleanup for DB)
  3. Permanently delete soft-deleted users older than 30 days (with admin confirmation flag)
  4. Clean notification records older than 90 days
Retry: 2 attempts
```

---

### 6.13 Audit Log System

Every state-changing action creates an audit log entry automatically via middleware.

**What is logged:**

| Action Category | Examples |
|----------------|---------|
| Auth events | Login, logout, logout-all, failed login, password reset |
| User management | Create user, edit user, deactivate, role change |
| Room management | Create room, edit room, maintenance flag |
| Allocation | Cycle created/advanced/closed, SGPA upload, merit override, room selected |
| Leave | Submitted, approved, rejected, revoked, cancelled |
| Movement | OUT logged, IN logged, manual confirmation, overdue flagged |
| Complaint | Submitted, status changed, resolved, escalated |
| System | Cron job triggered, cache flushed, settings changed |
| QR | QR generated, QR used, QR expired |

**Audit log entry structure:**
```typescript
{
  id: UUID,
  actor_id: UUID,           // who performed the action
  actor_role: RoleEnum,
  action: string,           // e.g. "LEAVE_APPROVED"
  entity_type: string,      // e.g. "LeaveRequest"
  entity_id: UUID,
  old_value: JSON | null,   // state before
  new_value: JSON | null,   // state after
  ip_address: string,
  user_agent: string,
  request_id: string,       // ties to Winston log
  created_at: DateTime
}
```

---

### 6.14 SEO & Public Pages

See Section 20 for full SEO strategy.

**Public pages (no login required):**
- `/` - Landing page
- `/about` - About HostelHub & PCCOE
- `/contact` - Contact hostel office
- `/privacy` - Privacy policy
- `/terms` - Terms of use

---

## 7. Database Schema Design (v2.1)

### 7.1 All Tables

```sql
-- ─────────────────────────────────────────
-- CORE AUTHENTICATION
-- ─────────────────────────────────────────

CREATE TABLE users (
  id              CHAR(36) PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('ADMIN','WARDEN','STUDENT','WEB_ADMIN') NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  failed_attempts TINYINT DEFAULT 0,
  locked_until    DATETIME NULL,
  last_login_at   DATETIME NULL,
  last_login_ip   VARCHAR(45),
  password_changed_at DATETIME,
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  deleted_at      DATETIME NULL,           -- soft delete
  INDEX idx_email (email),
  INDEX idx_role_active (role, is_active)
);

CREATE TABLE refresh_tokens (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,       -- bcrypt hashed token
  device_info VARCHAR(300),
  ip_address  VARCHAR(45),
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_expires (expires_at)
);

CREATE TABLE password_history (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  hash        VARCHAR(255) NOT NULL,       -- last 3 password hashes
  created_at  DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- STUDENT PROFILES
-- ─────────────────────────────────────────

CREATE TABLE students (
  id                  CHAR(36) PRIMARY KEY,
  user_id             CHAR(36) NOT NULL UNIQUE,
  prn                 VARCHAR(20) UNIQUE NOT NULL,
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  phone               VARCHAR(15),
  branch              VARCHAR(50) NOT NULL,
  year                TINYINT NOT NULL,    -- 1, 2, 3, 4
  admission_year      SMALLINT,
  photo_url           VARCHAR(500),
  emergency_name      VARCHAR(100),
  emergency_phone     VARCHAR(15),
  emergency_relation  VARCHAR(50),
  blood_group         VARCHAR(5),
  address             TEXT,
  created_at          DATETIME NOT NULL,
  updated_at          DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_prn (prn),
  INDEX idx_year_branch (year, branch)
);

-- ─────────────────────────────────────────
-- ROOMS
-- ─────────────────────────────────────────

CREATE TABLE rooms (
  id          CHAR(36) PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  floor       TINYINT NOT NULL,
  block       VARCHAR(10),
  capacity    TINYINT NOT NULL DEFAULT 3,
  status      ENUM('AVAILABLE','FULL','MAINTENANCE','ARCHIVED') DEFAULT 'AVAILABLE',
  is_reserved BOOLEAN DEFAULT FALSE,       -- reserved for 1st year
  notes       TEXT,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  INDEX idx_status (status),
  INDEX idx_floor_block (floor, block)
);

-- ─────────────────────────────────────────
-- ACADEMIC YEARS & ALLOCATION CYCLES
-- ─────────────────────────────────────────

CREATE TABLE academic_years (
  id         CHAR(36) PRIMARY KEY,
  label      VARCHAR(20) NOT NULL UNIQUE,  -- "2025-2026"
  is_active  BOOLEAN DEFAULT FALSE,
  starts_at  DATE NOT NULL,
  ends_at    DATE NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_active (is_active)
);

CREATE TABLE allocation_cycles (
  id                    CHAR(36) PRIMARY KEY,
  academic_year_id      CHAR(36) NOT NULL,
  status                ENUM(
    'DRAFT','PREFERENCE_COLLECTION','MERIT_GENERATION',
    'ROOM_SELECTION','FIRST_YEAR_ALLOCATION','CLOSED','CANCELLED'
  ) DEFAULT 'DRAFT',
  preference_deadline   DATETIME,
  selection_deadline    DATETIME,
  sgpa_cutoff           DECIMAL(4,2),
  reserved_seats_fy     TINYINT DEFAULT 20,
  total_available_seats SMALLINT,
  cancellation_reason   TEXT,
  created_by            CHAR(36),
  created_at            DATETIME NOT NULL,
  updated_at            DATETIME NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE merit_entries (
  id                    CHAR(36) PRIMARY KEY,
  cycle_id              CHAR(36) NOT NULL,
  student_id            CHAR(36) NOT NULL,
  sgpa                  DECIMAL(4,2) NOT NULL,
  rank                  INT NOT NULL,
  original_rank         INT,               -- preserved when admin overrides
  wants_hostel          BOOLEAN NULL,      -- NULL = not responded
  is_eligible           BOOLEAN DEFAULT TRUE,
  selection_token       CHAR(64),
  selection_window_start DATETIME,
  selection_expires_at  DATETIME,
  room_selected_id      CHAR(36) NULL,
  status                ENUM('PENDING','SELECTED','DECLINED','WAITLISTED','EXPIRED') DEFAULT 'PENDING',
  admin_note            TEXT,
  created_at            DATETIME NOT NULL,
  updated_at            DATETIME NOT NULL,
  FOREIGN KEY (cycle_id) REFERENCES allocation_cycles(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY uk_cycle_student (cycle_id, student_id),
  INDEX idx_cycle_rank (cycle_id, rank),
  INDEX idx_status (status)
);

CREATE TABLE allocations (
  id               CHAR(36) PRIMARY KEY,
  student_id       CHAR(36) NOT NULL,
  room_id          CHAR(36) NOT NULL,
  academic_year_id CHAR(36) NOT NULL,
  cycle_id         CHAR(36),
  allocation_type  ENUM('MERIT','MANUAL_OVERRIDE','FIRST_YEAR','ADMIN') DEFAULT 'MERIT',
  allocated_by     CHAR(36),
  allocated_at     DATETIME NOT NULL,
  vacated_at       DATETIME NULL,
  vacate_reason    TEXT,
  created_at       DATETIME NOT NULL,
  updated_at       DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  INDEX idx_student_year (student_id, academic_year_id),
  INDEX idx_room_active (room_id, vacated_at)
);

-- ─────────────────────────────────────────
-- MOVEMENT LOGS
-- ─────────────────────────────────────────

CREATE TABLE movement_logs (
  id                   CHAR(36) PRIMARY KEY,
  student_id           CHAR(36) NOT NULL,
  type                 ENUM('OUT','IN') NOT NULL,
  destination          VARCHAR(200),
  reason               VARCHAR(500),
  expected_return      DATETIME,
  actual_return        DATETIME,
  gate_pass_ref        VARCHAR(25) NOT NULL UNIQUE,
  is_overdue           BOOLEAN DEFAULT FALSE,
  overdue_flagged_at   DATETIME,
  qr_session_id        CHAR(36),           -- which QR session was used for IN
  manually_confirmed   BOOLEAN DEFAULT FALSE, -- warden confirmed offline
  confirmed_by         CHAR(36),           -- warden user_id if manual
  created_at           DATETIME NOT NULL,
  updated_at           DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_student_date (student_id, created_at),
  INDEX idx_overdue (is_overdue),
  INDEX idx_open_out (student_id, type, actual_return)  -- for "is currently out" queries
);

-- ─────────────────────────────────────────
-- QR SESSIONS (DB record; Redis is primary store)
-- ─────────────────────────────────────────

CREATE TABLE qr_sessions (
  id           CHAR(36) PRIMARY KEY,
  warden_id    CHAR(36) NOT NULL,
  session_token CHAR(64) NOT NULL UNIQUE,
  expires_at   DATETIME NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   DATETIME NOT NULL,
  FOREIGN KEY (warden_id) REFERENCES users(id),
  INDEX idx_token (session_token),
  INDEX idx_active (is_active, expires_at)
);

-- ─────────────────────────────────────────
-- LEAVE REQUESTS
-- ─────────────────────────────────────────

CREATE TABLE leave_requests (
  id                CHAR(36) PRIMARY KEY,
  student_id        CHAR(36) NOT NULL,
  type              ENUM('HOME','MEDICAL','EMERGENCY','EVENT') NOT NULL,
  from_date         DATE NOT NULL,
  to_date           DATE NOT NULL,
  reason            TEXT NOT NULL,
  emergency_contact VARCHAR(15),
  status            ENUM('PENDING','APPROVED','REJECTED','CANCELLED','REVOKED') DEFAULT 'PENDING',
  reviewed_by       CHAR(36),
  reviewed_at       DATETIME,
  review_note       TEXT,
  revoked_by        CHAR(36),
  revoked_at        DATETIME,
  revoke_reason     TEXT,
  leave_ref         VARCHAR(30) UNIQUE,
  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_student_status (student_id, status),
  INDEX idx_status_date (status, created_at),
  INDEX idx_dates (from_date, to_date)
);

-- ─────────────────────────────────────────
-- COMPLAINTS
-- ─────────────────────────────────────────

CREATE TABLE complaints (
  id              CHAR(36) PRIMARY KEY,
  student_id      CHAR(36) NOT NULL,
  category        ENUM('INFRASTRUCTURE','CLEANLINESS','SECURITY','MESS','NOISE','OTHER') NOT NULL,
  priority        ENUM('CRITICAL','HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
  title           VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  photo_url       VARCHAR(500),
  status          ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'OPEN',
  resolved_by     CHAR(36),
  resolved_at     DATETIME,
  resolution_note TEXT,
  internal_note   TEXT,                  -- warden-only
  is_escalated    BOOLEAN DEFAULT FALSE,
  escalated_at    DATETIME,
  reopen_count    TINYINT DEFAULT 0,
  last_reopened_at DATETIME,
  sla_breach_at   DATETIME,             -- computed on creation
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_status_created (status, created_at),
  INDEX idx_category (category),
  INDEX idx_escalated (is_escalated)
);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────

CREATE TABLE notifications (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  type        VARCHAR(60) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  entity_type VARCHAR(50),
  entity_id   CHAR(36),
  email_sent  BOOLEAN DEFAULT FALSE,
  created_at  DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
);

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────

CREATE TABLE audit_logs (
  id          CHAR(36) PRIMARY KEY,
  actor_id    CHAR(36),
  actor_role  VARCHAR(20),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   CHAR(36),
  old_value   JSON,
  new_value   JSON,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  request_id  VARCHAR(36),
  created_at  DATETIME NOT NULL,
  INDEX idx_actor (actor_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;  -- audit logs can be large

-- ─────────────────────────────────────────
-- SYSTEM SETTINGS
-- ─────────────────────────────────────────

CREATE TABLE settings (
  id          CHAR(36) PRIMARY KEY,
  key_name    VARCHAR(100) UNIQUE NOT NULL,
  value       TEXT NOT NULL,
  description TEXT,
  updated_by  CHAR(36),
  updated_at  DATETIME NOT NULL,
  INDEX idx_key (key_name)
);
-- Default settings seeded:
-- leave.max_home_days, leave.max_medical_days, leave.max_event_days
-- allocation.default_capacity, allocation.default_sgpa_cutoff
-- hostel.name, hostel.address, hostel.warden_contact
```

---

## 8. Redis Caching Architecture

Redis serves four distinct purposes in v2.1. Use **Upstash Redis** (serverless, free tier 10k commands/day - sufficient for this scale) or **Railway Redis**.

### 8.1 Cache Namespacing

```
auth:refresh:{userId}:{tokenId}     → hashed token (TTL: 7d)
auth:failedAttempts:{email}         → count (TTL: 15min)
auth:locked:{email}                 → "1" (TTL: 15min)
auth:otp:{userId}                   → OTP hash (TTL: 15min)

qr:session:{sessionId}              → wardenId (TTL: 30min)
qr:used:{sessionId}:{studentId}     → "1" (TTL: 30min)

cache:rooms:all                     → JSON (TTL: 5min)
cache:rooms:{roomId}                → JSON (TTL: 5min)
cache:students:all:{page}:{filters} → JSON (TTL: 2min)
cache:merit:{cycleId}               → JSON (TTL: 1min during selection)
cache:analytics:overview            → JSON (TTL: 5min)
cache:analytics:occupancy           → JSON (TTL: 10min)

ratelimit:{ip}                      → request count (TTL: 15min)
ratelimit:user:{userId}             → request count (TTL: 15min)

jobs:cron:lastRun:{jobName}         → ISO timestamp
```

### 8.2 Cache Strategy per Resource

| Resource | Strategy | TTL | Invalidation |
|----------|----------|-----|-------------|
| Room list | Read-through | 5 min | On any room mutation |
| Student list | Read-through | 2 min | On student create/update |
| Merit list | Read-through | 1 min | On SGPA upload / rank override |
| Analytics overview | Cache-aside | 5 min | Scheduled refresh every 5 min |
| Auth tokens | Write-through | 7 days | On logout / rotation |
| QR sessions | Write-through | 30 min | On refresh or expiry |
| Rate limits | Sliding window | 15 min | Natural expiry |

### 8.3 Cache Invalidation Rules

```typescript
// Example: When admin edits a room
await roomRepository.update(roomId, data);          // DB update
await redis.del(`cache:rooms:${roomId}`);           // Invalidate specific
await redis.del('cache:rooms:all');                  // Invalidate list
await redis.del('cache:analytics:occupancy');        // Invalidate analytics
```

### 8.4 BullMQ Queue Names

```
queue:email           → email sending jobs
queue:notification    → in-app notification creation
queue:overdue-scan    → movement overdue detection
queue:sla-check       → complaint SLA escalation  
queue:selection-expiry → merit selection window expiry
queue:report          → weekly/monthly report generation
queue:cleanup         → nightly cleanup job
```

---

## 9. Cron Job System

See Section 6.12 for full job specifications. Implementation notes:

```typescript
// src/jobs/scheduler.ts
import { Queue, Worker, QueueScheduler } from 'bullmq';
import { redis } from '../config/redis';

// All queues share one Redis connection
const connection = { host: process.env.REDIS_HOST, port: 6379 };

// Repeatable jobs (cron syntax)
await overdueQueue.add('scan', {}, {
  repeat: { pattern: '*/30 * * * *' },   // every 30 min
  jobId: 'overdue-scan-recurring',
});

await cleanupQueue.add('nightly', {}, {
  repeat: { pattern: '0 2 * * *' },       // 2 AM daily
  jobId: 'nightly-cleanup-recurring',
});

await reportQueue.add('weekly', {}, {
  repeat: { pattern: '0 7 * * 1' },       // Monday 7 AM
  jobId: 'weekly-report-recurring',
});
```

Job monitoring dashboard available to Admin via `/admin/settings/jobs`.

---

## 10. API Design

### 10.1 Base URLs

```
Production:  https://api.hostelhub.pccoe.ac.in/api/v1
Development: http://localhost:5000/api/v1
```

### 10.2 Standard Response Envelope

```typescript
// Success
{
  "success": true,
  "message": "Leave approved successfully",
  "data": { ... },
  "meta": {
    "page": 1, "limit": 20, "total": 87, "totalPages": 5
  },
  "timestamp": "2026-05-12T10:30:00.000Z",
  "requestId": "req_01J2KX7M3Z4N"
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "fromDate", "message": "Date cannot be in the past" }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-05-12T10:30:00.000Z",
  "requestId": "req_01J2KX7M3Z4N"
}
```

### 10.3 Complete API Routes

```
AUTH
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/logout-all
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/sessions
DELETE /auth/sessions/:sessionId

USERS
GET    /users                      ADMIN, WARDEN
POST   /users                      ADMIN
POST   /users/bulk-import          ADMIN (multipart CSV)
GET    /users/:id                  ADMIN, WARDEN
PATCH  /users/:id                  ADMIN
DELETE /users/:id                  ADMIN (soft)
PATCH  /users/:id/deactivate       ADMIN
PATCH  /users/:id/reactivate       ADMIN
POST   /users/:id/force-logout     ADMIN
GET    /users/:id/login-history    ADMIN

STUDENTS
GET    /students                   ADMIN, WARDEN
GET    /students/:id               ADMIN, WARDEN
GET    /students/:id/profile       ADMIN, WARDEN (full history)
PATCH  /students/:id               ADMIN, WARDEN
GET    /students/me                STUDENT (own profile)
PATCH  /students/me                STUDENT (own editable fields)
GET    /students/:id/download-id   ADMIN, WARDEN, STUDENT(own) (PDF)

ROOMS
GET    /rooms                      ADMIN, WARDEN
POST   /rooms                      ADMIN
GET    /rooms/:id                  ADMIN, WARDEN
PATCH  /rooms/:id                  ADMIN
PATCH  /rooms/:id/maintenance      ADMIN, WARDEN
PATCH  /rooms/:id/restore          ADMIN
DELETE /rooms/:id                  ADMIN (archive)
GET    /rooms/:id/occupants        ADMIN, WARDEN

ACADEMIC YEARS
GET    /academic-years             ADMIN, WARDEN
POST   /academic-years             ADMIN
PATCH  /academic-years/:id/activate ADMIN

ALLOCATION CYCLES
GET    /cycles                     ADMIN, WARDEN
POST   /cycles                     ADMIN
GET    /cycles/:id                 ADMIN, WARDEN, STUDENT
PATCH  /cycles/:id                 ADMIN (config update)
POST   /cycles/:id/advance         ADMIN
POST   /cycles/:id/rewind          ADMIN
POST   /cycles/:id/cancel          ADMIN
POST   /cycles/:id/upload-sgpa     ADMIN (CSV)
POST   /cycles/:id/generate-merit  ADMIN
GET    /cycles/:id/merit-list      ADMIN, WARDEN, STUDENT(limited)
PATCH  /cycles/:id/merit/:entryId/override ADMIN
POST   /cycles/:id/preference      STUDENT (yes/no)
POST   /cycles/:id/select-room     STUDENT
POST   /cycles/:id/decline         STUDENT

ALLOCATIONS
GET    /allocations                ADMIN, WARDEN
POST   /allocations                ADMIN (manual)
DELETE /allocations/:id            ADMIN (remove)
POST   /allocations/swap           ADMIN (swap two students)

MOVEMENT LOGS
GET    /movements                  ADMIN, WARDEN
POST   /movements/out              STUDENT
POST   /movements/in               STUDENT (+ QR token)
GET    /movements/my               STUDENT
GET    /movements/overdue          ADMIN, WARDEN
POST   /movements/:id/manual-confirm WARDEN, ADMIN
PATCH  /movements/:id              ADMIN (edit/correct)
DELETE /movements/:id              ADMIN
GET    /movements/export           ADMIN, WARDEN

QR SESSIONS
POST   /qr/generate                WARDEN
POST   /qr/refresh                 WARDEN
POST   /qr/invalidate              WARDEN
GET    /qr/current                 WARDEN

LEAVE REQUESTS
GET    /leaves                     ADMIN, WARDEN
POST   /leaves                     STUDENT
GET    /leaves/:id                 ADMIN, WARDEN, STUDENT(own)
PATCH  /leaves/:id/approve         ADMIN, WARDEN
PATCH  /leaves/:id/reject          ADMIN, WARDEN
PATCH  /leaves/:id/revoke          ADMIN, WARDEN
PATCH  /leaves/:id/cancel          STUDENT (own, pending only)
GET    /leaves/my                  STUDENT
GET    /leaves/calendar            ADMIN, WARDEN
GET    /leaves/export              ADMIN, WARDEN

COMPLAINTS
GET    /complaints                 ADMIN, WARDEN
POST   /complaints                 STUDENT (multipart for photo)
GET    /complaints/:id             ADMIN, WARDEN, STUDENT(own)
PATCH  /complaints/:id/status      ADMIN, WARDEN
PATCH  /complaints/:id/resolve     ADMIN, WARDEN
PATCH  /complaints/:id/reopen      STUDENT (own, within 7d)
DELETE /complaints/:id             ADMIN
GET    /complaints/my              STUDENT
GET    /complaints/export          ADMIN, WARDEN

NOTIFICATIONS
GET    /notifications              ALL
PATCH  /notifications/:id/read     ALL
PATCH  /notifications/read-all     ALL
POST   /notifications/broadcast    ADMIN, WARDEN
DELETE /notifications/:id          ALL (own)

ANALYTICS
GET    /analytics/overview         ADMIN, WARDEN
GET    /analytics/occupancy        ADMIN, WARDEN
GET    /analytics/movements        ADMIN, WARDEN
GET    /analytics/leaves           ADMIN, WARDEN
GET    /analytics/complaints       ADMIN, WARDEN
GET    /analytics/allocation       ADMIN, WARDEN
GET    /analytics/users            ADMIN
GET    /analytics/website          ADMIN, WEB_ADMIN
GET    /analytics/performance      ADMIN, WEB_ADMIN
GET    /analytics/export           ADMIN, WARDEN

AUDIT LOGS
GET    /audit-logs                 ADMIN
GET    /audit-logs/export          ADMIN

SETTINGS
GET    /settings                   ADMIN
PATCH  /settings/:key              ADMIN
GET    /settings/jobs              ADMIN
POST   /settings/jobs/:name/trigger ADMIN
PATCH  /settings/jobs/:name/pause  ADMIN
PATCH  /settings/jobs/:name/resume ADMIN
GET    /settings/cache             ADMIN
DELETE /settings/cache/:pattern    ADMIN

WEB ADMIN
GET    /webadmin/analytics         WEB_ADMIN, ADMIN
GET    /webadmin/performance       WEB_ADMIN, ADMIN
GET    /webadmin/health            WEB_ADMIN, ADMIN
POST   /webadmin/tests/run         WEB_ADMIN
GET    /webadmin/tests/results     WEB_ADMIN
GET    /webadmin/seo               WEB_ADMIN
GET    /webadmin/links/check       WEB_ADMIN

HEALTH
GET    /health
GET    /health/db
GET    /health/redis
GET    /health/queue
```

---

## 11. Frontend Architecture & Pages

### 11.1 All Pages

#### Public Pages (unauthenticated)
```
/                    Landing page (SEO-optimized, PCCOE branding)
/about               About HostelHub
/contact             Contact the hostel office
/privacy             Privacy policy
/terms               Terms of use
/login               Login page
/forgot-password     Forgot password
/reset-password      Reset password (token from email)
```

#### Student Pages
```
/student/dashboard              Overview: room, current status, notifications
/student/profile                My profile (editable fields)
/student/movement/out           Log OUT movement
/student/movement/in            Scan QR to log IN
/student/movement/history       My movement history (paginated)
/student/leave/new              Apply for leave
/student/leave/history          My leave requests
/student/leave/:id              View leave details
/student/complaints/new         Submit complaint
/student/complaints/history     My complaints
/student/complaints/:id         View complaint + status
/student/allocation/status      My allocation status (active cycle)
/student/allocation/select      Room selection page (during window)
/student/notifications          All notifications
/student/settings               Password change, profile settings
```

#### Warden Pages
```
/warden/dashboard               Live overview: OUT students, pending actions
/warden/students                All students list (search, filter)
/warden/students/:id            Student profile + full history
/warden/students/create         Create student account
/warden/movement                All movement logs (live + history)
/warden/movement/overdue        Overdue students list
/warden/qr                      QR generation page (gate QR)
/warden/leave                   All leave requests
/warden/leave/calendar          Leave calendar view
/warden/leave/:id               Leave request detail + approve/reject
/warden/complaints              All complaints (SLA-ordered)
/warden/complaints/:id          Complaint detail + status management
/warden/analytics               Full analytics dashboard
/warden/notifications           Notifications
/warden/settings                Password change
```

#### Admin Pages
```
/admin/dashboard                Full overview + KPIs
/admin/users                    All users management
/admin/users/create             Create any user type
/admin/users/bulk-import        CSV bulk import
/admin/users/:id                User detail + edit
/admin/rooms                    Room list
/admin/rooms/map                Room grid/map view
/admin/rooms/create             Create room
/admin/rooms/:id                Room detail + occupants
/admin/academic-years           Academic year management
/admin/cycles                   Allocation cycles list
/admin/cycles/create            Create new cycle
/admin/cycles/:id               Cycle detail + controls
/admin/cycles/:id/merit-list    Merit list view + overrides
/admin/cycles/:id/upload-sgpa   SGPA data upload
/admin/allocations              All allocations (current + history)
/admin/movement                 All movement logs (admin view)
/admin/leave                    All leave requests (admin view)
/admin/complaints               All complaints (admin view)
/admin/analytics                Full analytics dashboard + export
/admin/audit-logs               Audit log viewer
/admin/notifications/broadcast  Send broadcast
/admin/settings                 System settings
/admin/settings/jobs            Cron job control panel
/admin/settings/cache           Redis cache management
/admin/notifications            Notifications
```

#### WebAdmin Pages
```
/webadmin/dashboard             Overview: uptime, perf, errors
/webadmin/analytics             Website analytics (traffic, users)
/webadmin/performance           API performance metrics
/webadmin/health                System health dashboard
/webadmin/tests                 QA test runner
/webadmin/tests/:runId          Test run results
/webadmin/seo                   SEO health dashboard
/webadmin/links                 Broken link scanner
/webadmin/notifications         Notifications
```

### 11.2 Key Frontend Components

```
components/
├── ui/                          shadcn/ui base components
├── common/
│   ├── DataTable.tsx            TanStack Table: sort, filter, paginate
│   ├── StatusBadge.tsx          Color-coded status pill
│   ├── ConfirmModal.tsx         Reusable confirmation dialog
│   ├── EmptyState.tsx           Empty list illustration + message
│   ├── ErrorBoundary.tsx        Catches component crashes
│   ├── LoadingSkeleton.tsx      Skeleton loaders (per content shape)
│   ├── PageHeader.tsx           Title + breadcrumb + action buttons
│   ├── NotificationBell.tsx     Badge + dropdown
│   ├── ThemeToggle.tsx          Dark/light toggle button
│   └── ExportButton.tsx         CSV/PDF export trigger
├── charts/
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   ├── DonutChart.tsx
│   ├── HeatmapGrid.tsx          Room occupancy heatmap
│   └── KPICard.tsx              Metric card with trend arrow
├── forms/
│   ├── LeaveForm.tsx
│   ├── ComplaintForm.tsx
│   ├── MovementOutForm.tsx
│   ├── QRScanner.tsx            Camera QR scan component
│   ├── CSVUpload.tsx            Drag-drop CSV import
│   └── RoomSelector.tsx        Visual room picker grid
└── layout/
    ├── Sidebar.tsx              Role-aware navigation
    ├── Header.tsx               Top bar with user + notifications
    ├── Breadcrumb.tsx
    └── PageLayout.tsx
```

---

## 12. Security Architecture

### 12.1 Backend Security Stack (Complete)

```typescript
// Security middleware applied in order
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    }
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
}));

app.use(cors({
  origin: [process.env.FRONTEND_URL],   // whitelist only
  credentials: true,                     // needed for cookie
  methods: ['GET','POST','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(hpp());                          // HTTP parameter pollution
app.use(compression());

// Rate limiting (Redis-backed)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  store: new RedisStore({ client: redis }),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: new RedisStore({ client: redis }),
});

app.use('/api/v1/', generalLimiter);
app.use('/api/v1/auth/login', authLimiter);
```

### 12.2 File Upload Security

```typescript
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },          // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG/PNG/WebP images allowed'));
    }
  },
});

// After upload: sanitize filename, scan via ClamAV if available
// Store to Cloudinary (not local filesystem)
```

### 12.3 SQL Injection Prevention

Sequelize ORM with parameterized queries everywhere. Raw SQL strictly forbidden. All dynamic filters go through Sequelize's where builder, never string interpolation.

### 12.4 Environment Validation (Startup)

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development','production','test']),
  PORT: z.string().regex(/^\d+$/),
  DB_HOST: z.string().min(1),
  DB_PASSWORD: z.string().min(8),
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  REDIS_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().min(1),
  // ... all required vars
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);  // fail fast - never start with missing config
}

export const env = parsed.data;
```

---

## 13. Design System & UI Guidelines

### 13.1 PCCOE Brand Identity

PCCOE's official color palette centers on **deep navy blue** and **white**, with gold as an accent. We stay true to this identity while adding professional depth for a web application context.

```css
/* ─────────────────────────────────────── */
/* PCCOE PRIMARY - Navy Blue              */
/* ─────────────────────────────────────── */
--color-primary-50:  #EFF6FF;
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-400: #3B82F6;
--color-primary-500: #1D4ED8;   /* Primary interactive */
--color-primary-600: #1A3FAA;   /* Hover state */
--color-primary-700: #1E3A8A;   /* PCCOE deep navy */
--color-primary-800: #1E3070;
--color-primary-900: #172554;   /* Darkest - headings */

/* ─────────────────────────────────────── */
/* PCCOE ACCENT - Gold                   */
/* ─────────────────────────────────────── */
--color-accent-300: #FCD34D;
--color-accent-400: #FBBF24;
--color-accent-500: #F59E0B;   /* Gold accent */
--color-accent-600: #D97706;   /* Hover gold */

/* ─────────────────────────────────────── */
/* SEMANTIC COLORS                        */
/* ─────────────────────────────────────── */
--color-success-50:  #F0FDF4;
--color-success-500: #22C55E;
--color-success-700: #15803D;

--color-warning-50:  #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-700: #B45309;

--color-error-50:    #FFF1F2;
--color-error-500:   #EF4444;
--color-error-700:   #B91C1C;

--color-info-50:     #EFF6FF;
--color-info-500:    #3B82F6;

/* ─────────────────────────────────────── */
/* NEUTRAL (backgrounds, text, borders)   */
/* ─────────────────────────────────────── */
--color-neutral-50:  #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;
```

### 13.2 Dark / Light Theme

Implemented via Tailwind CSS `class` strategy (not `media` strategy - gives user control).

```css
/* Light (default) */
--bg-primary: var(--color-neutral-50);
--bg-surface: #FFFFFF;
--bg-muted: var(--color-neutral-100);
--text-primary: var(--color-neutral-900);
--text-secondary: var(--color-neutral-500);
--border: var(--color-neutral-200);

/* Dark */
.dark {
  --bg-primary: var(--color-neutral-900);
  --bg-surface: var(--color-neutral-800);
  --bg-muted: var(--color-neutral-700);
  --text-primary: var(--color-neutral-50);
  --text-secondary: var(--color-neutral-400);
  --border: var(--color-neutral-700);
}
```

Theme toggle: stored in `localStorage` via Zustand `uiStore`. Applied at root `<html>` level. No flash of wrong theme (handled by inline script in `index.html` before React loads).

### 13.3 Typography

```css
/* Display headings - authority and professionalism */
--font-display: 'Plus Jakarta Sans', sans-serif;

/* Body text - clarity at all sizes */
--font-body: 'Inter', sans-serif;

/* Monospace - code, IDs, references */
--font-mono: 'JetBrains Mono', monospace;
```

**Type Scale:**
```
text-xs:   12px / 1.5  - Labels, captions
text-sm:   14px / 1.5  - Body small, table cells
text-base: 16px / 1.5  - Body default
text-lg:   18px / 1.4  - Section intros
text-xl:   20px / 1.3  - Card titles
text-2xl:  24px / 1.2  - Page section headers
text-3xl:  30px / 1.15 - Page titles
text-4xl:  36px / 1.1  - Landing page hero
text-5xl:  48px / 1.05 - Hero display
```

### 13.4 Animation Guidelines

**Principles:**
- Purposeful, not decorative - every animation communicates state or guides attention
- Fast and smooth - 150–300ms for UI feedback, 400–600ms for page transitions
- Never block interaction - animations are additive, not blocking
- Respect `prefers-reduced-motion` media query

**Animation System:**
```css
/* Micro-interactions */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* ease-in-out */
--duration-fast: 150ms;   /* Hover, active states */
--duration-base: 250ms;   /* Dropdown, toggle */
--duration-slow: 400ms;   /* Page content entry */
--duration-slower: 600ms; /* Complex transitions */

/* Entry animations (Framer Motion) */
fadeInUp:     { opacity: 0→1, y: 16→0,  duration: 0.4 }
fadeIn:       { opacity: 0→1,           duration: 0.3 }
slideInRight: { opacity: 0→1, x: 20→0, duration: 0.35 }
scaleIn:      { opacity: 0→1, scale: 0.95→1, duration: 0.25 }

/* Page transitions */
layoutTransition: { duration: 0.3, ease: "easeInOut" }
```

**Specific UI animations:**
- **Navigation sidebar:** slide-in on mobile, always-visible on desktop
- **Dashboard KPI cards:** staggered fade-in-up on load (150ms between cards)
- **Data table rows:** subtle fade-in on first load
- **Status badge changes:** brief scale pulse when status updates
- **Modal:** scale + fade in from center
- **Toast notifications:** slide in from top-right, auto-dismiss with progress bar
- **QR code:** subtle rotation animation while generating
- **Merit rank reveal:** count-up animation on number display
- **Loading skeleton:** shimmer effect with PCCOE blue tint

### 13.5 Component Specs

**Status Badges:**
```
PENDING     → Yellow bg, dark yellow text
APPROVED    → Green bg, dark green text
REJECTED    → Red bg, dark red text
OPEN        → Blue bg, dark blue text
IN_PROGRESS → Orange bg, dark orange text
RESOLVED    → Green bg, dark green text
CLOSED      → Gray bg, dark gray text
OVERDUE     → Red bg (pulse animation), white text
```

**Loading States:**
- Every data table has a skeleton loader matching column layout
- Every KPI card has a number skeleton
- Every form submission has a loading spinner on the submit button
- Never show blank white space while loading

**Empty States:**
- Custom illustration per context (no stock SVGs)
- Clear message: "No leave requests yet"
- Primary action when relevant: "Apply for Leave →"

### 13.6 PCCOE Logo Usage

- Use official PCCOE logo SVG in header sidebar and landing page
- White version on dark/navy backgrounds
- Full-color version on white backgrounds
- Never stretch or recolor the logo
- Minimum size: 32px height

### 13.7 Pages & Layout

**Sidebar layout (dashboards):**
- Left sidebar: 256px wide, fixed
- Header: 64px tall, sticky
- Content area: rest, scrollable
- Mobile: sidebar collapses to bottom tab bar (4 tabs max)

**Landing page sections:**
1. Hero - PCCOE-branded with campus image background, tagline, CTA
2. Problem Statement - what was the paper-based system costing
3. Features - 6 key features with icons
4. How It Works - 3-step visual flow
5. Roles - cards for Admin / Warden / Student
6. Testimonials (placeholder for future)
7. Footer - PCCOE contact, social links, copyright

---

## 14. Folder Structure

### 14.1 Backend
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # Sequelize + PlanetScale config
│   │   ├── redis.ts           # Upstash Redis client
│   │   ├── env.ts             # Zod env validation
│   │   ├── bullmq.ts          # Queue configuration
│   │   └── constants.ts
│   ├── controllers/           # Thin: parse → service → respond
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── student.controller.ts
│   │   ├── room.controller.ts
│   │   ├── cycle.controller.ts
│   │   ├── allocation.controller.ts
│   │   ├── movement.controller.ts
│   │   ├── qr.controller.ts
│   │   ├── leave.controller.ts
│   │   ├── complaint.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── audit.controller.ts
│   │   ├── settings.controller.ts
│   │   └── webadmin.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── student.service.ts
│   │   ├── room.service.ts
│   │   ├── cycle.service.ts       # Allocation cycle state machine
│   │   ├── merit.service.ts       # SGPA ranking + merit list logic
│   │   ├── allocation.service.ts
│   │   ├── movement.service.ts
│   │   ├── qr.service.ts          # QR generation + verification
│   │   ├── leave.service.ts
│   │   ├── complaint.service.ts
│   │   ├── analytics.service.ts
│   │   ├── notification.service.ts
│   │   ├── email.service.ts
│   │   ├── cache.service.ts       # Redis cache helpers
│   │   ├── report.service.ts      # PDF report generation
│   │   └── webadmin.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── student.repository.ts
│   │   ├── room.repository.ts
│   │   ├── cycle.repository.ts
│   │   ├── merit.repository.ts
│   │   ├── allocation.repository.ts
│   │   ├── movement.repository.ts
│   │   ├── qr.repository.ts
│   │   ├── leave.repository.ts
│   │   ├── complaint.repository.ts
│   │   ├── notification.repository.ts
│   │   └── audit.repository.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Student.ts
│   │   ├── Room.ts
│   │   ├── AcademicYear.ts
│   │   ├── AllocationCycle.ts
│   │   ├── MeritEntry.ts
│   │   ├── Allocation.ts
│   │   ├── MovementLog.ts
│   │   ├── QRSession.ts
│   │   ├── LeaveRequest.ts
│   │   ├── Complaint.ts
│   │   ├── RefreshToken.ts
│   │   ├── Notification.ts
│   │   ├── AuditLog.ts
│   │   ├── Settings.ts
│   │   ├── PasswordHistory.ts
│   │   └── index.ts               # All associations defined here
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── validate.ts
│   │   ├── requestLogger.ts
│   │   ├── errorHandler.ts
│   │   └── auditLogger.ts
│   ├── routes/
│   │   ├── index.ts
│   │   └── [all route files]
│   ├── validators/
│   │   └── [all Zod schemas]
│   ├── jobs/
│   │   ├── workers/
│   │   │   ├── overdueScanner.worker.ts
│   │   │   ├── leaveReturnScanner.worker.ts
│   │   │   ├── selectionExpiry.worker.ts
│   │   │   ├── selectionReminder.worker.ts
│   │   │   ├── slaEscalator.worker.ts
│   │   │   ├── preferenceDeadline.worker.ts
│   │   │   ├── weeklyReport.worker.ts
│   │   │   └── accountCleanup.worker.ts
│   │   └── scheduler.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   ├── hash.ts
│   │   ├── pagination.ts
│   │   ├── response.ts
│   │   ├── gatePassRef.ts
│   │   ├── leaveRef.ts
│   │   └── uuid.ts
│   ├── helpers/
│   │   ├── csvParser.ts
│   │   ├── emailTemplates.ts
│   │   ├── fileUpload.ts
│   │   └── pdfGenerator.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── api.types.ts
│   │   └── enums.ts
│   ├── constants/
│   │   └── index.ts
│   ├── migrations/
│   ├── seeders/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.ts
│   └── app.ts
├── .env.development
├── .env.production
├── .env.test
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### 14.2 Frontend
```
frontend/
├── src/
│   ├── api/                   # One file per resource
│   │   ├── client.ts          # Axios + interceptors
│   │   └── [resource].api.ts
│   ├── components/
│   │   ├── ui/                # shadcn/ui
│   │   ├── common/            # Shared components
│   │   ├── charts/            # recharts wrappers
│   │   ├── forms/             # Form components
│   │   └── layout/            # Layout components
│   ├── pages/
│   │   ├── public/            # Landing, About, Contact
│   │   ├── auth/              # Login, ForgotPassword
│   │   ├── admin/
│   │   ├── warden/
│   │   ├── student/
│   │   └── webadmin/
│   ├── layouts/
│   │   ├── PublicLayout.tsx   # Landing + static pages
│   │   ├── AuthLayout.tsx     # Login pages
│   │   ├── AdminLayout.tsx
│   │   ├── WardenLayout.tsx
│   │   ├── StudentLayout.tsx
│   │   └── WebAdminLayout.tsx
│   ├── hooks/                 # Custom hooks (per feature)
│   ├── store/
│   │   ├── authStore.ts       # Zustand
│   │   └── uiStore.ts         # Zustand
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── validators/            # Zod schemas (mirrored from backend)
│   ├── types/                 # TypeScript interfaces
│   ├── utils/                 # Helpers
│   ├── constants/
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── assets/
│   │   ├── pccoe-logo.svg
│   │   └── illustrations/
│   ├── styles/
│   │   └── globals.css
│   └── tests/
│       ├── components/
│       ├── hooks/
│       └── setup.ts
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── favicon.ico
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 15. Tech Stack & Library Decisions

### 15.1 Backend

| Library | Purpose | Justification |
|---------|---------|--------------|
| `express` 4.x | HTTP framework | Industry standard, stable |
| `sequelize` 6.x + `sequelize-cli` | ORM + migrations | TypeScript support, mature |
| `mysql2` | MySQL driver | Required by Sequelize for MySQL |
| `zod` 3.x | Validation (server) | TypeScript-first, composable |
| `jsonwebtoken` 9.x | JWT | Standard, well-maintained |
| `bcrypt` 5.x | Password hashing | Battle-tested, cost factor control |
| `helmet` 7.x | Security headers | Industry standard, 11 headers in one |
| `cors` 2.x | CORS | Simple, configurable |
| `express-rate-limit` 7.x | Rate limiting | |
| `rate-limit-redis` | Redis store for rate limiter | Shared across instances |
| `hpp` 0.2.x | HTTP param pollution | |
| `compression` 1.x | gzip | Reduce payload size |
| `winston` 3.x | Logging | Structured, multi-transport |
| `morgan` 1.x | HTTP access log | Dev-friendly |
| `ioredis` 5.x | Redis client | Best-in-class, supports Upstash |
| `bullmq` 5.x | Job queues | Redis-based, excellent for cron |
| `multer` 1.x | File upload | |
| `cloudinary` 2.x | Cloud image storage | |
| `nodemailer` 6.x | Email sending | |
| `node-cron` 3.x | Cron scheduling | Fallback for BullMQ scheduled jobs |
| `csv-parser` 3.x | CSV ingestion | |
| `puppeteer` 21.x | PDF generation | Headless Chrome for reports |
| `uuid` 9.x | UUID generation | |
| `jsonwebtoken` | QR token signing | Reuse existing JWT lib |

### 15.2 Frontend

| Library | Purpose | Justification |
|---------|---------|--------------|
| `react` 18.x + `react-dom` | UI | |
| `typescript` 5.x | Type safety | |
| `vite` 5.x | Build tool | Fast HMR, great DX |
| `react-router-dom` 6.x | Routing | |
| `@tanstack/react-query` 5.x | Server state | Caching, background refresh |
| `zustand` 4.x | Client state | Simple, no boilerplate |
| `axios` 1.x | HTTP client | Interceptors for token refresh |
| `react-hook-form` 7.x | Forms | Performant, uncontrolled |
| `zod` 3.x | Validation (client) | Same schemas as backend |
| `@hookform/resolvers` | Zod + RHF bridge | |
| `tailwindcss` 3.x | Styling | |
| `shadcn/ui` | Component base | Radix-based, accessible |
| `framer-motion` 11.x | Animations | Professional, declarative |
| `recharts` 2.x | Charts | Composable, React-native |
| `@tanstack/react-table` 8.x | Data tables | Headless, full control |
| `react-hot-toast` 2.x | Toast notifications | |
| `date-fns` 3.x | Date formatting | Tree-shakeable |
| `lucide-react` | Icons | Clean, consistent |
| `html5-qrcode` | QR scanner | Camera-based QR scanning |
| `qrcode` | QR generation | Generate QR for gate |
| `react-dropzone` | File uploads | Drag-drop CSV/image |
| `@react-pdf/renderer` | Client PDF | ID card generation |

### 15.3 Testing

| Library | Layer | Purpose |
|---------|-------|---------|
| `jest` | Backend | Test runner |
| `supertest` | Backend | HTTP integration tests |
| `@jest/globals` | Backend | Types |
| `vitest` | Frontend | Fast test runner |
| `@testing-library/react` | Frontend | Component tests |
| `@testing-library/user-event` | Frontend | User interaction simulation |
| `msw` 2.x | Frontend | Mock Service Worker (API mocking) |
| `playwright` | E2E | Cross-browser E2E tests |
| `k6` | Load testing | Performance / scalability tests |

---

## 16. Hosting & Infrastructure

### 16.1 Recommended Stack

| Service | Platform | Tier | Why |
|---------|----------|------|-----|
| **Frontend** | Vercel | Free | CDN-edge, auto-deploy, already using |
| **Backend** | Render | Free/Starter ($7/mo) | Auto-deploy, sufficient for scale |
| **Database** | PlanetScale | Free (5GB) | Best MySQL hosting; branching, no cold start |
| **Redis** | Upstash | Free (10k cmd/day) | Serverless Redis, pay-per-use, no cold start |
| **File Storage** | Cloudinary | Free (25GB) | Image upload + CDN for student photos |
| **Email** | Brevo (Sendinblue) | Free (300/day) | Reliable SMTP, no credit card |
| **Monitoring** | BetterUptime | Free | Uptime + incident alerts |
| **Error Tracking** | Sentry | Free (5k errors/mo) | Real-time error tracking |
| **Custom Domain** | PCCOE IT Dept | - | `hostelhub.pccoe.ac.in` |

### 16.2 Why PlanetScale Over Railway MySQL

| Feature | Railway MySQL | PlanetScale |
|---------|--------------|-------------|
| Cold start | Yes (free tier) | No |
| DB branching | No | Yes (like git for DB) |
| Connection pooling | Manual | Built-in Vitess |
| Free storage | Varies | 5GB |
| Backups | Manual config | Automatic daily |
| Migration workflow | Manual | Schema changes with safe deploys |

### 16.3 Environment Strategy

```
development    → local Docker (MySQL + Redis containers)
staging        → Render + PlanetScale dev branch
production     → Render + PlanetScale main branch + Upstash Redis
testing        → GitHub Actions + in-memory SQLite (or PlanetScale test branch)
```

---

## 17. Scalability Design (1000+ Concurrent Users)

### 17.1 Why 1000 concurrent users is achievable

The architecture is designed from day one to handle this load without expensive infrastructure.

**Key design decisions for scale:**

| Decision | Benefit |
|----------|---------|
| Redis rate limiting (shared) | Works across multiple instances |
| Redis session tokens | No DB hit for every API call |
| Read-through caching | Reduces DB queries by ~70% |
| BullMQ for background jobs | No request blocking for heavy operations |
| Pagination on all list endpoints | Never return unbounded result sets |
| DB indexes on all FK + filter columns | Queries fast even at 100k rows |
| Soft deletes (no foreign key cascades) | No expensive cascade on delete |
| N+1 query prevention (Sequelize include) | Single query for joined data |
| PlanetScale Vitess connection pooling | Handles 1000s of DB connections |
| Cloudinary CDN for images | Images never served from your server |
| Gzip compression | Reduces payload size ~70% |
| Vercel CDN (edge) for frontend | Frontend served from edge globally |

### 17.2 Database Query Optimization

```typescript
// BAD - N+1 query (fetches 1 + N students)
const rooms = await Room.findAll();
for (const room of rooms) {
  room.students = await Student.findAll({ where: { roomId: room.id } });
}

// GOOD - Single JOIN query
const rooms = await Room.findAll({
  include: [{ model: Student, as: 'occupants' }],
  where: { status: 'AVAILABLE' }
});
```

### 17.3 Pagination Strategy

All list endpoints support cursor-based or offset pagination:

```typescript
// Standard offset pagination (simpler, fine for this scale)
GET /movements?page=1&limit=20&sort=created_at&order=desc

// Response includes:
{
  "meta": {
    "page": 1, "limit": 20,
    "total": 2847, "totalPages": 143
  }
}
```

### 17.4 Future Horizontal Scaling

If the system outgrows Render's single instance:
1. Enable Render's multiple instances (Redis-backed sessions already support this)
2. Read replicas on PlanetScale for analytics queries
3. BullMQ workers can run on separate instances
4. CDN layer (Cloudflare) in front of Render backend

---

## 18. CI/CD & DevOps

### 18.1 GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: HostelHub CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-checks:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
        env:
          NODE_ENV: test
          DB_URL: sqlite::memory:
          JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET_TEST }}
          REDIS_URL: redis://localhost:6379

  frontend-checks:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  build:
    needs: [backend-checks, frontend-checks]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm run build
      - run: cd frontend && npm ci && npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
      # Vercel deploys automatically on push to main
```

### 18.2 Git Strategy

```
main     → Production (auto-deploys to Vercel + Render)
develop  → Staging (manual deploy to staging environment)

feature/{feature-name}   → Feature branches
fix/{bug-description}    → Bug fixes
hotfix/{description}     → Emergency production fixes (branch from main)
```

### 18.3 Semantic Commits

```
feat(allocation): add selection window expiry cron job
fix(qr): prevent double scan for same student
refactor(leave): extract approval logic to service layer
chore(deps): update sequelize to 6.37.1
test(auth): add refresh token replay attack test
docs(api): add Swagger docs for /movements endpoints
perf(analytics): cache overview stats in Redis
security(auth): enforce password complexity validation
```

---

## 19. Testing Strategy - Full Coverage

### 19.1 Testing Pyramid

```
              ┌───────────────┐
              │   E2E Tests   │  ← Playwright: 10–15 critical flows
              │  (few, slow)  │
            ┌─┴───────────────┴─┐
            │ Integration Tests │  ← Supertest: all API endpoints
            │ (moderate count)  │
          ┌─┴───────────────────┴─┐
          │     Unit Tests        │  ← Jest/Vitest: all services, utils
          │ (many, fast, focused) │
          └───────────────────────┘
```

### 19.2 Backend Unit Tests (Jest)

```
tests/unit/
├── services/
│   ├── merit.service.test.ts          # SGPA ranking algorithm
│   │   ├── sorts students by SGPA descending
│   │   ├── handles equal SGPA (secondary sort by PRN)
│   │   ├── applies seat limit correctly
│   │   ├── marks below-cutoff students as WAITLISTED
│   │   └── handles empty student list
│   ├── cycle.service.test.ts          # State machine transitions
│   │   ├── cannot advance from CLOSED state
│   │   ├── cannot create cycle if one is active
│   │   └── each valid transition works correctly
│   ├── qr.service.test.ts             # QR verification logic
│   │   ├── validates correct QR token
│   │   ├── rejects expired QR
│   │   ├── rejects reused QR (same student)
│   │   └── allows multiple students on same QR
│   ├── leave.service.test.ts
│   ├── complaint.service.test.ts
│   └── auth.service.test.ts
├── utils/
│   ├── gatePassRef.test.ts
│   ├── pagination.test.ts
│   └── hash.test.ts
└── validators/
    └── schemas.test.ts
```

**Coverage target: 80%+ on all service files**

### 19.3 Backend Integration Tests (Jest + Supertest)

```
tests/integration/
├── auth.test.ts              # Full auth flow
│   ├── POST /auth/login - valid credentials
│   ├── POST /auth/login - wrong password (5x → lockout)
│   ├── POST /auth/refresh - valid refresh token
│   ├── POST /auth/refresh - expired token
│   ├── POST /auth/refresh - reused token (security)
│   └── POST /auth/logout - clears session
├── leave.test.ts             # Full lifecycle
│   ├── Student submits leave → PENDING
│   ├── Warden approves → APPROVED + notification
│   ├── Warden rejects (with reason) → REJECTED
│   ├── Student cancels pending leave
│   ├── Student cannot cancel approved leave after date
│   └── Leave overlap detection
├── movement.test.ts          # Full lifecycle + QR
│   ├── Student logs OUT
│   ├── Student cannot log OUT twice
│   ├── Student scans QR → IN logged
│   ├── Expired QR rejected
│   ├── Reused QR rejected
│   └── Overdue detection
├── allocation.test.ts        # Cycle state machine
│   ├── Full cycle: DRAFT → CLOSED
│   ├── Merit list generated correctly
│   ├── Student selects room
│   ├── Student declines → next student notified
│   └── Admin overrides allocation
├── complaint.test.ts
├── room.test.ts
└── user.test.ts
```

### 19.4 Frontend Component Tests (Vitest + RTL)

```
tests/components/
├── forms/
│   ├── LeaveForm.test.tsx         # Validation, submission
│   ├── ComplaintForm.test.tsx     # File upload, validation
│   └── MovementOutForm.test.tsx
├── pages/
│   ├── LoginPage.test.tsx         # Form submission, error display
│   ├── StudentDashboard.test.tsx  # Data loading, empty state
│   └── MeritList.test.tsx         # Correct rank display
├── common/
│   ├── DataTable.test.tsx
│   ├── StatusBadge.test.tsx
│   └── QRScanner.test.tsx
└── hooks/
    ├── useAuth.test.ts
    └── useLeaves.test.ts
```

**Coverage target: 70%+ on all component and hook files**

### 19.5 E2E Tests (Playwright)

```
tests/e2e/
├── student-journey.spec.ts
│   ├── Login as student
│   ├── Log OUT movement
│   ├── Scan QR to log IN
│   ├── Submit leave request
│   └── Submit complaint with photo
├── warden-journey.spec.ts
│   ├── Login as warden
│   ├── Generate QR code
│   ├── Approve leave request
│   └── Update complaint status
├── admin-journey.spec.ts
│   ├── Login as admin
│   ├── Create student account
│   ├── Create allocation cycle
│   ├── Upload SGPA and generate merit list
│   └── Manually assign room
└── auth-security.spec.ts
    ├── Login lockout after 5 attempts
    ├── Protected routes redirect to login
    └── Role-based access (student cannot access /admin)
```

### 19.6 Load Tests (k6)

```javascript
// tests/load/movement.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 1000,           // 1000 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],     // <1% error rate
  },
};

// Simulate 1000 students simultaneously logging OUT
export default function() {
  const res = http.post('https://api.../api/v1/movements/out', 
    JSON.stringify({ destination: 'Home', reason: 'Test', expectedReturn: '...' }),
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  check(res, { 'status is 201': (r) => r.status === 201 });
  sleep(1);
}
```

**Load test targets:**
- 1000 concurrent users: API response < 500ms (P95)
- 0 errors under normal load
- Graceful degradation under spike (2000 users): returns 429, not 500

### 19.7 WebAdmin Testing Console

The WebAdmin role can trigger a subset of these tests from the dashboard (functional tests only, not load tests) and view results in real-time.

---

## 20. SEO Strategy

HostelHub is a web application - its public-facing pages should rank well when PCCOE students and parents search for "PCCOE hostel management" or "PCCOE girls hostel."

### 20.1 Technical SEO

**Meta tags (per page):**
```html
<!-- Landing page example -->
<title>HostelHub - PCCOE Girls Hostel Management System</title>
<meta name="description" content="Digital hostel management for PCCOE's girls hostel. Track movement, apply for leave, submit complaints, and get room allocation - all online." />
<meta name="keywords" content="PCCOE hostel, PCCOE girls hostel, hostel management, Pimpri Chinchwad College hostel" />
<link rel="canonical" href="https://hostelhub.pccoe.ac.in" />

<!-- Open Graph -->
<meta property="og:title" content="HostelHub - PCCOE Girls Hostel" />
<meta property="og:description" content="Digital hostel management for PCCOE" />
<meta property="og:image" content="https://hostelhub.pccoe.ac.in/og-image.png" />
<meta property="og:url" content="https://hostelhub.pccoe.ac.in" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
```

**Structured Data (JSON-LD):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HostelHub",
  "description": "Digital hostel management system for PCCOE Girls Hostel",
  "url": "https://hostelhub.pccoe.ac.in",
  "applicationCategory": "Education",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0" },
  "provider": {
    "@type": "EducationalOrganization",
    "name": "PCET's Pimpri Chinchwad College of Engineering",
    "url": "https://www.pccoepune.com"
  }
}
</script>
```

**Sitemap (`/sitemap.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hostelhub.pccoe.ac.in/</loc><priority>1.0</priority></url>
  <url><loc>https://hostelhub.pccoe.ac.in/about</loc><priority>0.8</priority></url>
  <url><loc>https://hostelhub.pccoe.ac.in/contact</loc><priority>0.7</priority></url>
  <url><loc>https://hostelhub.pccoe.ac.in/privacy</loc><priority>0.4</priority></url>
</urlset>
```

**`robots.txt`:**
```
User-agent: *
Allow: /
Allow: /about
Allow: /contact
Disallow: /admin/
Disallow: /student/
Disallow: /warden/
Disallow: /api/
Sitemap: https://hostelhub.pccoe.ac.in/sitemap.xml
```

### 20.2 Performance SEO (Core Web Vitals)

| Metric | Target | Implementation |
|--------|--------|---------------|
| LCP (Largest Contentful Paint) | < 2.5s | Preload hero image, CDN, lazy load below fold |
| FID / INP (Interaction to Next Paint) | < 200ms | Code splitting, deferred scripts |
| CLS (Cumulative Layout Shift) | < 0.1 | Skeleton loaders, explicit image dimensions |
| Time to First Byte | < 200ms | Vercel edge CDN, Render warm instances |

**Vite build optimizations:**
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 500,
  },
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate' }),  // PWA for future
  ]
}
```

### 20.3 Content SEO

Public landing page content with keywords naturally integrated:
- "PCCOE Girls Hostel Management System"
- "Pimpri Chinchwad College of Engineering Hostel"
- "Digital hostel management"
- "Online leave application hostel"
- "Merit-based room allocation PCCOE"

### 20.4 Lighthouse Score Targets

| Category | Target Score |
|----------|-------------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |

---

## 21. Future Scope & Advancement

The system is architected to support these future features without breaking changes.

### 21.1 Near-Term (Next Version)

| Feature | Description | Technical Notes |
|---------|-------------|----------------|
| PWA (Progressive Web App) | Install on phone home screen | Vite PWA plugin - already stubbed |
| Push Notifications | Real-time alerts without email | Service Worker + Web Push API |
| Mobile App (React Native) | iOS/Android app | Backend API already mobile-ready |
| Mess Menu Management | Digital weekly menu + feedback | New module, new DB table |
| Fee Payment Tracking | Mark fees as paid/unpaid | Integration-ready, no gateway |
| Notice Board | Digital announcements board | New module |

### 21.2 Medium-Term

| Feature | Description |
|---------|-------------|
| Parent Portal | Read-only view for parents: leave status, room info |
| Biometric Integration | Face recognition at gate (hardware dependency) |
| ERP Integration | Auto-sync student data from college ERP |
| AI Room Allocation Suggestions | Suggest compatible roommates by branch/year |
| Multi-Hostel Support | Handle boys hostel or other institutions |

### 21.3 Long-Term

| Feature | Description |
|---------|-------------|
| Multi-Institution SaaS | License system to other colleges |
| IoT Gate Integration | Smart lock linked to QR verification |
| Predictive Analytics | ML-based occupancy forecasting |
| Multi-Language Support | Marathi + Hindi UI |

### 21.4 Microservices Migration Path

Current monolith is well-separated internally. When scale demands it:

```
Phase 1 (current): Monolith with clean module separation
Phase 2: Extract notification service (high volume, independent)
Phase 3: Extract analytics service (read-heavy, can have own replica)
Phase 4: Extract allocation service (complex, infrequent, critical)
```

The Repository pattern ensures any module can be moved to a separate service without touching business logic - just changing transport from function calls to HTTP/gRPC.

---

## 22. Development Roadmap (Sprints)

### Phase 1: Foundation - Week 1–2

- [ ] Monorepo scaffold with workspaces
- [ ] TypeScript strict mode configuration (backend + frontend)
- [ ] ESLint + Prettier + Husky + lint-staged
- [ ] Backend: Express app shell with all middleware
- [ ] Environment validation (Zod, fail-fast)
- [ ] Database: PlanetScale setup + all Sequelize models
- [ ] All migrations written and run
- [ ] Redis (Upstash): connection + cache service
- [ ] Winston logging + request ID middleware
- [ ] Global error handler
- [ ] Health check endpoints (`/health`, `/health/db`, `/health/redis`)
- [ ] Docker Compose for local dev (MySQL + Redis)
- [ ] Seed data: admin user, sample rooms, academic year
- [ ] Frontend: Vite + React + TypeScript scaffold
- [ ] Tailwind + shadcn/ui setup with PCCOE theme
- [ ] Axios client with interceptors
- [ ] Zustand auth store

### Phase 2: Authentication & Users - Week 3

- [ ] Auth API (login, refresh, logout, logout-all, forgot, reset)
- [ ] JWT access + refresh token rotation
- [ ] Redis-backed session + rate limiting
- [ ] Account lockout after 5 failed attempts
- [ ] RBAC middleware (authenticate + authorize)
- [ ] User management CRUD (admin)
- [ ] CSV bulk import (students)
- [ ] Frontend: Login page, forgot password, reset password
- [ ] Frontend: Protected routes, role routes
- [ ] Frontend: Token refresh interceptor
- [ ] Auth tests (unit + integration)

### Phase 3: Student Core Features - Week 4–5

- [ ] Movement log API (OUT, IN with QR, history)
- [ ] QR session API (generate, refresh, invalidate)
- [ ] QR verification logic + Redis tokens
- [ ] Leave request API (submit, cancel, history)
- [ ] Complaint API (submit, view, reopen)
- [ ] Notification API + BullMQ email queue
- [ ] Frontend: Student dashboard
- [ ] Frontend: Movement OUT form + QR scanner (IN)
- [ ] Frontend: Leave application + history
- [ ] Frontend: Complaint form + history
- [ ] Cron: Overdue movement scanner (Job 1)
- [ ] Cron: Leave return scanner (Job 2)
- [ ] Tests: movement, leave, complaint flows

### Phase 4: Room Allocation - Week 6–7 (Most Complex)

- [ ] Room management API (CRUD)
- [ ] Academic year API
- [ ] Allocation cycle API (full state machine)
- [ ] SGPA CSV upload + merit list generation
- [ ] Preference collection workflow
- [ ] Student room selection (time-windowed)
- [ ] Cycle state advancement (manual + auto)
- [ ] Admin manual override allocation
- [ ] Room swap
- [ ] Cron: Selection window expiry (Job 3)
- [ ] Cron: Selection reminder (Job 4)
- [ ] Cron: Preference deadline handler (Job 6)
- [ ] Frontend: Admin allocation hub (all cycle pages)
- [ ] Frontend: Student allocation status + room selection
- [ ] Allocation tests (full cycle)

### Phase 5: Admin & Warden Dashboards - Week 8

- [ ] All analytics API endpoints
- [ ] Redis analytics caching
- [ ] PDF export (Puppeteer)
- [ ] CSV export for all resources
- [ ] Audit log API
- [ ] Settings API (system config)
- [ ] Cron job control API
- [ ] Frontend: Admin dashboard (full analytics)
- [ ] Frontend: Warden dashboard
- [ ] Frontend: All admin management pages
- [ ] Frontend: Warden QR page + leave management + complaints

### Phase 6: WebAdmin + Advanced Features - Week 9

- [ ] WebAdmin analytics API (proxied metrics)
- [ ] Website analytics collection (lightweight, no third-party)
- [ ] Performance metrics API
- [ ] Test runner API (runs Jest/Playwright subset)
- [ ] SEO dashboard API (Lighthouse via Puppeteer)
- [ ] Frontend: WebAdmin console (all pages)
- [ ] Cron: SLA escalator (Job 5)
- [ ] Cron: Weekly report (Job 7)
- [ ] Cron: Account cleanup (Job 8)
- [ ] Frontend: Dark/Light theme implementation
- [ ] Frontend: All animations (Framer Motion)
- [ ] Frontend: Landing page (SEO-optimized)
- [ ] robots.txt, sitemap.xml, meta tags

### Phase 7: Testing, Security & Launch - Week 10

- [ ] Complete unit test coverage (backend services)
- [ ] Complete integration test coverage (all API routes)
- [ ] Frontend component tests
- [ ] E2E tests (Playwright - 4 critical journeys)
- [ ] Load test baseline (k6 - 1000 users)
- [ ] Security audit checklist
- [ ] npm audit + dependency review
- [ ] Secrets audit (no hardcoded values)
- [ ] Lighthouse score audit (target: all ≥ 90)
- [ ] GitHub Actions CI pipeline
- [ ] Production deployment checklist
- [ ] README + API docs + deployment guide
- [ ] Copyright notice in all source files

---

## 23. Copyright & Legal

### 23.1 Intellectual Property

```
Copyright © 2026 HostelHub
Developed by:
  Piyush Rajkumar Patil    (123B1B220)
  Pranali Rajendra Patil   (123B1B221)
  Sayali Rajesh Pawar      (123B1B229)

Department of Computer Engineering
PCET's Pimpri Chinchwad College of Engineering
Sector 26, Nigdi, Pradhikaran, Pune - 411044

Under the Guidance of: Prof. Shraddha Ovale

All rights reserved. This software and its documentation are
proprietary and confidential. Unauthorized reproduction,
distribution, or modification is strictly prohibited.
```

### 23.2 License File (`LICENSE.txt`)

```
PROPRIETARY SOFTWARE LICENSE

This software ("HostelHub") is the exclusive intellectual property of
Piyush Rajkumar Patil, Pranali Rajendra Patil, and Sayali Rajesh Pawar,
developed under the guidance of Prof. Shraddha Ovale at PCET's Pimpri
Chinchwad College of Engineering, Pune.

Permission is granted solely to PCET's Pimpri Chinchwad College of
Engineering ("the Institution") to deploy and use this software for
internal hostel management operations.

Restrictions:
1. No part of this software may be reproduced, distributed, modified,
   or sub-licensed without explicit written permission from the authors.
2. Commercial use is strictly prohibited without written consent.
3. The Institution may not transfer this license to any third party.
4. The software must retain this copyright notice in all copies.

THE SOFTWARE IS PROVIDED "AS IS" FOR INSTITUTIONAL USE ONLY.
THE AUTHORS ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM ITS USE.

For licensing inquiries: hostelhub.pccoe@gmail.com
```

### 23.3 Source File Header (Short Form)

```typescript
/**
 * HostelHub - PCCOE Girls Hostel Management System
 * Copyright © 2026 Piyush Patil, Pranali Patil, Sayali Pawar
 * Proprietary and confidential. See LICENSE.txt for terms.
 */
```

### 23.4 Before Going Live - Security Checklist

- [ ] All `.env` files in `.gitignore` - verify with `git log --all -- '*.env'`
- [ ] No secrets in git history (`git log -S "secret"`)
- [ ] HTTPS enforced everywhere (no HTTP fallback)
- [ ] CORS whitelist: production domain only
- [ ] Rate limiting active on all endpoints
- [ ] Error responses don't expose stack traces
- [ ] File uploads validated (type + size + MIME)
- [ ] Admin seed password changed from default
- [ ] JWT secrets are 64+ chars, randomly generated
- [ ] Redis not exposed publicly (Upstash is fine)
- [ ] Database not exposed publicly (PlanetScale is fine)
- [ ] SSL certificate valid and auto-renews
- [ ] Sentry configured for production error tracking
- [ ] BetterUptime monitoring configured
- [ ] Backups verified (PlanetScale auto-backups)
- [ ] All cron jobs tested in staging before production

---

*Document: HostelHub v2.1 Master Blueprint*  
*Status: Documentation Complete - Ready for Implementation*  
*Next Step: Phase 1 Sprint - Foundation*

---

> **This document is the single source of truth for HostelHub v2.1.**  
> Every implementation decision references this document.  
> Updates to this document require version increment.