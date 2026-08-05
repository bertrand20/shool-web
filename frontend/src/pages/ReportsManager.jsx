import { useState, useEffect } from 'react'
import { Download, FileSpreadsheet, CalendarCheck, Wallet, FileText, BadgeDollarSign, CheckCircle, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function ReportsManager() {
  const { t } = useI18n()
  const [classes, setClasses] = useState([])
  const [exams, setExams] = useState([])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    attendance: { class_id: '', start_date: '', end_date: '' },
    fees: { class_id: '' },
    marks: { exam_id: '', class_id: '' },
    payroll: { month: '2026-01' },
  })

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  useEffect(() => {
    (async () => {
      try {
        const [cls, ex] = await Promise.all([
          fetch(API + '/classes').then(r => r.json()),
          fetch(API + '/exams').then(r => r.json()),
        ])
        setClasses(cls)
        setExams(ex)
      } catch { setMsg({ type: 'error', text: t('reports.failedToLoad') }) }
    })()
  }, [])

  const downloadCSV = async (endpoint, filename, params) => {
    setLoading(true)
    try {
      const qs = Object.entries(params).filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&')
      const res = await fetch(API + endpoint + (qs ? '?' + qs : ''), { headers: authHeaders })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || t('reports.exportFailed'))
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMsg({ type: 'success', text: filename + ' ' + t('reports.downloaded') })
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  const setF = (group, key, value) => setFilters(f => ({ ...f, [group]: { ...f[group], [key]: value } }))

  const sections = [
    {
      title: t('reports.attendanceReport'),
      desc: t('reports.attendanceDesc'),
      icon: CalendarCheck,
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={filters.attendance.class_id} onChange={e => setF('attendance', 'class_id', e.target.value)} className="select-field text-sm">
            <option value="">{t('reports.allClasses')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <input type="date" value={filters.attendance.start_date} onChange={e => setF('attendance', 'start_date', e.target.value)} className="input-field text-sm" />
          <input type="date" value={filters.attendance.end_date} onChange={e => setF('attendance', 'end_date', e.target.value)} className="input-field text-sm" />
        </div>
      ),
      action: () => downloadCSV('/reports/attendance', 'attendance.csv', filters.attendance),
    },
    {
      title: t('reports.outstandingFees'),
      desc: t('reports.outstandingFeesDesc'),
      icon: Wallet,
      fields: (
        <select value={filters.fees.class_id} onChange={e => setF('fees', 'class_id', e.target.value)} className="select-field text-sm">
          <option value="">{t('reports.allClasses')}</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
      ),
      action: () => downloadCSV('/reports/outstanding-fees', 'outstanding_fees.csv', filters.fees),
    },
    {
      title: t('reports.marksExport'),
      desc: t('reports.marksExportDesc'),
      icon: FileText,
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={filters.marks.exam_id} onChange={e => setF('marks', 'exam_id', e.target.value)} className="select-field text-sm" required>
            <option value="">{t('reports.selectExam')}</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={filters.marks.class_id} onChange={e => setF('marks', 'class_id', e.target.value)} className="select-field text-sm">
            <option value="">{t('reports.allClasses')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
        </div>
      ),
      action: () => downloadCSV('/reports/marks', 'marks.csv', filters.marks),
    },
    {
      title: t('reports.payrollExport'),
      desc: t('reports.payrollExportDesc'),
      icon: BadgeDollarSign,
      fields: (
        <input type="month" value={filters.payroll.month} onChange={e => setF('payroll', 'month', e.target.value)} className="input-field text-sm" />
      ),
      action: () => downloadCSV('/reports/payroll', 'payroll.csv', filters.payroll),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('reportsExports')}</h1>
        <p className="page-subtitle text-emerald-100">{t('reports.downloadCsvSubtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map(s => (
          <div key={s.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={18} className="text-white" />
              <h3 className="text-white font-semibold text-sm">{s.title}</h3>
            </div>
            <p className="text-xs text-emerald-100/70 mb-4">{s.desc}</p>
            <div className="space-y-3 mb-4">{s.fields}</div>
            <button onClick={s.action} disabled={loading} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
              <Download size={14} className="mr-1 inline" /> {loading ? t('reports.exporting') : t('reports.downloadCsv')}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-emerald-100/60">
        <FileSpreadsheet size={14} /> {t('reports.serverSideNote')}
      </div>
    </div>
  )
}
