import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/context'
import { Wallet, Wand2, CheckCircle, X, Check, Printer } from 'lucide-react'

const API = '/api'

export default function PayrollManager() {
  const { t } = useI18n()
  const [slips, setSlips] = useState([])
  const [summary, setSummary] = useState(null)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error('Fetch failed')
    return res.json()
  }

  const load = async () => {
    const [s, sum] = await Promise.all([fetchData(API + '/payroll?month=' + month), fetchData(API + '/payroll/summary?month=' + month)])
    setSlips(s)
    setSummary(sum)
  }

  useEffect(() => { load().catch(() => setMsg({ type: 'error', text: t('payroll.loadFailed') })) }, [month])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch(API + '/payroll/generate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ month }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('payroll.generateFailed'))
      setMsg({ type: 'success', text: data.message })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  const updateSlip = async (slip, updates) => {
    const res = await fetch(API + '/payroll/' + slip.id, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(updates) })
    const data = await res.json()
    if (!res.ok) return setMsg({ type: 'error', text: data.error || t('payroll.updateFailed') })
    setMsg({ type: 'success', text: t('payroll.slipUpdated') })
    load()
  }

  const printSlip = (slip) => {
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>${t('payroll.salarySlip')}</title><style>body{font-family:Arial,sans-serif;padding:30px}.wrap{max-width:560px;margin:auto;border:2px solid #000;padding:20px}h1{text-align:center;margin:0}h2{text-align:center;margin-top:20px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}.t{border-top:2px solid #000;font-weight:bold;margin-top:8px}</style></head><body><div class="wrap"><h1>${t('appName')}</h1><p style="text-align:center">${t('payroll.salarySlip')} - ${slip.month}</p><h2>${slip.first_name} ${slip.last_name}</h2><p style="text-align:center">${slip.role} · ${slip.department || ''}</p><div class="row"><span>${t('payroll.basicSalary')}</span><span>${parseFloat(slip.basic_salary).toFixed(2)}</span></div><div class="row"><span>${t('payroll.allowances')}</span><span>${parseFloat(slip.allowances).toFixed(2)}</span></div><div class="row"><span>${t('payroll.deductions')}</span><span>${parseFloat(slip.deductions).toFixed(2)}</span></div><div class="row t"><span>${t('payroll.netSalary')}</span><span>${parseFloat(slip.net_salary).toFixed(2)}</span></div><div class="row"><span>${t('status')}</span><span>${slip.payment_status}</span></div></div></body></html>`)
    w.document.close()
    w.print()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('payroll')}</h1>
        <p className="page-subtitle text-emerald-100">{t('payroll.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold">{summary.slips}</p><p className="text-xs text-emerald-100">{t('payroll.slips')}</p></div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold">{parseFloat(summary.total_basic).toLocaleString()}</p><p className="text-xs text-emerald-100">{t('payroll.totalBasic')}</p></div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"><p className="text-2xl font-bold">{parseFloat(summary.total_net).toLocaleString()}</p><p className="text-xs text-emerald-100">{t('payroll.totalNetPay')}</p></div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-white">
          <Wallet size={16} className="text-emerald-100" />
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input-field text-sm w-44" />
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
          <Wand2 size={14} className="mr-1 inline" /> {loading ? t('payroll.generating') : t('payroll.generateForMonth')}
        </button>
        <p className="text-xs text-emerald-100/60">{t('payroll.generateHint')}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        {slips.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('payroll.noSlipsFor')} {month}. {t('payroll.noSlipsHint')}</p>}
        {slips.map(s => (
          <div key={s.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Wallet size={16} className="text-white" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{s.first_name} {s.last_name}</p>
              <p className="text-xs text-emerald-100/70 truncate">{s.role} · {s.department || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">{parseFloat(s.net_salary).toLocaleString()}</p>
              <p className="text-xs text-emerald-100/60">{t('payroll.basic')} {parseFloat(s.basic_salary).toLocaleString()} + {parseFloat(s.allowances)} - {parseFloat(s.deductions)}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${s.payment_status === 'Paid' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'}`}>{s.payment_status === 'Paid' ? t('paid') : t('pending')}</span>
            <button onClick={() => printSlip(s)} className="p-1.5 hover:bg-white/15 rounded text-white/70"><Printer size={14} /></button>
            {s.payment_status === 'Pending' && (
              <button onClick={() => updateSlip(s, { payment_status: 'Paid', payment_date: new Date().toISOString().slice(0, 10) })} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
                <Check size={13} className="mr-1 inline" /> {t('payroll.markPaid')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
