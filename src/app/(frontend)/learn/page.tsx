'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { InlineLoadState } from '@/components/ui/LoadState'
import { useApi } from '@/lib/use-api'
import type { LearningLesson } from '@/types'

export default function LearnIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { data, loading, error } = useApi<LearningLesson[]>('/learning/lessons')
  const initialLessons = data ?? []

  const categories = ['All', 'Foundations', 'Communication', 'Behavioural', 'Technical']

  const filtered = initialLessons.filter((lesson) => {
    const matchesCategory = selectedCategory === 'All' || lesson.category === selectedCategory
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/learn" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <span className="eyebrow mb-3">LEARNING ACADEMY</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Learn How to Answer with Structure & Confidence
          </h1>
          <p className="mt-3 text-base sm:text-lg text-body max-w-3xl">
            Short, focused frameworks that build transferable interview ability. Master the intent
            behind questions, learn to structure your personal experience, and avoid common traps.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search lessons and frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"
              />
            </div>

            <div className="category-bar flex flex-wrap gap-2 w-full sm:w-auto">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={selectedCategory === c ? 'active font-bold' : ''}
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <InlineLoadState loading={loading} error={error} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((lesson) => (
            <article
              key={lesson.id}
              className="bg-surface rounded-3xl border border-border/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-brand hover:shadow-md transition-all group"
            >
              <div className="p-7">
                <div className="flex items-center justify-between text-xs font-bold text-subtle mb-4">
                  <span className="tag">{lesson.category}</span>
                  <span>
                    {lesson.duration} · {lesson.level}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-ink group-hover:text-brand-strong transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-sm text-body mt-2.5 leading-relaxed line-clamp-3">
                  {lesson.summary}
                </p>

                <div className="mt-6 pt-5 border-t border-border-soft">
                  <small className="text-xs font-bold text-subtle uppercase tracking-wider block mb-2">
                    Learning Outcomes
                  </small>
                  <ul className="space-y-1.5 text-xs text-body">
                    {lesson.objectives.slice(0, 2).map((obj) => (
                      <li key={obj} className="flex items-start gap-1.5">
                        <span className="text-success font-bold">✓</span>
                        <span className="line-clamp-1">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-5 bg-surface-soft border-t border-border-soft flex items-center justify-between">
                <span className="text-xs text-muted font-medium">Interactive quiz included</span>
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-sm inline-block"
                >
                  Start Lesson →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
