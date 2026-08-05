import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { useI18n } from '../i18n/context'

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: 'Male',
  class_id: '',
  guardian_name: '',
  guardian_phone: '',
  address: '',
}

export default function AddStudentModal({ isOpen, onClose, onSave, classes, editStudent }) {
  const { t } = useI18n()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editStudent) {
      setForm({
        first_name: editStudent.first_name || '',
        last_name: editStudent.last_name || '',
        email: editStudent.email || '',
        phone: editStudent.phone || '',
        date_of_birth: editStudent.date_of_birth ? editStudent.date_of_birth.split('T')[0] : '',
        gender: editStudent.gender || 'Male',
        class_id: editStudent.class_id || '',
        guardian_name: editStudent.guardian_name || '',
        guardian_phone: editStudent.guardian_phone || '',
        address: editStudent.address || '',
      })
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [editStudent, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError(t('error.firstLastRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(form, editStudent?.id)
      onClose()
    } catch (err) {
      setError(err.message || t('error.failedSaveStudent'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-school-text">
            {editStudent ? t('editStudent') : t('modal.newStudentEnrollment')}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-school-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('firstName')} *</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('lastName')} *</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('email')}</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('phone')}</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('dateOfBirth')}</label>
              <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('gender')}</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-school-muted mb-1">{t('class')}</label>
              <select name="class_id" value={form.class_id} onChange={handleChange} className="select-field">
                <option value="">{t('selectClass')}</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {t('section')} {c.section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('guardianName')}</label>
              <input name="guardian_name" value={form.guardian_name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('guardianPhone')}</label>
              <input name="guardian_phone" value={form.guardian_phone} onChange={handleChange} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-school-muted mb-1">{t('address')}</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="input-field resize-none" />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">{t('cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
            <Save size={15} />
            {saving ? t('saving') : editStudent ? t('updateStudent') : t('enrollStudent')}
          </button>
        </div>
      </div>
    </div>
  )
}
