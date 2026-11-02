'use client'

import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { InlineLoadState } from '@/components/ui/LoadState'
import { apiUrl } from '@/lib/api'
import { useApi } from '@/lib/use-api'
import type { QuestionItem } from '@/types'

export default function QuestionBankIndexPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const { data, loading, error } = useApi<QuestionItem[]>('/questions')
  const initialQuestions = data ?? []
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({
    'q-101': true,
    'q-102': true,
  })

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }))
    fetch(apiUrl(`/questions/${id}`), { method: 'POST' }).catch(() => {})
  }

  const filtered = initialQuestions.filter((q) => {
    const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty
    const matchCat = selectedCategory === 'All' || q.category === selectedCategory
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.intent.toLowerCase().includes(search.toLowerCase())
    return matchDiff && matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/question-bank" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <span className="eyebrow mb-3">CURATED QUESTION BANK</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Practise with Purpose: Verified Question Prompts
          </h1>
          <p className="mt-3 text-base sm:text-lg text-body max-w-3xl">
            Explore authentic interview prompts across technical, behavioral, and governmental
            interview tracks. Learn the interviewer’s hidden intent and practice recommended answer
            structures.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Search prompts by keyword, competency or question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-96 px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"
            />

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  type="button"
                  key={diff}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-brand text-inverse border-brand'
                      : 'bg-surface text-body border-border hover:bg-surface-soft'
                  }`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <InlineLoadState loading={loading} error={error} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-surface p-6 sm:p-7 rounded-3xl border border-border/90 shadow-sm hover:border-brand-tint hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-subtle mb-3">
                  <span className="bg-brand-soft text-brand-strong px-2.5 py-0.5 rounded-md uppercase tracking-wider text-xs">
                    {q.category} · {q.difficulty}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleSave(q.id, e)}
                    className={`flex items-center gap-1 hover:text-brand-strong ${
                      savedMap[q.id] ? 'text-brand-strong font-bold' : 'text-subtle'
                    }`}
                  >
                    <span>{savedMap[q.id] ? '★ Saved' : '☆ Save'}</span>
                  </button>
                </div>

                <h3 className="text-lg font-bold text-ink leading-snug">{q.title}</h3>

                <div className="mt-3 p-3 bg-surface-soft rounded-xl text-xs text-body">
                  <b className="font-semibold text-ink block mb-0.5">Interviewer Intent:</b>
                  {q.intent}
                </div>

                <div className="mt-3.5">
                  <span className="text-xs font-bold text-subtle uppercase tracking-wider block mb-1">
                    Framework:
                  </span>
                  <span className="text-xs text-ink font-medium bg-brand-soft/50 px-2.5 py-1 rounded-md inline-block">
                    {q.framework}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-soft flex items-center justify-between">
                <span className="text-xs text-subtle">Practised {q.timesPractised} times</span>
                <div className="flex gap-2">
                  <Link
                    href={`/question-bank/${q.id}`}
                    className="px-3.5 py-2 rounded-xl border border-border text-body text-xs font-bold hover:bg-surface-soft transition-colors"
                  >
                    View Breakdown
                  </Link>
                  <Link
                    href="/app/candidate"
                    className="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                  >
                    Practise Spoken Answer →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
