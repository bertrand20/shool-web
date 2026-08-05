import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Trash2, CheckCircle, X } from 'lucide-react'

const API = '/api'

export default function BehaviorManager() {
  const [logs, setLogs] = useState([])
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ student_id: '', entry_type: 'Incident', title: '', description: '', entry_date: '' })

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
        const [l, s] = await Promise.all([fetchData(API + '/behavior'), fetchData(API + '/students?limit=300')])
        setLogs(l)
        setStudents(Array.isArray(s) ? s : s.students || [])
      } catch { setMsg({ type: 'error', text: 'Failed to load data' }) }
    })()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.student_id || !form.title) return setMsg({ type: 'error', text: 'Student and title are required' })
    try {
      const res = await fetch(API + '/behavior', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setMsg({ type: 'success', text: 'Behavior entry logged' })
      setShowForm(false)
      setForm({ student_id: '', entry_type: 'Incident', title: '', description: '', entry_date: '' })
      setLogs(await fetchData(API + '/behavior'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this behavior entry?')) return
    await fetch(API + '/behavior/' + id, { method: 'DELETE', headers: authHeaders })
    setLogs(logs.filter(l => l.id !== id))
  }

  const typeColor = (t) => t === 'Commendation' ? 'bg-emerald-400/20 text-emerald-100' : t === 'Warning' ? 'bg-amber-400/20 text-amber-100' : t === 'Suspension' ? 'bg-red-400/20 text-red-100' : 'bg-orange-400/20 text-orange-100'
  const filtered = filter ? logs.filter(l => l.entry_type === filter) : logs

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">Behavior & Discipline</h1>
        <p className="page-subtitle text-emerald-100">Track commendations, warnings, and incidents per student</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 overflow-x-auto">
          {[{ id: '', label: 'All' }, { id: 'Commendation', label: 'Commendations' }, { id: 'Warning', label: 'Warnings' }, { id: 'Incident', label: 'Incidents' }, { id: 'Suspension', label: 'Suspensions' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f.id ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}>{f.label}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> Log Entry</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} className="select-field text-sm" required>
            <option value="">Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
          <select value={form.entry_type} onChange={e => setForm({ ...form, entry_type: e.target.value })} className="select-field text-sm">
            <option>Commendation</option><option>Warning</option><option>Incident</option><option>Suspension</option>
          </select>
          <input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} className="input-field text-sm" />
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field text-sm" required />
          <textarea placeholder="Details" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm sm:col-span-2" rows="2" />
          <div className="sm:col-span-3 flex gap-2">
            <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">Log Entry</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">No behavior entries found</p>}
        {filtered.map(l => (
          <div key={l.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><ClipboardList size={16} className="text-white" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColor(l.entry_type)}`}>{l.entry_type}</span>
              </div>
              <p className="text-xs text-emerald-100/70 truncate">{l.student_name} · {l.class_name} {l.section} · {l.entry_date} · by {l.recorded_by}</p>
              {l.description && <p className="text-xs text-emerald-100/50 mt-0.5 truncate">{l.description}</p>}
            </div>
            <button onClick={() => handleDelete(l.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
