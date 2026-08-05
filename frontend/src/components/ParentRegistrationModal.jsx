import { useState, useEffect } from 'react'
import { X, Save, ChevronRight, ChevronLeft } from 'lucide-react'
import { useI18n } from '../i18n/context'

const emptyParent = {
  first_name: '', last_name: '', email: '', phone: '',
  occupation: '', relationship: 'Father', address: '',
}

const emptyChild = {
  first_name: '', last_name: '', email: '', phone: '',
  date_of_birth: '', gender: 'Male', class_id: '',
  address: '',
}

export default function ParentRegistrationModal({ isOpen, onClose, onSave, classes, editParent }) {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const [parentForm, setParentForm] = useState(emptyParent)
  const [childForm, setChildForm] = useState(emptyChild)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [registeredParentId, setRegisteredParentId] = useState(null)

  useEffect(() => {
    if (isOpen) {
      if (editParent) {
        setParentForm({
          first_name: editParent.first_name || '',
          last_name: editParent.last_name || '',
          email: editParent.email || '',
          phone: editParent.phone || '',
          occupation: editParent.occupation || '',
          relationship: editParent.relationship || 'Father',
          address: editParent.address || '',
        })
        setRegisteredParentId(editParent.id)
      } else {
        setParentForm(emptyParent)
        setChildForm(emptyChild)
        setRegisteredParentId(null)
      }
      setStep(1)
      setError(null)
    }
  }, [editParent, isOpen])

  const handleParentChange = (e) => {
    setParentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleChildChange = (e) => {
    setChildForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleParentSubmit = async () => {
    if (!parentForm.first_name.trim() || !parentForm.last_name.trim() || !parentForm.email.trim() || !parentForm.phone.trim()) {
      setError(t('error.parentInfoRequired'))
      return
    }
    setError(null)
    setSaving(true)
    try {
      const result = await onSave('parent', parentForm, editParent?.id)
      if (result && result.id) {
        setRegisteredParentId(result.id)
      }
      setStep(2)
    } catch (err) {
      setError(err.message || t('error.failedSaveParent'))
    } finally {
      setSaving(false)
    }
  }

  const handleChildSubmit = async () => {
    if (!childForm.first_name.trim() || !childForm.last_name.trim()) {
      setError(t('error.childNameRequired'))
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave('child', { ...childForm, parent_id: registeredParentId }, null, registeredParentId)
      onClose()
    } catch (err) {
      setError(err.message || t('error.failedRegisterChild'))
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content animate-slide-up max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="text-lg font-semibold text-school-text">
              {editParent ? t('editParentDetails') : t('parents.parentRegistration')}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-school-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <ChevronRight size={12} className="text-school-muted" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-school-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="text-xs text-school-muted ml-1">
                {step === 1 ? t('parentInfo') : t('registerChild')}
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-school-muted" />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-school-muted mb-2">{t('step1Info')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('firstName')} *</label>
                  <input name="first_name" value={parentForm.first_name} onChange={handleParentChange} className="input-field" placeholder={t('firstName')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('lastName')} *</label>
                  <input name="last_name" value={parentForm.last_name} onChange={handleParentChange} className="input-field" placeholder={t('lastName')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('email')} *</label>
                  <input name="email" type="email" value={parentForm.email} onChange={handleParentChange} className="input-field" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('phone')} *</label>
                  <input name="phone" value={parentForm.phone} onChange={handleParentChange} className="input-field" placeholder={t('phoneNumber')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('relationship')}</label>
                  <select name="relationship" value={parentForm.relationship} onChange={handleParentChange} className="select-field">
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('occupation')}</label>
                  <input name="occupation" value={parentForm.occupation} onChange={handleParentChange} className="input-field" placeholder={t('occupation')} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('address')}</label>
                <textarea name="address" value={parentForm.address} onChange={handleParentChange} rows={2} className="input-field resize-none" placeholder={t('fullAddress')} />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-school-muted">{t('step2Info')}</p>
                <button onClick={() => setStep(1)} className="text-xs text-school-primary-light hover:underline flex items-center gap-0.5">
                  <ChevronLeft size={12} /> {t('back')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('childFirstName')} *</label>
                  <input name="first_name" value={childForm.first_name} onChange={handleChildChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('childLastName')} *</label>
                  <input name="last_name" value={childForm.last_name} onChange={handleChildChange} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('email')}</label>
                  <input name="email" type="email" value={childForm.email} onChange={handleChildChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('phone')}</label>
                  <input name="phone" value={childForm.phone} onChange={handleChildChange} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('dateOfBirth')}</label>
                  <input name="date_of_birth" type="date" value={childForm.date_of_birth} onChange={handleChildChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('gender')}</label>
                  <select name="gender" value={childForm.gender} onChange={handleChildChange} className="select-field">
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-muted mb-1">{t('class')}</label>
                  <select name="class_id" value={childForm.class_id} onChange={handleChildChange} className="select-field">
                    <option value="">{t('select')}</option>
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('address')}</label>
                <textarea name="address" value={childForm.address} onChange={handleChildChange} rows={2} className="input-field resize-none" />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} className="btn-secondary btn-sm">{t('cancel')}</button>
          {step === 1 ? (
            <button onClick={handleParentSubmit} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
              {saving ? t('saving') : t('continue')}
              {!saving && <ChevronRight size={14} />}
            </button>
          ) : (
            <button onClick={handleChildSubmit} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
              <Save size={14} />
              {saving ? t('registering') : t('completeRegistration')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
