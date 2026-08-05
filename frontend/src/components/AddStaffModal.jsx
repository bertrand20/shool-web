import { useState, useEffect } from 'react'
import { X, Save, Briefcase } from 'lucide-react'
import { useI18n } from '../i18n/context'

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  role: 'Teacher', department: '', qualification: '',
  date_of_birth: '', gender: 'Male', hire_date: '',
  salary: '', address: '', class_id: '',
}

const roleOptions = [
  'Teacher', 'Admin', 'Accountant', 'Librarian', 'Nurse', 'Security', 'Janitor', 'Driver', 'Other',
]

export default function AddStaffModal({ isOpen, onClose, onSave, classes, editStaff }) {
  const { t } = useI18n()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editStaff) {
      setForm({
        first_name: editStaff.first_name || '',
        last_name: editStaff.last_name || '',
        email: editStaff.email || '',
        phone: editStaff.phone || '',
        role: editStaff.role || 'Teacher',
        department: editStaff.department || '',
        qualification: editStaff.qualification || '',
        date_of_birth: editStaff.date_of_birth ? editStaff.date_of_birth.split('T')[0] : '',
        gender: editStaff.gender || 'Male',
        hire_date: editStaff.hire_date ? editStaff.hire_date.split('T')[0] : '',
        salary: editStaff.salary || '',
        address: editStaff.address || '',
        class_id: editStaff.class_id || '',
      })
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [editStaff, isOpen])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError(t('error.nameEmailPhoneRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : null,
        class_id: form.class_id ? parseInt(form.class_id) : null,
      }
      await onSave(payload, editStaff?.id)
      onClose()
    } catch (err) {
      setError(err.message || t('error.failedSaveStaff'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-school-text flex items-center gap-2">
            <Briefcase size={18} className="text-school-primary-light" />
            {editStaff ? t('editStaffMember') : t('addStaffMember')}
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('firstName')} *</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('lastName')} *</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('email')} *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('phone')} *</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('role')} *</label>
                <select name="role" value={form.role} onChange={handleChange} className="select-field">
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('department')}</label>
                <input name="department" value={form.department} onChange={handleChange} className="input-field" placeholder={t('departmentPlaceholder')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('qualification')}</label>
                <input name="qualification" value={form.qualification} onChange={handleChange} className="input-field" placeholder={t('qualificationPlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('gender')}</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('dateOfBirth')}</label>
                <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('hireDate')}</label>
                <input name="hire_date" type="date" value={form.hire_date} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('salary')}</label>
                <input name="salary" type="number" step="100" min="0" value={form.salary} onChange={handleChange} className="input-field" />
              </div>
            </div>

            {form.role === 'Teacher' && (
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('assignedClass')}</label>
                <select name="class_id" value={form.class_id} onChange={handleChange} className="select-field">
                  <option value="">{t('notAssigned')}</option>
                  {classes?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {t('section')} {c.section}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('address')}</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="input-field resize-none" />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">{t('cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
            <Save size={15} />
            {saving ? t('saving') : editStaff ? t('updateMember') : t('addMember')}
          </button>
        </div>
      </div>
    </div>
  )
}
