'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { initialQuestions } from '@/lib/data/mock-db'

export default function QuestionBankIndexPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({
    'q-101': true,
    'q-102': true,
  })

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedMap(prev => ({ ...prev, [id]: !prev[id] }))
    fetch(`/api/v1/questions/${id}`, { method: 'POST' }).catch(() => {})
  }

  const filtered = initialQuestions.filter(q => {
    const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty
    const matchCat = selectedCategory === 'All' || q.category === selectedCategory
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
                        q.intent.toLowerCase().includes(search.toLowerCase())
    return matchDiff && matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/question-bank" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <span className="eyebrow mb-3">CURATED QUESTION BANK</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Practise with Purpose: Verified Question Prompts
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-3xl">
            Explore authentic interview prompts across technical, behavioral, and governmental interview tracks. Learn the interviewer’s hidden intent and practice recommended answer structures.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Search prompts by keyword, competency or question..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-96 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <button
                  key={diff}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(q => (
            <div
              key={q.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/90 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-3">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider text-[11px]">
                    {q.category} · {q.difficulty}
                  </span>
                  <button
                    onClick={e => toggleSave(q.id, e)}
                    className={`flex items-center gap-1 hover:text-indigo-600 ${
                      savedMap[q.id] ? 'text-indigo-600 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    <span>{savedMap[q.id] ? '★ Saved' : '☆ Save'}</span>
                  </button>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 leading-snug">
                  {q.title}
                </h3>

                <div className="mt-3 p-3 bg-zinc-50 rounded-xl text-xs text-zinc-600">
                  <b className="font-semibold text-zinc-800 block mb-0.5">Interviewer Intent:</b>
                  {q.intent}
                </div>

                <div className="mt-3.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Framework:
                  </span>
                  <span className="text-xs text-indigo-900 font-medium bg-indigo-50/50 px-2.5 py-1 rounded-md inline-block">
                    {q.framework}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Practised {q.timesPractised} times</span>
                <div className="flex gap-2">
                  <Link
                    href={`/question-bank/${q.id}`}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors"
                  >
                    View Breakdown
                  </Link>
                  <Link
                    href="/app/candidate"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 inline-flex items-center gap-1"
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
