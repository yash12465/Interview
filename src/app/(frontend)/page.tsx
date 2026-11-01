import App from '@/components/App'
import { PrototypeProvider } from '@/components/PrototypeState'

export default function HomePage() {
  return <PrototypeProvider><App /></PrototypeProvider>
}
