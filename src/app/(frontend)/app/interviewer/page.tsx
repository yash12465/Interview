'use client'

import InterviewerApp from '@/components/InterviewerApp'
import { PrototypeProvider } from '@/components/PrototypeState'

export default function InterviewerDashboardPage() {
  return (
    <PrototypeProvider>
      <InterviewerApp
        exit={() => {
          window.location.href = '/'
        }}
      />
    </PrototypeProvider>
  )
}
