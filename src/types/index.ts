// Domain types shared with interview-planner-backend (src/data/mock-db.ts). Keep in sync.

export type UserRole = 'candidate' | 'interviewer' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  status: 'active' | 'restricted' | 'suspended'
  emailVerified: boolean
  createdAt: string
  lastActive: string
  candidateProfile?: CandidateProfile
  interviewerProfile?: InterviewerProfile
}

export interface CandidateProfile {
  targetTrack: string
  experienceLevel: 'beginner' | 'intermediate' | 'experienced'
  preferredLanguage: string
  preferredMode: 'voice' | 'text' | 'both'
  bio?: string
  education?: string
  workExperience?: string
  skills: string[]
  completedMocks: number
  practiceMinutes: number
  savedQuestionsCount: number
  lessonsCompletedCount: number
}

export interface InterviewerProfile {
  title: string
  category: 'professional' | 'exam_cleared' | 'faculty' | 'coach'
  domains: string[]
  verificationStatus: 'draft' | 'submitted' | 'under_review' | 'needs_information' | 'approved' | 'rejected' | 'suspended'
  verificationBadge: boolean
  experienceYears: string
  languages: string[]
  bio: string
  hourlyRate: number
  evidenceDocumentName?: string
  evidenceUrl?: string
  rating: number
  reviewCount: number
  headline: string
  completedSessions: number
  netEarnings: number
  pendingPayout: number
}

export interface InterviewTrack {
  id: string
  slug: string
  title: string
  category: 'Government' | 'College' | 'Technical' | 'Academic' | 'Skills' | 'Professional'
  copy: string
  description: string
  skills: string[]
  icon: string
  interviewApplicable: boolean
  applicabilityNote: string
  lastReviewed: string
  officialAuthority?: string
  selectionStages: {
    name: string
    type: 'written' | 'skill_test' | 'interview' | 'group_discussion' | 'document_verification'
    hasInterview: boolean
    description: string
  }[]
  recommendedLessons: string[]
  availableMentorsCount: number
}

export interface QuestionItem {
  id: string
  trackSlug: string
  category: string
  title: string
  intent: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  framework: string
  skillsTested: string[]
  expectedComponents: string[]
  sampleAnswerSummary: string
  commonPitfalls: string
  sourceType: 'expert_authored' | 'public_historical' | 'ai_practice'
  sourceCitation?: string
  isSaved?: boolean
  timesPractised: number
}

export interface LearningLesson {
  id: string
  slug: string
  title: string
  category: string
  trackSlug: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  progressPercent: number
  summary: string
  objectives: string[]
  sections: {
    title: string
    content: string
    example?: string
  }[]
  quiz: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }
}

export interface MentorService {
  id: string
  mentorId: string
  title: string
  durationMinutes: number
  pricePaise: number // integer minor units
  netPayoutPaise: number
  format: 'video' | 'audio' | 'written_feedback'
  description: string
  status: 'active' | 'draft' | 'paused'
}

export interface MentorSlot {
  id: string
  mentorId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  timezone: string
  isBooked: boolean
  startUtc?: string
  endUtc?: string
  isBlocked?: boolean
  isRecurring?: boolean
  recurringPattern?: string
  dayOfWeek?: number
}

export interface BookingRecord {
  id: string
  bookingRef: string
  candidateId: string
  candidateName: string
  mentorId: string
  mentorName: string
  trackTitle: string
  serviceName: string
  scheduledDate: string
  scheduledTime: string
  durationMinutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'rescheduled' | 'no_show' | 'slot_held' | 'payment_pending' | 'in_progress' | 'declined' | 'disputed' | 'refunded'
  pricePaise: number
  platformFeePaise: number
  startUtc?: string
  endUtc?: string
  cancellationReason?: string
  cancelledBy?: string
  rescheduledFromId?: string
  createdAt?: string
  updatedAt?: string
  briefShared: {
    targetRole: string
    focusArea: string
    notes: string
    consentToShare: boolean
  }
  privateMentorNotes?: string
  feedback?: {
    submittedAt: string
    scores: Record<string, 'Needs practice' | 'Developing' | 'Strong'>
    strengths: string
    improvementAreas: string
    suggestedNextPractice: string
  }
}

export interface AISessionTurn {
  turnId: string
  speaker: 'interviewer' | 'candidate'
  timestamp: string
  text: string
  questionIndex?: number
  audioDurationSeconds?: number
}

export interface AISessionRecord {
  id: string
  candidateId: string
  trackTitle: string
  mode: 'Learn-As-You-Go' | 'Realistic Mock' | 'Technical Deep Dive' | 'Behavioural / HR' | 'Panel Simulation' | 'Resume-Based'
  topic: string
  durationMinutes: number
  status: 'ready' | 'in_progress' | 'paused' | 'evaluating' | 'completed'
  scoreOverall?: number
  createdAt: string
  completedAt?: string
  turns: AISessionTurn[]
  report?: {
    summary: string
    strengths: string[]
    improvementOpportunities: string[]
    rubricScores: { dimension: string; score: number; maxScore: number; feedback: string }[]
    questionBreakdowns: {
      questionNumber: number
      questionText: string
      candidateAnswer: string
      score: number
      critique: string
      suggestion: string
    }[]
  }
}

export interface AuditLogEvent {
  id: string
  timestamp: string
  actorName: string
  actorRole: string
  action: string
  targetResource: string
  category: 'Verification' | 'Sensitive access' | 'Operations' | 'Content' | 'AI Governance' | 'Security'
  reason?: string
}


export interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: string
  bookingId?: string
  isRead: boolean
  createdAt: string
}
