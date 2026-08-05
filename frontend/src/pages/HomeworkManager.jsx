import { useState, useEffect } from 'react'
import { BookOpenCheck, Plus, Trash2, Pencil, CheckCircle, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function HomeworkManager() {
  const { t } = useI18n()
  const [homework, setHomework] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ class_id: '', subject_id: '', staff_id: '', title: '', description: '', due_date: '', priority: 'Medium' })

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
        const [cls, sub, tea] = await Promise.all([
          fetchData(API + '/classes'),
          fetchData(API + '/subjects'),
          fetchData(API + '/staff?limit=200&role=Teacher'),
        ])
        setClasses(cls)
        setSubjects(sub)
        setTeachers(Array.isArray(tea) ? tea : tea.staff || [])
      } catch { setMsg({ type: 'error', text: t('common.failedToLoadData') }) }
    })()
  }, [])

  useEffect(() => {
    fetchData(API + '/homework' + (filter ? '?status=' + filter : '')).then(setHomework).catch(() => {})
  }, [filter])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = { ...form, class_id: parseInt(form.class_id), subject_id: form.subject_id || null, staff_id: form.staff_id || null }
      const opts = { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(body) }
      const res = await fetch(API + (editing ? '/homework/' + editing.id : '/homework'), opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setMsg({ type: 'success', text: editing ? t('homework.updated') : t('homework.posted') })
      setShowForm(false)
      setEditing(null)
      setForm({ class_id: '', subject_id: '', staff_id: '', title: '', description: '', due_date: '', priority: 'Medium' })
      setHomework(await fetchData(API + '/homework' + (filter ? '?status=' + filter : '')))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm(t('homework.deleteConfirm'))) return
    await fetch(API + '/homework/' + id, { method: 'DELETE', headers: authHeaders })
    setHomework(homework.filter(h => h.id !== id))
  }

  const startEdit = (h) => {
    setEditing(h)
    setForm({ class_id: String(h.class_id), subject_id: h.subject_id ? String(h.subject_id) : '', staff_id: h.staff_id ? String(h.staff_id) : '', title: h.title, description: h.description || '', due_date: h.due_date ? h.due_date.slice(0, 10) : '', priority: h.priority })
    setShowForm(true)
  }

  const dueClass = (d) => {
    const days = Math.ceil((new Date(d) - new Date()) / 86400000)
    if (days < 0) return 'bg-red-400/20 text-red-100'
    if (days <= 3) return 'bg-amber-400/20 text-amber-100'
    return 'bg-white/10 text-emerald-100'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('homework.pageTitle')}</h1>
        <p className="page-subtitle text-emerald-100">{t('homework.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
          {[{ id: '', label: t('common.all') }, { id: 'upcoming', label: t('homework.upcoming') }, { id: 'overdue', label: t('homework.overdue') }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}>{f.label}</button>
          ))}
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
          <Plus size={14} className="mr-1 inline" /> {t('homework.add')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })} className="select-field text-sm" required>
            <option value="">{t('common.class')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="select-field text-sm">
            <option value="">{t('subject')}</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="select-field text-sm">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <input placeholder={t('title')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field text-sm" required />
          <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="input-field text-sm" required />
          <select value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })} className="select-field text-sm">
            <option value="">{t('homework.assignedTeacher')}</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select>
          <textarea placeholder={t('homework.descriptionPlaceholder')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm sm:col-span-3" rows="2" />
          <div className="sm:col-span-3 flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary btn-sm bg-white text-emerald-700">{loading ? t('common.saving') : editing ? t('update') : t('homework.post')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        {homework.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('homework.none')}</p>}
        {homework.map(h => (
          <div key={h.id} className="px-4 py-3 border-b border-white/10 flex items-center gap-3 last:border-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><BookOpenCheck size={16} className="text-white" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-white truncate">{h.title}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${h.priority === 'High' ? 'bg-red-400/20 text-red-100' : h.priority === 'Low' ? 'bg-white/10 text-emerald-100' : 'bg-amber-400/20 text-amber-100'}`}>{h.priority}</span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-0.5">{h.class_name} {h.section} · {h.subject_name || t('homework.general')} · {h.teacher_name || t('common.noTeacher')}</p>
              {h.description && <p className="text-xs text-emerald-100/50 mt-1 truncate">{h.description}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${dueClass(h.due_date)}`}>{h.due_date}</span>
            <button onClick={() => startEdit(h)} className="p-1 hover:bg-white/15 rounded text-white/70"><Pencil size={13} /></button>
            <button onClick={() => handleDelete(h.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
