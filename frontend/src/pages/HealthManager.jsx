import { useState, useEffect } from 'react'
import { Stethoscope, Plus, Trash2, CheckCircle, X, Syringe } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function HealthManager() {
  const { t } = useI18n()
  const [tab, setTab] = useState('records')
  const [records, setRecords] = useState([])
  const [vaccinations, setVaccinations] = useState([])
  const [students, setStudents] = useState([])
  const [nurses, setNurses] = useState([])
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [showVacForm, setShowVacForm] = useState(false)
  const [msg, setMsg] = useState(null)
  const [recordForm, setRecordForm] = useState({ student_id: '', visit_type: 'Checkup', symptoms: '', diagnosis: '', treatment: '', nurse_staff_id: '', notes: '' })
  const [vacForm, setVacForm] = useState({ student_id: '', vaccine_name: '', dose_number: '', date_given: '', notes: '' })

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
        const [r, v, s, n] = await Promise.all([
          fetchData(API + '/health/records'),
          fetchData(API + '/health/vaccinations'),
          fetchData(API + '/students?limit=300'),
          fetchData(API + '/staff?limit=300&role=Nurse'),
        ])
        setRecords(r)
        setVaccinations(v)
        setStudents(Array.isArray(s) ? s : s.students || [])
        setNurses(Array.isArray(n) ? n : n.staff || [])
      } catch { setMsg({ type: 'error', text: t('loadFailed') }) }
    })()
  }, [])

  const handleRecordSave = async (e) => {
    e.preventDefault()
    if (!recordForm.student_id) return setMsg({ type: 'error', text: t('health.selectStudent') })
    try {
      const res = await fetch(API + '/health/records', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ ...recordForm, nurse_staff_id: recordForm.nurse_staff_id || null }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('saveFailed'))
      setMsg({ type: 'success', text: t('health.recordAdded') })
      setShowRecordForm(false)
      setRecordForm({ student_id: '', visit_type: 'Checkup', symptoms: '', diagnosis: '', treatment: '', nurse_staff_id: '', notes: '' })
      setRecords(await fetchData(API + '/health/records'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDeleteRecord = async (id) => {
    await fetch(API + '/health/records/' + id, { method: 'DELETE', headers: authHeaders })
    setRecords(records.filter(r => r.id !== id))
  }

  const handleVacSave = async (e) => {
    e.preventDefault()
    if (!vacForm.student_id || !vacForm.vaccine_name) return setMsg({ type: 'error', text: t('health.vaccineRequired') })
    try {
      const res = await fetch(API + '/health/vaccinations', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(vacForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('saveFailed'))
      setMsg({ type: 'success', text: t('health.vaccinationRecorded') })
      setShowVacForm(false)
      setVacForm({ student_id: '', vaccine_name: '', dose_number: '', date_given: '', notes: '' })
      setVaccinations(await fetchData(API + '/health/vaccinations'))
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDeleteVac = async (id) => {
    await fetch(API + '/health/vaccinations/' + id, { method: 'DELETE', headers: authHeaders })
    setVaccinations(vaccinations.filter(v => v.id !== id))
  }

  const nurseName = (id) => {
    const n = nurses.find(x => x.id === id)
    return n ? n.first_name + ' ' + n.last_name : null
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('health.title')}</h1>
        <p className="page-subtitle text-emerald-100">{t('health.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab('records')} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'records' ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}>{t('healthRecords')} ({records.length})</button>
        <button onClick={() => setTab('vaccinations')} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'vaccinations' ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}>{t('health.vaccinations')} ({vaccinations.length})</button>
      </div>

      {tab === 'records' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{t('health.recordsSubtitle')}</p>
            <button onClick={() => setShowRecordForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('health.addRecord')}</button>
          </div>
          {showRecordForm && (
            <form onSubmit={handleRecordSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select value={recordForm.student_id} onChange={e => setRecordForm({ ...recordForm, student_id: e.target.value })} className="select-field text-sm" required>
                <option value="">{t('student')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <select value={recordForm.visit_type} onChange={e => setRecordForm({ ...recordForm, visit_type: e.target.value })} className="select-field text-sm">
                <option>Checkup</option><option>Illness</option><option>Injury</option><option>Vaccination</option><option>Other</option>
              </select>
              <select value={recordForm.nurse_staff_id} onChange={e => setRecordForm({ ...recordForm, nurse_staff_id: e.target.value })} className="select-field text-sm">
                <option value="">{t('health.attendingNurse')}</option>
                {nurses.map(n => <option key={n.id} value={n.id}>{n.first_name} {n.last_name}</option>)}
              </select>
              <input placeholder={t('health.symptoms')} value={recordForm.symptoms} onChange={e => setRecordForm({ ...recordForm, symptoms: e.target.value })} className="input-field text-sm" />
              <input placeholder={t('health.diagnosis')} value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })} className="input-field text-sm" />
              <input placeholder={t('health.treatment')} value={recordForm.treatment} onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })} className="input-field text-sm" />
              <textarea placeholder={t('notes')} value={recordForm.notes} onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} className="input-field text-sm sm:col-span-3" rows="2" />
              <div className="sm:col-span-3 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('health.addRecord')}</button>
                <button type="button" onClick={() => setShowRecordForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {records.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('health.noRecords')}</p>}
            {records.map(r => (
              <div key={r.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Stethoscope size={16} className="text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{r.student_name} <span className="font-normal text-emerald-100/70">· {r.visit_type}</span></p>
                  <p className="text-xs text-emerald-100/70 truncate">{r.visit_date} {r.symptoms ? '· ' + r.symptoms : ''}{r.diagnosis ? ' · ' + t('health.diagnosis') + ': ' + r.diagnosis : ''}{nurseName(r.nurse_staff_id) ? ' · ' + nurseName(r.nurse_staff_id) : ''}</p>
                  {r.treatment && <p className="text-xs text-emerald-100/50 truncate">{t('health.treatment')}: {r.treatment}</p>}
                </div>
                <button onClick={() => handleDeleteRecord(r.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'vaccinations' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{t('health.vaccinationRecords')}</p>
            <button onClick={() => setShowVacForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('health.addVaccination')}</button>
          </div>
          {showVacForm && (
            <form onSubmit={handleVacSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select value={vacForm.student_id} onChange={e => setVacForm({ ...vacForm, student_id: e.target.value })} className="select-field text-sm" required>
                <option value="">{t('student')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <input placeholder={t('health.vaccineName')} value={vacForm.vaccine_name} onChange={e => setVacForm({ ...vacForm, vaccine_name: e.target.value })} className="input-field text-sm" required />
              <input placeholder={t('health.dosePlaceholder')} value={vacForm.dose_number} onChange={e => setVacForm({ ...vacForm, dose_number: e.target.value })} className="input-field text-sm" />
              <input type="date" value={vacForm.date_given} onChange={e => setVacForm({ ...vacForm, date_given: e.target.value })} className="input-field text-sm" />
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('health.record')}</button>
                <button type="button" onClick={() => setShowVacForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {vaccinations.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('health.noVaccinations')}</p>}
            {vaccinations.map(v => (
              <div key={v.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Syringe size={16} className="text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{v.vaccine_name} {v.dose_number && <span className="text-emerald-100/70 font-normal">· {v.dose_number} {t('health.dose')}</span>}</p>
                  <p className="text-xs text-emerald-100/70 truncate">{v.student_name} · {t('health.given')} {v.date_given}</p>
                </div>
                <button onClick={() => handleDeleteVac(v.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
