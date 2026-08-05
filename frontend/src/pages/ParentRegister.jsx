import { useState, useEffect } from 'react'
import { UserPlus, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function ParentRegister() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)

  const { t } = useI18n()

  const [form, setForm] = useState({
    parent_first_name: '',
    parent_last_name: '',
    parent_email: '',
    parent_phone: '',
    parent_occupation: '',
    parent_relationship: 'Father',
    parent_address: '',
    student_first_name: '',
    student_last_name: '',
    student_email: '',
    student_phone: '',
    student_date_of_birth: '',
    student_gender: '',
    class_id: '',
    guardian_name: '',
    guardian_phone: '',
    student_address: '',
  })

  useEffect(() => {
    fetch(`${API}/classes`)
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => {})
  }, [])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/portal/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('parentRegister.registrationFailed'))

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('parentRegister.registrationSuccess')}</h1>
          <p className="text-gray-600 mb-4">
            <strong>{form.student_first_name} {form.student_last_name}</strong> {t('parentRegister.registeredSuccessfully')}
          </p>

          <div className="flex gap-3 justify-center">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors"
            >
              {t('parentRegister.backToHome')}
            </NavLink>
            <button
              onClick={() => {
                setSuccess(false)
                setStep(1)
                setForm({
                  parent_first_name: '', parent_last_name: '', parent_email: '', parent_phone: '',
                  parent_occupation: '', parent_relationship: 'Father', parent_address: '',
                  student_first_name: '', student_last_name: '', student_email: '', student_phone: '',
                  student_date_of_birth: '', student_gender: '', class_id: '',
                  guardian_name: '', guardian_phone: '', student_address: '',
                })
              }}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              {t('parentRegister.registerAnother')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <NavLink to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowLeft size={14} /> {t('parentRegister.backToHome')}
      </NavLink>

      <div className="flex items-center gap-3 mb-2">
        <UserPlus size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">{t('parentRegister.studentRegistration')}</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">{t('parentRegister.fillFormToEnroll')}</p>

      {error && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              step === s
                ? 'bg-emerald-600 text-white'
                : step > s
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
              {s}
            </span>
            {s === 1 ? t('parentRegister.parentDetails') : t('parentRegister.studentDetails')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t('parentRegister.parentGuardianInfo')}</h2>
            <p className="text-xs text-gray-400 mb-4">{t('parentRegister.requiredForEnrollment')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.firstName')}</label>
                <input type="text" required value={form.parent_first_name} onChange={(e) => update('parent_first_name', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Rajesh" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.lastName')}</label>
                <input type="text" required value={form.parent_last_name} onChange={(e) => update('parent_last_name', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Sharma" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.emailRequired')}</label>
                <input type="email" required value={form.parent_email} onChange={(e) => update('parent_email', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="parent@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.phoneRequired')}</label>
                <input type="tel" required value={form.parent_phone} onChange={(e) => update('parent_phone', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="9876543210" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.relationship')}</label>
                <select value={form.parent_relationship} onChange={(e) => update('parent_relationship', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Guardian</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.occupation')}</label>
                <input type="text" value={form.parent_occupation} onChange={(e) => update('parent_occupation', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('parentRegister.occupationExample')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('address')}</label>
              <textarea rows={2} value={form.parent_address} onChange={(e) => update('parent_address', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder={t('parentRegister.fullAddress')} />
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors">
                {t('parentRegister.nextStudentDetails')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t('parentRegister.studentInformation')}</h2>
            <p className="text-xs text-gray-400 mb-4">{t('parentRegister.studentBeingEnrolled')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.firstName')}</label>
                <input type="text" required value={form.student_first_name} onChange={(e) => update('student_first_name', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Aarav" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.lastName')}</label>
                <input type="text" required value={form.student_last_name} onChange={(e) => update('student_last_name', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Sharma" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('email')}</label>
                <input type="email" value={form.student_email} onChange={(e) => update('student_email', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('parentRegister.studentEmailOptional')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('phone')}</label>
                <input type="tel" value={form.student_phone} onChange={(e) => update('student_phone', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('parentRegister.optional')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('dateOfBirth')}</label>
                <input type="date" value={form.student_date_of_birth} onChange={(e) => update('student_date_of_birth', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.genderRequired')}</label>
                <select required value={form.student_gender} onChange={(e) => update('student_gender', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">{t('parentRegister.select')}</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('classLabel')}</label>
                <select value={form.class_id} onChange={(e) => update('class_id', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">{t('parentRegister.selectClass')}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.guardianName')}</label>
                <input type="text" value={form.guardian_name} onChange={(e) => update('guardian_name', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('parentRegister.defaultsToParentName')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.guardianPhone')}</label>
                <input type="tel" value={form.guardian_phone} onChange={(e) => update('guardian_phone', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('parentRegister.defaultsToParentPhone')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('parentRegister.studentAddress')}</label>
              <textarea rows={2} value={form.student_address} onChange={(e) => update('student_address', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder={t('parentRegister.leaveBlankParentAddress')} />
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                {t('back')}
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                <UserPlus size={16} />
                {loading ? t('parentRegister.registering') : t('parentRegister.registerStudent')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
