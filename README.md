# Sapan - Mentor-Founder Matching Platform

A platform connecting startup founders with experienced mentors in Thailand/SEA.

## Tech Stack

- **Backend**: Django 5.0, Django REST Framework, PostgreSQL
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand
- **Auth**: JWT (SimpleJWT) + Social Login (Google, LINE via django-allauth)
- **Infrastructure**: Docker Compose

## Quick Start

```bash
# Start all services
docker compose up -d

# Run migrations
docker compose exec backend python manage.py migrate

# Seed mock data (optional, for development)
docker compose exec backend python manage.py seed_data

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

## Project Structure

```
sapan/
├── backend/                 # Django backend
│   ├── sapan/              # Project settings
│   ├── users/              # Custom user model, auth views
│   ├── profiles/           # Founder & Mentor profiles
│   ├── industries/         # Reference data (industries, objectives, stages)
│   ├── connections/        # Connection requests between users
│   └── office_hours/       # Office hours booking system
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/           # Pages (App Router)
│       ├── components/    # React components
│       ├── lib/           # API client, auth store
│       └── types/         # TypeScript interfaces
└── docker-compose.yml
```

---

## Core Features

### 1. Authentication

**Social Login** (Google & LINE):
- Frontend redirects to OAuth provider
- Provider redirects to `/auth/callback/[provider]`
- Backend exchanges code for JWT tokens
- Tokens stored in localStorage

**Dev Login** (development only):
- `POST /api/auth/dev-login/` - Email/password login for mock users
- Only available when `DEBUG=True`

### 2. User Types

| Type | Description |
|------|-------------|
| `founder` | Startup founders looking for mentorship |
| `mentor` | Experienced professionals offering guidance |

Users select their type during onboarding after first login.

### 3. Profiles

**Founder Profile**:
- Startup name, industry, stage (idea → growth)
- Objectives (fundraising, operations help)
- About section

**Mentor Profile**:
- Company, role, years of experience
- Expertise industries
- Can help with (objectives)

### 4. Connections

Founders and mentors connect through requests:
- **Intents**: `mentor_me`, `collaborate`, `peer_network`
- **Statuses**: `pending` → `accepted` / `declined`
- Connected users can see each other's email and book office hours

### 5. Office Hours Booking

Allows founders to book time slots with connected mentors.

**For Mentors**:
- Set recurring availability (e.g., Mon/Wed 9am-12pm)
- Optionally connect Google Calendar for conflict checking
- View and manage bookings

**For Founders**:
- View available slots on mentor profiles
- Book slots with optional agenda
- Receive confirmation email with Google Meet link

---

## API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/google/` | Google OAuth login |
| POST | `/line/` | LINE OAuth login |
| POST | `/dev-login/` | Dev login (DEBUG only) |
| POST | `/complete-profile/` | Set user type |
| POST | `/refresh/` | Refresh JWT token |
| POST | `/logout/` | Logout (blacklist token) |
| GET | `/me/` | Get current user |
| PATCH | `/me/` | Update current user |

### Profiles (`/api/profiles/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/founder/` | Current user's founder profile |
| GET/POST | `/mentor/` | Current user's mentor profile |
| GET | `/mentors/` | List mentors (paginated, filterable) |
| GET | `/mentors/{id}/` | Get mentor detail |
| GET | `/founders/` | List founders (paginated, filterable) |
| GET | `/founders/{id}/` | Get founder detail |

### Connections (`/api/connections/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get accepted connections |
| GET | `/recent/` | Recent connections (public feed) |
| POST | `/request/` | Send connection request |
| GET | `/requests/sent/` | Sent requests |
| GET | `/requests/received/` | Received pending requests |
| POST | `/request/{id}/accept/` | Accept request |
| POST | `/request/{id}/decline/` | Decline request |

### Office Hours (`/api/office-hours/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/calendar/auth-url/` | Get Google Calendar OAuth URL |
| POST | `/calendar/callback/` | Exchange OAuth code for tokens |
| GET | `/calendar/status/` | Check calendar connection |
| DELETE | `/calendar/disconnect/` | Remove calendar connection |
| GET/POST | `/availability/` | List/create availability rules |
| PUT/DELETE | `/availability/{id}/` | Update/delete rule |
| GET | `/mentors/{id}/slots/` | Get available slots |
| GET/POST | `/bookings/` | List/create bookings |
| POST | `/bookings/{id}/cancel/` | Cancel booking |

### Reference Data (`/api/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/industries/` | Industry categories & subcategories |
| GET | `/objectives/` | Available objectives |
| GET | `/stages/` | Startup stages |

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with townhall feed |
| `/login` | Login (Google/LINE/Dev) |
| `/onboarding` | Select user type |
| `/dashboard` | User dashboard |
| `/profile` | Edit profile |
| `/settings` | Calendar & availability settings |
| `/mentors` | Browse mentors |
| `/mentors/[id]` | Mentor detail + booking |
| `/founders` | Browse founders |
| `/founders/[id]` | Founder detail |
| `/connections` | Accepted connections |
| `/requests` | Pending requests |
| `/bookings` | Office hours bookings |

---

## Development

### Mock Data

Seed test data for development:

```bash
docker compose exec backend python manage.py seed_data
```

**Test Accounts** (password: `mockpassword123`):
- Mentors: `mentor1@mock.sapan.io` through `mentor5@mock.sapan.io`
- Founders: `founder1@mock.sapan.io` through `founder3@mock.sapan.io`

Each founder is connected to mentors 1-3.

### Dev Login

1. Go to `/login`
2. Click "Show Dev Login"
3. Enter mock email and password

### Environment Variables

**Backend** (`.env` in project root):
```bash
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
POSTGRES_DB=sapan
POSTGRES_USER=sapan
POSTGRES_PASSWORD=secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_LINE_CHANNEL_ID=your-line-channel-id
```

---

## Office Hours System Details

### Data Models

**GoogleCalendarToken**: Stores mentor's calendar OAuth tokens (separate from login OAuth)

**AvailabilityRule**: Recurring availability
- `weekday`: 0 (Monday) - 6 (Sunday)
- `start_time`, `end_time`: TimeField
- `slot_duration_minutes`: Default 30
- `timezone`: Default "Asia/Bangkok"

**Booking**: Booked sessions
- `mentor`, `founder`: User FKs
- `start_time`, `end_time`: DateTimeField
- `agenda`: Optional text
- `google_meet_link`: Auto-generated
- `status`: confirmed | cancelled_by_founder | cancelled_by_mentor | completed

### Google Calendar Integration

Read-only integration for conflict checking:
1. Mentor connects calendar in Settings
2. When founders view slots, system checks mentor's calendar for conflicts
3. Busy times are marked as unavailable

### Email Notifications

Emails sent via AWS SES (currently mocked):
- Booking confirmation (both parties) with .ics attachment
- Cancellation notification
- 24-hour reminder (TODO: implement cron job)

### Google Meet Links

Auto-generated using deterministic hash:
```python
code = hashlib.md5(f"sapan-{booking_id}").hexdigest()[:10]
link = f"https://meet.google.com/{code[:3]}-{code[3:7]}-{code[7:]}"
```

---

## Deployment

### Production Checklist

- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up real email service (AWS SES)
- [ ] Configure production database
- [ ] Set up SSL/HTTPS
- [ ] Add Google Calendar redirect URI to Google Cloud Console
- [ ] Configure CORS for production domain
