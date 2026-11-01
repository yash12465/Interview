// InterviewSetu - Core Domain Types & Persistent Data Store
// Aligned with the InterviewSetu Master Specification

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
  status: 'slot_held' | 'payment_pending' | 'confirmed' | 'in_progress' | 'completed' | 'declined' | 'cancelled' | 'disputed' | 'refunded'
  pricePaise: number
  platformFeePaise: number
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

// -------------------------------------------------------------
// Seed Data
// -------------------------------------------------------------

export const initialTracks: InterviewTrack[] = [
  {
    id: 'trk-001',
    slug: 'upsc-personality-test',
    title: 'UPSC Personality Test (Civil Services)',
    category: 'Government',
    copy: 'DAF-linked discussion, balanced reasoning and situational governance questions.',
    description: 'The Union Public Service Commission Civil Services Examination Personality Test evaluates intellectual qualities, social traits, moral integrity and balanced judgement.',
    skills: ['Detailed Application Form (DAF)', 'Current Affairs & Policy', 'Situational Judgement', 'Balanced Reasoning'],
    icon: '✦',
    interviewApplicable: true,
    applicabilityNote: 'Phase 3 of Civil Services Examination. Carries 275 marks in final merit ranking.',
    lastReviewed: '2026-06-12',
    officialAuthority: 'Union Public Service Commission (UPSC)',
    selectionStages: [
      { name: 'Preliminary Examination', type: 'written', hasInterview: false, description: 'Objective GS + CSAT screening test.' },
      { name: 'Mains Examination', type: 'written', hasInterview: false, description: '9 descriptive written papers totaling 1750 marks.' },
      { name: 'Personality Test / Interview', type: 'interview', hasInterview: true, description: 'Comprehensive board interview in New Delhi for shortlisted candidates (275 marks).' },
    ],
    recommendedLessons: ['Structure balanced opinions', 'Handle follow-up questions'],
    availableMentorsCount: 8,
  },
  {
    id: 'trk-002',
    slug: 'software-engineering',
    title: 'Software Engineering & System Design',
    category: 'Technical',
    copy: 'Explain your thinking across data structures, system design, code trade-offs and project defence.',
    description: 'Designed for early and mid-career software engineers preparing for product companies, startups and engineering roles in India and globally.',
    skills: ['Project Defence', 'Architecture Trade-offs', 'DSA Problem Walkthrough', 'Concurrency & DBMS'],
    icon: '⌘',
    interviewApplicable: true,
    applicabilityNote: 'Core multi-round process across technical screenings, coding rounds and system design evaluations.',
    lastReviewed: '2026-06-14',
    selectionStages: [
      { name: 'Online Assessment', type: 'written', hasInterview: false, description: 'Coding algorithms & CS fundamentals.' },
      { name: 'Technical Round 1 (DSA)', type: 'interview', hasInterview: true, description: 'Live problem solving, complexity analysis and thinking aloud.' },
      { name: 'Technical Round 2 (Systems/Projects)', type: 'interview', hasInterview: true, description: 'Deep dive into architecture, DB schema and personal contributions.' },
      { name: 'Bar Raiser / Engineering Manager', type: 'interview', hasInterview: true, description: 'Behavioural, collaboration, trade-offs and team alignment.' },
    ],
    recommendedLessons: ['Explain your project with clarity', 'Think aloud in technical interviews'],
    availableMentorsCount: 24,
  },
  {
    id: 'trk-003',
    slug: 'campus-placements',
    title: 'Campus Placements & College Recruitment',
    category: 'College',
    copy: 'Build confidence across self-introductions, technical basics, project explanations and HR interviews.',
    description: 'Structured for final-year engineering, commerce, sciences and management undergraduates preparing for on-campus and off-campus drives.',
    skills: ['Self-Introduction', 'Project Explanation', 'STAR Behavioural', 'Resume Defense'],
    icon: '⌁',
    interviewApplicable: true,
    applicabilityNote: 'Standard hiring funnel across mass recruiters, product firms, IT consulting and financial firms.',
    lastReviewed: '2026-06-10',
    selectionStages: [
      { name: 'Aptitude & Coding Test', type: 'written', hasInterview: false, description: 'Quantitative, logical reasoning and basic programming.' },
      { name: 'Technical Interview', type: 'interview', hasInterview: true, description: 'Assessment of coursework, academic projects and fundamentals.' },
      { name: 'HR / Placement Interview', type: 'interview', hasInterview: true, description: 'Cultural fit, willingness to relocate and communication skills.' },
    ],
    recommendedLessons: ['Build a confident self-introduction', 'Use STAR without sounding scripted'],
    availableMentorsCount: 16,
  },
  {
    id: 'trk-004',
    slug: 'banking-officer',
    title: 'Banking Officer Interviews (IBPS / SBI PO)',
    category: 'Government',
    copy: 'Banking fundamentals, economic policy, situational banking scenarios and personal interview practice.',
    description: 'Preparation for State Bank of India Probationary Officer (SBI PO) and IBPS PO candidate selection interview rounds.',
    skills: ['Banking Awareness', 'Customer Situations', 'Monetary Policy', 'Personal Motivation'],
    icon: '◇',
    interviewApplicable: true,
    applicabilityNote: 'Applicable for Scale-I Officer recruitment (Phase 3). Not applicable for clerical cadres where interviews are discontinued.',
    lastReviewed: '2026-06-08',
    officialAuthority: 'IBPS & State Bank of India',
    selectionStages: [
      { name: 'Prelims Examination', type: 'written', hasInterview: false, description: 'English, Quantitative Aptitude & Reasoning.' },
      { name: 'Mains Examination & Descriptive Test', type: 'written', hasInterview: false, description: 'Objective sections + Essay/Letter writing.' },
      { name: 'Group Discussion & Interview', type: 'interview', hasInterview: true, description: 'GD (20 marks) and Personal Interview (30 marks) totaling 50 marks.' },
    ],
    recommendedLessons: ['Structure balanced opinions', 'Build a confident self-introduction'],
    availableMentorsCount: 12,
  },
  {
    id: 'trk-005',
    slug: 'mba-admissions',
    title: 'MBA Admissions & Case Interviews',
    category: 'Academic',
    copy: 'Connect your academic records, work experience and career goals into a cohesive leadership narrative.',
    description: 'For IIM WAT/PI, XLRI, ISB and premier Indian business school admissions.',
    skills: ['Career Goals Narrative', 'Undergrad Reflection', 'Current Economy', 'Case Problem Solving'],
    icon: '△',
    interviewApplicable: true,
    applicabilityNote: 'Second stage of MBA admissions following CAT / GMAT / XAT score qualification.',
    lastReviewed: '2026-06-05',
    selectionStages: [
      { name: 'Written Ability Test (WAT)', type: 'written', hasInterview: false, description: 'Essay writing on current economic, social or business topics.' },
      { name: 'Personal Interview (PI)', type: 'interview', hasInterview: true, description: 'Panel interview testing clarity of thought, business awareness and maturity.' },
    ],
    recommendedLessons: ['Build a confident self-introduction', 'Handle follow-up questions'],
    availableMentorsCount: 14,
  },
  {
    id: 'trk-006',
    slug: 'communication-and-structure',
    title: 'Communication, Delivery & Answer Structure',
    category: 'Skills',
    copy: 'Turn scattered thoughts into concise, structured and memorable spoken answers.',
    description: 'Cross-functional track for anyone who feels their answers are unstructured, rambling, or lacking punch in high-stakes conversations.',
    skills: ['STAR Framework', 'PREP Framework', 'Pacing & Tone', 'Handling Curveballs'],
    icon: '〽',
    interviewApplicable: true,
    applicabilityNote: 'Universal communication foundations applicable to all viva, recruitment and panel formats.',
    lastReviewed: '2026-06-15',
    selectionStages: [
      { name: 'Self-Assessment', type: 'skill_test', hasInterview: false, description: 'Baseline evaluation of audio recording.' },
      { name: 'Interactive Practice', type: 'interview', hasInterview: true, description: 'Adaptive practice with AI evaluating conciseness and pace.' },
    ],
    recommendedLessons: ['Use STAR without sounding scripted', 'Build a confident self-introduction'],
    availableMentorsCount: 20,
  },
]

export const initialQuestions: QuestionItem[] = [
  {
    id: 'q-101',
    trackSlug: 'software-engineering',
    category: 'Technical',
    title: 'Explain a difficult technical decision you made and the trade-offs involved.',
    intent: 'Tests technical judgement, ownership, consideration of realistic alternatives and ability to evaluate trade-offs under constraints.',
    difficulty: 'Intermediate',
    framework: 'Context → Alternatives → Decision & Reasoning → Outcome & Reflection',
    skillsTested: ['Technical judgement', 'Trade-off reasoning', 'Clarity of ownership'],
    expectedComponents: ['Why the decision mattered', 'At least two feasible alternatives', 'Constraints that guided selection', 'Measurable result'],
    sampleAnswerSummary: 'While designing an order sync microservice, chose PostgreSQL with transactional outbox over direct Kafka publish to eliminate duplicate events during transient network drops.',
    commonPitfalls: 'Saying "we just followed standard practice" or describing only the success without acknowledging drawbacks.',
    sourceType: 'expert_authored',
    timesPractised: 1420,
    isSaved: true,
  },
  {
    id: 'q-102',
    trackSlug: 'campus-placements',
    category: 'Communication',
    title: 'Tell me about yourself and why you are interested in this role.',
    intent: 'Evaluates your communication conciseness, relevance to the job opening, logical flow, and professional direction.',
    difficulty: 'Beginner',
    framework: 'Present (Current status) → Proof (1-2 key achievements) → Direction (Why this specific company & role)',
    skillsTested: ['Pacing', 'Relevance', 'Conciseness', 'Alignment'],
    expectedComponents: ['Under 90 seconds delivery', 'Relevant technical skills', 'Connection to job responsibilities'],
    sampleAnswerSummary: 'Final-year computer science student with a focus on web APIs, demonstrated via a real-time collaborative tool, excited about backend reliability at this team.',
    commonPitfalls: 'Reciting high school marks or chronological resume line by line.',
    sourceType: 'expert_authored',
    timesPractised: 3840,
    isSaved: true,
  },
  {
    id: 'q-103',
    trackSlug: 'campus-placements',
    category: 'Behavioural',
    title: 'Describe a situation where you had a disagreement with a team member. How did you resolve it?',
    intent: 'Assesses interpersonal maturity, psychological safety, empathy and collaborative conflict resolution.',
    difficulty: 'Intermediate',
    framework: 'STAR (Situation → Task → Action → Result)',
    skillsTested: ['Conflict resolution', 'Active listening', 'Emotional maturity'],
    expectedComponents: ['Specific situation', 'Focus on shared project goal', 'Constructive compromise', 'Positive relationship maintained'],
    sampleAnswerSummary: 'During a hackathon, disagreed with teammate on database schema; benchmarked query patterns together and agreed on a hybrid document structure that met deadline.',
    commonPitfalls: 'Blaming the teammate or claiming conflicts never happen.',
    sourceType: 'expert_authored',
    timesPractised: 2150,
  },
  {
    id: 'q-104',
    trackSlug: 'upsc-personality-test',
    category: 'Government',
    title: 'How would you balance economic growth with environmental conservation in a resource-rich district?',
    intent: 'Evaluates administrative empathy, constitutional values, balanced reasoning, and long-term policy trade-offs without extreme biases.',
    difficulty: 'Advanced',
    framework: 'Constitutional balance → Stakeholder empathy → Regulatory enforcement → Sustainable livelihoods',
    skillsTested: ['Balanced reasoning', 'Administrative judgement', 'Policy nuance'],
    expectedComponents: ['Acknowledge local tribal/community rights', 'Environmental impact assessment compliance', 'Technological mitigation', 'Accountability'],
    sampleAnswerSummary: 'A district magistrate must uphold Article 48A and 21, ensuring industrial development adheres strictly to EIA and CSR while protecting local forest rights and generating green jobs.',
    commonPitfalls: 'Taking an ideological all-or-nothing stance or ignoring statutory legal procedures.',
    sourceType: 'public_historical',
    sourceCitation: 'UPSC CSE Personality Test Mock Series & Board Historical Patterns',
    timesPractised: 980,
  },
  {
    id: 'q-105',
    trackSlug: 'software-engineering',
    category: 'Technical',
    title: 'Explain your final-year project: what problem did it solve, and what was your personal contribution?',
    intent: 'Checks depth of understanding, individual contribution vs group credit, architectural mastery, and handling of technical challenges.',
    difficulty: 'Intermediate',
    framework: 'Problem → System Overview → Personal Component → Difficult Bug Solved → Impact',
    skillsTested: ['Individual accountability', 'Architectural clarity', 'Debugging'],
    expectedComponents: ['Specific modules owned by candidate', 'API design or data pipeline details', 'Concrete metrics'],
    sampleAnswerSummary: 'Built an automated lecture summary tool for campus students; personally implemented the audio chunking pipeline and caching layer reducing transcription latency by 45%.',
    commonPitfalls: 'Using "we did everything" without specifying what code the candidate actually wrote.',
    sourceType: 'expert_authored',
    timesPractised: 2900,
  },
]

export const initialLessons: LearningLesson[] = [
  {
    id: 'les-101',
    slug: 'confident-self-introduction',
    title: 'Build a Confident Self-Introduction',
    category: 'Foundations',
    trackSlug: 'campus-placements',
    duration: '12 min',
    level: 'Beginner',
    progressPercent: 72,
    summary: 'Master the 60-90 second introduction that connects who you are, your strongest proof, and why this role is your logical next step.',
    objectives: [
      'Choose details that directly support your target role',
      'Connect past projects with future enthusiasm without sounding scripted',
      'Deliver in under 90 seconds with natural breathing and pacing',
    ],
    sections: [
      {
        title: 'Why Introductions Matter',
        content: 'The "Tell me about yourself" question is rarely about learning your biography—it is a calibrated opening to see if you can organize your thoughts and set a productive agenda for the interview.',
      },
      {
        title: 'The 3-Part Framework: Present, Proof, Direction',
        content: '1. Present: Who you are right now and your current focus.\n2. Proof: One or two concrete experiences demonstrating competency.\n3. Direction: Why this specific opportunity is the natural evolution of your journey.',
        example: '“I am a final-year CS student with a strong focus on high-throughput backend services. During my capstone, I led the caching architecture that handled over 50,000 synthetic requests. I am eager to join your platform team to contribute to scalable cloud infrastructure.”',
      },
      {
        title: 'Common Traps to Avoid',
        content: 'Avoid starting from birth or school graduation. Avoid reciting every bullet on your resume. Never end with "and yeah, that is pretty much it"—conclude decisively on your interest in the position.',
      },
    ],
    quiz: {
      question: 'Which of the following makes the strongest opening statement in an interview?',
      options: [
        'My name is Aarav, and I was born in Bhopal and finished 10th grade in 2020…',
        'I am a final-year student specializing in backend systems, passionate about resilient data pipelines…',
        'As you can already see from my resume, I have worked on several diverse projects…',
      ],
      correctIndex: 1,
      explanation: 'A present-day focus statement immediately grounds the discussion in relevant skills and professional identity.',
    },
  },
  {
    id: 'les-102',
    slug: 'explain-projects-with-clarity',
    title: 'Explain Your Projects with Clarity & Proof',
    category: 'Communication',
    trackSlug: 'software-engineering',
    duration: '15 min',
    level: 'Intermediate',
    progressPercent: 35,
    summary: 'Turn complex engineering, academic, or professional projects into compelling structured explanations with clear ownership.',
    objectives: [
      'Separate high-level architecture from low-level implementation details',
      'Articulate technical trade-offs and alternative solutions considered',
      'Quantify results and lessons learned from system failures',
    ],
    sections: [
      {
        title: 'The Problem-Approach-Tradeoff-Outcome Blueprint',
        content: 'Structure every project explanation in four tiers: 1) What real-world friction existed? 2) How did your architecture address it? 3) What difficult trade-offs did you balance? 4) What was the measured outcome?',
      },
      {
        title: 'Defining Personal Ownership',
        content: 'Interviewers look for distinct ownership. Use "I architected the database schema" or "I resolved a concurrency bottleneck" rather than vague collective verbs like "we did".',
      },
    ],
    quiz: {
      question: 'When asked why you selected PostgreSQL over MongoDB for a project, what should you emphasize?',
      options: [
        'It was simply the technology our professor told us to use.',
        'PostgreSQL is always faster and newer than NoSQL databases.',
        'Our domain required strict ACID transactions and relational referential integrity across ledger accounts.',
      ],
      correctIndex: 2,
      explanation: 'Highlighting architectural constraints and business requirements shows genuine technical judgement.',
    },
  },
  {
    id: 'les-103',
    slug: 'star-method-behavioural',
    title: 'Use the STAR Method Without Sounding Robotic',
    category: 'Behavioural',
    trackSlug: 'campus-placements',
    duration: '10 min',
    level: 'Beginner',
    progressPercent: 100,
    summary: 'Use Situation, Task, Action, Result to narrate challenges, leadership moments, and mistakes conversationally.',
    objectives: [
      'Allocate 70% of response time to Action and Result',
      'Include quantitative impact and retrospective reflection',
      'Answer concisely within 2 to 3 minutes',
    ],
    sections: [
      {
        title: 'Weighting the STAR Components',
        content: 'The most frequent mistake is spending 2 minutes describing the Situation and only 20 seconds on Action. Keep Situation and Task under 30 seconds combined. Dive deep into your specific actions.',
      },
    ],
    quiz: {
      question: 'What is the most critical element of the STAR method that interviewers evaluate?',
      options: [
        'How dramatic the situation was',
        'The specific personal actions you took and the concrete outcome',
        'How many people were on your team',
      ],
      correctIndex: 1,
      explanation: 'Your personal actions and results reveal your problem-solving style and accountability.',
    },
  },
]

export const initialMentors: User[] = [
  {
    id: 'usr-mentor-1',
    name: 'Riya Mehta',
    email: 'riya.mehta@example.com',
    role: 'interviewer',
    status: 'active',
    emailVerified: true,
    createdAt: '2026-03-15',
    lastActive: 'Just now',
    interviewerProfile: {
      title: 'Senior Software Engineer | Ex-Fintech',
      headline: 'Technical mock interviews, architecture deep dives & project defence',
      category: 'professional',
      domains: ['Software Engineering', 'Project Defence', 'System Design'],
      verificationStatus: 'approved',
      verificationBadge: true,
      experienceYears: '6+ years',
      languages: ['English', 'Hindi'],
      bio: '6+ years in backend systems and distributed platforms. I help early-career engineers articulate technical decisions, reason through trade-offs, and handle rigorous follow-ups with poise.',
      hourlyRate: 1199,
      evidenceDocumentName: 'employment_verification_letter_rm.pdf',
      rating: 4.9,
      reviewCount: 38,
      completedSessions: 42,
      netEarnings: 40280,
      pendingPayout: 3596,
    },
  },
  {
    id: 'usr-mentor-2',
    name: 'Dr. Arjun Khanna',
    email: 'arjun.khanna@example.com',
    role: 'interviewer',
    status: 'active',
    emailVerified: true,
    createdAt: '2026-02-10',
    lastActive: '2 hours ago',
    interviewerProfile: {
      title: 'Associate Professor & Academic Interview Chair',
      headline: 'MBA Admissions, PhD interviews & scholarly viva preparation',
      category: 'faculty',
      domains: ['MBA Admissions', 'Academic & Research', 'Communication & Structure'],
      verificationStatus: 'approved',
      verificationBadge: true,
      experienceYears: '12+ years',
      languages: ['English', 'Hindi'],
      bio: 'Former admissions panelist. Specializes in helping candidates construct coherent academic stories, defend thesis proposals, and tackle high-pressure panel inquiries.',
      hourlyRate: 1499,
      evidenceDocumentName: 'university_faculty_id_ak.pdf',
      rating: 4.8,
      reviewCount: 29,
      completedSessions: 31,
      netEarnings: 37175,
      pendingPayout: 4497,
    },
  },
  {
    id: 'usr-mentor-3',
    name: 'Priya Shah, IRS (Retd.)',
    email: 'priya.shah@example.com',
    role: 'interviewer',
    status: 'active',
    emailVerified: true,
    createdAt: '2026-01-20',
    lastActive: 'Yesterday',
    interviewerProfile: {
      title: 'Civil Services Mentor | Former UPSC Ranker',
      headline: 'DAF deconstruction, balanced governance reasoning & situational ethics',
      category: 'exam_cleared',
      domains: ['UPSC Personality Test', 'State PSC Interviews', 'Administrative Ethics'],
      verificationStatus: 'approved',
      verificationBadge: true,
      experienceYears: '8+ years mentoring',
      languages: ['English', 'Hindi', 'Gujarati'],
      bio: 'Cleared UPSC Civil Services with high marks in the Personality Test. Guides aspirants through DAF analysis, constitutional neutrality, and handling uncomfortable situational probes.',
      hourlyRate: 1999,
      evidenceDocumentName: 'service_allocation_notification_ps.pdf',
      rating: 5.0,
      reviewCount: 54,
      completedSessions: 68,
      netEarnings: 108740,
      pendingPayout: 9995,
    },
  },
  {
    id: 'usr-mentor-4',
    name: 'Vikram Rao',
    email: 'vikram.rao@example.com',
    role: 'interviewer',
    status: 'active',
    emailVerified: true,
    createdAt: '2026-06-01',
    lastActive: 'Today',
    interviewerProfile: {
      title: 'Senior Data Scientist | Product Analytics',
      headline: 'Data analytics, metrics definitions, SQL & ML system design',
      category: 'professional',
      domains: ['Data Analytics', 'Software Engineering', 'Campus Placements'],
      verificationStatus: 'under_review',
      verificationBadge: false,
      experienceYears: '5 years',
      languages: ['English'],
      bio: 'Experienced data scientist mentoring campus students and transitioning analysts on hypothesis formulation, A/B testing discussions and SQL live coding.',
      hourlyRate: 899,
      evidenceDocumentName: 'work_contract_vr.pdf',
      rating: 4.7,
      reviewCount: 8,
      completedSessions: 10,
      netEarnings: 7192,
      pendingPayout: 1798,
    },
  },
]

export const initialBookings: BookingRecord[] = [
  {
    id: 'bk-2048',
    bookingRef: 'IS-2048',
    candidateId: 'usr-cand-1',
    candidateName: 'Aarav Kumar',
    mentorId: 'usr-mentor-1',
    mentorName: 'Riya Mehta',
    trackTitle: 'Software Engineering',
    serviceName: 'Technical Mock & Project Defence',
    scheduledDate: '2026-06-18',
    scheduledTime: '18:00',
    durationMinutes: 45,
    status: 'confirmed',
    pricePaise: 119900,
    platformFeePaise: 24000,
    briefShared: {
      targetRole: 'Software Engineer',
      focusArea: 'Project Defence & Architecture Trade-offs',
      notes: 'Final-year capstone project: want to practice explaining our distributed caching layer and DB schema choices.',
      consentToShare: true,
    },
    privateMentorNotes: 'Check understanding of caching invalidation strategies and single-point-of-failure concerns.',
  },
  {
    id: 'bk-2051',
    bookingRef: 'IS-2051',
    candidateId: 'usr-cand-2',
    candidateName: 'Neha Kapoor',
    mentorId: 'usr-mentor-1',
    mentorName: 'Riya Mehta',
    trackTitle: 'Campus Placements',
    serviceName: 'Technical Mock & Behavioral',
    scheduledDate: '2026-06-19',
    scheduledTime: '17:30',
    durationMinutes: 45,
    status: 'confirmed',
    pricePaise: 119900,
    platformFeePaise: 24000,
    briefShared: {
      targetRole: 'Graduate Trainee Engineer',
      focusArea: 'Self-Introduction & Core CS Fundamentals',
      notes: 'First time interviewing with a product company. Need candid feedback on pacing.',
      consentToShare: true,
    },
  },
]

export const initialAuditLogs: AuditLogEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-06-16 10:42 UTC',
    actorName: 'Super Admin',
    actorRole: 'super_admin',
    action: 'Approved Interviewer Application',
    targetResource: 'Interviewer DEMO-INT-2034 (Priya Shah)',
    category: 'Verification',
    reason: 'Verified service allocation gazette notice against official records.',
  },
  {
    id: 'aud-002',
    timestamp: '2026-06-16 09:18 UTC',
    actorName: 'Verification Reviewer',
    actorRole: 'reviewer',
    action: 'Viewed Private Evidence Document',
    targetResource: 'File: employment_letter_sample.pdf (Riya Mehta)',
    category: 'Sensitive access',
    reason: 'Routine application credential verification review.',
  },
  {
    id: 'aud-003',
    timestamp: '2026-06-15 16:30 UTC',
    actorName: 'Operations Lead',
    actorRole: 'operations',
    action: 'Updated Booking Status to Confirmed',
    targetResource: 'Booking IS-2048',
    category: 'Operations',
    reason: 'Verified candidate payment reconciliation.',
  },
  {
    id: 'aud-004',
    timestamp: '2026-06-14 11:15 UTC',
    actorName: 'Content Manager',
    actorRole: 'content_manager',
    action: 'Published Lesson Revision v2.1',
    targetResource: 'Lesson: Explain Your Projects with Clarity',
    category: 'Content',
    reason: 'Added new technical trade-off section with illustrative architectural diagrams.',
  },
]
