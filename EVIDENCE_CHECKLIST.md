# Sapan.io Evidence Documentation Checklist

**Purpose:** Track all evidence materials needed for the Director's Progress Report
**Status:** Pending (to be captured when system is running)

---

## 1. System Screenshots (Priority: High)

### Frontend Pages

| # | Screenshot | Description | Status |
|---|------------|-------------|--------|
| 1 | Landing Page | Hero section with "Thailand's data-driven Startup ecosystem" messaging | [ ] Pending |
| 2 | Signup - User Type | Screen showing Founder/Mentor selection | [ ] Pending |
| 3 | Onboarding - Step 1 | Startup name and bio entry | [ ] Pending |
| 4 | Onboarding - Industry | Industry dropdown showing 10 categories | [ ] Pending |
| 5 | Onboarding - Stage | Stage selection (Idea to Growth) | [ ] Pending |
| 6 | Onboarding - Objectives | Multi-select objectives | [ ] Pending |
| 7 | Founder Dashboard | Stats cards, suggested mentors, activity | [ ] Pending |
| 8 | Mentor Browse | List view with mentor cards | [ ] Pending |
| 9 | Mentor Browse - Filtered | Results after applying filters | [ ] Pending |
| 10 | Mentor Detail | Full profile page | [ ] Pending |
| 11 | Request Intro Modal | Connection request with message field | [ ] Pending |
| 12 | Connection Requests - Sent | Founder's sent requests tab | [ ] Pending |
| 13 | Connection Requests - Received | Mentor's received requests | [ ] Pending |
| 14 | My Connections | List of established connections | [ ] Pending |
| 15 | Edit Profile | Profile editing interface | [ ] Pending |
| 16 | Mentor Pending Page | Approval waiting status | [ ] Pending |

### Admin Interface

| # | Screenshot | Description | Status |
|---|------------|-------------|--------|
| 17 | Django Admin - Users | User list in admin panel | [ ] Pending |
| 18 | Django Admin - Mentor Approval | Showing is_approved field | [ ] Pending |
| 19 | Django Admin - Industries | Industry category management | [ ] Pending |

### Technical Evidence

| # | Screenshot | Description | Status |
|---|------------|-------------|--------|
| 20 | API Response - Mentors | JSON response from /api/mentors/ | [ ] Pending |
| 21 | API Response - Industries | JSON response from /api/industries/ | [ ] Pending |
| 22 | Docker Compose | Running containers (docker-compose ps) | [ ] Pending |
| 23 | Git Log | Commit history showing development | [ ] Pending |

---

## 2. Documentation Evidence (Status: Complete)

| Document | Location | Lines | Status |
|----------|----------|-------|--------|
| MVP Specification | `/MVP_SPECIFICATION.md` | 419 | [x] Complete |
| UI Wireframes | `/WIREFRAMES.md` | 685 | [x] Complete |
| Progress Report | `/PROGRESS_REPORT_JAN_2026.md` | 300+ | [x] Complete |
| Demo Script | `/DEMO_SCRIPT.md` | 250+ | [x] Complete |
| Docker Config (Dev) | `/docker-compose.yml` | - | [x] Complete |
| Docker Config (Prod) | `/docker-compose.prod.yml` | - | [x] Complete |

---

## 3. Business Documentation (Status: Available)

| Document | Location | Status |
|----------|----------|--------|
| Business Proposal (Pitch Deck) | `/business/2 Pitch deck Business Proposal (1).pdf` | [x] Available |
| Previous Progress Report | `/business/Business-Progress-Report-Raintree-Technologies (1).pdf` | [x] Available |
| Company Catalog | `/business/Company catalog.pdf` | [x] Available |

---

## 4. Codebase Evidence

### Git Statistics

```bash
# Run these commands to generate evidence
git log --oneline | head -20              # Recent commits
git shortlog -sn                          # Contributors
find . -name "*.py" | wc -l               # Python files
find . -name "*.tsx" | wc -l              # React components
```

### File Counts (Approximate)

| Category | Count |
|----------|-------|
| Backend Python files | ~30 |
| Frontend TypeScript/TSX files | ~40 |
| API Endpoints | 23 |
| Frontend Pages | 14 |
| Database Models | 6 |

---

## 5. Screenshot Capture Instructions

### Setup
```bash
# Start the system
cd /Users/cho/codes/sapan
docker-compose up -d

# Wait for all services to be ready
docker-compose logs -f
# Look for "Starting development server" from both backend and frontend
```

### Recommended Screenshot Tool
- macOS: Command+Shift+4 (selection) or Command+Shift+3 (full screen)
- Save to: `/Users/cho/codes/sapan/business/screenshots/`

### Naming Convention
```
01_landing_page.png
02_signup_user_type.png
03_onboarding_step1.png
...
```

---

## 6. Video Recording (Optional)

For a more comprehensive demo, consider recording:

| Recording | Duration | Content |
|-----------|----------|---------|
| Full Demo Walkthrough | 10-15 min | Complete user flow from signup to connection |
| Technical Overview | 5 min | Docker, API responses, admin panel |

**Recommended Tool:** QuickTime Player (macOS) or Loom

---

## 7. Checklist Summary

### Immediately Available
- [x] MVP Specification document
- [x] UI Wireframes document
- [x] Progress Report (January 2026)
- [x] Demo Script
- [x] Business Plan / Pitch Deck
- [x] Previous Progress Report (December 2025)
- [x] Company Catalog
- [x] Docker configuration files
- [x] Complete codebase

### Requires System Running
- [ ] Frontend screenshots (16 total)
- [ ] Admin interface screenshots (3 total)
- [ ] API response screenshots (2 total)
- [ ] Docker status screenshot (1 total)

### Total Screenshots Needed: 23

---

## 8. Evidence Package Structure

When complete, organize evidence as follows:

```
/business/
├── screenshots/
│   ├── frontend/
│   │   ├── 01_landing_page.png
│   │   ├── 02_signup_user_type.png
│   │   └── ...
│   ├── admin/
│   │   ├── 17_admin_users.png
│   │   └── ...
│   └── technical/
│       ├── 20_api_mentors.png
│       └── ...
├── documents/
│   ├── PROGRESS_REPORT_JAN_2026.md
│   ├── DEMO_SCRIPT.md
│   └── EVIDENCE_CHECKLIST.md
└── existing/
    ├── 2 Pitch deck Business Proposal (1).pdf
    ├── Business-Progress-Report-Raintree-Technologies (1).pdf
    └── Company catalog.pdf
```

---

*Checklist Version: 1.0*
*Last Updated: January 16, 2026*
