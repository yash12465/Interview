'use client'

import React from 'react'

export interface PasswordStrengthMeterProps {
  password: string
}

export function checkPasswordStrength(password: string) {
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  if (checks.length) score++
  if (checks.lowercase && checks.uppercase) score++
  if (checks.number) score++
  if (checks.special) score++

  let label = 'Very Weak'
  let color = 'bg-rose-500'
  let textColor = 'text-rose-600'

  if (score === 1) {
    label = 'Weak'
    color = 'bg-rose-500'
    textColor = 'text-rose-600'
  } else if (score === 2) {
    label = 'Fair'
    color = 'bg-amber-500'
    textColor = 'text-amber-600'
  } else if (score === 3) {
    label = 'Good'
    color = 'bg-blue-500'
    textColor = 'text-blue-600'
  } else if (score === 4) {
    label = 'Strong'
    color = 'bg-emerald-500'
    textColor = 'text-emerald-600'
  }

  return { score, label, color, textColor, checks }
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null

  const { score, label, color, textColor, checks } = checkPasswordStrength(password)

  return (
    <div className="mt-2 space-y-1.5 text-left">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-zinc-500">Password Strength:</span>
        <span className={textColor}>{label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= idx ? color : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px] text-zinc-500">
        <span className={checks.length ? 'text-emerald-600 font-medium' : ''}>
          {checks.length ? '✓' : '•'} At least 8 characters
        </span>
        <span className={checks.lowercase && checks.uppercase ? 'text-emerald-600 font-medium' : ''}>
          {checks.lowercase && checks.uppercase ? '✓' : '•'} Upper & lowercase
        </span>
        <span className={checks.number ? 'text-emerald-600 font-medium' : ''}>
          {checks.number ? '✓' : '•'} At least 1 number
        </span>
        <span className={checks.special ? 'text-emerald-600 font-medium' : ''}>
          {checks.special ? '✓' : '•'} Special symbol
        </span>
      </div>
    </div>
  )
}
