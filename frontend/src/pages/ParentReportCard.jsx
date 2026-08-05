import { useState, useEffect } from 'react'
import { Search, FileText, CheckCircle, AlertCircle, Printer, ChevronRight } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

function ReportCardPrint({ data }) {
  const { t } = useI18n()
  if (!data) return null
  const { student, exam, marks, summary } = data
  return (
    <div id="report-card-public" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-emerald-600 text-white p-6 text-center">
        <h1 className="text-xl font-bold">{t('appName')}</h1>
        <p className="text-emerald-100 text-sm mt-1">{t('parentReportCard.studentReportCard')}</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-gray-500">{t('student')}:</span> <span className="font-semibold ml-2">{student.first_name} {student.last_name}</span></div>
          <div><span className="text-gray-500">{t('id')}:</span> <span className="font-semibold ml-2">{student.id}</span></div>
          <div><span className="text-gray-500">{t('classLabel')}:</span> <span className="font-semibold ml-2">{student.class_name} {student.section}</span></div>
          <div><span className="text-gray-500">{t('parentReportCard.examLabel')}:</span> <span className="font-semibold ml-2">{exam.name}</span></div>
          <div><span className="text-gray-500">{t('parentReportCard.term')}:</span> <span className="font-semibold ml-2">{exam.term || t('na')}</span></div>
          <div><span className="text-gray-500">{t('academicYearLabel')}:</span> <span className="font-semibold ml-2">{exam.academic_year}</span></div>
        </div>
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-gray-600 text-xs">{t('subject')}</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('parentReportCard.marks')}</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('parentReportCard.max')}</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('parentReportCard.percent')}</th>
              <th className="text-center py-2 px-3 font-medium text-gray-600 text-xs">{t('grade')}</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m) => {
              const pct = parseFloat(m.max_marks) > 0 ? ((parseFloat(m.marks) / parseFloat(m.max_marks)) * 100) : 0
              let g = 'F'
              if (pct >= 90) g = 'A+'
              else if (pct >= 80) g = 'A'
              else if (pct >= 70) g = 'B+'
              else if (pct >= 60) g = 'B'
              else if (pct >= 50) g = 'C+'
              else if (pct >= 40) g = 'C'
              else if (pct >= 30) g = 'D'
              return (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="py-2 px-3 font-medium">{m.subject_name}</td>
                  <td className="py-2 px-3 text-right">{parseFloat(m.marks).toFixed(0)}</td>
                  <td className="py-2 px-3 text-right text-gray-500">{parseFloat(m.max_marks).toFixed(0)}</td>
                  <td className="py-2 px-3 text-right">{pct.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-center font-bold">{g}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex justify-between items-center bg-emerald-50 rounded-lg p-4">
          <div className="text-sm">
            <span className="text-gray-500">{t('parentReportCard.total')}:</span> <span className="font-bold ml-1">{summary.totalMarks.toFixed(0)} / {summary.totalMax.toFixed(0)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">{t('parentReportCard.average')}:</span> <span className="font-bold ml-1">{summary.average}%</span>
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {t('grade')}: {summary.grade}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParentReportCard() {
  const [step, setStep] = useState('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [exams, setExams] = useState([])
  const [selectedExamType, setSelectedExamType] = useState('')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  const { t } = useI18n()

  useEffect(() => {
    fetch(API + '/exams').then(r => r.json()).then(setExams).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    setSearching(true)
    setSearchError(null)
    setResults([])
    try {
      const res = await fetch(API + '/portal/search-student?query=' + encodeURIComponent(query.trim()))
      if (!res.ok) throw new Error(t('searchFailed'))
      const data = await res.json()
      setResults(data)
      if (data.length === 0) setSearchError(t('noStudentsFound'))
    } catch { setSearchError(t('parentReportCard.searchFailedRetry')) }
    finally { setSearching(false) }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setStep('exam')
  }

  const handleGenerate = async () => {
    if (!selectedExamType) return
    setLoading(true)
    try {
      const res = await fetch(API + '/portal/report-card/' + selectedStudent.id + '?exam_type=' + encodeURIComponent(selectedExamType) + '&academic_year=' + encodeURIComponent(academicYear))
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      const data = await res.json()
      setReportData(data)
      setStep('report')
    } catch (err) { setSearchError(err.message) }
    finally { setLoading(false) }
  }

  const resetAll = () => {
    setStep('search')
    setQuery('')
    setResults([])
    setSelectedStudent(null)
    setSelectedExamType('')
    setReportData(null)
    setSearchError(null)
  }

  const examTypes = ['CAT 1', 'CAT 2', 'Exam']
  const uniqueYears = [...new Set(exams.map(e => e.academic_year))]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reportCard')}</h1>
        <p className="text-gray-500">{t('parentReportCard.subtitle')}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {['search', 'exam', 'report'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-emerald-600 text-white scale-110' :
              ['search', 'exam', 'report'].indexOf(step) > i ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {['search', 'exam', 'report'].indexOf(step) > i ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${['search', 'exam', 'report'].indexOf(step) > i ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {step === 'search' && (
        <div className="animate-fade-in">
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder={t('searchStudentPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
            <button type="submit" disabled={searching || query.trim().length < 2}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {searching ? t('searching') : t('search')}
            </button>
          </form>
          {searchError && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} /> {searchError}
            </div>
          )}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 mb-2">{results.length} {t('studentsFound')}</p>
              {results.map(s => (
                <button key={s.id} onClick={() => handleSelectStudent(s)}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    {s.first_name?.[0]}{s.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-gray-500">{s.class_name} {s.section} &middot; {t('id')}: {s.id}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'exam' && (
        <div className="animate-fade-in">
          <button onClick={resetAll} className="text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors">&larr; {t('backToSearch')}</button>
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                {selectedStudent?.first_name?.[0]}{selectedStudent?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                <p className="text-xs text-gray-500">{selectedStudent?.class_name} {selectedStudent?.section}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('parentReportCard.examType')}</label>
              <div className="grid grid-cols-3 gap-2">
                {examTypes.map(t => (
                  <button key={t} onClick={() => setSelectedExamType(t)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedExamType === t ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('academicYearLabel')}</label>
              <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="select-field text-sm">
                {uniqueYears.length > 0 ? uniqueYears.map(y => <option key={y} value={y}>{y}</option>) : <option value="2025-2026">2025-2026</option>}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading || !selectedExamType}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {loading ? t('parentReportCard.generating') : t('parentReportCard.generateReportCard')}
            </button>
          </div>
        </div>
      )}

      {step === 'report' && reportData && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setStep('exam')} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">&larr; {t('back')}</button>
            <button onClick={() => {
              const el = document.getElementById('report-card-public')
              if (!el) return
              const w = window.open('', '_blank')
              w.document.write('<html><head><title>' + t('reportCard') + '</title><style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:8px 12px}th{background:#f3f4f6}</style></head><body>')
              w.document.write(el.innerHTML)
              w.document.write('</body></html>')
              w.document.close()
              w.print()
            }} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Printer size={14} /> {t('parentReportCard.print')}
            </button>
          </div>
          <ReportCardPrint data={reportData} />
        </div>
      )}
    </div>
  )
}
