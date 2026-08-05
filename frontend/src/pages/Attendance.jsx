import { useState, useEffect } from 'react'
import { Check, X as XIcon, Clock, Ban, Save, CalendarDays } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import { useI18n } from '../i18n/context'

const API = '/api'

const statusOptions = [
  { value: 'Present', label: 'Present', icon: Check, color: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200' },
  { value: 'Absent', label: 'Absent', icon: XIcon, color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
  { value: 'Late', label: 'Late', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' },
  { value: 'Excused', label: 'Excused', icon: Ban, color: 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' },
]

export default function Attendance() {
  const { t } = useI18n()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saveMsg, setSaveMsg] = useState(null)
  const [summary, setSummary] = useState([])

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API}/classes`)
      if (res.ok) setClasses(await res.json())
    } catch {
      // classes fetch is non-critical
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ status: 'Active', limit: 100 })
      if (selectedClass) params.append('class_id', selectedClass)

      const res = await fetch(`${API}/students?${params}`)
      if (!res.ok) throw new Error(t('failedToLoadStudents'))

      const data = await res.json()
      setStudents(data.students)

      const existingRes = await fetch(`${API}/attendance?date=${date}${selectedClass ? `&class_id=${selectedClass}` : ''}`)
      const existingData = existingRes.ok ? await existingRes.json() : { records: [] }

      const existingMap = {}
      existingData.records.forEach((r) => {
        existingMap[r.student_id] = r.status
      })

      const initialRecords = {}
      data.students.forEach((s) => {
        initialRecords[s.id] = existingMap[s.id] || ''
      })
      setRecords(initialRecords)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/attendance/summary${selectedClass ? `?class_id=${selectedClass}` : ''}`)
      if (res.ok) setSummary(await res.json())
    } catch {
      // summary is non-critical
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    fetchStudents()
    fetchSummary()
  }, [date, selectedClass])

  const handleMark = (studentId, status) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' : status,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const payload = {
        date,
        records: Object.entries(records)
          .filter(([_, status]) => status !== '')
          .map(([student_id, status]) => ({
            student_id: parseInt(student_id),
            status,
            recorded_by: 'Admin',
          })),
      }

      const res = await fetch(`${API}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(t('failedToSaveAttendance'))

      setSaveMsg(t('attendanceSavedSuccessfully'))
      setTimeout(() => setSaveMsg(null), 3000)
      fetchSummary()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const marked = Object.values(records).filter((v) => v !== '').length
  const total = students.length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">{t('attendance')}</h1>
          <p className="page-subtitle">{t('attendance.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="panel-card !p-4 animate-slide-up stagger-1">
          <label className="block text-xs font-medium text-school-muted mb-1.5">{t('date')}</label>
          <div className="relative">
            <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-muted" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
        </div>
        <div className="panel-card !p-4 animate-slide-up stagger-2">
          <label className="block text-xs font-medium text-school-muted mb-1.5">{t('attendance.classFilter')}</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select-field py-2 text-sm"
          >
            <option value="">{t('attendance.allClasses')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
            ))}
          </select>
        </div>
        <div className="panel-card !p-4 flex items-center justify-between animate-slide-up stagger-3">
          <div>
            <p className="text-xs text-school-muted">{t('attendance.marked')}</p>
            <p className="text-xl font-bold text-school-text">
              {marked}<span className="text-sm font-normal text-school-muted">/{total}</span>
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || marked === 0}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Save size={14} />
            {saving ? t('saving') : t('attendance.saveAll')}
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 animate-fade-in">
          {saveMsg}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message={t('loadingStudents')} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          title={t('attendance.noStudentsFound')}
          description={t('attendance.noActiveStudentsForClass')}
        />
      ) : (
        <div className="panel-card animate-fade-in">
          <div className="space-y-1">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-school-primary-light/10 text-school-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-school-text truncate">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-xs text-school-muted">
                    {student.class_name} - {student.class_section}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {statusOptions.map(({ value, icon: StatusIcon, color }) => (
                    <button
                      key={value}
                      onClick={() => handleMark(student.id, value)}
                      title={t(`attendance.${value.toLowerCase()}`)}
                      className={`
                        w-9 h-9 rounded-lg border flex items-center justify-center
                        transition-all duration-150 text-xs
                        ${records[student.id] === value
                          ? color + ' ring-2 ring-offset-1 ring-current/20'
                          : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }
                      `}
                    >
                      <StatusIcon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.length > 0 && (
        <div className="panel-card mt-6 animate-slide-up stagger-4">
          <h2 className="text-sm font-semibold text-school-text mb-3">{t('attendance.recentRates')}</h2>
          <div className="flex items-end gap-2 h-28">
            {summary.slice(0, 10).reverse().map((day) => {
              const height = day.rate > 0 ? Math.max(day.rate, 8) : 5
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-school-muted font-mono">{day.rate}%</span>
                  <div
                    className="w-full bg-emerald-400/70 rounded-t transition-all duration-300 hover:bg-emerald-500"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${day.present}/${day.total} ${t('attendance.present')}`}
                  />
                  <span className="text-[10px] text-school-muted truncate w-full text-center">{day.date?.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
