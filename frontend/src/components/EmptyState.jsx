import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-school-muted" />
      </div>
      <p className="text-sm font-medium text-school-text mb-1">{title}</p>
      {description && (
        <p className="text-sm text-school-muted mb-4 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  )
}
