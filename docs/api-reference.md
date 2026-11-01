# InterviewSetu API Reference (`/api/v1`)

All endpoints return JSON responses with standard status codes, timestamps, and error structures.

## 1. System Health
- **`GET /api/v1/health`**
  - Returns service status, version, and active subsystem adapters (AI Engine, WebRTC, Razorpay Sandbox).

## 2. Tracks & Examinations
- **`GET /api/v1/tracks?category={category}`**
  - Retrieves available interview preparation tracks.
- **`GET /api/v1/tracks/{slug}`**
  - Retrieves track details including official selection stages and applicability notes.

## 3. Question Bank
- **`GET /api/v1/questions?trackSlug={slug}&difficulty={diff}&search={query}`**
  - Search and filter questions by competency, difficulty, and track.
- **`GET /api/v1/questions/{id}`**
  - Question intent, framework (STAR, PREP), common pitfalls, and sample answer summary.
- **`POST /api/v1/questions/{id}`**
  - Toggle save question to candidate library.

## 4. Learning Academy
- **`GET /api/v1/learning/lessons?category={cat}`**
  - List interactive lessons.
- **`GET /api/v1/learning/lessons/{slug}`**
  - Complete lesson content, illustrative examples, and interactive quiz.
- **`POST /api/v1/learning/lessons/{slug}`**
  - Update candidate lesson progress percent.

## 5. Mentors & Booking Marketplace
- **`GET /api/v1/mentors?domain={domain}`**
  - List verified interviewers and coaches.
- **`GET /api/v1/mentors/{id}`**
  - Mentor profile, verification badges, packages, and available slots.
- **`POST /api/v1/bookings`**
  - Create booking, hold slot, and share preparation brief.
- **`PATCH /api/v1/bookings/{id}`**
  - Update booking status (confirm, decline, cancel) or submit post-session feedback.

## 6. AI Interview Engine
- **`POST /api/v1/interviews/session`**
  - Initialize an AI mock interview session with track, topic, and difficulty.
- **`POST /api/v1/interviews/turn`**
  - Submit candidate spoken or typed turn; returns adaptive interviewer follow-up probe.
- **`GET /api/v1/interviews/{id}/report`**
  - Retrieve comprehensive structured evaluation report across 5 rubric dimensions.

## 7. Platform Operations & Audit
- **`GET /api/v1/admin/overview`**
  - Operational KPIs, application counts, and booking funnel.
- **`GET /api/v1/admin/verification`**
  - Queue of pending interviewer verification applications.
- **`POST /api/v1/admin/verification`**
  - Action an application (`approve`, `reject`, `needs_info`) with required audit justification.
- **`GET /api/v1/admin/audit-logs`**
  - Append-only audit log records for sensitive administrative operations.
