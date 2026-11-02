import AdminApp from '@/components/AdminApp'
import { PrototypeProvider } from '@/components/PrototypeState'

export default function StaffPortalPage() {
  return (
    <PrototypeProvider>
      <AdminApp />
    </PrototypeProvider>
  )
}
