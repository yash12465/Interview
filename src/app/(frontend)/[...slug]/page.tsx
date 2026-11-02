import { notFound } from 'next/navigation'

// The root layout lives in this route group, so its not-found.tsx only renders for notFound()
// calls. Sending every unmatched URL here gives them the same branded 404 page.
export default function UnmatchedRoutePage() {
  notFound()
}
