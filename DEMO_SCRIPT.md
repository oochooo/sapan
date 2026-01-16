# Sapan.io Product Demo Script

**Purpose:** Step-by-step guide for demonstrating the Sapan.io MVP
**Duration:** 15-20 minutes
**Audience:** Director, stakeholders, potential partners

---

## Pre-Demo Setup

### 1. Start the Development Environment

```bash
# Navigate to project directory
cd /Users/cho/codes/sapan

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Seed Sample Data (if needed)

```bash
# Access the backend container
docker-compose exec backend python manage.py seed_industries

# Create a superuser for admin access
docker-compose exec backend python manage.py createsuperuser
```

### 3. Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Django Admin | http://localhost:8000/admin |

---

## Demo Flow

### Part 1: Landing Page (2 minutes)

**URL:** http://localhost:3000

**Talking Points:**
- "This is Sapan.io - Thailand's data-driven startup ecosystem platform"
- "We connect Founders with Mentors based on what they need, not who they know"
- Show the hero section, features overview
- Highlight industry categories displayed
- Point out the clear call-to-action: "Get Started" or "Sign Up"

**Screenshot Opportunity:** Landing page hero section

---

### Part 2: Founder Registration Flow (3 minutes)

**Step 2.1: Sign Up**

1. Click "Sign Up" button
2. Select "Founder" as user type
3. Enter demo credentials:
   - Email: `demo.founder@example.com`
   - Password: `DemoPassword123`
4. Submit registration

**Screenshot Opportunity:** User type selection screen

**Step 2.2: Onboarding Wizard**

Walk through each step:

1. **Startup Information**
   - Startup Name: "TechDemo Startup"
   - About: "An innovative solution for the Thai market"

2. **Industry Selection**
   - Show the industry dropdown with 10 categories
   - Select: "FinTech" > "Payments"
   - Highlight: "40+ specific industry subcategories"

3. **Stage Selection**
   - Show options: Idea, Pre-seed, Seed, Series A, Growth
   - Select: "Seed"

4. **Objectives Selection**
   - Show the multi-select options
   - Select: "Fundraising strategy", "Investor introductions"
   - Highlight: "Founders specify exactly what help they need"

5. **Complete Profile**
   - Submit and redirect to Dashboard

**Screenshot Opportunity:** Multi-step onboarding wizard

---

### Part 3: Founder Dashboard (2 minutes)

**URL:** http://localhost:3000/dashboard

**Talking Points:**
- "The dashboard shows at-a-glance metrics"
- Point out: Total connections, pending requests, suggested mentors
- "Founders can immediately see mentors who match their needs"

**Show:**
- Stats cards (connections count, request counts)
- Suggested mentors section
- Recent activity

**Screenshot Opportunity:** Founder dashboard with stats

---

### Part 4: Browse & Filter Mentors (3 minutes)

**URL:** http://localhost:3000/mentors

**Step 4.1: Show the Mentor List**

- "Founders can browse all approved mentors"
- Show mentor cards with key information:
  - Name, company, role
  - Years of experience
  - Expertise areas (badges)
  - What they can help with

**Step 4.2: Demonstrate Filtering**

1. **Filter by Industry:**
   - Select "FinTech" from dropdown
   - Show filtered results

2. **Filter by Objective:**
   - Select "Fundraising strategy"
   - Show refined results

3. **Search:**
   - Type a keyword (e.g., "banking" or a name)
   - Show search results

**Talking Point:** "Unlike LinkedIn where you cold message, here every mentor has opted in to help and specified their expertise areas"

**Screenshot Opportunity:** Mentor browse page with filters active

---

### Part 5: View Mentor & Request Connection (2 minutes)

**URL:** http://localhost:3000/mentors/[id]

**Step 5.1: Mentor Detail Page**

- Click on a mentor card to view full profile
- Show:
  - Full bio
  - Company & role
  - Years of experience
  - All expertise areas
  - What they can help with

**Step 5.2: Request Introduction**

1. Click "Request Intro" button
2. Modal appears for optional message
3. Enter: "I'm building a payments solution and would love your guidance on regulatory compliance"
4. Submit request

**Talking Point:** "The founder can add context to their request, helping mentors understand if it's a good fit"

**Screenshot Opportunity:** Mentor detail page with "Request Intro" modal

---

### Part 6: Track Requests (2 minutes)

**URL:** http://localhost:3000/requests

**Show:**
- "Sent" tab with pending request
- Request shows status: "Pending"
- Timestamp of when request was sent

**Talking Point:** "Founders can track all their outreach in one place - no more lost emails or forgotten LINE messages"

**Screenshot Opportunity:** Connection requests page with sent requests

---

### Part 7: Mentor Experience (3 minutes)

**Setup:** Either log out and log in as a mentor, or open an incognito window

**Step 7.1: Mentor Pending Approval**

- Create a new mentor account
- Show the "Pending Approval" page
- "Mentors must be verified before appearing in the directory - this ensures quality"

**Screenshot Opportunity:** Mentor pending approval status page

**Step 7.2: Admin Approval (Django Admin)**

- Open Django Admin: http://localhost:8000/admin
- Navigate to Users
- Find the mentor user
- Set `is_approved = True`
- Save

**Screenshot Opportunity:** Django Admin mentor approval interface

**Step 7.3: Mentor Dashboard**

- Log back in as approved mentor
- Show mentor dashboard with:
  - Incoming connection requests
  - Request from demo founder
  - Accept/Decline buttons

**Step 7.4: Accept Request**

- Click "Accept" on the founder's request
- Show confirmation
- "Now both parties can see each other in their connections"

---

### Part 8: Connection Established (2 minutes)

**Show from both perspectives:**

1. **Mentor's Connections:** http://localhost:3000/connections
   - Show the founder now appears in connections

2. **Founder's Connections:**
   - Switch to founder account
   - Show mentor now appears in connections
   - "They can now reach out via email or LinkedIn to continue the conversation"

**Talking Point:** "Sapan.io facilitates the initial connection - the actual mentorship happens through whatever channel works best for both parties"

**Screenshot Opportunity:** Connections page showing matched pair

---

## Part 9: Technical Demo (Optional - 3 minutes)

For technical stakeholders, show:

### API Response

```bash
# Get list of mentors
curl http://localhost:8000/api/mentors/ | json_pp

# Get industries
curl http://localhost:8000/api/industries/ | json_pp
```

**Screenshot Opportunity:** API JSON response

### Docker Setup

```bash
# Show running containers
docker-compose ps

# Show logs
docker-compose logs -f backend
```

---

## Key Messages to Reinforce

1. **Problem-Solution Fit:**
   "Thailand's startup ecosystem is fragmented. Founders outside Bangkok lack access to quality mentorship."

2. **MVP Completeness:**
   "This is a fully functional platform - registration, profiles, discovery, and connections all work end-to-end."

3. **Quality Control:**
   "Mentor approval ensures only verified, committed professionals appear on the platform."

4. **Scalable Architecture:**
   "Built with Next.js and Django - the same stack used by companies like Instagram and Netflix."

5. **Next Steps:**
   "We're ready for beta launch with initial mentor cohort. Looking to onboard 50 verified mentors by Q2 2026."

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Services not starting | `docker-compose down && docker-compose up -d` |
| Database errors | `docker-compose exec backend python manage.py migrate` |
| No mentors showing | Run seed command and approve mentors in admin |
| Frontend not loading | Check `docker-compose logs frontend` |

---

## Post-Demo Actions

1. Save all screenshots to `/business/screenshots/` folder
2. Note any questions/feedback from audience
3. Create follow-up action items

---

*Demo Script Version: 1.0*
*Last Updated: January 16, 2026*
