'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

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

  const createRipple = useCallback((clientX?: number, clientY?: number) => {
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
    setRipples(prev => [...prev, { id, x, y, size }])

    // Cleanup after ripple animation (600ms)
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)
  }, [disabled])

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
    primary: 'bg-gradient-to-r from-[#665dff] via-[#7c55f8] to-[#42ddf5] text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border-transparent active:translate-y-0',
    secondary: 'bg-white text-zinc-900 border border-zinc-200/90 shadow-sm hover:border-indigo-300 hover:bg-zinc-50 hover:-translate-y-0.5 active:translate-y-0',
    quiet: 'bg-zinc-100/80 text-zinc-700 hover:bg-zinc-200/80 border-transparent active:translate-y-0',
    danger: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:translate-y-0',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100/70 border-transparent active:translate-y-0',
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
        {icon && <span className="inline-flex transition-transform group-hover:translate-x-0.5">{icon}</span>}
      </span>
      {/* Ripple elements container */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        {ripples.map(r => (
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
        className={`group relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none overflow-hidden ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {content}
    </button>
  )
}
