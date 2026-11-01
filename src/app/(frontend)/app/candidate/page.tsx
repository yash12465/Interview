'use client'

import React from 'react'
import CandidateApp from '@/components/CandidateApp'
import { PrototypeProvider } from '@/components/PrototypeState'

export default function CandidateDashboardPage() {
  return (
    <PrototypeProvider>
      <CandidateApp exit={() => { window.location.href = '/' }} />
    </PrototypeProvider>
  )
}
