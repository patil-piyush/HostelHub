# HostelHub v2.0 — Enterprise Hostel Management System
### Project Blueprint & Architecture Document
**Institution:** PCET's Pimpri Chinchwad College of Engineering (PCCOE), Nigdi, Pune  
**Department:** Computer Engineering  
**Project By:** Piyush Rajkumar Patil, Pranali Rajendra Patil, Sayali Rajesh Pawar  
**Guide:** Prof. Shraddha Ovale  
**Document Version:** 2.0 — Production Blueprint  
**Date:** May 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What's Wrong With v1 (Honest Audit)](#2-whats-wrong-with-v1-honest-audit)
3. [Project Identity & Vision](#3-project-identity--vision)
4. [System Architecture](#4-system-architecture)
5. [Role & Permission Matrix](#5-role--permission-matrix)
6. [Feature Modules (Complete)](#6-feature-modules-complete)
7. [Database Schema Design](#7-database-schema-design)
8. [API Design](#8-api-design)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Folder Structure](#11-folder-structure)
12. [Tech Stack & Library Decisions](#12-tech-stack--library-decisions)
13. [Hosting & Infrastructure](#13-hosting--infrastructure)
14. [CI/CD & DevOps](#14-cicd--devops)
15. [Design System & UI Guidelines](#15-design-system--ui-guidelines)
16. [Development Roadmap (Sprints)](#16-development-roadmap-sprints)
17. [Testing Strategy](#17-testing-strategy)
18. [Copyright & Legal](#18-copyright--legal)

---

## 1. Executive Summary

HostelHub v2.0 is a **production-grade, enterprise-quality Hostel Management System** built exclusively for PCCOE's girls' hostel. It digitizes every physical register, paper form, and manual workflow into a secure, fast, and transparent web platform.

The system serves **four user roles**: Admin, Warden, Student, and Maintenance Staff — each with dedicated dashboards, permission-scoped actions, and real-time updates.

### What makes v2.0 different from v1:

| Dimension | v1 (Current) | v2.0 (Target) |
|-----------|-------------|----------------|
| Architecture | Flat controller-db coupling | Controller → Service → Repository → DB |
| Auth | Basic JWT | Access + Refresh token rotation |
| Validation | Partial frontend only | Zod on both frontend AND backend |
| Error Handling | None/inconsistent | Global middleware, typed error classes |
| Logging | None | Winston with request IDs |
| Database | Sync force:true | Migrations + Seeders only |
| Security | Minimal | Helmet, rate limiting, CORS whitelist, etc. |
| Testing | None | Jest + Vitest, unit + integration |
| DevOps | Manual deploy | GitHub Actions CI/CD |
| UI | Basic | Professional with PCCOE brand system |

---

## 2. What's Wrong With v1 (Honest Audit)

Before rebuilding, understand exactly what needs fixing. This is an unfiltered engineering critique.

### 2.1 Architecture Problems

**Problem:** Everything is in controllers. No service layer, no repository pattern.
```
// v1 pattern (bad)
router → controller → Sequelize.findAll() directly
```
**Why it's bad:** Business logic bleeds into controllers. Impossible to unit test. Changing DB requires touching controllers.

**v2 solution:**
```
Route → Controller (thin) → Service (business logic) → Repository (DB only)
```

**Problem:** `sync({ force: true })` or `sync({ alter: true })` in production.
**Why it's bad:** This DROPS AND RECREATES tables. Production data can be destroyed on restart.
**v2 solution:** Sequelize migrations only. No sync.

### 2.2 Security Problems

- No rate limiting → brute force attacks possible on `/auth/login`
- No Helmet → missing security headers (XSS, clickjacking, etc.)
- Hardcoded secrets or committed `.env` files (common in student projects)
- No refresh token → users get indefinitely logged in or get kicked out too often
- No input sanitization beyond basic validation
- CORS likely set to `*` (allows any origin)
- No protection against SQL injection via raw queries

### 2.3 Frontend Problems

- No centralized API client (axios used ad-hoc in components)
- No token refresh interceptor (users get 401 and see broken UI)
- Direct API calls inside components (coupling)
- No global error boundaries
- No loading states / skeleton loaders
- No Zustand/Redux — state scattered via props and local state
- No React Query — data fetching not cached or deduplicated

### 2.4 Database Problems

- No indexes on foreign keys (FKs without indexes = slow JOINs)
- No soft deletes (hard deleting leaves orphaned records)
- No audit trail (who changed what, when?)
- N+1 query patterns (fetching rooms then fetching students per room in loop)
- No UUID support (incremental IDs expose record counts to users)
- No database-level constraints (only application-level)

### 2.5 Operational Problems

- No logging (debugging in production is blind)
- No health check endpoint
- No environment separation (same config for dev and prod)
- No Docker (environment differences between devs)
- No CI/CD (manual deploys, no automated tests before deploy)

---

## 3. Project Identity & Vision

### 3.1 Product Name
**HostelHub** — *Powered by PCCOE*

### 3.2 Tagline
*"Smart Hostel. Transparent Decisions. Zero Paperwork."*

### 3.3 Core Philosophy
- **Transparency:** Every decision (room allocation, leave approval, complaint status) is visible and traceable
- **Fairness:** Merit-based allocation with documented criteria, no favoritism possible
- **Accountability:** Full audit logs — who did what, when
- **Simplicity:** Complex workflows made simple for students and wardens

### 3.4 Target Users
| Role | Count | Primary Need |
|------|-------|-------------|
| Admin | 1–2 | Full control, analytics, yearly room allocation cycle |
| Warden | 2–4 | Daily monitoring, leave approvals, complaint management |
| Student | 200–400 | Movement log, leave requests, complaints, room selection |
| Maintenance Staff | 2–5 | View and update assigned complaints |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│          React + TypeScript (Vercel)                     │
│   [Student App] [Warden App] [Admin App]                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  API GATEWAY LAYER                       │
│         Node.js + Express (Render)                      │
│   Rate Limiting → Auth Middleware → Route Handler       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Controllers  │  │   Services   │  │ Repositories │  │
│  │  (thin layer) │→│ (biz logic)  │→│  (DB access) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ Sequelize ORM
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│           MySQL (Railway)                                │
│   Users | Rooms | Allocations | Leaves | Complaints     │
│   MovementLogs | AuditLogs | Notifications | Sessions   │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Request Lifecycle

```
Request
  │
  ├─ Helmet (security headers)
  ├─ CORS (whitelist check)
  ├─ Rate Limiter (per IP / per user)
  ├─ Request Logger (Winston + Request ID)
  ├─ Body Parser + Size Limit
  ├─ Auth Middleware (JWT verify)
  ├─ Role Middleware (RBAC check)
  ├─ Zod Validator (body/params/query)
  │
  ├─ Controller (parse, call service, return response)
  │     └─ Service (business logic, transactions)
  │           └─ Repository (Sequelize queries)
  │                 └─ MySQL
  │
  └─ Global Error Handler (format error response)
```

### 4.3 Authentication Flow

```
Login Request
  │
  ├─ Validate credentials (Zod)
  ├─ Find user (Repository)
  ├─ Verify password (bcrypt.compare)
  ├─ Generate Access Token (15min expiry)
  ├─ Generate Refresh Token (7d expiry, store in DB)
  ├─ Set Refresh Token in httpOnly cookie
  └─ Return Access Token in response body

Token Refresh (frontend interceptor)
  │
  ├─ Access token expired (401 from API)
  ├─ Frontend calls POST /auth/refresh
  ├─ Backend reads httpOnly cookie
  ├─ Validates refresh token against DB
  ├─ Rotates refresh token (invalidate old, issue new)
  └─ Return new access token

Logout
  ├─ Invalidate refresh token in DB
  └─ Clear httpOnly cookie
```

---

## 5. Role & Permission Matrix

### 5.1 Roles

| Role | Code | Description |
|------|------|-------------|
| Super Admin | `ADMIN` | Full system access, manages everything |
| Warden | `WARDEN` | Daily operations — leave, complaints, movement |
| Student | `STUDENT` | Self-service — movement log, leave, complaints |
| Maintenance | `MAINTENANCE` | View & update assigned complaints only |

### 5.2 Permission Matrix

| Feature | ADMIN | WARDEN | STUDENT | MAINTENANCE |
|---------|-------|--------|---------|-------------|
| **Auth** |||||
| Login/Logout | ✅ | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ | ✅ |
| **User Management** |||||
| Create student accounts | ✅ | ✅ | ❌ | ❌ |
| Bulk import students (CSV) | ✅ | ❌ | ❌ | ❌ |
| Create warden accounts | ✅ | ❌ | ❌ | ❌ |
| Delete/deactivate accounts | ✅ | ❌ | ❌ | ❌ |
| View all students | ✅ | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ | ✅ |
| **Room Allocation** |||||
| Create/edit rooms | ✅ | ❌ | ❌ | ❌ |
| Initiate allocation cycle | ✅ | ❌ | ❌ | ❌ |
| Upload SGPA/CGPA data | ✅ | ❌ | ❌ | ❌ |
| Set eligibility criteria | ✅ | ❌ | ❌ | ❌ |
| View merit list | ✅ | ✅ | ✅* | ❌ |
| Select room (if eligible) | ❌ | ❌ | ✅* | ❌ |
| Manually assign any room | ✅ | ❌ | ❌ | ❌ |
| De-allocate student | ✅ | ❌ | ❌ | ❌ |
| View room inventory | ✅ | ✅ | ❌ | ❌ |
| **Movement Logs** |||||
| Log own OUT entry | ❌ | ❌ | ✅ | ❌ |
| Log own IN entry | ❌ | ❌ | ✅ | ❌ |
| View all movement logs | ✅ | ✅ | ❌ | ❌ |
| View own movement history | ❌ | ❌ | ✅ | ❌ |
| Export movement logs | ✅ | ✅ | ❌ | ❌ |
| **Leave Management** |||||
| Apply for leave | ❌ | ❌ | ✅ | ❌ |
| Approve/Reject leave | ✅ | ✅ | ❌ | ❌ |
| View all leave requests | ✅ | ✅ | ❌ | ❌ |
| View own leave history | ❌ | ❌ | ✅ | ❌ |
| Export leave data | ✅ | ✅ | ❌ | ❌ |
| **Complaints** |||||
| Submit complaint | ❌ | ❌ | ✅ | ❌ |
| Assign complaint to staff | ✅ | ✅ | ❌ | ❌ |
| Update complaint status | ✅ | ✅ | ❌ | ✅** |
| View all complaints | ✅ | ✅ | ❌ | ❌ |
| View assigned complaints | ❌ | ❌ | ❌ | ✅ |
| View own complaints | ❌ | ❌ | ✅ | ❌ |
| **Analytics** |||||
| Full analytics dashboard | ✅ | ✅ | ❌ | ❌ |
| Export reports (CSV/PDF) | ✅ | ✅ | ❌ | ❌ |
| **Notifications** |||||
| Send broadcast notices | ✅ | ✅ | ❌ | ❌ |
| View own notifications | ✅ | ✅ | ✅ | ✅ |
| **Audit Logs** |||||
| View full audit trail | ✅ | ❌ | ❌ | ❌ |
| **Settings** |||||
| System settings | ✅ | ❌ | ❌ | ❌ |
| Academic year management | ✅ | ❌ | ❌ | ❌ |

*Only during active allocation window and only if eligible per merit list  
**Only for complaints assigned to them; status: In Progress → Resolved

---

## 6. Feature Modules (Complete)

### Module 1: Authentication & Session Management

**Features:**
- Email/password login with bcrypt
- Access token (JWT, 15 min) + Refresh token (httpOnly cookie, 7 days)
- Automatic token refresh via axios interceptor
- Logout from current device / all devices
- Password reset via email OTP (Nodemailer)
- Session list (which devices are logged in)
- Failed login attempt tracking + temporary lockout after 5 failures

**Why not Auth0?**
Auth0 is excellent but adds third-party dependency and cost. For a college deployment where you own the infrastructure and user base is known, custom JWT with refresh token rotation is more appropriate, secure enough, and fully free.

---

### Module 2: Admin Dashboard

**Features:**
- Overview cards: Total students, occupied rooms, pending leaves, open complaints
- Academic year management (create, switch active year)
- Quick actions panel
- Recent activity feed (audit log preview)
- Real-time stats

---

### Module 3: User Management

**Features:**
- Create individual student accounts
- Bulk import via CSV (name, PRN, branch, year, email)
- Create/edit/deactivate warden accounts
- Create maintenance staff accounts
- View student profile (room, movement history, leave history, complaint history)
- Role assignment / change
- Account search + filter by year, branch, room status

**CSV Import Format:**
```
name,prn,email,branch,year,phone
Priya Sharma,123B1B001,priya@pccoe.edu,CS,2,9876543210
```

---

### Module 4: Room Management & Allocation System

This is the most complex and critical module.

#### 4.1 Room Inventory

- Rooms have: number, floor, block, capacity (max 3), current occupancy, status (Available/Full/Maintenance)
- Admin creates/edits rooms
- View room map (grid of all rooms with color-coded status)

#### 4.2 Yearly Allocation Cycle

**The Process (exactly as described by you):**

```
Step 1: Admin initiates new academic year allocation cycle
  └─ Sets: deadline for preference submission, eligibility SGPA cutoff

Step 2: Returning students (2nd, 3rd year) indicate intent
  └─ Each student: "I want hostel this year" YES/NO
  └─ Deadline enforced by system

Step 3: Admin uploads SGPA data (CSV) for merit ranking
  └─ Validated, stored against student record for current cycle

Step 4: System generates merit list
  └─ Sorted by SGPA descending
  └─ Limited to available seats (total capacity - seats reserved for 1st year)
  └─ Students below cutoff rank: waitlisted

Step 5: Room Selection Window
  └─ Students on merit list (in order) get notified
  └─ Each eligible student gets a time window to select a room
  └─ They can see: available rooms, floor, block, roommates
  └─ If they don't select within window → system moves to next student
  └─ If they decline → next student gets their slot

Step 6: 1st Year Allocation
  └─ Reserved rooms for 1st year filled separately
  └─ Can be manual by admin or by SGPA if data available

Step 7: Cycle closes
  └─ All allocations finalized
  └─ Students notified of final room assignment
```

**States of a cycle:**
`DRAFT → PREFERENCE_COLLECTION → MERIT_GENERATION → ROOM_SELECTION → FIRST_YEAR_ALLOCATION → CLOSED`

**Admin overrides:**
- Admin can manually move any student to any room at any time
- Admin can override merit list manually
- Admin can extend deadlines

---

### Module 5: Movement Log (In/Out Register)

**Features:**
- Student logs OUT: destination, reason, expected return time
- Student logs IN: actual return time (auto-filled if they tap on open entry)
- Warden/Admin views all movement logs with filters
- Overdue detection: students who logged OUT but haven't logged IN after expected time → highlighted in red, warden notified
- Movement history for each student
- Export: CSV / PDF
- Date-range filter, search by name/PRN

**Movement Entry Fields:**
| Field | Type | Notes |
|-------|------|-------|
| Student | FK | auto from session |
| Type | ENUM | OUT / IN |
| Destination | String | Where going |
| Reason | String | Purpose |
| Expected Return | DateTime | Required for OUT |
| Actual Return | DateTime | Filled on IN entry |
| Gate Pass # | String | Auto-generated reference |
| Created At | DateTime | Auto |

---

### Module 6: Leave Management

**Leave Types:**
- Home Leave (weekend, vacation)
- Medical Leave
- Emergency Leave
- Event Leave (inter-college, sports)

**Workflow:**
```
Student submits → Pending
  └─ Warden reviews → Approved / Rejected (with reason)
  └─ Student notified
  └─ If Approved: student gets leave reference number
```

**Student submits:**
- Leave type, dates (from-to), reason, emergency contact
- Parent/guardian contact (for admin record)

**Warden sees:**
- All pending leaves, sorted by submission date
- Quick approve/reject with optional note
- Calendar view of approved leaves

**Admin sees:**
- All leaves with full history
- Analytics: leaves per month, by type, average duration
- Export

---

### Module 7: Complaint Management

**Complaint Categories:**
- Infrastructure (plumbing, electrical, furniture)
- Cleanliness
- Security
- Mess / Food
- Noise / Behavior
- Other

**Lifecycle:**
```
Student Submits (OPEN)
  └─ Warden Acknowledges (IN_PROGRESS)
        └─ Warden assigns to Maintenance Staff (if needed)
              └─ Maintenance Staff updates status
                    └─ Warden resolves (RESOLVED)
                          └─ Student confirms (CLOSED)
                               └─ If not confirmed in 48hrs → auto-CLOSED
```

**Features:**
- Photo attachment on complaint (optional)
- Internal notes by warden (not visible to student)
- Resolution time tracking
- SLA alerts (complaint open > 3 days → escalate flag)
- Student can reopen a CLOSED complaint once within 7 days

---

### Module 8: Analytics & Reports

**Admin/Warden Analytics:**
- Occupancy rate over time (chart)
- Room occupancy by floor/block (heatmap)
- Leave requests: by month, by type, approval rate
- Complaint resolution time (avg, by category)
- Movement log: peak exit hours (bar chart)
- Student-wise summary

**Time filters:** Today, This Week, This Month, This Quarter, This Year, Custom Range

**Export formats:** CSV, PDF (auto-generated)

---

### Module 9: Notifications

- In-app notification bell (badge count)
- Email notifications (Nodemailer + SendGrid)
- Notification types:
  - Leave approved/rejected
  - Complaint status update
  - Room allocation result
  - Overdue movement alert (to warden)
  - System announcements

**Broadcast notices** by Admin/Warden → all students or specific year/branch group

---

### Module 10: Audit Log

**Every state-changing action is logged:**

```
{
  id: UUID,
  actor_id: UUID (who did it),
  actor_role: ENUM,
  action: String (e.g., "LEAVE_APPROVED"),
  entity_type: String (e.g., "LeaveRequest"),
  entity_id: UUID,
  old_value: JSON (before),
  new_value: JSON (after),
  ip_address: String,
  user_agent: String,
  created_at: Timestamp
}
```

Only Admin can view audit logs. This is the legal paper trail for copyright and accountability.

---

### Module 11: Profile & Settings

**Student Profile:**
- Personal info, photo
- Academic info (PRN, branch, year)
- Emergency contacts
- Current room
- Hostel ID card (downloadable PDF with QR code)

**Admin Settings:**
- Academic year configuration
- Hostel capacity settings
- Notification templates
- Leave policy (max days per type)
- Allocation cycle parameters

---

## 7. Database Schema Design

### 7.1 Core Tables

```sql
-- Users (base for all roles)
CREATE TABLE users (
  id           CHAR(36) PRIMARY KEY,           -- UUID
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('ADMIN','WARDEN','STUDENT','MAINTENANCE') NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  last_login   DATETIME,
  created_at   DATETIME NOT NULL,
  updated_at   DATETIME NOT NULL,
  deleted_at   DATETIME,                        -- soft delete
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Student Profiles
CREATE TABLE students (
  id              CHAR(36) PRIMARY KEY,
  user_id         CHAR(36) NOT NULL UNIQUE,
  prn             VARCHAR(20) UNIQUE NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(15),
  branch          VARCHAR(50) NOT NULL,
  year            TINYINT NOT NULL,             -- 1,2,3,4
  photo_url       VARCHAR(500),
  emergency_name  VARCHAR(100),
  emergency_phone VARCHAR(15),
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_prn (prn),
  INDEX idx_year_branch (year, branch)
);

-- Rooms
CREATE TABLE rooms (
  id          CHAR(36) PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  floor       TINYINT NOT NULL,
  block       VARCHAR(10),
  capacity    TINYINT DEFAULT 3,
  status      ENUM('AVAILABLE','FULL','MAINTENANCE') DEFAULT 'AVAILABLE',
  is_reserved BOOLEAN DEFAULT FALSE,            -- reserved for 1st year
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  INDEX idx_status (status),
  INDEX idx_floor (floor)
);

-- Academic Years
CREATE TABLE academic_years (
  id         CHAR(36) PRIMARY KEY,
  label      VARCHAR(20) NOT NULL,             -- e.g. "2025-2026"
  is_active  BOOLEAN DEFAULT FALSE,
  starts_at  DATE NOT NULL,
  ends_at    DATE NOT NULL,
  created_at DATETIME NOT NULL
);

-- Room Allocations
CREATE TABLE allocations (
  id               CHAR(36) PRIMARY KEY,
  student_id       CHAR(36) NOT NULL,
  room_id          CHAR(36) NOT NULL,
  academic_year_id CHAR(36) NOT NULL,
  allocated_by     CHAR(36),                   -- user_id of admin/warden
  allocated_at     DATETIME NOT NULL,
  vacated_at       DATETIME,                   -- NULL = currently allocated
  created_at       DATETIME NOT NULL,
  updated_at       DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  INDEX idx_student_year (student_id, academic_year_id),
  INDEX idx_room_year (room_id, academic_year_id)
);

-- Allocation Cycles
CREATE TABLE allocation_cycles (
  id                    CHAR(36) PRIMARY KEY,
  academic_year_id      CHAR(36) NOT NULL,
  status                ENUM('DRAFT','PREFERENCE_COLLECTION','MERIT_GENERATION',
                             'ROOM_SELECTION','FIRST_YEAR_ALLOCATION','CLOSED') DEFAULT 'DRAFT',
  preference_deadline   DATETIME,
  selection_deadline    DATETIME,
  sgpa_cutoff           DECIMAL(4,2),
  reserved_seats_fy     TINYINT DEFAULT 20,    -- seats reserved for 1st year
  created_at            DATETIME NOT NULL,
  updated_at            DATETIME NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Merit List (generated per cycle)
CREATE TABLE merit_entries (
  id              CHAR(36) PRIMARY KEY,
  cycle_id        CHAR(36) NOT NULL,
  student_id      CHAR(36) NOT NULL,
  sgpa            DECIMAL(4,2) NOT NULL,
  rank            INT NOT NULL,
  wants_hostel    BOOLEAN,                     -- NULL = not responded yet
  is_eligible     BOOLEAN DEFAULT TRUE,        -- false if below seat count
  selection_token CHAR(64),                    -- time-limited selection token
  selection_expires_at DATETIME,
  room_selected_id CHAR(36),
  status          ENUM('PENDING','SELECTED','DECLINED','WAITLISTED','EXPIRED') DEFAULT 'PENDING',
  created_at      DATETIME NOT NULL,
  FOREIGN KEY (cycle_id) REFERENCES allocation_cycles(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_cycle_rank (cycle_id, rank)
);

-- Movement Logs
CREATE TABLE movement_logs (
  id              CHAR(36) PRIMARY KEY,
  student_id      CHAR(36) NOT NULL,
  type            ENUM('OUT','IN') NOT NULL,
  destination     VARCHAR(200),
  reason          VARCHAR(500),
  expected_return DATETIME,
  actual_return   DATETIME,
  gate_pass_ref   VARCHAR(20) NOT NULL UNIQUE,
  is_overdue      BOOLEAN DEFAULT FALSE,
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_student_date (student_id, created_at),
  INDEX idx_overdue (is_overdue)
);

-- Leave Requests
CREATE TABLE leave_requests (
  id               CHAR(36) PRIMARY KEY,
  student_id       CHAR(36) NOT NULL,
  type             ENUM('HOME','MEDICAL','EMERGENCY','EVENT') NOT NULL,
  from_date        DATE NOT NULL,
  to_date          DATE NOT NULL,
  reason           TEXT NOT NULL,
  emergency_contact VARCHAR(15),
  status           ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  reviewed_by      CHAR(36),                   -- warden user_id
  reviewed_at      DATETIME,
  review_note      TEXT,
  leave_ref        VARCHAR(20) UNIQUE,
  created_at       DATETIME NOT NULL,
  updated_at       DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_student_status (student_id, status),
  INDEX idx_status_date (status, created_at)
);

-- Complaints
CREATE TABLE complaints (
  id           CHAR(36) PRIMARY KEY,
  student_id   CHAR(36) NOT NULL,
  category     ENUM('INFRASTRUCTURE','CLEANLINESS','SECURITY','MESS','NOISE','OTHER') NOT NULL,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NOT NULL,
  photo_url    VARCHAR(500),
  status       ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'OPEN',
  assigned_to  CHAR(36),                       -- maintenance staff user_id
  resolved_by  CHAR(36),                       -- warden user_id
  resolved_at  DATETIME,
  internal_note TEXT,                          -- warden-only
  is_escalated BOOLEAN DEFAULT FALSE,
  created_at   DATETIME NOT NULL,
  updated_at   DATETIME NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_status (status),
  INDEX idx_category (category)
);

-- Refresh Tokens (for secure auth)
CREATE TABLE refresh_tokens (
  id         CHAR(36) PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  device     VARCHAR(200),
  ip_address VARCHAR(45),
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);

-- Notifications
CREATE TABLE notifications (
  id         CHAR(36) PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  entity_type VARCHAR(50),
  entity_id  CHAR(36),
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_read (user_id, is_read)
);

-- Audit Logs
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
  created_at  DATETIME NOT NULL,
  INDEX idx_actor (actor_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);
```

### 7.2 Indexes Strategy

All foreign keys have explicit indexes. High-query columns (status, date ranges, student lookups) have indexes. Audit and notification tables have indexes on user_id and created_at for efficient pagination.

---

## 8. API Design

### 8.1 Base URL
```
Production: https://api.hostelhub.pccoe.ac.in/api/v1
Development: http://localhost:5000/api/v1
```

### 8.2 Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "2026-05-12T10:30:00.000Z",
  "requestId": "req_abc123"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-05-12T10:30:00.000Z",
  "requestId": "req_abc123"
}
```

### 8.3 API Endpoints

```
AUTH
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/logout-all
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/sessions

USERS
GET    /api/v1/users                 (admin)
POST   /api/v1/users                 (admin)
POST   /api/v1/users/bulk-import     (admin, CSV)
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id             (soft delete)

STUDENTS
GET    /api/v1/students
GET    /api/v1/students/:id
GET    /api/v1/students/:id/profile  (full profile with history)
PATCH  /api/v1/students/:id

ROOMS
GET    /api/v1/rooms
POST   /api/v1/rooms                 (admin)
GET    /api/v1/rooms/:id
PATCH  /api/v1/rooms/:id             (admin)
DELETE /api/v1/rooms/:id             (admin)
GET    /api/v1/rooms/:id/occupants

ACADEMIC YEARS
GET    /api/v1/academic-years
POST   /api/v1/academic-years        (admin)
PATCH  /api/v1/academic-years/:id/set-active

ALLOCATION CYCLES
GET    /api/v1/cycles
POST   /api/v1/cycles                (admin)
GET    /api/v1/cycles/:id
PATCH  /api/v1/cycles/:id/advance-status
POST   /api/v1/cycles/:id/upload-sgpa
GET    /api/v1/cycles/:id/merit-list
POST   /api/v1/cycles/:id/generate-merit-list
POST   /api/v1/cycles/:id/preferences  (student: wants hostel yes/no)
POST   /api/v1/cycles/:id/select-room  (student: select room from available)
POST   /api/v1/cycles/:id/decline      (student: decline their slot)

ALLOCATIONS
GET    /api/v1/allocations
POST   /api/v1/allocations           (admin: manual assign)
DELETE /api/v1/allocations/:id       (admin: de-allocate)

MOVEMENT LOGS
GET    /api/v1/movements
POST   /api/v1/movements             (student: log OUT)
PATCH  /api/v1/movements/:id/return  (student: log IN)
GET    /api/v1/movements/my          (student: own history)
GET    /api/v1/movements/overdue     (warden/admin)
GET    /api/v1/movements/export      (CSV)

LEAVE REQUESTS
GET    /api/v1/leaves
POST   /api/v1/leaves                (student)
GET    /api/v1/leaves/:id
PATCH  /api/v1/leaves/:id/approve   (warden/admin)
PATCH  /api/v1/leaves/:id/reject    (warden/admin)
GET    /api/v1/leaves/my             (student)
GET    /api/v1/leaves/export         (CSV)

COMPLAINTS
GET    /api/v1/complaints
POST   /api/v1/complaints            (student)
GET    /api/v1/complaints/:id
PATCH  /api/v1/complaints/:id/assign  (warden: assign to staff)
PATCH  /api/v1/complaints/:id/status  (warden/maintenance)
PATCH  /api/v1/complaints/:id/resolve (warden)
GET    /api/v1/complaints/my          (student)
GET    /api/v1/complaints/assigned    (maintenance staff)

NOTIFICATIONS
GET    /api/v1/notifications
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
POST   /api/v1/notifications/broadcast (admin/warden)

ANALYTICS
GET    /api/v1/analytics/overview
GET    /api/v1/analytics/occupancy
GET    /api/v1/analytics/movements
GET    /api/v1/analytics/leaves
GET    /api/v1/analytics/complaints

AUDIT
GET    /api/v1/audit-logs            (admin only)

HEALTH
GET    /api/v1/health
GET    /api/v1/health/db
```

### 8.4 Query Parameters (Standard)
```
?page=1&limit=20          - Pagination
?sort=created_at&order=desc  - Sorting
?search=priya             - Search
?status=PENDING           - Filter by status
?from=2026-01-01&to=2026-05-12  - Date range
?year=2&branch=CS         - Specific filters
```

---

## 9. Frontend Architecture

### 9.1 App Structure by Role

```
Landing Page (/)
  └─ Login (/login)
        └─ Admin Dashboard (/admin/...)
        └─ Warden Dashboard (/warden/...)
        └─ Student Dashboard (/student/...)
        └─ Maintenance Dashboard (/maintenance/...)
```

### 9.2 State Management

**Server State:** TanStack Query (React Query)
- All API data: leave requests, complaints, rooms, students
- Automatic caching, background refetch, stale-while-revalidate
- Optimistic updates for status changes
- Infinite scroll for logs

**Client State:** Zustand
- Auth state (user info, access token)
- UI state (sidebar open, active filters)
- Notification bell count

**Form State:** React Hook Form + Zod

### 9.3 API Layer

```typescript
// Centralized Axios instance
// src/api/client.ts

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // for refresh token cookie
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 9.4 Route Guards

```
<ProtectedRoute requiredRole="ADMIN">
  <AdminDashboard />
</ProtectedRoute>

<AllocationGuard cycleStatus="ROOM_SELECTION">
  <RoomSelectionPage />
</AllocationGuard>
```

---

## 10. Security Architecture

### 10.1 Backend Security Checklist

```typescript
// Security middleware stack (in order)
app.use(helmet());                          // Security headers
app.use(cors({ origin: WHITELIST }));       // CORS whitelist only
app.use(express.json({ limit: '10kb' }));  // Payload size limit
app.use(hpp());                             // HTTP param pollution
app.use(mongoSanitize());                   // NoSQL injection (if any)

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,              // 15 min window
  max: 10,                                // 10 attempts
  message: 'Too many login attempts',
});
app.use('/api/v1/auth/login', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,                               // 300 req/15min per IP
});
app.use('/api/v1', apiLimiter);
```

### 10.2 Helmet Configuration

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

### 10.3 Input Validation (Zod, server-side)

```typescript
// Every route has a Zod schema
const createLeaveSchema = z.object({
  body: z.object({
    type: z.enum(['HOME','MEDICAL','EMERGENCY','EVENT']),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().min(10).max(500),
    emergencyContact: z.string().regex(/^[0-9]{10}$/).optional(),
  })
});

// Middleware validates before controller
router.post('/leaves', authenticate, authorize('STUDENT'), 
  validate(createLeaveSchema), leaveController.create);
```

### 10.4 Environment Variables (Required at startup)

```env
# Server
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://pccoehostelhub.vercel.app

# Database
DB_HOST=
DB_PORT=3306
DB_NAME=hostelhub
DB_USER=
DB_PASSWORD=

# JWT
JWT_ACCESS_SECRET=       # 64+ char random string
JWT_REFRESH_SECRET=      # 64+ char random string (different)
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@hostelhub.pccoe.ac.in

# Storage (for photo uploads)
CLOUDINARY_URL=          # or S3 credentials
```

Server startup validates all required vars via Zod — if any are missing, process exits with a clear error.

---

## 11. Folder Structure

### 11.1 Backend
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Sequelize config
│   │   ├── env.ts              # Zod env validation
│   │   └── constants.ts
│   ├── controllers/            # Thin — parse req, call service, return res
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── room.controller.ts
│   │   ├── allocation.controller.ts
│   │   ├── movement.controller.ts
│   │   ├── leave.controller.ts
│   │   ├── complaint.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── notification.controller.ts
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── allocation.service.ts
│   │   ├── merit.service.ts    # SGPA processing, rank generation
│   │   ├── movement.service.ts
│   │   ├── leave.service.ts
│   │   ├── complaint.service.ts
│   │   ├── notification.service.ts
│   │   └── analytics.service.ts
│   ├── repositories/           # DB access only — Sequelize queries
│   │   ├── user.repository.ts
│   │   ├── student.repository.ts
│   │   ├── room.repository.ts
│   │   ├── allocation.repository.ts
│   │   ├── movement.repository.ts
│   │   ├── leave.repository.ts
│   │   ├── complaint.repository.ts
│   │   └── notification.repository.ts
│   ├── models/                 # Sequelize models
│   │   ├── User.ts
│   │   ├── Student.ts
│   │   ├── Room.ts
│   │   ├── AcademicYear.ts
│   │   ├── AllocationCycle.ts
│   │   ├── MeritEntry.ts
│   │   ├── Allocation.ts
│   │   ├── MovementLog.ts
│   │   ├── LeaveRequest.ts
│   │   ├── Complaint.ts
│   │   ├── RefreshToken.ts
│   │   ├── Notification.ts
│   │   ├── AuditLog.ts
│   │   └── index.ts            # associations
│   ├── middleware/
│   │   ├── authenticate.ts     # JWT verify
│   │   ├── authorize.ts        # Role check
│   │   ├── validate.ts         # Zod middleware
│   │   ├── requestLogger.ts    # Winston + request ID
│   │   ├── errorHandler.ts     # Global error handler
│   │   └── auditLogger.ts      # Auto audit on mutations
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── room.routes.ts
│   │   ├── allocation.routes.ts
│   │   ├── movement.routes.ts
│   │   ├── leave.routes.ts
│   │   ├── complaint.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── notification.routes.ts
│   ├── validators/             # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── leave.schema.ts
│   │   ├── complaint.schema.ts
│   │   ├── movement.schema.ts
│   │   └── allocation.schema.ts
│   ├── utils/
│   │   ├── logger.ts           # Winston instance
│   │   ├── jwt.ts              # Sign/verify helpers
│   │   ├── hash.ts             # bcrypt helpers
│   │   ├── pagination.ts
│   │   ├── gatePassRef.ts      # GP reference generator
│   │   └── response.ts         # Standard response builder
│   ├── helpers/
│   │   ├── csvParser.ts        # Bulk import CSV
│   │   ├── emailSender.ts      # Nodemailer wrapper
│   │   └── fileUpload.ts       # Multer + Cloudinary
│   ├── types/
│   │   ├── express.d.ts        # Extend Request type
│   │   ├── api.types.ts
│   │   └── models.types.ts
│   ├── jobs/
│   │   └── overdueScan.ts      # Cron: scan overdue movements
│   ├── constants/
│   │   └── index.ts
│   ├── migrations/             # Sequelize migrations
│   ├── seeders/                # Sequelize seeders
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── app.ts
├── .env.development
├── .env.production
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### 11.2 Frontend
```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── user.api.ts
│   │   ├── room.api.ts
│   │   ├── allocation.api.ts
│   │   ├── movement.api.ts
│   │   ├── leave.api.ts
│   │   ├── complaint.api.ts
│   │   ├── analytics.api.ts
│   │   └── notification.api.ts
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── common/             # Shared: Table, Modal, Badge, etc.
│   │   ├── layout/             # Sidebar, Header, Breadcrumb
│   │   ├── forms/              # Reusable form components
│   │   └── charts/             # Analytics charts (recharts)
│   ├── pages/
│   │   ├── auth/               # Login, ForgotPassword
│   │   ├── admin/              # All admin pages
│   │   ├── warden/             # All warden pages
│   │   ├── student/            # All student pages
│   │   └── maintenance/
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── WardenLayout.tsx
│   │   └── StudentLayout.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLeaves.ts
│   │   ├── useComplaints.ts
│   │   ├── useMovements.ts
│   │   ├── useNotifications.ts
│   │   └── useAllocation.ts
│   ├── store/
│   │   ├── authStore.ts        # Zustand: user, token
│   │   └── uiStore.ts          # Zustand: sidebar, theme
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── validators/
│   │   ├── auth.schema.ts      # Zod (same schemas as backend where possible)
│   │   ├── leave.schema.ts
│   │   └── complaint.schema.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   └── enums.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── cn.ts               # Tailwind merge
│   │   └── errorParser.ts
│   ├── constants/
│   │   └── index.ts
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── assets/
│   │   └── pccoe-logo.svg
│   ├── styles/
│   │   └── globals.css
│   └── tests/
├── .env.development
├── .env.production
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 12. Tech Stack & Library Decisions

### 12.1 Backend

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| express | 4.x | HTTP server | Industry standard |
| sequelize | 6.x | ORM | Great TypeScript support |
| sequelize-cli | 6.x | Migrations/Seeders | Proper DB management |
| zod | 3.x | Validation | TypeScript-first, composable |
| jsonwebtoken | 9.x | JWT | Standard |
| bcrypt | 5.x | Password hashing | Battle-tested |
| helmet | 7.x | Security headers | Industry standard |
| cors | 2.x | CORS | |
| express-rate-limit | 7.x | Rate limiting | |
| hpp | 0.2.x | HTTP param pollution | |
| winston | 3.x | Logging | Flexible, production-ready |
| morgan | 1.x | HTTP request logging | |
| multer | 1.x | File uploads | |
| cloudinary | 2.x | Cloud storage | Free tier generous |
| nodemailer | 6.x | Email | |
| node-cron | 3.x | Scheduled jobs | |
| compression | 1.x | gzip responses | |
| uuid | 9.x | UUID generation | |
| csv-parser | 3.x | Bulk CSV import | |

### 12.2 Frontend

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| react | 18.x | UI | |
| typescript | 5.x | Types | |
| vite | 5.x | Build tool | Fast, modern |
| react-router-dom | 6.x | Routing | |
| @tanstack/react-query | 5.x | Server state | Best-in-class |
| zustand | 4.x | Client state | Simple, no boilerplate |
| axios | 1.x | HTTP client | |
| react-hook-form | 7.x | Forms | Performant |
| zod | 3.x | Validation | Same as backend |
| @hookform/resolvers | 3.x | Zod + RHF bridge | |
| tailwindcss | 3.x | Styling | |
| shadcn/ui | latest | Component system | Accessible, customizable |
| recharts | 2.x | Charts | Simple, declarative |
| react-hot-toast | 2.x | Toast notifications | |
| date-fns | 3.x | Date formatting | |
| lucide-react | 0.x | Icons | Clean, consistent |
| @tanstack/react-table | 8.x | Data tables | Headless, powerful |

---

## 13. Hosting & Infrastructure

### 13.1 Recommended Stack (Free/Low Cost)

| Service | Platform | Why |
|---------|----------|-----|
| Frontend | **Vercel** | Already using, excellent for React, free |
| Backend | **Render** | Already using, free tier, auto-deploy from GitHub |
| Database | **Railway** | Already using; OR switch to **PlanetScale** (MySQL, free tier, better DX) |
| File Storage | **Cloudinary** | Free 25GB, perfect for student photos and complaint images |
| Email | **Gmail SMTP** + **Brevo** (free 300/day) | Reliable, free |
| Monitoring | **Better Uptime** (free) | Uptime alerts |
| Logs | **Logtail** or file logs on Render | Free tier |

### 13.2 Alternative Database Hosting

| Platform | Free Tier | MySQL | Recommendation |
|----------|-----------|-------|----------------|
| Railway | $5/month after trial | ✅ | Currently using — acceptable |
| PlanetScale | Free (5GB) | ✅ | **Best MySQL hosting** for students |
| Aiven | Free 1GB | ✅ | Good alternative |
| Clever Cloud | Free (256MB) | ✅ | Small scale only |
| Supabase | Free (500MB) | PostgreSQL | Switch to PG if desired |

**Recommendation:** Switch from Railway MySQL to **PlanetScale** for the database. It offers:
- Branching (dev/prod DB branches like git)
- Connection pooling built-in
- No cold start (Railway has this issue)
- Better free tier

### 13.3 Custom Domain

Deploy to: `hostelhub.pccoe.ac.in` (request from college IT)
Backend API: `api.hostelhub.pccoe.ac.in`

Both Vercel and Render support custom domains with free SSL.

---

## 14. CI/CD & DevOps

### 14.1 GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  build:
    needs: [lint-and-typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Trigger Render deploy hook"
      # Render auto-deploys on push to main
```

### 14.2 Git Branch Strategy

```
main          → Production (Vercel + Render auto-deploy)
develop       → Staging
feature/*     → Feature branches (PR into develop)
fix/*         → Bug fixes
```

### 14.3 Commit Convention

```
feat: add merit list generation
fix: correct room occupancy count on deallocation
refactor: extract allocation logic to service
chore: update dependencies
docs: add API documentation for leaves endpoint
test: add integration tests for auth flow
```

### 14.4 Docker (for local development)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/app.js"]
```

```yaml
# docker-compose.yml (development)
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: hostelhub_dev
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    env_file: ./backend/.env.development
    ports:
      - "5000:5000"
    depends_on:
      - db
```

---

## 15. Design System & UI Guidelines

### 15.1 PCCOE Color Palette

```css
/* Primary — PCCOE Navy Blue */
--color-primary-50:  #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-500: #1e40af;   /* Main brand */
--color-primary-600: #1d3a9f;
--color-primary-700: #1e3a8a;   /* Dark variant */
--color-primary-900: #172554;

/* Secondary — PCCOE Gold/Saffron */
--color-secondary-400: #f59e0b;
--color-secondary-500: #d97706;

/* Semantic */
--color-success: #16a34a;
--color-warning: #d97706;
--color-error:   #dc2626;
--color-info:    #0284c7;
```

### 15.2 Typography

- **Headings:** `Plus Jakarta Sans` (clean, modern, professional)
- **Body:** `Inter` (readable, standard)
- **Code/Data:** `JetBrains Mono`

### 15.3 Component Principles

- Every action has a loading state
- Every list has an empty state with illustration
- Every error has a retry option
- Mobile-first responsive (breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px)
- Dark mode support via Tailwind `dark:` classes
- Accessibility: WCAG 2.1 AA minimum
- All interactive elements have focus rings
- All icons have aria-label

### 15.4 Key UI Patterns

- **Data Tables:** Sortable, filterable, paginated, with bulk actions
- **Status Badges:** Color-coded pill components (PENDING=yellow, APPROVED=green, etc.)
- **Timeline:** For audit history, complaint lifecycle
- **Room Grid:** Visual floor plan with color-coded availability
- **Merit List:** Ranked table with SGPA, status, selection progress
- **Skeleton Loaders:** For every loading state (no spinners alone)

---

## 16. Development Roadmap (Sprints)

### Phase 1: Foundation (Week 1–2)
- [ ] Project scaffold (monorepo structure)
- [ ] Environment configuration + Zod validation
- [ ] Database setup (Railway/PlanetScale)
- [ ] All Sequelize models + associations
- [ ] All migrations
- [ ] Seed data (admin user, sample rooms)
- [ ] Winston logging setup
- [ ] Global error handler
- [ ] Health check endpoint
- [ ] Docker compose for local dev

### Phase 2: Auth & Users (Week 3)
- [ ] Auth routes (login, refresh, logout)
- [ ] Access + refresh token system
- [ ] Role-based middleware
- [ ] User management (CRUD + bulk CSV import)
- [ ] Frontend: Login page + token refresh interceptor
- [ ] Frontend: Protected routes by role
- [ ] Frontend: Auth store (Zustand)

### Phase 3: Core Student Features (Week 4–5)
- [ ] Movement Log module (full)
- [ ] Leave Request module (full)
- [ ] Complaint module (full)
- [ ] Notification system
- [ ] Student dashboard + profile page

### Phase 4: Admin & Room Allocation (Week 6–7) ← Most Complex
- [ ] Room management (CRUD)
- [ ] Academic year management
- [ ] Allocation cycle state machine
- [ ] SGPA upload + merit list generation
- [ ] Preference collection workflow
- [ ] Student room selection (time-windowed)
- [ ] Admin manual override
- [ ] Admin dashboard

### Phase 5: Warden Features (Week 8)
- [ ] Warden dashboard
- [ ] Leave approval/rejection UI
- [ ] Complaint management UI
- [ ] Movement monitoring + overdue alerts
- [ ] Analytics dashboard

### Phase 6: Analytics, Export & Polish (Week 9)
- [ ] Full analytics module
- [ ] CSV/PDF export
- [ ] Audit log UI (admin)
- [ ] Notification center
- [ ] Email notifications
- [ ] Dark mode

### Phase 7: Testing, Security Audit & Deploy (Week 10)
- [ ] Backend unit tests (services + repositories)
- [ ] API integration tests (supertest)
- [ ] Frontend component tests (vitest + RTL)
- [ ] Security audit (run npm audit, check all headers)
- [ ] GitHub Actions CI pipeline
- [ ] Final production deployment
- [ ] Documentation

---

## 17. Testing Strategy

### 17.1 Backend Tests (Jest + Supertest)

```
tests/
├── unit/
│   ├── merit.service.test.ts      # SGPA ranking logic
│   ├── allocation.service.test.ts # Cycle state transitions
│   ├── leave.service.test.ts
│   └── auth.service.test.ts
├── integration/
│   ├── auth.test.ts               # Full login flow
│   ├── leave.test.ts              # Submit → Approve lifecycle
│   ├── complaint.test.ts
│   └── allocation.test.ts
```

**Coverage target:** 70%+ on services, 90%+ on critical paths (auth, allocation)

### 17.2 Frontend Tests (Vitest + RTL)

```
tests/
├── components/
│   ├── LeaveForm.test.tsx
│   ├── RoomGrid.test.tsx
│   └── MeritList.test.tsx
├── hooks/
│   └── useAuth.test.ts
```

---

## 18. Copyright & Legal

### 18.1 Copyright Notice

```
Copyright © 2026 HostelHub — PCET's Pimpri Chinchwad College of Engineering
Developed by: Piyush Patil, Pranali Patil, Sayali Pawar
Department of Computer Engineering, PCCOE, Nigdi, Pune - 411044

This software is developed exclusively for PCCOE Girls' Hostel.
All rights reserved. Unauthorized copying, distribution, or modification
of this software is strictly prohibited.

Contact: hostelhub@pccoe.ac.in
```

Add this to:
- `README.md` header
- All source files (abbreviated comment header)
- Login page footer
- PDF exports
- Admin settings page

### 18.2 License

Use a **proprietary license** (not MIT/GPL) since this is intended for exclusive institutional use. Create a `LICENSE.txt`:

```
PROPRIETARY SOFTWARE LICENSE

This software ("HostelHub") is the exclusive intellectual property of
Piyush Rajkumar Patil, Pranali Rajendra Patil, and Sayali Rajesh Pawar,
developed under the guidance of Prof. Shraddha Ovale at PCCOE, Pune.

Permission is granted solely to PCET's Pimpri Chinchwad College of 
Engineering to use this software for hostel management operations.

No part of this software may be reproduced, distributed, modified, 
sub-licensed, or used commercially without explicit written permission 
from the copyright holders.
```

### 18.3 Before Going Live Checklist

- [ ] All `.env` files in `.gitignore`
- [ ] No hardcoded secrets in codebase (audit with `git log -S "secret"`)
- [ ] HTTPS enforced everywhere
- [ ] Database backups configured (Railway/PlanetScale auto-backups)
- [ ] Rate limiting active on all auth routes
- [ ] Error messages don't expose internal stack traces
- [ ] All file uploads validated (type, size, sanitized filename)
- [ ] CORS whitelist to production domain only
- [ ] Audit log records all sensitive actions
- [ ] Admin password changed from default seed
- [ ] SSL certificate valid

---

## Summary: What We're Building

HostelHub v2.0 is not a student project anymore. It is a **real SaaS-grade institutional management system** that:

1. **Replaces physical registers** with a traceable, searchable digital system
2. **Enforces fairness** in room allocation through automated merit ranking with zero scope for manual bias
3. **Creates accountability** with full audit logs of every action
4. **Scales** from 50 to 500+ students without architectural changes
5. **Protects data** with enterprise-grade security (JWT rotation, rate limiting, HTTPS, input validation)
6. **Works on any device** with responsive, accessible design
7. **Can be maintained** by any developer due to clean architecture and documentation

When a warden approves a leave, when an admin uploads SGPA data, when a student selects a room — every action is logged, validated, role-checked, and reversible by an admin. No ambiguity. No manipulation. Full transparency.

This is the system PCCOE Girls' Hostel deserves.

---

*Document prepared for HostelHub v2.0 development.  
Next step: Begin Phase 1 — Foundation Sprint.*
