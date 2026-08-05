import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/context'
import { DollarSign, Search, Edit2, Trash2, X, CheckCircle, Receipt, Clock } from 'lucide-react'

const API = '/api'

export default function PaymentsManager() {
  const { t } = useI18n()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editMethod, setEditMethod] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [msg, setMsg] = useState(null)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      setPayments(await res.json())
    } catch {
      setMsg({ type: 'error', text: t('payments.loadFailed') })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayments() }, [])

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.student_first?.toLowerCase().includes(q) ||
      p.student_last?.toLowerCase().includes(q) ||
      p.fee_type?.toLowerCase().includes(q) ||
      p.receipt_number?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    )
  })

  const totalCollected = filtered.reduce((s, p) => s + parseFloat(p.amount_paid), 0)

  const startEdit = (p) => {
    setEditing(p)
    setEditAmount(String(p.amount_paid))
    setEditMethod(p.payment_method)
    setEditNotes(p.notes || '')
  }

  const handleUpdate = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API}/admin/payments/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount_paid: parseFloat(editAmount), payment_method: editMethod, notes: editNotes }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setMsg({ type: 'success', text: t('payments.updated') })
      setEditing(null)
      fetchPayments()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API}/admin/payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(t('payments.deleteFailed'))
      setMsg({ type: 'success', text: t('payments.deleted') })
      setDeleteConfirm(null)
      fetchPayments()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('payments')}</h1>
        <p className="page-subtitle">{t('payments.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${
          msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {msg.type === 'error' ? <CheckCircle size={16} /> : <CheckCircle size={16} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="panel-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-school-muted">{t('payments.totalPayments')}</p>
              <p className="text-lg font-bold text-school-text">{filtered.length}</p>
            </div>
          </div>
        </div>
        <div className="panel-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt size={18} />
            </div>
            <div>
              <p className="text-xs text-school-muted">{t('billing.totalCollected')}</p>
              <p className="text-lg font-bold text-emerald-600">${totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="panel-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-school-muted">{t('payments.onlinePayments')}</p>
              <p className="text-lg font-bold text-school-text">{filtered.filter(p => p.recorded_by === 'Parent Online').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('payments.searchPlaceholder')}
            className="input-field pl-9 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-school-muted text-sm">{t('payments.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-school-muted text-sm">
          {payments.length === 0 ? t('noPaymentsRecorded') : t('payments.noMatch')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-school-border">
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('payments.id')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('student')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('class')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('feeType')}</th>
                <th className="text-right py-3 px-3 font-medium text-school-muted text-xs">{t('amount')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('payments.method')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('date')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('payments.receipt')}</th>
                <th className="text-left py-3 px-3 font-medium text-school-muted text-xs">{t('payments.recordedBy')}</th>
                <th className="text-right py-3 px-3 font-medium text-school-muted text-xs">{t('payments.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-school-border/50 table-row-interactive">
                  <td className="py-3 px-3 font-mono text-xs text-school-muted">{p.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-school-text">{p.student_first} {p.student_last}</span>
                  </td>
                  <td className="py-3 px-3 text-school-muted">{p.class_name} {p.section}</td>
                  <td className="py-3 px-3 text-school-text">{p.fee_type}</td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                    ${parseFloat(p.amount_paid).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.payment_method === 'Online' ? 'bg-blue-100 text-blue-700' :
                      p.payment_method === 'Cash' ? 'bg-amber-100 text-amber-700' :
                      p.payment_method === 'Card' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-school-muted text-xs">{p.payment_date?.slice(0, 10)}</td>
                  <td className="py-3 px-3 font-mono text-xs text-school-muted">{p.receipt_number}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.recorded_by === 'Parent Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.recorded_by}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-school-muted hover:text-school-primary transition-colors" title={t('payments.edit')}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-school-muted hover:text-red-600 transition-colors" title={t('payments.delete')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-school-text">{t('payments.editPayment')} #{editing.id}</h3>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.amountDollar')}</label>
                <input type="number" step="0.01" min="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                  className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('paymentMethod')}</label>
                <select value={editMethod} onChange={(e) => setEditMethod(e.target.value)} className="select-field text-sm">
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.notes')}</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="input-field text-sm resize-none" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">{t('cancel')}</button>
              <button onClick={handleUpdate} disabled={saving} className="btn-primary btn-sm">
                {saving ? t('payments.saving') : t('payments.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content animate-slide-up max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body text-center py-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('payments.deleteConfirm')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('payments.deleteWarningPayment')} #{deleteConfirm.id} {t('payments.deleteWarningFor')} ${parseFloat(deleteConfirm.amount_paid).toFixed(2)} {t('payments.deleteWarningRemoved')}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary btn-sm">{t('cancel')}</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger btn-sm">{t('payments.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
