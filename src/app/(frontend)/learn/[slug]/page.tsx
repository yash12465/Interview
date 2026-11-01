'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { RippleButton } from '@/components/ui/RippleButton'
import { initialLessons } from '@/lib/data/mock-db'

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const lesson = initialLessons.find(l => l.slug === slug) || initialLessons[0]

  const [activeSection, setActiveSection] = useState(0)
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
    fetch(`/api/v1/learning/lessons/${lesson.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPercent: 100 }),
    }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/learn" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/learn" className="hover:text-indigo-600">← Back to Learning Academy</Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">{lesson.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-8 bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">
              <span>{lesson.category}</span>
              <span>•</span>
              <span>{lesson.duration}</span>
              <span>•</span>
              <span>{lesson.level}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              {lesson.title}
            </h1>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed border-b border-zinc-100 pb-6">
              {lesson.summary}
            </p>

            {/* Learning Objectives Box */}
            <div className="mt-6 p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900 mb-2">
                By the end of this lesson, you will be able to:
              </h3>
              <ul className="space-y-1.5 text-xs text-indigo-950 font-medium">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Sections */}
            <div className="mt-8 space-y-8">
              {lesson.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    {sec.title}
                  </h2>
                  <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                  {sec.example && (
                    <div className="p-4 bg-zinc-50 border-l-4 border-indigo-500 rounded-r-xl text-xs text-zinc-800 leading-relaxed font-mono">
                      <b className="block text-[10px] uppercase font-bold text-indigo-600 tracking-wider mb-1 font-sans">
                        ILLUSTRATIVE DEMONSTRATION
                      </b>
                      {sec.example}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Knowledge Check Quiz */}
            <div className="mt-12 pt-8 border-t border-zinc-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  KNOWLEDGE CHECK
                </span>
                <span className="text-xs text-zinc-400">Test your understanding</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-4">
                {lesson.quiz.question}
              </h3>

              <div className="space-y-2.5">
                {lesson.quiz.options.map((option, optIdx) => {
                  let styleClass = 'border-zinc-200 bg-white hover:border-indigo-300'
                  if (quizSubmitted) {
                    if (optIdx === lesson.quiz.correctIndex) {
                      styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                    } else if (selectedQuizAnswer === optIdx) {
                      styleClass = 'border-rose-400 bg-rose-50 text-rose-950'
                    }
                  } else if (selectedQuizAnswer === optIdx) {
                    styleClass = 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => !quizSubmitted && setSelectedQuizAnswer(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs flex items-center justify-between ${styleClass}`}
                    >
                      <span>{option}</span>
                      {quizSubmitted && optIdx === lesson.quiz.correctIndex && (
                        <span className="text-emerald-600 font-bold text-sm">✓ Correct</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={selectedQuizAnswer === null}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 disabled:opacity-40 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-500/20"
                >
                  Check Answer
                </button>
              ) : (
                <div className="mt-4 p-4 bg-zinc-50 rounded-xl text-xs text-zinc-700">
                  <b className="font-bold block mb-1">Explanation:</b>
                  {lesson.quiz.explanation}
                </div>
              )}
            </div>

            {/* Lesson Completion Action */}
            <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center justify-between">
              <Link href="/learn" className="text-xs font-bold text-zinc-500 hover:text-zinc-800">
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
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-sm">
              <span className="kicker">PRACTICE COMPANION</span>
              <h3 className="font-bold text-base text-zinc-900 mt-1">Try this in an AI mock</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                Now that you understand the framework, test your spoken delivery in the AI Interview Studio.
              </p>
              <Link
                href="/app/candidate"
                className="mt-4 block w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-opacity"
              >
                Launch AI Practice Session →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-sm">
              <span className="kicker">PERSONAL SCRATCHPAD</span>
              <h3 className="font-bold text-base text-zinc-900 mt-1">Private Lesson Notes</h3>
              <textarea
                placeholder="Jot down notes, personal stories, or ideas to include in your introduction..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={5}
                className="mt-3 w-full p-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-400 block mt-1.5">
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
