'use client'

import AdminApp from '@/components/AdminApp'
import { PrototypeProvider } from '@/components/PrototypeState'

export default function AdminConsolePage() {
  return (
    <PrototypeProvider>
      <AdminApp
        exit={() => {
          window.location.href = '/'
        }}
      />
    </PrototypeProvider>
  )
}
