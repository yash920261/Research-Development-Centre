# R&D Center Website Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│                                                                   │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │     Pages     │  │  Components  │  │   Auth Context       │ │
│  │               │  │              │  │                      │ │
│  │ - Faculty     │  │ - Dialogs    │  │ - Login/Signup      │ │
│  │ - Forum       │  │ - Forms      │  │ - Session Mgmt      │ │
│  │ - Home        │  │ - Cards      │  │ - User State        │ │
│  └───────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│          │                  │                     │              │
│          └──────────────────┼─────────────────────┘              │
│                             │                                    │
│                   ┌─────────▼──────────┐                        │
│                   │  Service Layer     │                        │
│                   │                    │                        │
│                   │ - faculty.service  │                        │
│                   │ - forum.service    │                        │
│                   │ - project.service  │                        │
│                   └─────────┬──────────┘                        │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Supabase Client    │
                   │  (lib/supabase.ts)  │
                   └──────────┬──────────┘
                              │
═══════════════════════════════════════════════════════════════════
                              │
                   ┌──────────▼──────────┐
                   │      SUPABASE       │
                   │                     │
                   │  ┌───────────────┐  │
                   │  │     Auth      │  │
                   │  │               │  │
                   │  │ - Users       │  │
                   │  │ - Sessions    │  │
                   │  │ - Tokens      │  │
                   │  └───────────────┘  │
                   │                     │
                   │  ┌───────────────┐  │
                   │  │   Database    │  │
                   │  │               │  │
                   │  │ - profiles    │  │
                   │  │ - faculty     │  │
                   │  │ - forum_*     │  │
                   │  │ - projects    │  │
                   │  └───────────────┘  │
                   │                     │
                   │  ┌───────────────┐  │
                   │  │      RLS      │  │
                   │  │               │  │
                   │  │ - Policies    │  │
                   │  │ - Triggers    │  │
                   │  │ - Functions   │  │
                   │  └───────────────┘  │
                   └─────────────────────┘
```

## Data Flow Diagram

### 1. User Authentication Flow

```
User Sign Up/Login
       │
       ▼
Auth Context (contexts/auth-context.tsx)
       │
       ├─► supabase.auth.signUp()
       │   or
       └─► supabase.auth.signInWithPassword()
       │
       ▼
Supabase Auth
       │
       ├─► Creates auth.users record
       ├─► Trigger: handle_new_user()
       └─► Creates profiles record
       │
       ▼
Session & User State Updated
       │
       ▼
Components Re-render with User Data
```

### 2. Faculty CRUD Flow (Admin Only)

```
Admin User Action (Add/Edit/Delete Faculty)
       │
       ▼
Component (add-faculty-dialog.tsx, etc.)
       │
       ▼
Service Layer (lib/services/faculty.service.ts)
       │
       ├─► facultyService.create(data)
       ├─► facultyService.update(id, data)
       └─► facultyService.delete(id)
       │
       ▼
Supabase Client
       │
       ▼
RLS Policy Check
       │
       ├─► Is user admin? (Check profiles.role)
       │   │
       │   ├─► Yes: Allow operation
       │   └─► No: Deny (403 error)
       │
       ▼
Database Operation
       │
       ▼
Response to Service
       │
       ▼
Component Updates UI + Toast Notification
```

### 3. Forum Topic Creation Flow

```
Authenticated User Creates Topic
       │
       ▼
Component (new-discussion-form.tsx)
       │
       ▼
Service Layer (lib/services/forum.service.ts)
       │
       └─► forumService.createTopic(data)
       │
       ▼
Supabase Client
       │
       ▼
RLS Policy Check
       │
       ├─► Is user authenticated?
       │   │
       │   ├─► Yes: Allow insert
       │   └─► No: Deny
       │
       ▼
Insert into forum_topics
       │
       ▼
Return created topic
       │
       ▼
Component Updates UI + Redirects
```

### 4. Project Submission Flow

```
Anyone Submits Project (No Auth Required)
       │
       ▼
Component (project-submission-form.tsx)
       │
       ▼
Service Layer (lib/services/project.service.ts)
       │
       └─► projectService.submit(data)
       │
       ▼
Supabase Client
       │
       ▼
RLS Policy Check
       │
       └─► Public insert allowed
       │
       ▼
Insert into project_submissions
       │
       ▼
Return submission record
       │
       ▼
Component Shows Success Message
```

## Database Schema Relationships

```
auth.users (Supabase)
    │
    │ 1:1
    ├─────────► profiles
    │           - id (FK to auth.users.id)
    │           - email
    │           - name
    │           - role (student/admin)
    │           - department
    │
    │ 1:N
    ├─────────► forum_topics
    │           - author_id (FK)
    │           - title, content
    │           - category, tags
    │           - views, likes
    │           │
    │           │ 1:N
    │           ├─────► forum_replies
    │           │       - topic_id (FK)
    │           │       - author_id (FK)
    │           │       - content, likes
    │           │
    │           └─────► forum_likes
    │                   - topic_id (FK)
    │                   - user_id (FK)
    │
    └─────────► forum_likes
                - reply_id (FK)
                - user_id (FK)

faculty (Independent)
    - id (UUID, Primary Key)
    - name, email, department
    - research_interests, projects
    - web_profile (JSONB)
    - analytics (JSONB)

project_submissions (Independent)
    - id (UUID, Primary Key)
    - name, email, department
    - project_title, description
    - status (pending/approved/rejected)
```

## Security Architecture (RLS)

```
┌─────────────────────────────────────────┐
│         Row Level Security              │
├─────────────────────────────────────────┤
│                                         │
│  Public Read Access:                    │
│  ├─ faculty (all columns)               │
│  ├─ forum_topics (all columns)          │
│  ├─ forum_replies (all columns)         │
│  └─ forum_likes (count only)            │
│                                         │
│  Authenticated User Access:             │
│  ├─ CREATE forum_topics                 │
│  ├─ CREATE forum_replies                │
│  ├─ CREATE/DELETE own forum_likes       │
│  ├─ UPDATE own forum posts              │
│  ├─ DELETE own forum posts              │
│  └─ INSERT project_submissions          │
│                                         │
│  Admin Only Access:                     │
│  ├─ CREATE faculty                      │
│  ├─ UPDATE faculty                      │
│  ├─ DELETE faculty                      │
│  ├─ SELECT all project_submissions      │
│  └─ UPDATE project_submission.status    │
│                                         │
│  Policy Enforcement:                    │
│  - Check auth.uid() for user identity   │
│  - Join profiles table to verify role   │
│  - Validate ownership for updates       │
│  - Block unauthorized access            │
└─────────────────────────────────────────┘
```

## Service Layer Structure

```
lib/services/
│
├── faculty.service.ts
│   ├── getAll()              → SELECT all faculty
│   ├── getById(id)           → SELECT where id
│   ├── create(data)          → INSERT (admin only)
│   ├── update(id, data)      → UPDATE (admin only)
│   ├── delete(id)            → DELETE (admin only)
│   ├── search(query)         → SELECT with LIKE
│   ├── filterByDepartment()  → SELECT where department
│   └── incrementAnalytics()  → UPDATE analytics JSONB
│
├── forum.service.ts
│   ├── getAllTopics()        → SELECT all topics
│   ├── getTopicById(id)      → SELECT topic + replies
│   ├── createTopic(data)     → INSERT topic (auth required)
│   ├── createReply(data)     → INSERT reply (auth required)
│   ├── incrementViews(id)    → UPDATE views counter
│   ├── toggleTopicLike()     → INSERT/DELETE like
│   ├── toggleReplyLike()     → INSERT/DELETE like
│   ├── searchTopics(query)   → SELECT with LIKE
│   └── filterByCategory()    → SELECT where category
│
└── project.service.ts
    ├── submit(data)          → INSERT (public)
    ├── getAll()              → SELECT all (admin only)
    ├── getByEmail(email)     → SELECT where email
    ├── updateStatus(id)      → UPDATE status (admin only)
    └── getById(id)           → SELECT where id
```

## Technology Stack

```
Frontend:
├── Next.js 14 (React Framework)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
├── Radix UI (Component Library)
└── Sonner (Toast Notifications)

Backend:
├── Supabase (BaaS)
│   ├── PostgreSQL (Database)
│   ├── PostgREST (Auto API)
│   ├── GoTrue (Authentication)
│   └── Realtime (WebSockets)

State Management:
├── React Context (Auth)
└── Component State (UI)

Data Layer:
├── Supabase JS Client
└── Custom Service Functions
```

## Deployment Architecture

```
┌──────────────────────────────────────┐
│         Vercel / Netlify             │
│                                      │
│  Next.js Application                 │
│  - Static Generation                 │
│  - Server Components                 │
│  - Client Components                 │
│  - API Routes                        │
└───────────────┬──────────────────────┘
                │
                │ HTTPS
                │
┌───────────────▼──────────────────────┐
│           Supabase Cloud             │
│                                      │
│  - Database (PostgreSQL)             │
│  - Auth Service                      │
│  - Realtime Engine                   │
│  - Storage (if used)                 │
│  - Edge Functions (if used)          │
└──────────────────────────────────────┘
```

## Performance Optimizations

```
Database Level:
├── Indexes on frequently queried columns
│   ├── faculty.department
│   ├── faculty.email
│   ├── forum_topics.created_at
│   ├── forum_topics.category
│   └── forum_replies.topic_id
│
├── Efficient JOIN operations
├── JSONB indexing for analytics
└── Connection pooling

Application Level:
├── React Server Components
├── Lazy loading
├── Optimistic UI updates
└── Client-side caching

Network Level:
├── CDN distribution
├── Edge caching
└── Compression
```

---

This architecture provides:
- ✅ Scalable backend
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Real-time capabilities (ready)
- ✅ Type-safe operations
- ✅ Production-ready infrastructure
