// InterviewSetu Domain Service Layer
import {
  initialTracks,
  initialQuestions,
  initialLessons,
  initialMentors,
  initialBookings,
  initialAuditLogs,
  InterviewTrack,
  QuestionItem,
  LearningLesson,
  User,
  BookingRecord,
  AISessionRecord,
  AISessionTurn,
  AuditLogEvent,
} from '../data/mock-db'

// In-memory runtime state that syncs across API calls
let tracks: InterviewTrack[] = [...initialTracks]
let questions: QuestionItem[] = [...initialQuestions]
let lessons: LearningLesson[] = [...initialLessons]
let mentors: User[] = [...initialMentors]
let bookings: BookingRecord[] = [...initialBookings]
let auditLogs: AuditLogEvent[] = [...initialAuditLogs]
const aiSessions: Map<string, AISessionRecord> = new Map()

// Pre-populate demo completed session for Aarav Kumar
aiSessions.set('sess-demo-1', {
  id: 'sess-demo-1',
  candidateId: 'usr-cand-1',
  trackTitle: 'Software Engineering',
  mode: 'Realistic Mock',
  topic: 'Project explanation & architecture trade-offs',
  durationMinutes: 18,
  status: 'completed',
  scoreOverall: 74,
  createdAt: '2026-06-16T10:20:00Z',
  completedAt: '2026-06-16T10:38:00Z',
  turns: [
    {
      turnId: 't-1',
      speaker: 'interviewer',
      timestamp: '10:20:05',
      text: 'Good morning, Aarav. Let’s start with your final-year project. What technical challenge did you own and how did you approach it?',
    },
    {
      turnId: 't-2',
      speaker: 'candidate',
      timestamp: '10:21:30',
      text: 'In my final-year project, we built a lecture summary tool. I was responsible for the database and audio chunking pipeline. We had an issue with long audio files causing memory leaks.',
    },
    {
      turnId: 't-3',
      speaker: 'interviewer',
      timestamp: '10:22:10',
      text: 'What trade-off led you to choose chunking over streaming, and how did you verify that memory usage stabilized?',
    },
    {
      turnId: 't-4',
      speaker: 'candidate',
      timestamp: '10:24:00',
      text: 'We benchmarked streaming buffers vs 30-second audio slices stored temporarily in Redis. While streaming had lower latency, slices allowed retry mechanisms for failed transcription segments without restarting the whole file.',
    },
  ],
  report: {
    summary: 'Strong technical reasoning and calm pacing. The candidate explained context and trade-offs well. Next key improvement is to quantify the exact memory reduction and clearly articulate personal ownership.',
    strengths: [
      'Clear articulation of why streaming had higher risk for transient network drops',
      'Logical separation of system architecture into chunking and transcription layers',
      'Calm and professional communication style under probing follow-ups',
    ],
    improvementOpportunities: [
      'Name specific profiling tools used (e.g. Node clinic, memory heap snapshots)',
      'Quantify the outcome (e.g. "reduced peak memory by 45% from 1.2GB to 650MB")',
      'Use singular first-person pronouns when describing decisions you personally made',
    ],
    rubricScores: [
      { dimension: 'Relevance to Question', score: 82, maxScore: 100, feedback: 'Directly addressed the interviewer’s probe on trade-offs.' },
      { dimension: 'Structure & Coherence', score: 74, maxScore: 100, feedback: 'Followed Problem-Approach-Tradeoff sequence clearly.' },
      { dimension: 'Technical Depth & Accuracy', score: 76, maxScore: 100, feedback: 'Good conceptual clarity on chunking vs streaming.' },
      { dimension: 'Specificity & Evidence', score: 61, maxScore: 100, feedback: 'Lacked concrete performance metrics and tooling specifics.' },
      { dimension: 'Communication & Pacing', score: 81, maxScore: 100, feedback: 'Pacing was natural, calm, and conversational.' },
    ],
    questionBreakdowns: [
      {
        questionNumber: 1,
        questionText: 'What technical challenge did you own and how did you approach it?',
        candidateAnswer: 'In my final-year project, we built a lecture summary tool. I was responsible for the database and audio chunking pipeline. We had an issue with long audio files causing memory leaks.',
        score: 72,
        critique: 'Clear context, but relied on "we" rather than distinguishing your personal implementation.',
        suggestion: 'Start with: "I owned the audio ingestion pipeline where I identified a 1.2GB heap leak..."',
      },
      {
        questionNumber: 2,
        questionText: 'What trade-off led you to choose chunking over streaming, and how did you verify that memory usage stabilized?',
        candidateAnswer: 'We benchmarked streaming buffers vs 30-second audio slices stored temporarily in Redis. While streaming had lower latency, slices allowed retry mechanisms for failed transcription segments without restarting the whole file.',
        score: 76,
        critique: 'Excellent trade-off evaluation between low latency and idempotency/retry capability.',
        suggestion: 'State the benchmark numbers: "Under 50 concurrent uploads, chunking kept memory flat at 300MB."',
      },
    ],
  },
})

export const InterviewSetuService = {
  // Tracks
  getTracks: (category?: string) => {
    if (!category || category === 'All') return tracks
    return tracks.filter(t => t.category.toLowerCase() === category.toLowerCase())
  },

  getTrackBySlug: (slug: string) => {
    return tracks.find(t => t.slug === slug)
  },

  // Questions
  getQuestions: (filter?: { trackSlug?: string; difficulty?: string; search?: string }) => {
    return questions.filter(q => {
      if (filter?.trackSlug && filter.trackSlug !== 'All' && q.trackSlug !== filter.trackSlug) return false
      if (filter?.difficulty && filter.difficulty !== 'All' && q.difficulty !== filter.difficulty) return false
      if (filter?.search) {
        const query = filter.search.toLowerCase()
        return q.title.toLowerCase().includes(query) || q.intent.toLowerCase().includes(query) || q.category.toLowerCase().includes(query)
      }
      return true
    })
  },

  getQuestionById: (id: string) => {
    return questions.find(q => q.id === id)
  },

  toggleSaveQuestion: (id: string) => {
    const q = questions.find(item => item.id === id)
    if (q) {
      q.isSaved = !q.isSaved
      return q.isSaved
    }
    return false
  },

  // Lessons
  getLessons: (category?: string) => {
    if (!category || category === 'All') return lessons
    return lessons.filter(l => l.category.toLowerCase() === category.toLowerCase())
  },

  getLessonBySlug: (slug: string) => {
    return lessons.find(l => l.slug === slug)
  },

  updateLessonProgress: (id: string, progress: number) => {
    const lesson = lessons.find(l => l.id === id)
    if (lesson) {
      lesson.progressPercent = Math.min(100, Math.max(0, progress))
      return lesson
    }
    return null
  },

  // Mentors
  getMentors: (domain?: string) => {
    if (!domain || domain === 'All') return mentors
    return mentors.filter(m => m.interviewerProfile?.domains.some(d => d.toLowerCase().includes(domain.toLowerCase())))
  },

  getMentorById: (id: string) => {
    return mentors.find(m => m.id === id)
  },

  // Bookings
  getBookings: (userId?: string, role: 'candidate' | 'interviewer' | 'admin' = 'candidate') => {
    if (role === 'admin') return bookings
    if (role === 'interviewer') {
      return bookings.filter(b => b.mentorId === (userId || 'usr-mentor-1'))
    }
    return bookings.filter(b => b.candidateId === (userId || 'usr-cand-1'))
  },

  getBookingById: (id: string) => {
    return bookings.find(b => b.id === id || b.bookingRef === id)
  },

  createBooking: (payload: {
    candidateId: string
    candidateName: string
    mentorId: string
    trackTitle: string
    serviceName: string
    scheduledDate: string
    scheduledTime: string
    durationMinutes: number
    pricePaise: number
    brief: {
      targetRole: string
      focusArea: string
      notes: string
      consentToShare: boolean
    }
  }) => {
    const mentor = mentors.find(m => m.id === payload.mentorId)
    const newRef = `IS-${Math.floor(2000 + Math.random() * 900)}`
    const booking: BookingRecord = {
      id: `bk-${Date.now()}`,
      bookingRef: newRef,
      candidateId: payload.candidateId,
      candidateName: payload.candidateName,
      mentorId: payload.mentorId,
      mentorName: mentor ? mentor.name : 'Riya Mehta',
      trackTitle: payload.trackTitle,
      serviceName: payload.serviceName,
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      durationMinutes: payload.durationMinutes,
      status: 'confirmed',
      pricePaise: payload.pricePaise,
      platformFeePaise: Math.round(payload.pricePaise * 0.2),
      briefShared: payload.brief,
    }
    bookings.unshift(booking)

    // Add audit event
    InterviewSetuService.addAuditLog({
      actorName: payload.candidateName,
      actorRole: 'candidate',
      action: `Created Booking ${newRef}`,
      targetResource: `Mentor ${booking.mentorName} on ${payload.scheduledDate}`,
      category: 'Operations',
      reason: 'Candidate completed booking payment step.',
    })

    return booking
  },

  updateBookingStatus: (bookingId: string, status: BookingRecord['status'], actor: string = 'User') => {
    const b = bookings.find(item => item.id === bookingId || item.bookingRef === bookingId)
    if (b) {
      const prev = b.status
      b.status = status
      InterviewSetuService.addAuditLog({
        actorName: actor,
        actorRole: 'system',
        action: `Updated Booking ${b.bookingRef} Status from ${prev} to ${status}`,
        targetResource: `Booking ${b.bookingRef}`,
        category: 'Operations',
      })
      return b
    }
    return null
  },

  submitMentorFeedback: (
    bookingId: string,
    feedbackData: {
      scores: Record<string, 'Needs practice' | 'Developing' | 'Strong'>
      strengths: string
      improvementAreas: string
      suggestedNextPractice: string
      privateNotes?: string
    }
  ) => {
    const b = bookings.find(item => item.id === bookingId || item.bookingRef === bookingId)
    if (b) {
      b.status = 'completed'
      b.privateMentorNotes = feedbackData.privateNotes
      b.feedback = {
        submittedAt: new Date().toISOString(),
        scores: feedbackData.scores,
        strengths: feedbackData.strengths,
        improvementAreas: feedbackData.improvementAreas,
        suggestedNextPractice: feedbackData.suggestedNextPractice,
      }
      InterviewSetuService.addAuditLog({
        actorName: b.mentorName,
        actorRole: 'interviewer',
        action: `Submitted Session Feedback for ${b.candidateName}`,
        targetResource: `Booking ${b.bookingRef}`,
        category: 'Operations',
      })
      return b
    }
    return null
  },

  // AI Interview Engine
  createAISession: (payload: {
    candidateId: string
    trackTitle: string
    mode: AISessionRecord['mode']
    topic: string
    durationMinutes: number
  }) => {
    const sessionId = `sess-${Date.now()}`
    const firstQuestion = payload.topic.toLowerCase().includes('project')
      ? 'Tell me about a challenging project where you made an important technical decision.'
      : payload.trackTitle.toLowerCase().includes('upsc')
      ? 'How would you balance economic industrial growth with environmental conservation in an ecologically sensitive district?'
      : 'Tell me about yourself, and what motivated you to prepare for this role?'

    const session: AISessionRecord = {
      id: sessionId,
      candidateId: payload.candidateId,
      trackTitle: payload.trackTitle,
      mode: payload.mode,
      topic: payload.topic,
      durationMinutes: payload.durationMinutes,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      turns: [
        {
          turnId: `t-${Date.now()}-1`,
          speaker: 'interviewer',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: firstQuestion,
          questionIndex: 1,
        },
      ],
    }
    aiSessions.set(sessionId, session)
    return session
  },

  getAISession: (sessionId: string) => {
    return aiSessions.get(sessionId)
  },

  submitAITurn: (sessionId: string, candidateAnswer: string) => {
    const session = aiSessions.get(sessionId)
    if (!session) return null

    // Record candidate turn
    const candTurn: AISessionTurn = {
      turnId: `t-${Date.now()}-c`,
      speaker: 'candidate',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: candidateAnswer,
    }
    session.turns.push(candTurn)

    // Calculate question count
    const candidateTurnsCount = session.turns.filter(t => t.speaker === 'candidate').length

    // Generate adaptive follow-up
    let followUpText = ''
    if (candidateTurnsCount === 1) {
      if (candidateAnswer.toLowerCase().includes('team') || candidateAnswer.toLowerCase().includes('we')) {
        followUpText = 'You mentioned working with the team. What specific technical decision or module did you personally design and own?'
      } else {
        followUpText = 'What trade-offs or constraints did you face when choosing that approach over the alternatives?'
      }
    } else if (candidateTurnsCount === 2) {
      followUpText = 'How did you measure the outcome or verify that your solution solved the root problem effectively?'
    } else {
      followUpText = 'Thank you. That completes our questions for this practice round. Let us generate your structured evaluation report.'
      session.status = 'evaluating'
    }

    const aiTurn: AISessionTurn = {
      turnId: `t-${Date.now()}-ai`,
      speaker: 'interviewer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: followUpText,
      questionIndex: candidateTurnsCount + 1,
    }
    session.turns.push(aiTurn)

    return { candTurn, aiTurn, isComplete: candidateTurnsCount >= 3 }
  },

  completeAISession: (sessionId: string) => {
    const session = aiSessions.get(sessionId)
    if (!session) return null

    session.status = 'completed'
    session.completedAt = new Date().toISOString()
    session.scoreOverall = 76

    session.report = {
      summary: 'Solid performance with clear logical progression. The candidate demonstrated sound understanding of the subject matter. To achieve top-tier impact, incorporate quantitative outcomes and explicit architectural trade-offs.',
      strengths: [
        'Responded calmly and directly to follow-up challenges',
        'Demonstrated authentic domain knowledge without sounding like a memorized script',
        'Paced answers smoothly and paused to structure thoughts before speaking',
      ],
      improvementOpportunities: [
        'Clarify the exact technical alternatives considered before deciding',
        'Avoid collective "we" terminology when explaining individual contributions',
        'Include measurable metrics (e.g. latency, throughput, error reduction) to validate success',
      ],
      rubricScores: [
        { dimension: 'Relevance to Question', score: 84, maxScore: 100, feedback: 'Addressed the core intent promptly without excessive preamble.' },
        { dimension: 'Structure & Coherence', score: 78, maxScore: 100, feedback: 'Followed STAR framework with clear transitions.' },
        { dimension: 'Technical/Subject Accuracy', score: 76, maxScore: 100, feedback: 'Accurate terminology and solid conceptual foundation.' },
        { dimension: 'Specificity & Evidence', score: 68, maxScore: 100, feedback: 'Could provide deeper details on concrete implementation steps.' },
        { dimension: 'Communication & Tone', score: 82, maxScore: 100, feedback: 'Polished, conversational, and professional composure.' },
      ],
      questionBreakdowns: session.turns
        .filter(t => t.speaker === 'interviewer' && t.questionIndex && t.questionIndex <= 3)
        .map((t, idx) => {
          const ans = session.turns.find((a, i) => i > session.turns.indexOf(t) && a.speaker === 'candidate')
          return {
            questionNumber: idx + 1,
            questionText: t.text,
            candidateAnswer: ans ? ans.text : 'Spoken response captured.',
            score: [74, 78, 76][idx % 3],
            critique: [
              'Good overview of the problem, but could specify personal contribution more decisively.',
              'Great explanation of the trade-off between speed and reliability.',
              'Clear answer, but would be strengthened by citing exact metric benchmarks.',
            ][idx % 3],
            suggestion: [
              'State your individual responsibility in the first 15 seconds.',
              'Explicitly contrast the chosen solution with at least one rejected alternative.',
              'Cite measurable improvements: e.g., "reduced latency by 35%".',
            ][idx % 3],
          }
        }),
    }

    InterviewSetuService.addAuditLog({
      actorName: 'AI Evaluation Engine',
      actorRole: 'system',
      action: `Generated AI Mock Report for Session ${sessionId}`,
      targetResource: `Session ${sessionId}`,
      category: 'AI Governance',
      reason: 'Rubric-evaluated multi-turn session complete.',
    })

    return session
  },

  // Admin & Operations
  getAdminMetrics: () => {
    return {
      totalCandidates: 2486,
      candidatesActiveThisMonth: 126,
      activeInterviewers: mentors.filter(m => m.interviewerProfile?.verificationStatus === 'approved').length,
      pendingApplications: mentors.filter(m => m.interviewerProfile?.verificationStatus === 'under_review' || m.interviewerProfile?.verificationStatus === 'submitted').length,
      interviewsCompleted: 1204,
      upcomingSessionsCount: bookings.filter(b => b.status === 'confirmed').length,
      reportedIssuesCount: 3,
      grossVolumePaise: 28400000, // ₹2.84L
      platformFeesPaise: 5680000,
    }
  },

  getAdminApplications: () => {
    return mentors.map(m => ({
      userId: m.id,
      name: m.name,
      email: m.email,
      category: m.interviewerProfile?.category,
      headline: m.interviewerProfile?.headline,
      domains: m.interviewerProfile?.domains,
      verificationStatus: m.interviewerProfile?.verificationStatus,
      evidenceDocumentName: m.interviewerProfile?.evidenceDocumentName,
      submittedDate: m.createdAt,
    }))
  },

  reviewInterviewerApplication: (
    userId: string,
    action: 'approve' | 'reject' | 'needs_info',
    reason: string,
    reviewer: string = 'Super Admin'
  ) => {
    const mentor = mentors.find(m => m.id === userId)
    if (!mentor || !mentor.interviewerProfile) return null

    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      needs_info: 'needs_information' as const,
    }

    mentor.interviewerProfile.verificationStatus = statusMap[action]
    if (action === 'approve') {
      mentor.interviewerProfile.verificationBadge = true
    } else {
      mentor.interviewerProfile.verificationBadge = false
    }

    InterviewSetuService.addAuditLog({
      actorName: reviewer,
      actorRole: 'admin',
      action: `${action.toUpperCase()} Interviewer Application for ${mentor.name}`,
      targetResource: `User ${mentor.id} (${mentor.name})`,
      category: 'Verification',
      reason: reason || 'Reviewed against platform verification guidelines.',
    })

    return mentor
  },

  getAuditLogs: () => {
    return auditLogs
  },

  addAuditLog: (event: Omit<AuditLogEvent, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      ...event,
    }
    auditLogs.unshift(newLog)
    return newLog
  },
}
