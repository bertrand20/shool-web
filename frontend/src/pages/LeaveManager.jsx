import { useState, useEffect } from 'react'
import { CalendarOff, Plus, Check, X, Trash2, CheckCircle } from 'lucide-react'

const API = '/api'

export default function LeaveManager() {
  const [requests, setRequests] = useState([])
  const [staff, setStaff] = useState([])
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ staff_id: '', leave_type: 'Casual', start_date: '', end_date: '', reason: '' })

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error('Fetch failed')
    return res.json()
  }

  useEffect(() => {
    (async () => {
      try {
        const [l, s] = await Promise.all([fetchData(API + '/leave'), fetchData(API + '/staff?limit=300')])
        setRequests(l)
        setStaff(Array.isArray(s) ? s : s.staff || [])
      } catch { setMsg({ type: 'error', text: 'Failed to load data' }) }
    })()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.staff_id || !form.start_date || !form.end_date) return setMsg({ type: 'error', text: 'Staff and dates are required' })
    try {
      const res = await fetch(API + '/leave', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      setMsg({ type: 'success', text: 'Leave request created' })
      setShowForm(false)
      setForm({ staff_id: '', leave_type: 'Casual', start_date: '', end_date: '', reason: '' })
      setRequests(await fetchData(API + '/leave'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleStatus = async (id, status) => {
    if (status === 'Approved' && !confirm('Approve this leave request?')) return
    if (status === 'Rejected' && !confirm('Reject this leave request?')) return
    const res = await fetch(API + '/leave/' + id + '/status', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ status }) })
    const data = await res.json()
    if (!res.ok) return setMsg({ type: 'error', text: data.error || 'Update failed' })
    setMsg({ type: 'success', text: data.message })
    setRequests(await fetchData(API + '/leave'))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this leave request?')) return
    await fetch(API + '/leave/' + id, { method: 'DELETE', headers: authHeaders })
    setRequests(requests.filter(r => r.id !== id))
  }

  const statusColor = (s) => s === 'Approved' ? 'bg-emerald-400/20 text-emerald-100' : s === 'Rejected' ? 'bg-red-400/20 text-red-100' : s === 'Cancelled' ? 'bg-white/15 text-white/70' : 'bg-amber-400/20 text-amber-100'
  const staffName = (id) => { const s = staff.find(x => x.id === id); return s ? s.first_name + ' ' + s.last_name : 'Unknown' }

  const filtered = filter ? requests.filter(r => r.status === filter) : requests

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">Staff Leave</h1>
        <p className="page-subtitle text-emerald-100">Manage leave requests, approvals, and staff availability</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
          {[{ id: '', label: 'All' }, { id: 'Pending', label: 'Pending' }, { id: 'Approved', label: 'Approved' }, { id: 'Rejected', label: 'Rejected' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}>{f.label}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> Add Leave Request</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })} className="select-field text-sm" required>
            <option value="">Staff Member</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
          <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })} className="select-field text-sm">
            <option>Casual</option><option>Sick</option><option>Earned</option><option>Maternity</option><option>Paternity</option><option>Unpaid</option><option>Other</option>
          </select>
          <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="input-field text-sm" required />
          <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="input-field text-sm" required />
          <input placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input-field text-sm sm:col-span-3" />
          <div className="flex gap-2 sm:col-span-4">
            <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">Create Request</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">No leave requests found</p>}
        {filtered.map(r => {
          const days = Math.max(1, Math.round((new Date(r.end_date) - new Date(r.start_date)) / 86400000) + 1)
          return (
            <div key={r.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><CalendarOff size={16} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{staffName(r.staff_id)} <span className="font-normal text-emerald-100/70">· {r.leave_type}</span></p>
                <p className="text-xs text-emerald-100/70 truncate">{r.start_date} → {r.end_date} ({days} days){r.reason ? ' · ' + r.reason : ''}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg ${statusColor(r.status)}`}>{r.status}</span>
              {r.status === 'Pending' && (
                <>
                  <button onClick={() => handleStatus(r.id, 'Approved')} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Check size={13} className="mr-1 inline" /> Approve</button>
                  <button onClick={() => handleStatus(r.id, 'Rejected')} className="btn-secondary btn-sm bg-white/10 text-white hover:bg-white/20"><X size={13} className="mr-1 inline" /> Reject</button>
                </>
              )}
              <button onClick={() => handleDelete(r.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
