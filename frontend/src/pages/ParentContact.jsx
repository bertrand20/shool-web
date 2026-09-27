import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function ParentContact() {
  const { t } = useI18n()
  const [schoolInfo, setSchoolInfo] = useState({})
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`${API}/portal/school-info`)
      .then((r) => r.json())
      .then(setSchoolInfo)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch(`${API}/portal/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send your message')
      setSent(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Phone size={24} className="text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('parentContact.contactUs')}</h1>
          <p className="text-sm text-gray-500">{t('parentContact.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {schoolInfo.contact_address && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <MapPin size={18} className="text-emerald-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('address')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_address}</p>
            </div>
          )}
          {schoolInfo.contact_phone && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Phone size={18} className="text-emerald-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('phone')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_phone}</p>
            </div>
          )}
          {schoolInfo.contact_email && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Mail size={18} className="text-emerald-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('email')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_email}</p>
            </div>
          )}
          {schoolInfo.contact_hours && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Clock size={18} className="text-emerald-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('parentContact.officeHours')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_hours}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('parentContact.sendMessage')}</h2>
            {sent && (
              <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                {t('parentContact.messageSent')}
              </div>
            )}
            {submitError && (
              <div role="alert" className="mb-4 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder={t('parentContact.yourName')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder={t('parentContact.yourEmailPlaceholder')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('subject')}</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder={t('parentContact.howCanWeHelp')}
                />
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('message')}</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    placeholder={t('parentContact.messagePlaceholder')}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Send size={15} />
                {submitting ? t('loading') : t('parentContact.sendMessageBtn')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
