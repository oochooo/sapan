# Sapan.io MVP Specification

> Thailand's data-driven Startup ecosystem enablement platform

**Date:** January 7, 2026
**Status:** Approved for Development

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [User Types & Auth](#user-types--auth)
4. [Data Models](#data-models)
5. [Industry Taxonomy](#industry-taxonomy)
6. [API Endpoints](#api-endpoints)
7. [Frontend Pages](#frontend-pages)
8. [Connection Flow](#connection-flow)
9. [Out of Scope](#out-of-scope)

---

## Overview

### Problem
Thailand's startup ecosystem is fragmented. Founders outside Bangkok lack access to mentorship, and information asymmetry slows capital deployment.

### Solution (MVP)
A web platform connecting **Founders** with **Mentors** through:
- Profile creation with industry tags
- Filtered discovery/browsing
- Connection request system

### Success Criteria
- Local working prototype via Docker
- Full flow: Signup → Profile → Browse → Request → Accept

---

## Tech Stack

```
sapan/
├── frontend/          # Next.js 14 (App Router, TypeScript, Tailwind) - USER PROVIDED
├── backend/           # Django 5 + Django REST Framework
├── docker-compose.yml # Development environment
├── docker-compose.prod.yml # Production environment
├── .env.example       # Environment template
└── MVP_SPECIFICATION.md
```

### Backend Stack
- **Framework:** Django 5.0+
- **API:** Django REST Framework
- **Database:** PostgreSQL 15
- **Auth:** Django REST Framework SimpleJWT (or session-based)
- **Container:** Docker

### Frontend Stack (User Provided)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### Infrastructure
- **Dev:** Docker Compose (hot reload enabled)
- **Prod:** Docker Compose (optimized builds)
- **Deployment:** Manual VPS deployment

---

## User Types & Auth

### User Types

| Type | Description | Signup Flow |
|------|-------------|-------------|
| **Founder** | Startup founders seeking mentorship | Signup → Active immediately |
| **Mentor** | Experienced professionals offering guidance | Signup → Pending → Admin approves |

### Authentication

| Feature | Implementation |
|---------|----------------|
| Method | Email + Password |
| Token | JWT (access + refresh) |
| Session | Optional for frontend |

### Mentor Approval Flow

```
1. Mentor signs up → status = "pending"
2. Admin reviews in Django Admin
3. Admin sets status = "approved" or "rejected"
4. If approved → Mentor appears in directory
```

**Future Enhancement (deferred):**
- When mentor quota is full → switch to invite-only
- Mentor accountability (auto-deactivate if ignoring requests)

---

## Data Models

### User Model (Custom)

```python
class User(AbstractUser):
    email = EmailField(unique=True)
    user_type = CharField(choices=['founder', 'mentor'])
    profile_photo = ImageField(nullable=True)
    bio = TextField(nullable=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    # Mentor-specific
    is_approved = BooleanField(default=False)  # Only for mentors
```

### Founder Profile

```python
class FounderProfile(Model):
    user = OneToOneField(User)
    startup_name = CharField(max_length=200)
    industry = ForeignKey(IndustrySubcategory)
    stage = CharField(choices=STAGE_CHOICES)
    objectives = ManyToManyField(Objective)
    about_startup = TextField()
```

**Stage Choices:**
- `idea` - Idea Stage
- `pre_seed` - Pre-seed
- `seed` - Seed
- `series_a` - Series A
- `growth` - Growth

### Mentor Profile

```python
class MentorProfile(Model):
    user = OneToOneField(User)
    company = CharField(max_length=200)
    role = CharField(max_length=200)
    years_of_experience = IntegerField()
    expertise_industries = ManyToManyField(IndustrySubcategory)
    can_help_with = ManyToManyField(Objective)
```

### Industry Taxonomy

```python
class IndustryCategory(Model):
    name = CharField(max_length=100)
    slug = SlugField(unique=True)

class IndustrySubcategory(Model):
    category = ForeignKey(IndustryCategory)
    name = CharField(max_length=100)
    slug = SlugField(unique=True)
```

### Objective

```python
class Objective(Model):
    name = CharField(max_length=100)
    slug = SlugField(unique=True)
    category = CharField(choices=['fundraising', 'operations'])
```

### Connection Request

```python
class ConnectionRequest(Model):
    from_user = ForeignKey(User)  # Founder
    to_user = ForeignKey(User)    # Mentor
    message = TextField(nullable=True)
    status = CharField(choices=['pending', 'accepted', 'declined'])
    created_at = DateTimeField(auto_now_add=True)
    responded_at = DateTimeField(nullable=True)
```

---

## Industry Taxonomy

### Categories & Subcategories

| Category | Subcategories |
|----------|---------------|
| **SaaS/Software** | B2B, B2C, Enterprise, Developer Tools |
| **Marketplace/Platform** | B2B, B2C, P2P, Aggregator |
| **Consumer/D2C** | Subscription, E-commerce, App-based |
| **Hardware/IoT** | Consumer devices, Industrial, Wearables |
| **DeepTech/AI** | ML/AI, Blockchain, Robotics, Biotech |
| **FinTech** | Payments, Lending, InsurTech, WealthTech |
| **HealthTech** | Telemedicine, MedTech, Wellness |
| **EdTech** | K-12, Higher Ed, Corporate Training |
| **FoodTech/AgriTech** | Delivery, Farm-to-table, FoodScience |
| **Services** | Agency, Consulting, Freelance platform |

### Objectives

**Fundraising:**
- Fundraising strategy
- Investor introductions
- Pitch deck review

**Operations:**
- Product development
- Hiring & team building
- Go-to-market strategy
- Legal & compliance

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, get tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| POST | `/api/auth/logout/` | Logout (blacklist token) |
| GET | `/api/auth/me/` | Get current user |

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/founder/` | Get current founder profile |
| PUT | `/api/profiles/founder/` | Update founder profile |
| POST | `/api/profiles/founder/` | Create founder profile |
| GET | `/api/profiles/mentor/` | Get current mentor profile |
| PUT | `/api/profiles/mentor/` | Update mentor profile |
| POST | `/api/profiles/mentor/` | Create mentor profile |

### Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentors/` | List approved mentors (filterable) |
| GET | `/api/mentors/{id}/` | Get mentor detail |
| GET | `/api/founders/` | List founders (for mentors) |
| GET | `/api/founders/{id}/` | Get founder detail |

**Query Parameters for `/api/mentors/`:**
- `industry` - Filter by industry subcategory slug
- `objective` - Filter by objective slug
- `search` - Search by name, company, bio

### Connections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/connections/` | List my connections |
| GET | `/api/connections/requests/sent/` | My sent requests |
| GET | `/api/connections/requests/received/` | Requests I received |
| POST | `/api/connections/request/` | Send connection request |
| POST | `/api/connections/request/{id}/accept/` | Accept request |
| POST | `/api/connections/request/{id}/decline/` | Decline request |

### Reference Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/industries/` | List all industries (nested) |
| GET | `/api/objectives/` | List all objectives |
| GET | `/api/stages/` | List all stages |

---

## Frontend Pages

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing page |
| `/login` | Login | Email + password login |
| `/signup` | Signup | Registration with user type selection |

### Onboarding (Protected)

| Route | Page | Description |
|-------|------|-------------|
| `/onboarding` | Profile Setup | Multi-step form based on user type |

### Dashboard (Protected)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Overview, recent activity |
| `/profile` | My Profile | View/edit own profile |

### Discovery (Protected)

| Route | Page | Description |
|-------|------|-------------|
| `/mentors` | Browse Mentors | Filterable list (for founders) |
| `/mentors/[id]` | Mentor Detail | Full profile, send request |
| `/founders` | Browse Founders | Filterable list (for mentors) |
| `/founders/[id]` | Founder Detail | Full profile |

### Connections (Protected)

| Route | Page | Description |
|-------|------|-------------|
| `/connections` | My Connections | Accepted connections |
| `/requests` | Connection Requests | Sent/received requests |

---

## Connection Flow

### Founder → Mentor Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Founder]                              [Mentor]                │
│                                                                 │
│  1. Browse /mentors                                             │
│         │                                                       │
│         ▼                                                       │
│  2. View mentor profile                                         │
│         │                                                       │
│         ▼                                                       │
│  3. Click "Request Intro"                                       │
│         │                                                       │
│         ▼                                                       │
│  4. Add optional message ──────────────► 5. Sees in /requests   │
│         │                                        │               │
│         ▼                                        ▼               │
│  6. Status: "Pending"               7. Accept or Decline        │
│         │                                        │               │
│         │◄───────────────────────────────────────┘               │
│         ▼                                                       │
│  8. If Accepted:                                                │
│     - Both see in /connections                                  │
│     - Contact info revealed                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Connection States

| Status | Founder Sees | Mentor Sees |
|--------|--------------|-------------|
| `pending` | "Pending" badge | In /requests/received |
| `accepted` | In /connections | In /connections |
| `declined` | "Declined" (or hidden) | Removed from queue |

---

## Out of Scope (MVP)

The following are explicitly **NOT** included in this MVP:

| Feature | Reason |
|---------|--------|
| Investors / Deal Flow | Phase 2 - focus on founder-mentor first |
| Pitch deck uploads | Adds complexity, storage costs |
| In-app messaging/chat | Can use email/LinkedIn for now |
| Payments / Subscriptions | Monetization comes later |
| AI/NLP matching | Start with tag-based filtering |
| Email notifications | Manual check for now |
| Custom admin panel | Django admin is sufficient |
| Mentor accountability (auto-deactivate) | Deferred feature |
| Industry suggestion queue | Admin manually adds for now |
| Mobile app | Web-first |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgres://user:pass@db:5432/sapan
POSTGRES_USER=sapan
POSTGRES_PASSWORD=secret
POSTGRES_DB=sapan

# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=1440  # minutes (1 day)
```

---

## Next Steps

1. [ ] Set up Django backend project structure
2. [ ] Implement data models
3. [ ] Create API endpoints
4. [ ] Configure Django admin for mentor approval
5. [ ] Integrate with frontend (user-provided Next.js)
6. [ ] Set up Docker Compose (dev + prod)
7. [ ] Test full flow
8. [ ] Deploy to VPS

---

*Document created: January 7, 2026*
*Last updated: January 7, 2026*
