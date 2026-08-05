import { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle, X, Trash2 } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function AuditLogs() {
  const { t } = useI18n()
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [msg, setMsg] = useState(null)

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (p) => {
    const res = await fetch(API + '/audit-logs?page=' + p + '&limit=50', { headers: authHeaders })
    if (!res.ok) throw new Error(t('audit.fetchFailed'))
    return res.json()
  }

  const load = async (p) => {
    try {
      const data = await fetchData(p)
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch { setMsg({ type: 'error', text: t('audit.loadFailed') }) }
  }

  useEffect(() => { load(1) }, [])

  const handleClear = async () => {
    if (!confirm(t('audit.clearConfirm'))) return
    const res = await fetch(API + '/audit-logs', { method: 'DELETE', headers: authHeaders })
    if (!res.ok) return setMsg({ type: 'error', text: t('audit.clearFailed') })
    setLogs([])
    setMsg({ type: 'success', text: t('audit.cleared') })
  }

  const actionColor = (a) => {
    if (['delete', 'remove'].some(x => a.includes(x))) return 'bg-red-400/20 text-red-100'
    if (['create', 'send', 'generate', 'issue'].some(x => a.includes(x))) return 'bg-emerald-400/20 text-emerald-100'
    if (a.includes('update') || a.includes('approve') || a.includes('reject')) return 'bg-blue-400/20 text-blue-100'
    return 'bg-white/15 text-white/80'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('auditLogs')}</h1>
        <p className="page-subtitle text-emerald-100">{t('audit.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-emerald-100">{pagination?.total || 0} {t('audit.actionsRecorded')}</p>
        <button onClick={handleClear} className="btn-secondary btn-sm bg-red-500/20 text-red-100 border-red-400/30 hover:bg-red-500/30"><Trash2 size={13} className="mr-1 inline" /> {t('audit.clearLogs')}</button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        {logs.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('audit.none')}</p>}
        {logs.map(l => (
          <div key={l.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><ShieldCheck size={16} className="text-white" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${actionColor(l.action)}`}>{l.action}</span>
                <p className="text-sm font-semibold text-white">{l.admin_name}</p>
              </div>
              <p className="text-xs text-emerald-100/70 truncate">
                {l.entity_type || 'system'}{l.entity_id ? ' #' + l.entity_id : ''}{l.details ? ' · ' + l.details : ''} · {new Date(l.created_at).toLocaleString()}
              </p>
            </div>
            {l.ip_address && <span className="text-xs text-emerald-100/50 font-mono">{l.ip_address}</span>}
          </div>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => { setPage(page - 1); load(page - 1) }} disabled={page <= 1} className="btn-secondary btn-sm bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-40">{t('audit.prev')}</button>
          <span className="text-sm text-emerald-100">{t('audit.page')} {pagination.page} {t('audit.of')} {pagination.pages}</span>
          <button onClick={() => { setPage(page + 1); load(page + 1) }} disabled={page >= pagination.pages} className="btn-secondary btn-sm bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-40">{t('audit.next')}</button>
        </div>
      )}
    </div>
  )
}
