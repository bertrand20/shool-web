import { useState, useEffect } from 'react'
import { Boxes, Plus, Trash2, Pencil, CheckCircle, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function InventoryManager() {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ item_name: '', category: 'Other', quantity: 0, unit: '', min_stock: 0, unit_cost: 0, location: '', supplier: '', notes: '' })

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error('Fetch failed')
    return res.json()
  }

  const load = async () => {
    const [i, s] = await Promise.all([fetchData(API + '/inventory'), fetchData(API + '/inventory/summary')])
    setItems(i)
    setSummary(s)
  }

  useEffect(() => { load().catch(() => setMsg({ type: 'error', text: t('inventory.loadFailed') })) }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.item_name) return setMsg({ type: 'error', text: t('inventory.itemNameRequired') })
    try {
      const opts = { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(form) }
      const res = await fetch(API + (editing ? '/inventory/' + editing.id : '/inventory'), opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('saveFailed'))
      setMsg({ type: 'success', text: editing ? t('inventory.itemUpdated') : t('inventory.itemAdded') })
      setShowForm(false)
      setEditing(null)
      setForm({ item_name: '', category: 'Other', quantity: 0, unit: '', min_stock: 0, unit_cost: 0, location: '', supplier: '', notes: '' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('inventory.deleteConfirm'))) return
    await fetch(API + '/inventory/' + id, { method: 'DELETE', headers: authHeaders })
    load()
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({ item_name: item.item_name, category: item.category, quantity: item.quantity, unit: item.unit || '', min_stock: item.min_stock, unit_cost: item.unit_cost, location: item.location || '', supplier: item.supplier || '', notes: item.notes || '' })
    setShowForm(true)
  }

  const adjust = async (item, delta) => {
    const res = await fetch(API + '/inventory/' + item.id + '/adjust', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ quantity: delta }) })
    const data = await res.json()
    if (!res.ok) return setMsg({ type: 'error', text: data.error || t('inventory.adjustFailed') })
    load()
  }

  const lowStock = items.filter(i => i.quantity <= i.min_stock)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('inventory')}</h1>
        <p className="page-subtitle text-emerald-100">{t('inventory.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold">{summary.items}</p><p className="text-xs text-emerald-100">{t('inventory.itemTypes')}</p></div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold">{summary.total_qty}</p><p className="text-xs text-emerald-100">{t('inventory.totalUnits')}</p></div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold">{parseFloat(summary.total_value).toLocaleString()}</p><p className="text-xs text-emerald-100">{t('inventory.totalValue')}</p></div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold text-amber-300">{summary.low_stock}</p><p className="text-xs text-emerald-100">{t('inventory.lowStock')}</p></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-emerald-100">{items.length} {t('inventory.items')}{lowStock.length > 0 && <span className="text-amber-300 ml-2">· {lowStock.length} {t('inventory.needRestocking')}</span>}</p>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('inventory.addItem')}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input placeholder={t('itemName')} value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="input-field text-sm" required />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="select-field text-sm">
            <option>Textbook</option><option>Sports</option><option>Furniture</option><option>Electronics</option><option>Stationery</option><option>Uniform</option><option>Other</option>
          </select>
          <input type="number" min="0" placeholder={t('quantity')} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field text-sm" />
          <input placeholder={t('inventory.unit')} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field text-sm" />
          <input type="number" min="0" placeholder={t('inventory.minStock')} value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className="input-field text-sm" />
          <input type="number" min="0" step="0.01" placeholder={t('inventory.unitCost')} value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} className="input-field text-sm" />
          <input placeholder={t('location')} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field text-sm" />
          <input placeholder={t('supplier')} value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="input-field text-sm" />
          <textarea placeholder={t('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field text-sm sm:col-span-4" rows="2" />
          <div className="sm:col-span-4 flex gap-2">
            <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{editing ? t('update') : t('inventory.addItem')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        {items.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('inventory.noItems')}</p>}
        {items.map(i => {
          const isLow = i.quantity <= i.min_stock
          return (
            <div key={i.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Boxes size={16} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{i.item_name} <span className="text-emerald-100/60 font-normal">· {i.category}</span></p>
                <p className="text-xs text-emerald-100/70 truncate">{i.location || t('inventory.unassigned')}{i.supplier ? ' · ' + i.supplier : ''}{i.unit_cost ? ' · ' + t('inventory.cost') + ' ' + parseFloat(i.unit_cost).toFixed(2) : ''}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => adjust(i, -1)} className="p-1 hover:bg-white/15 rounded text-red-300"><ArrowDownCircle size={14} /></button>
                <span className={`text-sm font-bold w-14 text-center ${isLow ? 'text-amber-300' : 'text-white'}`}>{i.quantity}{i.unit ? ' ' + i.unit : ''}</span>
                <button onClick={() => adjust(i, 1)} className="p-1 hover:bg-white/15 rounded text-emerald-300"><ArrowUpCircle size={14} /></button>
              </div>
              <button onClick={() => startEdit(i)} className="p-1 hover:bg-white/15 rounded text-white/70"><Pencil size={13} /></button>
              <button onClick={() => handleDelete(i.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
