import { useState, useEffect, useCallback } from 'react'
import { UserPlus, RefreshCw } from 'lucide-react'
import StudentTable from '../components/StudentTable'
import AddStudentModal from '../components/AddStudentModal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function Enrollment() {
  const { t } = useI18n()
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)

  const fetchStudents = useCallback(async (page = 1, term = search) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (term) params.append('search', term)

      const res = await fetch(`${API}/students?${params}`)
      if (!res.ok) throw new Error(t('enrollment.loadFailed'))

      const data = await res.json()
      setStudents(data.students)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API}/classes`)
      if (res.ok) setClasses(await res.json())
    } catch {
      // classes fetch is non-critical
    }
  }

  useEffect(() => {
    fetchStudents(1)
    fetchClasses()
  }, [])

  const handleSearch = (term) => {
    setSearch(term)
    fetchStudents(1, term)
  }

  const handlePageChange = (page) => {
    fetchStudents(page)
  }

  const handleSave = async (formData, id) => {
    const method = id ? 'PUT' : 'POST'
    const url = id ? `${API}/students/${id}` : `${API}/students`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || t('enrollment.saveFailed'))
    }

    fetchStudents(pagination.page)
  }

  const handleRowClick = (student) => {
    setEditStudent(student)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditStudent(null)
  }

  if (loading && students.length === 0) return <LoadingSpinner message={t('enrollment.loading')} />
  if (error && students.length === 0) return <ErrorMessage message={error} onRetry={() => fetchStudents()} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">{t('enrollment.title')}</h1>
          <p className="page-subtitle">{t('enrollment.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchStudents(pagination.page)} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => { setEditStudent(null); setModalOpen(true) }}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            {t('addStudent')}
          </button>
        </div>
      </div>

      <div className="panel-card">
        <StudentTable
          students={students}
          pagination={pagination}
          searchValue={search}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
        />
      </div>

      <AddStudentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        classes={classes}
        editStudent={editStudent}
      />
    </div>
  )
}
