# Sapan MVP Demo Guide

A guide for demonstrating the Sapan startup ecosystem platform.

## Quick Start

### 1. Start the Services

```bash
# Start backend and database
docker compose up -d

# Run migrations (if needed)
docker compose exec backend python manage.py migrate

# Seed reference data (industries, objectives)
docker compose exec backend python manage.py seed_data --app industries

# Seed mock users (mentors, founders, connections)
docker compose exec backend python manage.py seed_data
```

```bash
# Start frontend (in a separate terminal)
cd frontend && npm run dev
```

### 2. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

---

## Dev Login (Bypass Social Auth)

Since production only allows Google/LINE OAuth, use **Dev Login** for demos:

1. Go to http://localhost:3000/login
2. Click **"Show Dev Login"** toggle at the bottom
3. Enter credentials from the test accounts below

---

## Test Accounts

**Password for all accounts:** `mockpassword123`

### Mentors

| Email | Name | Role | Company |
|-------|------|------|---------|
| `mentor1@mock.sapan.io` | Sarah Chen | Director of Product | Google |
| `mentor2@mock.sapan.io` | Michael Park | Partner | Sequoia Capital |
| `mentor3@mock.sapan.io` | Lisa Wong | CMO | Grab |
| `mentor4@mock.sapan.io` | David Kumar | CTO | Agoda |
| `mentor5@mock.sapan.io` | Anna Tanaka | Founder & CEO | HealthTech Ventures |

### Founders

| Email | Name | Startup | Stage |
|-------|------|---------|-------|
| `founder1@mock.sapan.io` | Tom Wilson | AgriTech Solutions | Seed |
| `founder2@mock.sapan.io` | Maya Patel | PayEasy | Pre-seed |
| `founder3@mock.sapan.io` | James Lee | LearnSpace | Series A |

### Pre-existing Connections

Each founder is already connected to mentors 1-3 (Sarah, Michael, Lisa).

---

## Demo Scenarios

### Scenario A: Founder Journey

**Login as:** `founder1@mock.sapan.io`

#### 1. Homepage & Townhall Feed
- Visit http://localhost:3000
- Show the landing page with value proposition
- Scroll to see the **Townhall Feed** (recent connections in the ecosystem)
- Note: Logged-out users see anonymized connections; logged-in see full details

#### 2. Browse Mentors
- Go to **Mentors** page (`/mentors`)
- Show the paginated list of available mentors
- Filter by industry or expertise (if available)
- Click on a mentor to view their full profile

#### 3. Send Connection Request
- View mentor4 or mentor5 (not yet connected)
- Click **"Connect"** button
- Select intent: "Mentor Me", "Collaborate", or "Peer Network"
- Add an optional message
- Submit the request

#### 4. View My Connections
- Go to **Connections** page (`/connections`)
- Show existing connections with mentors 1-3
- Show the connection details and intent

#### 5. Book Office Hours
- Go to a connected mentor's profile (e.g., mentor1)
- Click **"Book Office Hours"**
- View available time slots based on mentor's availability
- Select a slot and add meeting agenda
- Confirm booking
- Show the generated Google Meet link

#### 6. Manage Bookings
- Go to **Bookings** page (`/bookings`)
- View upcoming and past bookings
- Cancel a booking if needed

---

### Scenario B: Mentor Journey

**Login as:** `mentor1@mock.sapan.io`

#### 1. Dashboard
- View mentor dashboard with stats
- See pending connection requests
- See upcoming office hours bookings

#### 2. Set Availability
- Go to **Settings** (`/settings`)
- View/edit weekly availability rules
- Add a new availability window (e.g., Friday 2-4pm)
- Set slot duration (default 30 min)

#### 3. Respond to Connection Requests
- Go to **Requests** page (`/requests`)
- View pending requests from founders
- Accept or decline with optional message

#### 4. Browse Founders
- Go to **Founders** page (`/founders`)
- Browse the ecosystem of founders
- View founder profiles and their startups

#### 5. View Connected Founders
- Go to **Connections** page
- See all connected founders
- View their profiles and startup details

---

### Scenario C: Connection Flow (Two Browsers)

**Best for demonstrating real-time interaction:**

1. **Browser 1**: Login as `founder2@mock.sapan.io`
2. **Browser 2**: Login as `mentor4@mock.sapan.io`

#### Demo Steps:
1. **Founder** sends connection request to Mentor4
2. **Mentor** refreshes requests page and sees new request
3. **Mentor** accepts the request
4. **Founder** refreshes connections page and sees new connection
5. **Founder** books office hours with the newly connected mentor

---

## Key Features to Highlight

### For Founders
- Discovery of experienced mentors in SEA ecosystem
- Structured connection requests with clear intents
- Easy booking of 1:1 office hours
- Auto-generated meeting links

### For Mentors
- Flexible availability management
- Control over who they connect with
- Structured mentoring through office hours
- Visibility into founder ecosystem

### Platform Value
- **Townhall Feed**: Shows ecosystem activity, builds community feel
- **Industry Focus**: Curated for SEA startup ecosystem
- **Privacy Controls**: Anonymized public feed, full details for members
- **Structured Networking**: Intent-based connections, not just random adds

---

## API Endpoints for Technical Demo

```bash
# Get current user
curl http://localhost:8000/api/auth/me/ -H "Authorization: Bearer <token>"

# List mentors
curl http://localhost:8000/api/profiles/mentors/

# List founders
curl http://localhost:8000/api/profiles/founders/

# Recent connections (public feed)
curl http://localhost:8000/api/connections/recent/

# Industries reference data
curl http://localhost:8000/api/industries/

# Objectives reference data
curl http://localhost:8000/api/objectives/
```

---

## Troubleshooting

### "No mentors/founders showing"
Run the seed commands:
```bash
docker compose exec backend python manage.py seed_data --app industries
docker compose exec backend python manage.py seed_data
```

### "Dev login not showing"
Make sure `DEBUG=True` in backend `.env` file.

### "Connection request fails"
Check that both users exist and there's no duplicate request.

### Reset Mock Data
```bash
docker compose exec backend python manage.py seed_data --clear
```

---

## Notes for Demo

1. **Social Login**: In production, only Google and LINE OAuth are available. Dev login is for testing only.

2. **Google Calendar Integration**: Mentors can optionally connect their Google Calendar. This is not required for basic office hours functionality.

3. **Email Notifications**: In development, emails are printed to console. Check docker logs for booking confirmations.

4. **Timezone**: All mock mentors are set to Asia/Bangkok timezone.
