import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
})

const fields = [
  { key: 'mission', labelKey: 'schoolInfo.mission', type: 'textarea' },
  { key: 'vision', labelKey: 'schoolInfo.vision', type: 'textarea' },
  { key: 'about', labelKey: 'schoolInfo.about', type: 'textarea' },
  { key: 'contact_email', labelKey: 'schoolInfo.contactEmail', type: 'email' },
  { key: 'contact_phone', labelKey: 'schoolInfo.contactPhone', type: 'tel' },
  { key: 'contact_address', labelKey: 'address', type: 'textarea' },
  { key: 'contact_hours', labelKey: 'schoolInfo.officeHours', type: 'text' },
]

export default function SchoolInfoManager() {
  const { t } = useI18n()
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`${API}/admin/school-info`, { headers: getHeaders() })
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await fetch(`${API}/admin/school-info`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ info }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">{t('schoolInfo.information')}</h2>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Save size={14} /> {t('saveChanges')}
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {t('schoolInfo.updated')}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">{t('loading')}</p>
      ) : (
        <div className="space-y-4">
          {fields.map(({ key, labelKey, type }) => (
            <div key={key} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t(labelKey)}</label>
              {type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={info[key] || ''}
                  onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              ) : (
                <input
                  type={type}
                  value={info[key] || ''}
                  onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
