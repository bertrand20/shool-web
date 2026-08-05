import { useState, useEffect } from 'react'
import { Bus, Plus, Trash2, Pencil, CheckCircle, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function TransportManager() {
  const { t } = useI18n()
  const [tab, setTab] = useState('routes')
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [staff, setStaff] = useState([])
  const [showRouteForm, setShowRouteForm] = useState(false)
  const [showStopForm, setShowStopForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)
  const [msg, setMsg] = useState(null)
  const [routeForm, setRouteForm] = useState({ route_name: '', vehicle_number: '', driver_staff_id: '', start_point: '', end_point: '', status: 'Active' })
  const [stopForm, setStopForm] = useState({ route_id: '', stop_name: '', pickup_time: '', drop_time: '', fare: 0 })
  const [assignForm, setAssignForm] = useState({ student_id: '', route_id: '', stop_id: '', pickup_time: '', drop_time: '' })

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error('Fetch failed')
    return res.json()
  }

  const loadAll = async () => {
    const [r, s, a] = await Promise.all([fetchData(API + '/transport/routes'), fetchData(API + '/transport/stops'), fetchData(API + '/transport/assignments')])
    setRoutes(r)
    setStops(s)
    setAssignments(a)
  }

  useEffect(() => {
    (async () => {
      try {
        const [r, s, a, st, staff] = await Promise.all([
          fetchData(API + '/transport/routes'),
          fetchData(API + '/transport/stops'),
          fetchData(API + '/transport/assignments'),
          fetchData(API + '/students?limit=300'),
          fetchData(API + '/staff?limit=300'),
        ])
        setRoutes(r)
        setStops(s)
        setAssignments(a)
        setStudents(Array.isArray(st) ? st : st.students || [])
        setStaff(Array.isArray(staff) ? staff : staff.staff || [])
      } catch { setMsg({ type: 'error', text: t('loadFailed') }) }
    })()
  }, [])

  const handleRouteSave = async (e) => {
    e.preventDefault()
    try {
      const body = { ...routeForm, driver_staff_id: routeForm.driver_staff_id || null }
      const opts = { method: editingRoute ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(body) }
      const res = await fetch(API + (editingRoute ? '/transport/routes/' + editingRoute.id : '/transport/routes'), opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('saveFailed'))
      setMsg({ type: 'success', text: editingRoute ? t('transport.routeUpdated') : t('transport.routeCreated') })
      setShowRouteForm(false)
      setEditingRoute(null)
      setRouteForm({ route_name: '', vehicle_number: '', driver_staff_id: '', start_point: '', end_point: '', status: 'Active' })
      loadAll()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDeleteRoute = async (id) => {
    if (!confirm(t('transport.deleteRouteConfirm'))) return
    await fetch(API + '/transport/routes/' + id, { method: 'DELETE', headers: authHeaders })
    loadAll()
  }

  const startEditRoute = (r) => {
    setEditingRoute(r)
    setRouteForm({ route_name: r.route_name, vehicle_number: r.vehicle_number || '', driver_staff_id: r.driver_staff_id ? String(r.driver_staff_id) : '', start_point: r.start_point || '', end_point: r.end_point || '', status: r.status })
    setShowRouteForm(true)
  }

  const handleStopSave = async (e) => {
    e.preventDefault()
    if (!stopForm.route_id) return setMsg({ type: 'error', text: t('transport.selectRoute') })
    try {
      const res = await fetch(API + '/transport/stops', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(stopForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('saveFailed'))
      setMsg({ type: 'success', text: t('transport.stopAdded') })
      setShowStopForm(false)
      setStopForm({ route_id: '', stop_name: '', pickup_time: '', drop_time: '', fare: 0 })
      loadAll()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDeleteStop = async (id) => {
    await fetch(API + '/transport/stops/' + id, { method: 'DELETE', headers: authHeaders })
    loadAll()
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assignForm.student_id || !assignForm.route_id) return setMsg({ type: 'error', text: t('transport.studentRouteRequired') })
    try {
      const res = await fetch(API + '/transport/assign', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ ...assignForm, stop_id: assignForm.stop_id || null }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('transport.assignFailed'))
      setMsg({ type: 'success', text: t('transport.assignmentSaved') })
      setShowAssignForm(false)
      setAssignForm({ student_id: '', route_id: '', stop_id: '', pickup_time: '', drop_time: '' })
      loadAll()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDeleteAssignment = async (id) => {
    await fetch(API + '/transport/assignments/' + id, { method: 'DELETE', headers: authHeaders })
    loadAll()
  }

  const driverName = (id) => {
    const d = staff.find(s => s.id === id)
    return d ? d.first_name + ' ' + d.last_name : t('transport.notAssigned')
  }

  const tabs = [
    { id: 'routes', label: t('transport.routes') + ' (' + routes.length + ')' },
    { id: 'stops', label: t('transport.stops') + ' (' + stops.length + ')' },
    { id: 'assignments', label: t('transport.assignments') + ' (' + assignments.length + ')' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('transport')}</h1>
        <p className="page-subtitle text-emerald-100">{t('transport.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'routes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{t('transport.busRoutes')}</p>
            <button onClick={() => { setEditingRoute(null); setShowRouteForm(true) }} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('transport.addRoute')}</button>
          </div>
          {showRouteForm && (
            <form onSubmit={handleRouteSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input placeholder={t('transport.routeName')} value={routeForm.route_name} onChange={e => setRouteForm({ ...routeForm, route_name: e.target.value })} className="input-field text-sm" required />
              <input placeholder={t('transport.vehicleNumber')} value={routeForm.vehicle_number} onChange={e => setRouteForm({ ...routeForm, vehicle_number: e.target.value })} className="input-field text-sm" />
              <select value={routeForm.driver_staff_id} onChange={e => setRouteForm({ ...routeForm, driver_staff_id: e.target.value })} className="select-field text-sm">
                <option value="">{t('transport.driver')}</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <input placeholder={t('transport.startPoint')} value={routeForm.start_point} onChange={e => setRouteForm({ ...routeForm, start_point: e.target.value })} className="input-field text-sm" />
              <input placeholder={t('transport.endPoint')} value={routeForm.end_point} onChange={e => setRouteForm({ ...routeForm, end_point: e.target.value })} className="input-field text-sm" />
              <select value={routeForm.status} onChange={e => setRouteForm({ ...routeForm, status: e.target.value })} className="select-field text-sm"><option>Active</option><option>Inactive</option></select>
              <div className="col-span-2 sm:col-span-3 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{editingRoute ? t('update') : t('transport.addRoute')}</button>
                <button type="button" onClick={() => { setShowRouteForm(false); setEditingRoute(null) }} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {routes.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('transport.noRoutes')}</p>}
            {routes.map(r => (
              <div key={r.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Bus size={16} className="text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{r.route_name} {r.vehicle_number && <span className="text-emerald-100/60 font-normal">· {r.vehicle_number}</span>}</p>
                  <p className="text-xs text-emerald-100/70 truncate">{r.start_point || t('na')} → {r.end_point || t('na')} · {t('transport.driver')}: {driverName(r.driver_staff_id)}</p>
                </div>
                <span className="text-xs text-emerald-100/70">{r.stop_count} {t('transport.stopWord')} · {r.assigned_students} {t('transport.studentWord')}</span>
                <span className={`text-xs px-2 py-1 rounded-lg ${r.status === 'Active' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/15 text-white/70'}`}>{r.status}</span>
                <button onClick={() => startEditRoute(r)} className="p-1 hover:bg-white/15 rounded text-white/70"><Pencil size={13} /></button>
                <button onClick={() => handleDeleteRoute(r.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stops' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{t('transport.busStops')}</p>
            <button onClick={() => setShowStopForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('transport.addStop')}</button>
          </div>
          {showStopForm && (
            <form onSubmit={handleStopSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={stopForm.route_id} onChange={e => setStopForm({ ...stopForm, route_id: e.target.value })} className="select-field text-sm" required>
                <option value="">{t('transport.route')}</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
              </select>
              <input placeholder={t('transport.stopName')} value={stopForm.stop_name} onChange={e => setStopForm({ ...stopForm, stop_name: e.target.value })} className="input-field text-sm" required />
              <input type="time" value={stopForm.pickup_time} onChange={e => setStopForm({ ...stopForm, pickup_time: e.target.value })} className="input-field text-sm" />
              <input type="time" value={stopForm.drop_time} onChange={e => setStopForm({ ...stopForm, drop_time: e.target.value })} className="input-field text-sm" />
              <input type="number" placeholder={t('transport.fare')} value={stopForm.fare} onChange={e => setStopForm({ ...stopForm, fare: e.target.value })} className="input-field text-sm" />
              <div className="col-span-2 sm:col-span-3 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('transport.addStop')}</button>
                <button type="button" onClick={() => setShowStopForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {stops.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('transport.noStops')}</p>}
            {stops.map(s => (
              <div key={s.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.stop_name}</p>
                  <p className="text-xs text-emerald-100/70">{s.route_name} · {t('transport.pickup')} {s.pickup_time || t('na')} · {t('transport.drop')} {s.drop_time || t('na')}</p>
                </div>
                <span className="text-xs text-emerald-100/70">{t('transport.fare')}: {parseFloat(s.fare).toFixed(2)}</span>
                <button onClick={() => handleDeleteStop(s.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'assignments' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{t('transport.assignmentsSubtitle')}</p>
            <button onClick={() => setShowAssignForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('transport.assignStudent')}</button>
          </div>
          {showAssignForm && (
            <form onSubmit={handleAssign} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select value={assignForm.student_id} onChange={e => setAssignForm({ ...assignForm, student_id: e.target.value })} className="select-field text-sm" required>
                <option value="">{t('student')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <select value={assignForm.route_id} onChange={e => { setAssignForm({ ...assignForm, route_id: e.target.value, stop_id: '' }) }} className="select-field text-sm" required>
                <option value="">{t('transport.route')}</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
              </select>
              <select value={assignForm.stop_id} onChange={e => setAssignForm({ ...assignForm, stop_id: e.target.value })} className="select-field text-sm">
                <option value="">{t('transport.stop')}</option>
                {stops.filter(s => String(s.route_id) === assignForm.route_id).map(s => <option key={s.id} value={s.id}>{s.stop_name}</option>)}
              </select>
              <input type="time" value={assignForm.pickup_time} onChange={e => setAssignForm({ ...assignForm, pickup_time: e.target.value })} className="input-field text-sm" />
              <input type="time" value={assignForm.drop_time} onChange={e => setAssignForm({ ...assignForm, drop_time: e.target.value })} className="input-field text-sm" />
              <div className="flex gap-2 sm:col-span-3">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('transport.saveAssignment')}</button>
                <button type="button" onClick={() => setShowAssignForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {assignments.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('transport.noAssignments')}</p>}
            {assignments.map(a => (
              <div key={a.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Bus size={16} className="text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{a.student_name}</p>
                  <p className="text-xs text-emerald-100/70 truncate">{a.class_name} {a.section} · {a.route_name} · {a.stop_name || t('transport.noStop')}</p>
                </div>
                <button onClick={() => handleDeleteAssignment(a.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
