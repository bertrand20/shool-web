import { useState, useEffect, useCallback } from 'react'
import { UserPlus, RefreshCw, Users, ChevronRight, Mail, Phone, Briefcase } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import ParentRegistrationModal from '../components/ParentRegistrationModal'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function Parents() {
  const { t } = useI18n()
  const [parents, setParents] = useState([])
  const [classes, setClasses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editParent, setEditParent] = useState(null)
  const [selectedParent, setSelectedParent] = useState(null)
  const [children, setChildren] = useState([])
  const [loadingChildren, setLoadingChildren] = useState(false)

  const fetchParents = useCallback(async (page = 1, term = search) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (term) params.append('search', term)
      const res = await fetch(`${API}/parents?${params}`)
      if (!res.ok) throw new Error(t('couldNotLoadParents'))
      const data = await res.json()
      setParents(data.parents)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, t])

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API}/classes`)
      if (res.ok) setClasses(await res.json())
    } catch {
      // non-critical
    }
  }

  const fetchChildren = async (parentId) => {
    setLoadingChildren(true)
    try {
      const res = await fetch(`${API}/parents/${parentId}/children`)
      if (res.ok) setChildren(await res.json())
    } catch {
      setChildren([])
    } finally {
      setLoadingChildren(false)
    }
  }

  useEffect(() => {
    fetchParents(1)
    fetchClasses()
  }, [])

  const handleSearch = (term) => {
    setSearch(term)
    fetchParents(1, term)
  }

  const handleSave = async (type, formData, editId, parentId) => {
    if (type === 'parent') {
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `${API}/parents/${editId}` : `${API}/parents`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || t('failedToSaveParent'))
      }
      const result = await res.json()
      fetchParents(pagination.page)
      return result
    }

    if (type === 'child') {
      const res = await fetch(`${API}/parents/${parentId}/register-child`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || t('failedToRegisterChild'))
      }
      if (selectedParent && selectedParent.id === parentId) {
        fetchChildren(parentId)
      }
      return await res.json()
    }
  }

  const handleSelectParent = (parent) => {
    setSelectedParent(parent)
    fetchChildren(parent.id)
  }

  const relationshipBadge = (rel) => {
    const map = {
      Father: 'bg-blue-100 text-blue-700',
      Mother: 'bg-pink-100 text-pink-700',
      Guardian: 'bg-purple-100 text-purple-700',
      Other: 'bg-gray-100 text-gray-600',
    }
    return map[rel] || map.Other
  }

  if (loading && parents.length === 0) return <LoadingSpinner message={t('loadingParents')} />
  if (error && parents.length === 0) return <ErrorMessage message={error} onRetry={() => fetchParents()} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">{t('parents.parentRegistration')}</h1>
          <p className="page-subtitle">{t('parents.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchParents(pagination.page)} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => { setEditParent(null); setModalOpen(true) }}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            {t('parents.registerParent')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="panel-card">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={t('parents.searchParents')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-4 py-2 text-sm"
              />
            </div>

            {parents.length === 0 ? (
              <EmptyState
                title={t('parents.noParentsRegistered')}
                description={t('parents.registerParentToStart')}
                icon={Users}
              />
            ) : (
              <div className="space-y-1 max-h-[520px] overflow-y-auto">
                {parents.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectParent(p)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 ${
                      selectedParent?.id === p.id
                        ? 'bg-school-primary-light/10 border border-school-primary-light/30'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-school-primary-light/10 text-school-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {p.first_name?.[0]}{p.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-school-text truncate">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-school-muted truncate">{p.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${relationshipBadge(p.relationship)}`}>
                          {p.relationship}
                        </span>
                        <ChevronRight size={12} className="text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-school-border">
                <p className="text-xs text-school-muted">{pagination.total} {t('parents.parent')}{pagination.total !== 1 ? 's' : ''}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchParents(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-secondary btn-sm"
                  >{t('prev')}</button>
                  <button
                    onClick={() => fetchParents(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-secondary btn-sm"
                  >{t('next')}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedParent ? (
            <div className="space-y-4 animate-fade-in">
              <div className="panel-card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-school-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {selectedParent.first_name?.[0]}{selectedParent.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-school-text">{selectedParent.first_name} {selectedParent.last_name}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${relationshipBadge(selectedParent.relationship)}`}>
                      {selectedParent.relationship}
                    </span>
                  </div>
                  <button
                    onClick={() => { setEditParent(selectedParent); setModalOpen(true) }}
                    className="btn-secondary btn-sm"
                  >{t('edit')}</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-school-muted">
                    <Mail size={14} /> {selectedParent.email}
                  </div>
                  <div className="flex items-center gap-2 text-school-muted">
                    <Phone size={14} /> {selectedParent.phone}
                  </div>
                  <div className="flex items-center gap-2 text-school-muted">
                    <Briefcase size={14} /> {selectedParent.occupation || t('notSpecified')}
                  </div>
                  {selectedParent.address && (
                    <div className="text-school-muted text-xs sm:col-span-2 mt-1">
                      {selectedParent.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="panel-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-school-text">{t('parents.registeredChildren')}</h3>
                  <button
                    onClick={() => { setEditParent(selectedParent); setModalOpen(true) }}
                    className="text-xs text-school-primary-light hover:underline"
                  >
                    {t('parents.registerAnotherChild')}
                  </button>
                </div>
                {loadingChildren ? (
                  <LoadingSpinner message={t('loadingChildren')} />
                ) : children.length > 0 ? (
                  <div className="divide-y divide-school-border/60">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center gap-3 py-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {child.first_name?.[0]}{child.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-school-text">{child.first_name} {child.last_name}</p>
                          <p className="text-xs text-school-muted">
                            {child.class_name ? `${child.class_name} - ${child.class_section}` : t('noClassAssigned')}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${child.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                          {child.status === 'Active' ? t('active') : t('inactive')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-school-muted text-center py-4">
                    {t('parents.noChildrenRegistered')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="panel-card flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users size={24} className="text-school-muted" />
              </div>
              <p className="text-sm font-medium text-school-text mb-1">{t('parents.selectParent')}</p>
              <p className="text-sm text-school-muted text-center max-w-xs">
                {t('parents.selectParentHint')}
              </p>
            </div>
          )}
        </div>
      </div>

      <ParentRegistrationModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditParent(null) }}
        onSave={handleSave}
        classes={classes}
        editParent={editParent}
      />
    </div>
  )
}
