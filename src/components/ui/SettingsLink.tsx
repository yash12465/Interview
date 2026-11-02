import { Settings } from 'lucide-react'
import Link from 'next/link'

// Gear button in the public headers, linking to /settings (appearance).
export function SettingsLink() {
  return (
    <Link
      href="/settings"
      className="icon-button settings-link"
      aria-label="Settings"
      title="Settings"
    >
      <Settings size={20} />
    </Link>
  )
}
