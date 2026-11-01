import React from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { RippleButton } from '@/components/ui/RippleButton'

export default function PricingPage() {
  const tiers = [
    {
      name: 'Starter Practice',
      price: '₹0',
      period: 'forever',
      description: 'Ideal for trying out AI interview practice and getting baseline feedback.',
      features: [
        '3 full AI mock interviews per month',
        'Basic performance breakdown',
        'Access to Foundations learning modules',
        'Explore verified question bank',
        'Browse verified mentor profiles',
      ],
      cta: 'Get Started Free',
      href: '/onboarding/candidate',
      highlighted: false,
    },
    {
      name: 'Practice Plus',
      price: '₹499',
      period: 'per month',
      description: 'Everything you need to systematically prepare, refine your answers and improve scores.',
      features: [
        'Unlimited AI interview practice sessions',
        'In-depth rubric evaluations & timecode quotes',
        'Full access to Answer Learning Lab',
        'STAR & PREP interactive drafting builders',
        'Personalized roadmap & task planner',
        'Exportable PDF evaluation reports',
      ],
      cta: 'Start 7-Day Trial',
      href: '/onboarding/candidate',
      highlighted: true,
      badge: 'MOST POPULAR',
    },
    {
      name: 'Career Pro + Mentor Pass',
      price: '₹1,499',
      period: 'per month',
      description: 'Unlimited AI practice combined with included human mentor mock interview credits.',
      features: [
        'Everything in Practice Plus',
        '1 monthly 1:1 verified mentor mock interview (45m)',
        'Personalized human feedback scorecard',
        'Priority queue for AI voice rooms',
        'Resume & DAF deep analysis',
        'Direct mentor messaging for session prep',
      ],
      cta: 'Upgrade to Career Pro',
      href: '/onboarding/candidate',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/pricing" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-14 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow mb-3">TRANSPARENT, STUDENT-FRIENDLY PRICING</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Invest in your preparation with total confidence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            No hidden fees, no deceptive success guarantees. Choose a plan that fits your preparation timeline and upgrade or cancel at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col justify-between border transition-all ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-white to-indigo-50/40 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10'
                  : 'bg-white border-zinc-200/90 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-zinc-900">{tier.name}</h3>
                  {tier.badge && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900">{tier.price}</span>
                  <span className="text-xs text-zinc-500 font-medium">/ {tier.period}</span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                  {tier.description}
                </p>

                <div className="pt-6 border-t border-zinc-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
                    WHAT'S INCLUDED:
                  </span>
                  <ul className="space-y-3 text-xs text-zinc-700">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100">
                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 rounded-xl font-bold text-xs transition-all ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-95'
                      : 'bg-slate-800 text-white hover:bg-slate-700 shadow-sm'
                  }`}
                >
                  {tier.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 1:1 Mentor Pay-As-You-Go FAQ */}
        <div className="mt-16 bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Can I book 1:1 human mentors without a monthly subscription?</h2>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl">
            Yes! All candidate accounts have full access to book 1:1 human mock interview sessions on a direct pay-as-you-go basis. You pay only for the session you choose (e.g. ₹799 to ₹1,499 per session), with zero subscription commitment required.
          </p>
          <div className="mt-4">
            <Link href="/mentors" className="text-xs font-bold text-indigo-600 hover:underline">
              Explore mentor hourly rates & services →
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
