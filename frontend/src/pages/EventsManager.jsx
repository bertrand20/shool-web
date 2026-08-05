import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Trash2, Pencil, CheckCircle, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function EventsManager() {
  const { t } = useI18n()
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', event_type: 'Academic', is_holiday: false })

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error(t('events.fetchFailed'))
    return res.json()
  }

  useEffect(() => {
    fetchData(API + '/events').then(setEvents).catch(() => setMsg({ type: 'error', text: t('events.loadFailed') }))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.event_date) return setMsg({ type: 'error', text: t('events.titleDateRequired') })
    try {
      const opts = { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(form) }
      const res = await fetch(API + (editing ? '/events/' + editing.id : '/events'), opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('events.saveFailed'))
      setMsg({ type: 'success', text: editing ? t('events.updated') : t('events.created') })
      setShowForm(false)
      setEditing(null)
      setForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', event_type: 'Academic', is_holiday: false })
      setEvents(await fetchData(API + '/events'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('events.deleteConfirm'))) return
    await fetch(API + '/events/' + id, { method: 'DELETE', headers: authHeaders })
    setEvents(events.filter(e => e.id !== id))
  }

  const startEdit = (e) => {
    setEditing(e)
    setForm({ title: e.title, description: e.description || '', event_date: e.event_date ? e.event_date.slice(0, 10) : '', start_time: e.start_time ? e.start_time.slice(0, 5) : '', end_time: e.end_time ? e.end_time.slice(0, 5) : '', location: e.location || '', event_type: e.event_type, is_holiday: Boolean(e.is_holiday) })
    setShowForm(true)
  }

  const sorted = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
  const upcoming = sorted.filter(e => new Date(e.event_date + 'T00:00:00') >= new Date(new Date().toDateString()))

  const typeColor = (t) => t === 'Holiday' ? 'bg-red-400/20 text-red-100' : t === 'Sports' ? 'bg-amber-400/20 text-amber-100' : t === 'Academic' ? 'bg-blue-400/20 text-blue-100' : 'bg-white/15 text-white/80'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('events.calendarTitle')}</h1>
        <p className="page-subtitle text-emerald-100">{t('events.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-emerald-100">{upcoming.length} {t('events.upcoming')} · {events.length} {t('events.total')}</p>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('events.add')}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <input placeholder={t('title')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field text-sm" required />
          <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="input-field text-sm" required />
          <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })} className="select-field text-sm">
            <option value="Academic">{t('events.typeAcademic')}</option><option value="Sports">{t('events.typeSports')}</option><option value="Cultural">{t('events.typeCultural')}</option><option value="Holiday">{t('events.typeHoliday')}</option><option value="Meeting">{t('events.typeMeeting')}</option><option value="Other">{t('events.typeOther')}</option>
          </select>
          <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="input-field text-sm" />
          <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="input-field text-sm" />
          <input placeholder={t('location')} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field text-sm" />
          <textarea placeholder={t('description')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm sm:col-span-3" rows="2" />
          <label className="flex items-center gap-2 text-sm text-emerald-100">
            <input type="checkbox" checked={form.is_holiday} onChange={e => setForm({ ...form, is_holiday: e.target.checked })} className="w-4 h-4" /> {t('events.markAsHoliday')}
          </label>
          <div className="sm:col-span-3 flex gap-2">
            <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{editing ? t('update') : t('events.add')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map(ev => {
          const d = new Date(ev.event_date + 'T00:00:00')
          const isPast = d < new Date(new Date().toDateString())
          return (
            <div key={ev.id} className={`bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-center">
                  <div><p className="text-sm font-bold text-white leading-none">{d.getDate()}</p><p className="text-[9px] text-emerald-100 leading-none mt-0.5">{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</p></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{ev.title}</p>
                  <p className="text-xs text-emerald-100/70">{d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}{ev.start_time ? ' · ' + ev.start_time.slice(0, 5) : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(ev)} className="p-1 hover:bg-white/15 rounded text-white/70"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(ev.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-2 ${typeColor(ev.event_type)}`}><CalendarDays size={11} /> {ev.event_type}{ev.is_holiday ? ' · ' + t('events.typeHoliday') : ''}</span>
                {ev.location && <p className="text-xs text-emerald-100/60">📍 {ev.location}</p>}
                {ev.description && <p className="text-xs text-emerald-100/50 mt-1 line-clamp-2">{ev.description}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
