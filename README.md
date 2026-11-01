# InterviewSetu — Full Production Web Application & Backend

> **Tagline:** Learn how to answer. Practise with confidence. Improve with every interview.

InterviewSetu is India's interview preparation platform providing adaptive AI mock interviews, verified exam & placement selection stages, learning academy frameworks, and an admin-verified 1:1 human mock interview marketplace.

📖 **Comprehensive Technical Documentation:** For the full architecture, data flow diagrams, frontend/backend engineering details, code format standards, and API specifications, see **[Full Architecture & System Design Specification](docs/ARCHITECTURE_AND_SYSTEM_DESIGN.md)**.

---

## Portals & Access

1. **Public Marketing & Catalogue:** [http://localhost:3000](http://localhost:3000)
   - Ambient floating track constellation with liquid aurora hero
   - Sticky category explorer (Government, Technical, College, Academic, Skills)
   - 1:1 human guidance spotlight
   - The InterviewSetu method with audio waveform visualizer
   - FAQ accordion & institutional placement suite
2. **Interview Tracks & Official Stages:** [http://localhost:3000/interview-tracks](http://localhost:3000/interview-tracks)
3. **Official Exams & Notifications:** [http://localhost:3000/exams](http://localhost:3000/exams)
4. **Learning Academy & Frameworks:** [http://localhost:3000/learn](http://localhost:3000/learn)
5. **Curated Question Bank:** [http://localhost:3000/question-bank](http://localhost:3000/question-bank)
6. **Mentor Marketplace Directory:** [http://localhost:3000/mentors](http://localhost:3000/mentors)
7. **Pricing & Plans:** [http://localhost:3000/pricing](http://localhost:3000/pricing)
8. **Candidate Portal:** [http://localhost:3000/app/candidate](http://localhost:3000/app/candidate)
   - 6-step onboarding checklist
   - AI Interview Studio (Speech & Typed)
   - Multi-turn adaptive questions with follow-ups
   - Rubric evaluation scorecards (out of 100)
   - Progress analytics and weekly preparation roadmap
9. **Interviewer / Mentor Portal:** [http://localhost:3000/app/interviewer](http://localhost:3000/app/interviewer)
   - Verification application status centre
   - Booking management & candidate briefs
   - WebRTC live video room with private scratchpad
   - Post-session rubric feedback scorecard submission
   - Availability calendar & earnings ledger
10. **Admin Control Centre:** [http://localhost:3000/staff](http://localhost:3000/staff) (or `/app/admin`)
    - Operations overview & KPI metrics
    - Interviewer application verification queue
    - Exam catalogue & stage applicability builder
    - AI prompt configuration & rubric weights
    - Immutable audit log ledger

---

## REST JSON APIs (`/api/v1`)

- `GET /api/v1/health` — System status and capability check
- `GET /api/v1/tracks` — Interview tracks with category filter
- `GET /api/v1/tracks/:slug` — Official selection stages and applicability notes
- `GET /api/v1/questions` — Search and filter question bank
- `POST /api/v1/questions/:id` — Toggle save question
- `GET /api/v1/learning/lessons` — List academy lessons
- `GET /api/v1/learning/lessons/:slug` — Lesson content with interactive quiz
- `GET /api/v1/mentors` — Mentor directory with verification badges
- `POST /api/v1/bookings` — Create slot booking and share brief
- `PATCH /api/v1/bookings/:id` — Update status or submit scorecard
- `POST /api/v1/interviews/session` — Launch new AI mock interview
- `POST /api/v1/interviews/turn` — Submit candidate response & receive adaptive follow-up
- `GET /api/v1/interviews/:id/report` — Retrieve rubric evaluation scorecard
- `GET /api/v1/admin/overview` — Administrative operational metrics
- `POST /api/v1/admin/verification` — Approve/reject interviewer application with audit reason
- `GET /api/v1/admin/audit-logs` — Immutable staff audit events

---

## Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Typecheck verification
npx tsc --noEmit

# 3. Production build verification
npx next build

# 4. Start development server
pnpm dev
# App listens on http://localhost:3000
```
