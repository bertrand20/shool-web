import { useState, useEffect } from 'react'
import { Bell, Send, History, Settings2, CheckCircle, X, Users, CalendarCheck, DollarSign } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function NotificationsManager() {
  const { t } = useI18n()
  const [tab, setTab] = useState('send')
  const [settings, setSettings] = useState([])
  const [logs, setLogs] = useState([])
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [staff, setStaff] = useState([])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ recipient_type: 'parent', recipient_id: '', subject: '', body: '', channel: 'email' })
  const [alertDate, setAlertDate] = useState(new Date().toISOString().slice(0, 10))

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error(t('notifications.fetchFailed'))
    return res.json()
  }

  const loadRecipients = async (type) => {
    if (type === 'parent') {
      const d = await fetchData(API + '/parents?limit=300')
      setParents(Array.isArray(d) ? d : d.parents || [])
    } else if (type === 'student') {
      const d = await fetchData(API + '/students?limit=300')
      setStudents(Array.isArray(d) ? d : d.students || [])
    } else {
      const d = await fetchData(API + '/staff?limit=300')
      setStaff(Array.isArray(d) ? d : d.staff || [])
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([fetchData(API + '/notifications/settings'), fetchData(API + '/notifications/logs?limit=30')])
        setSettings(s)
        setLogs(l)
        loadRecipients('parent')
      } catch { setMsg({ type: 'error', text: t('notifications.loadFailed') }) }
    })()
  }, [])

  const toggleSetting = async (key, value) => {
    const next = settings.map(s => s.setting_key === key ? { ...s, setting_value: value ? 1 : 0 } : s)
    setSettings(next)
    const res = await fetch(API + '/notifications/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ settings: { [key]: value } }) })
    if (!res.ok) setMsg({ type: 'error', text: t('notifications.updateSettingFailed') })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.recipient_id) return setMsg({ type: 'error', text: t('notifications.selectRecipientError') })
    setLoading(true)
    try {
      const res = await fetch(API + '/notifications/send', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('notifications.sendFailed'))
      setMsg({ type: 'success', text: `${t('notifications.notification')} ${data.status === 'sent' ? t('notifications.sentByEmail') : t('notifications.logged')}${data.to ? ' ' + t('notifications.toRecipient') + ' ' + data.to : ''}` })
      setLogs(await fetchData(API + '/notifications/logs?limit=30'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  const handleBulk = async (kind) => {
    setLoading(true)
    try {
      const url = kind === 'fees' ? API + '/notifications/fee-reminders' : API + '/notifications/attendance-alerts'
      const opts = { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(kind === 'attendance' ? { date: alertDate } : {}) }
      const res = await fetch(url, opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('notifications.failed'))
      setMsg({ type: 'success', text: data.message })
      setLogs(await fetchData(API + '/notifications/logs?limit=30'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  const recipientOptions = () => {
    const list = form.recipient_type === 'parent' ? parents : form.recipient_type === 'student' ? students : staff
    return list.map(r => <option key={r.id} value={r.id}>{r.first_name} {r.last_name}{r.email ? ' (' + r.email + ')' : ''}</option>)
  }

  const tabs = [
    { id: 'send', label: t('notifications.sendTitle'), icon: Send },
    { id: 'bulk', label: t('notifications.bulkAlerts'), icon: Users },
    { id: 'settings', label: t('settings'), icon: Settings2 },
    { id: 'logs', label: t('history'), icon: History },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('notifications')}</h1>
        <p className="page-subtitle text-emerald-100">{t('notifications.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === id ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'send' && (
        <form onSubmit={handleSend} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('notifications.recipientType')}</label>
              <select value={form.recipient_type} onChange={e => { setForm({ ...form, recipient_type: e.target.value, recipient_id: '' }); loadRecipients(e.target.value) }} className="select-field text-sm">
                <option value="parent">{t('parent')}</option>
                <option value="student">{t('student')}</option>
                <option value="staff">{t('staff')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('notifications.recipient')}</label>
              <select value={form.recipient_id} onChange={e => setForm({ ...form, recipient_id: e.target.value })} className="select-field text-sm">
                <option value="">{t('notifications.selectRecipient')} {form.recipient_type}</option>
                {recipientOptions()}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-emerald-100 mb-1">{t('subject')}</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-field text-sm" required />
          </div>
          <div>
            <label className="block text-xs text-emerald-100 mb-1">{t('message')}</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="input-field text-sm" rows="4" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary bg-white text-emerald-700 hover:bg-white/90">
            <Send size={15} className="mr-2 inline" /> {loading ? t('sending') : t('notifications.sendTitle')}
          </button>
          <p className="text-xs text-emerald-100/60">{t('notifications.smtpNote')}</p>
        </form>
      )}

      {tab === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-white" /><h3 className="text-white font-semibold text-sm">{t('notifications.feeReminders')}</h3></div>
            <p className="text-xs text-emerald-100/70 mb-4">{t('notifications.feeRemindersDescription')}</p>
            <button onClick={() => handleBulk('fees')} disabled={loading} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">{loading ? t('sending') : t('notifications.sendFeeReminders')}</button>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1"><CalendarCheck size={16} className="text-white" /><h3 className="text-white font-semibold text-sm">{t('notifications.attendanceAlerts')}</h3></div>
            <p className="text-xs text-emerald-100/70 mb-3">{t('notifications.attendanceAlertsDescription')}</p>
            <div className="flex gap-2">
              <input type="date" value={alertDate} onChange={e => setAlertDate(e.target.value)} className="input-field text-sm" />
              <button onClick={() => handleBulk('attendance')} disabled={loading} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">{loading ? t('sending') : t('notifications.sendAlerts')}</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-xl space-y-3">
          {settings.map(s => (
            <div key={s.setting_key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">{s.setting_key.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</p>
                <p className="text-xs text-emerald-100/60">{t('notifications.autoSendDescription')}</p>
              </div>
              <button onClick={() => toggleSetting(s.setting_key, !s.setting_value)} className={`relative w-11 h-6 rounded-full transition-colors ${s.setting_value ? 'bg-emerald-400' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${s.setting_value ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
          {logs.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('notifications.none')}</p>}
          {logs.map(l => (
            <div key={l.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0"><Bell size={14} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{l.subject}</p>
                <p className="text-xs text-emerald-100/60 truncate">{t('notifications.to')}: {l.recipient_name || l.recipient_type} · {l.channel} · {new Date(l.created_at).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'sent' ? 'bg-emerald-400/20 text-emerald-100' : l.status === 'failed' ? 'bg-red-400/20 text-red-100' : 'bg-white/15 text-white/80'}`}>{l.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
