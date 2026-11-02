import { useEffect, useRef } from 'react'

// Calls onEscape when Escape is pressed while the component is mounted: the keyboard way to
// close a dialog whose backdrop closes it on click.
export function useEscapeKey(onEscape: () => void) {
  const latest = useRef(onEscape)
  latest.current = onEscape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') latest.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
