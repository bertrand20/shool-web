import { useState, useEffect } from 'react'
import { CalendarClock, Plus, Trash2, Pencil, CheckCircle, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function TimetableManager() {
  const { t } = useI18n()
  const [entries, setEntries] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [summary, setSummary] = useState(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ class_id: '', staff_id: '', subject_id: '', day_of_week: 'Monday', period_number: 1, start_time: '', end_time: '', location: '' })

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
        const [cls, sub, tea, sum] = await Promise.all([
          fetchData(API + '/classes'),
          fetchData(API + '/subjects'),
          fetchData(API + '/staff?limit=200&role=Teacher'),
          fetchData(API + '/timetable/summary'),
        ])
        setClasses(cls)
        setSubjects(sub)
        setTeachers(Array.isArray(tea) ? tea : tea.staff || [])
        setSummary(sum)
      } catch { setMsg({ type: 'error', text: t('common.failedToLoadData') }) }
    })()
  }, [])

  useEffect(() => {
    fetchData(API + '/timetable?class_id=' + selectedClass).then(setEntries).catch(() => {})
  }, [selectedClass])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = { ...form, class_id: parseInt(form.class_id), staff_id: form.staff_id || null, subject_id: form.subject_id || null, period_number: parseInt(form.period_number) }
      const opts = { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(body) }
      const res = await fetch(API + (editing ? '/timetable/' + editing.id : '/timetable'), opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setMsg({ type: 'success', text: editing ? t('timetable.entryUpdated') : t('timetable.entryAdded') })
      setShowForm(false)
      setEditing(null)
      setForm({ class_id: '', staff_id: '', subject_id: '', day_of_week: 'Monday', period_number: 1, start_time: '', end_time: '', location: '' })
      setEntries(await fetchData(API + '/timetable?class_id=' + selectedClass))
      setSummary(await fetchData(API + '/timetable/summary'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm(t('timetable.deleteConfirm'))) return
    await fetch(API + '/timetable/' + id, { method: 'DELETE', headers: authHeaders })
    setEntries(entries.filter(e => e.id !== id))
  }

  const startEdit = (entry) => {
    setEditing(entry)
    setForm({ class_id: String(entry.class_id), staff_id: entry.staff_id ? String(entry.staff_id) : '', subject_id: entry.subject_id ? String(entry.subject_id) : '', day_of_week: entry.day_of_week, period_number: entry.period_number, start_time: entry.start_time ? entry.start_time.slice(0, 5) : '', end_time: entry.end_time ? entry.end_time.slice(0, 5) : '', location: entry.location || '' })
    setShowForm(true)
  }

  const entriesByDay = DAYS.map(day => ({ day, items: entries.filter(e => e.day_of_week === day).sort((a, b) => a.period_number - b.period_number) }))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('timetable')}</h1>
        <p className="page-subtitle">{t('timetable.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="panel-card"><p className="text-2xl font-bold">{summary.total_entries}</p><p className="text-xs text-school-muted">{t('timetable.totalPeriods')}</p></div>
          <div className="panel-card"><p className="text-2xl font-bold">{summary.classes_scheduled}</p><p className="text-xs text-school-muted">{t('timetable.classesScheduled')}</p></div>
          <div className="panel-card"><p className="text-2xl font-bold">{summary.teachers_allocated}</p><p className="text-xs text-school-muted">{t('timetable.teachersAllocated')}</p></div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-school-text border border-school-border">
          <CalendarClock size={16} className="text-school-accent" />
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-transparent text-sm outline-none">
            <option value="" className="text-gray-800">{t('common.allClasses')}</option>
            {classes.map(c => <option key={c.id} value={c.id} className="text-gray-800">{c.name} {c.section}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
          <Plus size={14} className="mr-1 inline" /> {t('timetable.addPeriod')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="panel-card mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })} className="select-field text-sm" required>
            <option value="">{t('common.class')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <select value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })} className="select-field text-sm">
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
          <input type="number" min="1" max="10" placeholder={t('timetable.period')} value={form.period_number} onChange={e => setForm({ ...form, period_number: e.target.value })} className="input-field text-sm" required />
          <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="select-field text-sm">
            <option value="">{t('subject')}</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })} className="select-field text-sm">
            <option value="">{t('timetable.teacher')}</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select>
          <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="input-field text-sm" />
          <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="input-field text-sm" />
          <input placeholder={t('location')} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field text-sm" />
          <div className="col-span-2 sm:col-span-4 flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary btn-sm bg-white text-emerald-700">{loading ? t('common.saving') : editing ? t('update') : t('timetable.addPeriod')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {entriesByDay.map(({ day, items }) => (
          <div key={day} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-white/5 text-white text-sm font-semibold">{day} <span className="text-emerald-100 font-normal ml-1">({items.length} {t('timetable.periods')})</span></div>
            {items.length === 0 && <p className="px-4 py-3 text-xs text-emerald-100/50">{t('timetable.none')}</p>}
            {items.map(item => (
              <div key={item.id} className="px-4 py-2.5 border-t border-white/10 flex items-center gap-3">
                <span className="text-xs font-mono bg-white/15 rounded px-2 py-1 text-white w-16 text-center">{item.start_time ? item.start_time.slice(0, 5) : 'P' + item.period_number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.subject_name || t('timetable.freePeriod')}</p>
                  <p className="text-xs text-emerald-100/70 truncate">{item.teacher_name || t('common.noTeacher')} {item.location ? '· ' + item.location : ''}</p>
                </div>
                <button onClick={() => startEdit(item)} className="p-1 hover:bg-white/15 rounded text-white/70"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
