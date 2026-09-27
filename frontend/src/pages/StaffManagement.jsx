import { useState, useEffect, useCallback } from 'react'
import { UserPlus, RefreshCw, Search, Briefcase, GraduationCap, Shield, Stethoscope, BookOpen, Bus } from 'lucide-react'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import AddStaffModal from '../components/AddStaffModal'
import { useI18n } from '../i18n/context'

const API = '/api'
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` })

const roleIcon = {
  Teacher: GraduationCap,
  Admin: Briefcase,
  Accountant: Briefcase,
  Librarian: BookOpen,
  Nurse: Stethoscope,
  Security: Shield,
  Other: Bus,
}

const roleBadge = (role) => {
  const map = {
    Teacher: 'bg-blue-100 text-blue-700',
    Admin: 'bg-purple-100 text-purple-700',
    Accountant: 'bg-emerald-100 text-emerald-700',
    Librarian: 'bg-amber-100 text-amber-700',
    Nurse: 'bg-pink-100 text-pink-700',
    Security: 'bg-gray-100 text-gray-600',
    Janitor: 'bg-gray-100 text-gray-500',
    Driver: 'bg-orange-100 text-orange-700',
    Other: 'bg-gray-100 text-gray-600',
  }
  return map[role] || map.Other
}

export default function StaffManagement() {
  const { t } = useI18n()
  const [staff, setStaff] = useState([])
  const [classes, setClasses] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStaff, setEditStaff] = useState(null)

  const fetchStaff = useCallback(async (page = 1, term = search, role = roleFilter) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (term) params.append('search', term)
      if (role) params.append('role', role)
      const res = await fetch(`${API}/staff?${params}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(t('couldNotLoadStaff'))
      const data = await res.json()
      setStaff(data.staff)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, t])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/staff/stats`, { headers: authHeaders() })
      if (res.ok) setStats(await res.json())
    } catch {
      // non-critical
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API}/classes`, { headers: authHeaders() })
      if (res.ok) setClasses(await res.json())
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    fetchStaff(1)
    fetchStats()
    fetchClasses()
  }, [])

  const handleSearch = (term) => {
    setSearch(term)
    fetchStaff(1, term, roleFilter)
  }

  const handleRoleFilter = (role) => {
    setRoleFilter(role)
    fetchStaff(1, search, role)
  }

  const handleSave = async (formData, id) => {
    const method = id ? 'PUT' : 'POST'
    const url = id ? `${API}/staff/${id}` : `${API}/staff`
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || t('failedToSaveStaffMember'))
    }
    fetchStaff(pagination.page)
    fetchStats()
  }

  const handleDelete = async (id) => {
    if (!confirm(t('staff.removeConfirm'))) return
    try {
      const res = await fetch(`${API}/staff/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) {
        fetchStaff(pagination.page)
        fetchStats()
      }
    } catch {
      // handle silently
    }
  }

  const allRoles = ['Teacher', 'Admin', 'Accountant', 'Librarian', 'Nurse', 'Security', 'Other']

  if (loading && staff.length === 0) return <LoadingSpinner message={t('loadingStaff')} />
  if (error && staff.length === 0) return <ErrorMessage message={error} onRetry={() => fetchStaff()} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">{t('staff.management')}</h1>
          <p className="page-subtitle">{t('staff.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchStaff(pagination.page); fetchStats() }} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => { setEditStaff(null); setModalOpen(true) }}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            {t('addStaff')}
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Briefcase}
            label={t('totalActive')}
            value={stats.total_active}
            color="blue"
            delay={1}
          />
          {stats.by_role.slice(0, 3).map((r, i) => (
            <StatCard
              key={r.role}
              icon={roleIcon[r.role] || Briefcase}
              label={r.role}
              value={r.count}
              color={['green', 'purple', 'amber'][i]}
              delay={i + 2}
            />
          ))}
        </div>
      )}

      <div className="panel-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('staff.searchStaff')}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleRoleFilter('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!roleFilter ? 'bg-school-primary text-white' : 'bg-gray-100 text-school-muted hover:bg-gray-200'}`}
            >{t('all')}</button>
            {allRoles.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleFilter(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${roleFilter === r ? 'bg-school-primary text-white' : 'bg-gray-100 text-school-muted hover:bg-gray-200'}`}
              >{r}</button>
            ))}
          </div>
        </div>

        {staff.length === 0 ? (
          <EmptyState
            title={t('staff.noStaffFound')}
            description={t('staff.noStaffFoundHint')}
            icon={Briefcase}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-school-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-school-border">
                  <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('name')}</th>
                  <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('role')}</th>
                  <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden sm:table-cell">{t('department')}</th>
                  <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden md:table-cell">{t('qualification')}</th>
                  <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden lg:table-cell">{t('assignedClass')}</th>
                  <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('status')}</th>
                  <th className="text-right px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-border/60">
                {staff.map((s) => {
                  const RoleIcon = roleIcon[s.role] || Briefcase
                  return (
                    <tr key={s.id} className="table-row-interactive">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-school-primary-light/10 text-school-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-school-text truncate">{s.first_name} {s.last_name}</p>
                            <p className="text-xs text-school-muted truncate sm:hidden">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(s.role)}`}>
                          <RoleIcon size={10} />
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-school-muted text-xs hidden sm:table-cell">{s.department || '---'}</td>
                      <td className="px-4 py-3 text-school-muted text-xs hidden md:table-cell">{s.qualification || '---'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {s.assigned_class ? (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {s.assigned_class} - {s.assigned_section}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">---</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === 'Active' ? 'badge-active' :
                          s.status === 'On Leave' ? 'badge-warning' : 'badge-inactive'
                        }`}>
                          {s.status === 'Active' ? t('active') : s.status === 'On Leave' ? t('onLeave') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditStaff(s); setModalOpen(true) }}
                            className="text-xs text-school-primary-light hover:underline px-2 py-1"
                          >{t('edit')}</button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-xs text-red-500 hover:underline px-2 py-1"
                          >{t('remove')}</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-school-muted">
              {pagination.total} {t('staffMember')}{pagination.total !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button onClick={() => fetchStaff(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary btn-sm">{t('prev')}</button>
              <button onClick={() => fetchStaff(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="btn-secondary btn-sm">{t('next')}</button>
            </div>
          </div>
        )}
      </div>

      <AddStaffModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditStaff(null) }}
        onSave={handleSave}
        classes={classes}
        editStaff={editStaff}
      />
    </div>
  )
}
