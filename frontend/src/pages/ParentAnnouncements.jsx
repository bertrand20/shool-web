import { useState, useEffect } from 'react'
import { Megaphone, Calendar } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

const priorityColor = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ParentAnnouncements() {
  const { t } = useI18n()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/portal/announcements`)
      .then((r) => r.json())
      .then(setAnnouncements)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Megaphone size={24} className="text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('announcements')}</h1>
          <p className="text-sm text-gray-500">{t('parentAnnouncements.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('loading')}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t('parentAnnouncements.noAnnouncements')}</div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${priorityColor[a.priority]}`}>
                  {a.priority}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={12} />
                  {new Date(a.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{a.title}</h2>
              <p className="text-gray-600 leading-relaxed">{a.content}</p>
              {a.image_url && (
                <img src={a.image_url} alt={a.title} className="mt-4 rounded-lg w-full max-h-64 object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
