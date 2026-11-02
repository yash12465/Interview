'use client'

import type React from 'react'
import { useCallback, useRef, useState } from 'react'

export interface RippleItem {
  id: number
  x: number
  y: number
  size: number
}

export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  icon?: React.ReactNode
  fullWidth?: boolean
  className?: string
  asLinkHref?: string
}

export function RippleButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  asLinkHref,
  ...rest
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([])
  const nextId = useRef(0)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const createRipple = useCallback(
    (clientX?: number, clientY?: number) => {
      if (disabled) return
      const el = buttonRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2

      let x = rect.width / 2
      let y = rect.height / 2

      if (clientX !== undefined && clientY !== undefined) {
        x = clientX - rect.left
        y = clientY - rect.top
      }

      const id = ++nextId.current
      setRipples((prev) => [...prev, { id, x, y, size }])

      // Cleanup after ripple animation (600ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 600)
    },
    [disabled],
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e.clientX, e.clientY)
    if (onClick) {
      onClick(e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      createRipple()
    }
    if (rest.onKeyDown) {
      rest.onKeyDown(e)
    }
  }

  // Variant styling classes
  const variantStyles = {
    primary: 'bg-brand text-inverse shadow-sm hover:bg-brand-hover border-transparent',
    secondary:
      'bg-surface text-ink border border-border/90 shadow-sm hover:border-brand-tint hover:bg-surface-soft',
    quiet: 'bg-surface-sunken/80 text-body hover:bg-border border-transparent',
    danger: 'bg-danger-solid text-inverse shadow-md hover:opacity-90',
    ghost: 'bg-transparent text-body hover:bg-surface-sunken/70 border-transparent',
  }

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-2xl gap-3 font-semibold',
  }

  const content = (
    <>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
        {icon && (
          <span className="inline-flex transition-transform group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </span>
      {/* Ripple elements container */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="water-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              transform: 'translate(-50%, -50%) scale(0)',
            }}
          />
        ))}
      </span>
    </>
  )

  if (asLinkHref) {
    return (
      <a
        href={asLinkHref}
        className={`group relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 select-none overflow-hidden ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 select-none overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {content}
    </button>
  )
}
