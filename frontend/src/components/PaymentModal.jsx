import { useState, useEffect } from 'react'
import { X, CreditCard } from 'lucide-react'
import { useI18n } from '../i18n/context'

export default function PaymentModal({ isOpen, onClose, onSave, students, fees }) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    student_id: '',
    fee_id: '',
    amount_paid: '',
    payment_method: 'Cash',
    receipt_number: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setForm({
        student_id: '',
        fee_id: '',
        amount_paid: '',
        payment_method: 'Cash',
        receipt_number: '',
        notes: '',
      })
      setError(null)
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'fee_id' && value) {
      const fee = fees?.find((f) => f.id === parseInt(value))
      if (fee) {
        setForm((prev) => ({ ...prev, fee_id: value, amount_paid: fee.amount }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_id || !form.fee_id || !form.amount_paid) {
      setError(t('error.paymentFieldsRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        ...form,
        amount_paid: parseFloat(form.amount_paid),
        student_id: parseInt(form.student_id),
        fee_id: parseInt(form.fee_id),
      })
      onClose()
    } catch (err) {
      setError(err.message || t('error.failedRecordPayment'))
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
            <CreditCard size={18} className="text-school-primary-light" />
            {t('recordPayment')}
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
            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('student')} *</label>
              <select name="student_id" value={form.student_id} onChange={handleChange} className="select-field">
                <option value="">{t('selectStudent')}</option>
                {students?.map((s) => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.class_name} - {s.class_section})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('feeType')} *</label>
              <select name="fee_id" value={form.fee_id} onChange={handleChange} className="select-field">
                <option value="">{t('selectFee')}</option>
                {fees?.map((f) => (
                  <option key={f.id} value={f.id}>{f.fee_type} - ${f.amount} ({f.class_name} - {f.class_section})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('amount')} *</label>
                <input
                  name="amount_paid"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount_paid}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-school-muted mb-1">{t('paymentMethod')}</label>
                <select name="payment_method" value={form.payment_method} onChange={handleChange} className="select-field">
                  <option value="Cash">{t('cash')}</option>
                  <option value="Bank Transfer">{t('bankTransfer')}</option>
                  <option value="Card">{t('card')}</option>
                  <option value="Online">{t('online')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('receiptNumber')}</label>
              <input name="receipt_number" value={form.receipt_number} onChange={handleChange} className="input-field" placeholder={t('receiptPlaceholder')} />
            </div>

            <div>
              <label className="block text-xs font-medium text-school-muted mb-1">{t('notes')}</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input-field resize-none" placeholder={t('notesPlaceholder')} />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">{t('cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
            <CreditCard size={15} />
            {saving ? t('recording') : t('recordPayment')}
          </button>
        </div>
      </div>
    </div>
  )
}
