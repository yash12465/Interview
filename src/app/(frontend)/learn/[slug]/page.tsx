'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { PageLoadState } from '@/components/ui/LoadState'
import { RippleButton } from '@/components/ui/RippleButton'
import { apiUrl } from '@/lib/api'
import { useApi } from '@/lib/use-api'
import type { LearningLesson } from '@/types'

export default function LessonDetailPage() {
  const { data, loading, error } = useApi<LearningLesson[]>('/learning/lessons')
  if (!data || data.length === 0)
    return <PageLoadState currentPath="/learn" loading={loading} error={error} />
  return <LessonDetailView initialLessons={data} />
}

function LessonDetailView({ initialLessons }: { initialLessons: LearningLesson[] }) {
  const params = useParams()
  const slug = params?.slug as string

  const lesson = initialLessons.find((l) => l.slug === slug) || initialLessons[0]

  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [lessonFinished, setLessonFinished] = useState(false)
  const [noteText, setNoteText] = useState('')

  const handleQuizSubmit = () => {
    if (selectedQuizAnswer !== null) {
      setQuizSubmitted(true)
    }
  }

  const handleMarkComplete = () => {
    setLessonFinished(true)
    // Persist via API
    fetch(apiUrl(`/learning/lessons/${lesson.slug}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPercent: 100 }),
    }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/learn" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link href="/learn" className="hover:text-brand-strong">
            ← Back to Learning Academy
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{lesson.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-8 bg-surface p-8 sm:p-10 rounded-3xl border border-border/90 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs text-brand-strong font-bold uppercase tracking-wider mb-2">
              <span>{lesson.category}</span>
              <span>•</span>
              <span>{lesson.duration}</span>
              <span>•</span>
              <span>{lesson.level}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {lesson.title}
            </h1>
            <p className="mt-3 text-base text-body leading-relaxed border-b border-border-soft pb-6">
              {lesson.summary}
            </p>

            {/* Learning Objectives Box */}
            <div className="mt-6 p-5 bg-brand-soft/70 border border-brand-tint rounded-2xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-ink mb-2">
                By the end of this lesson, you will be able to:
              </h3>
              <ul className="space-y-1.5 text-xs text-ink font-medium">
                {lesson.objectives.map((obj) => (
                  <li key={obj} className="flex items-start gap-2">
                    <span className="text-brand-strong font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Sections */}
            <div className="mt-8 space-y-8">
              {lesson.sections.map((sec, idx) => (
                <div key={sec.title} className="space-y-3">
                  <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surface-sunken text-body text-xs font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    {sec.title}
                  </h2>
                  <p className="text-sm text-body leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                  {sec.example && (
                    <div className="p-4 bg-surface-soft border-l-4 border-brand rounded-r-xl text-xs text-ink leading-relaxed font-mono">
                      <b className="block text-xs uppercase font-bold text-brand-strong tracking-wider mb-1 font-sans">
                        ILLUSTRATIVE DEMONSTRATION
                      </b>
                      {sec.example}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Knowledge Check Quiz */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-warning-soft text-warning text-xs font-bold px-2.5 py-0.5 rounded-full">
                  KNOWLEDGE CHECK
                </span>
                <span className="text-xs text-subtle">Test your understanding</span>
              </div>
              <h3 className="text-lg font-bold text-ink mb-4">{lesson.quiz.question}</h3>

              <div className="space-y-2.5">
                {lesson.quiz.options.map((option, optIdx) => {
                  let styleClass = 'border-border bg-surface hover:border-brand-tint'
                  if (quizSubmitted) {
                    if (optIdx === lesson.quiz.correctIndex) {
                      styleClass = 'border-success bg-success-soft text-success font-medium'
                    } else if (selectedQuizAnswer === optIdx) {
                      styleClass = 'border-danger bg-danger-soft text-danger'
                    }
                  } else if (selectedQuizAnswer === optIdx) {
                    styleClass = 'border-brand bg-brand-soft/50 text-ink font-medium'
                  }

                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => !quizSubmitted && setSelectedQuizAnswer(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs flex items-center justify-between ${styleClass}`}
                    >
                      <span>{option}</span>
                      {quizSubmitted && optIdx === lesson.quiz.correctIndex && (
                        <span className="text-success font-bold text-sm">✓ Correct</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleQuizSubmit}
                  disabled={selectedQuizAnswer === null}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-brand disabled:opacity-40 text-inverse text-xs font-bold hover:bg-brand-hover transition-all shadow-sm"
                >
                  Check Answer
                </button>
              ) : (
                <div className="mt-4 p-4 bg-surface-soft rounded-xl text-xs text-body">
                  <b className="font-bold block mb-1">Explanation:</b>
                  {lesson.quiz.explanation}
                </div>
              )}
            </div>

            {/* Lesson Completion Action */}
            <div className="mt-10 pt-6 border-t border-border-soft flex items-center justify-between">
              <Link href="/learn" className="text-xs font-bold text-muted hover:text-ink">
                ← Return to Academy
              </Link>
              <RippleButton
                variant={lessonFinished ? 'secondary' : 'primary'}
                size="md"
                onClick={handleMarkComplete}
              >
                {lessonFinished ? '✓ Lesson Completed' : 'Mark Lesson as Complete →'}
              </RippleButton>
            </div>
          </article>

          {/* Side Assistant / Notes Rail */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface p-6 rounded-3xl border border-border/90 shadow-sm">
              <span className="kicker">PRACTICE COMPANION</span>
              <h3 className="font-bold text-base text-ink mt-1">Try this in an AI mock</h3>
              <p className="text-xs text-body mt-2 leading-relaxed">
                Now that you understand the framework, test your spoken delivery in the AI Interview
                Studio.
              </p>
              <Link
                href="/app/candidate"
                className="mt-4 block w-full text-center py-3 rounded-xl bg-brand text-inverse text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
              >
                Launch AI Practice Session →
              </Link>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-border/90 shadow-sm">
              <span className="kicker">PERSONAL SCRATCHPAD</span>
              <h3 className="font-bold text-base text-ink mt-1">Private Lesson Notes</h3>
              <textarea
                placeholder="Jot down notes, personal stories, or ideas to include in your introduction..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
                className="mt-3 w-full p-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
              />
              <span className="text-xs text-subtle block mt-1.5">
                Saved in your candidate workspace.
              </span>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
