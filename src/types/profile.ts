export interface EducationEntry {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: string
  endYear: string
  grade?: string
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface ResumeFileMeta {
  path: string
  fileName: string
  uploadedAt: string
  fileSize: number
  signedUrl?: string
}

export interface VerificationDocumentMeta {
  path: string
  fileName: string
  uploadedAt: string
  fileSize: number
  type: 'evidence' | 'certificate'
  signedUrl?: string
}

export interface CandidateProfileData {
  targetTrack?: string
  targetRole?: string
  preferredLanguage?: string
  preferredMode?: 'voice' | 'text' | 'both'
  bio?: string
  skills?: string[]
  educationHistory?: EducationEntry[]
  experienceHistory?: ExperienceEntry[]
  resume?: ResumeFileMeta | null
  completedMocks?: number
  practiceMinutes?: number
  savedQuestionsCount?: number
  lessonsCompletedCount?: number
}

export interface InterviewerProfileData {
  title?: string
  headline?: string
  category?: 'professional' | 'exam_cleared' | 'faculty' | 'coach'
  domains?: string[]
  experienceYears?: string
  languages?: string[]
  bio?: string
  hourlyRate?: number
  verificationStatus?: 'draft' | 'submitted' | 'under_review' | 'needs_information' | 'approved' | 'rejected' | 'suspended'
  verificationBadge?: boolean
  evidenceDocument?: VerificationDocumentMeta | null
  certificates?: VerificationDocumentMeta[]
  evidenceDocumentName?: string
  evidenceUrl?: string
  rating?: number
  reviewCount?: number
  completedSessions?: number
  netEarnings?: number
  pendingPayout?: number
  rejectionReason?: string
  adminNotes?: string
}
