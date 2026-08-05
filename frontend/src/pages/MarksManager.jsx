import { useState, useEffect, useCallback } from 'react'
import { BookOpen, GraduationCap, FileText, Plus, Trash2, X, CheckCircle, Printer } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

function ReportCard({ data, onPrint }) {
  const { t } = useI18n()
  if (!data) return null
  const { student, exam, marks, summary } = data
  return (
    <div id="report-card-print" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-emerald-600 text-white p-6 text-center">
        <h1 className="text-xl font-bold">{t('appName')}</h1>
        <p className="text-emerald-100 text-sm mt-1">{t('marks.studentReportCard')}</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-gray-500">{t('common.studentLabel')}</span> <span className="font-semibold ml-2">{student.first_name} {student.last_name}</span></div>
          <div><span className="text-gray-500">{t('marks.id')}</span> <span className="font-semibold ml-2">{student.id}</span></div>
          <div><span className="text-gray-500">{t('common.classLabel')}</span> <span className="font-semibold ml-2">{student.class_name} {student.section}</span></div>
          <div><span className="text-gray-500">{t('common.examLabel')}</span> <span className="font-semibold ml-2">{exam.name}</span></div>
          <div><span className="text-gray-500">{t('marks.termLabel')}</span> <span className="font-semibold ml-2">{exam.term || 'N/A'}</span></div>
          <div><span className="text-gray-500">{t('marks.academicYearLabel')}</span> <span className="font-semibold ml-2">{exam.academic_year}</span></div>
        </div>
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-gray-600 text-xs">{t('subject')}</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('common.marks')}</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('common.max')}</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('common.percentage')}</th>
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
            <span className="text-gray-500">{t('common.totalLabel')}</span> <span className="font-bold ml-1">{summary.totalMarks.toFixed(0)} / {summary.totalMax.toFixed(0)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">{t('common.averageLabel')}</span> <span className="font-bold ml-1">{summary.average}%</span>
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {t('common.gradeLabel')} {summary.grade}
          </div>
        </div>
      </div>
      <div className="px-6 pb-4 text-right">
        <button onClick={onPrint} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Printer size={14} /> {t('marks.printReportCard')}
        </button>
      </div>
    </div>
  )
}

export default function MarksManager() {
  const { t } = useI18n()
  const [tab, setTab] = useState('subjects')
  const [subjects, setSubjects] = useState([])
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [markEntries, setMarkEntries] = useState([])
  const [reportData, setReportData] = useState(null)
  const [reportExamId, setReportExamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const [newSubject, setNewSubject] = useState({ name: '', code: '', class_id: '' })
  const [newExam, setNewExam] = useState({ name: '', type: 'CAT 1', academic_year: '2025-2026', term: '' })
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [showExamForm, setShowExamForm] = useState(false)

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = useCallback(async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error('Fetch failed')
    return res.json()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const [sub, ex, cls] = await Promise.all([
          fetchData(API + '/subjects'),
          fetchData(API + '/exams'),
          fetchData(API + '/classes'),
        ])
        setSubjects(sub)
        setExams(ex)
        setClasses(cls)
      } catch { setMsg({ type: 'error', text: t('common.failedToLoadData') }) }
    })()
  }, [])

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return }
    fetchData(API + '/students?class_id=' + selectedClass + '&limit=200')
      .then(setStudents)
      .catch(() => {})
  }, [selectedClass])

  useEffect(() => {
    if (!selectedExam || !selectedClass) { setMarks([]); return }
    fetchData(API + '/marks?exam_id=' + selectedExam + '&class_id=' + selectedClass)
      .then(setMarks)
      .catch(() => {})
  }, [selectedExam, selectedClass])

  useEffect(() => {
    if (!selectedStudent || !selectedExam) { setMarkEntries([]); return }
    const classSubjects = subjects.filter(s => !s.class_id || String(s.class_id) === selectedClass)
    const existing = {}
    marks.forEach(m => { if (String(m.student_id) === selectedStudent) existing[m.subject_id] = m })
    setMarkEntries(classSubjects.map(s => ({
      student_id: parseInt(selectedStudent),
      subject_id: s.id,
      exam_id: parseInt(selectedExam),
      marks: existing[s.id] ? String(existing[s.id].marks) : '',
      max_marks: existing[s.id] ? String(existing[s.id].max_marks) : '100',
    })))
  }, [selectedStudent, selectedExam, marks, subjects, selectedClass])

  const handleSaveMarks = async () => {
    const valid = markEntries.filter(e => e.marks !== '')
    if (!valid.length) return setMsg({ type: 'error', text: t('marks.enterAtLeastOneMark') })
    setLoading(true)
    try {
      await fetch(API + '/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ marks: valid.map(e => ({ ...e, marks: parseFloat(e.marks) })) }),
      })
      setMsg({ type: 'success', text: t('marks.saved') })
      const updated = await fetchData(API + '/marks?exam_id=' + selectedExam + '&class_id=' + selectedClass)
      setMarks(updated)
    } catch { setMsg({ type: 'error', text: t('marks.failedToSaveMarks') }) }
    setLoading(false)
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    try {
      await fetch(API + '/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(newSubject),
      })
      setMsg({ type: 'success', text: t('marks.subjectCreated') })
      setShowSubjectForm(false)
      setNewSubject({ name: '', code: '', class_id: '' })
      setSubjects(await fetchData(API + '/subjects'))
    } catch { setMsg({ type: 'error', text: t('marks.failedToCreateSubject') }) }
  }

  const handleDeleteSubject = async (id) => {
    if (!confirm(t('marks.deleteSubjectConfirm'))) return
    await fetch(API + '/subjects/' + id, { method: 'DELETE', headers: authHeaders })
    setSubjects(subjects.filter(s => s.id !== id))
  }

  const handleCreateExam = async (e) => {
    e.preventDefault()
    try {
      await fetch(API + '/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(newExam),
      })
      setMsg({ type: 'success', text: t('marks.examCreated') })
      setShowExamForm(false)
      setNewExam({ name: '', type: 'CAT 1', academic_year: '2025-2026', term: '' })
      setExams(await fetchData(API + '/exams'))
    } catch { setMsg({ type: 'error', text: t('marks.failedToCreateExam') }) }
  }

  const handleDeleteExam = async (id) => {
    if (!confirm(t('marks.deleteExamConfirm'))) return
    await fetch(API + '/exams/' + id, { method: 'DELETE', headers: authHeaders })
    setExams(exams.filter(e => e.id !== id))
  }

  const handleGenerateReport = async () => {
    if (!selectedStudent || !reportExamId) return setMsg({ type: 'error', text: t('marks.selectStudentAndExam') })
    setLoading(true)
    try {
      const data = await fetchData(API + '/report-card/' + selectedStudent + '/' + reportExamId)
      setReportData(data)
    } catch { setMsg({ type: 'error', text: t('marks.noMarksFound') }) }
    setLoading(false)
  }

  const handlePrint = () => {
    const content = document.getElementById('report-card-print')
    if (!content) return
    const w = window.open('', '_blank')
    w.document.write('<html><head><title>' + t('reportCard') + '</title><style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left}th{background:#f3f4f6}.bg-emerald-600{background:#059669;color:white;padding:20px;text-align:center}.flex{display:flex}.justify-between{justify-content:space-between}.items-center{align-items:center}.bg-emerald-50{background:#ecfdf5}.rounded-lg{border-radius:8px}.p-4{padding:16px}.font-bold{font-weight:bold}.text-sm{font-size:14px}.text-lg{font-size:18px}.text-emerald-700{color:#047857}.ml-1{margin-left:4px}.ml-2{margin-left:8px}.grid{display:grid}.grid-cols-2{grid-template-columns:1fr 1fr}.gap-4{gap:16px}.mb-6{margin-bottom:24px}.mb-4{margin-bottom:16px}.text-gray-500{color:#6b7280}.text-right{text-align:right}.text-center{text-align:center}</style></head><body>')
    w.document.write(content.innerHTML)
    w.document.write('</body></html>')
    w.document.close()
    w.print()
  }

  const tabs = [
    { id: 'subjects', label: t('marks.subjects'), icon: BookOpen },
    { id: 'exams', label: t('marks.exams'), icon: GraduationCap },
    { id: 'marks', label: t('marks.enterMarks'), icon: FileText },
    { id: 'report', label: t('marks.reportCards'), icon: FileText },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('marks.pageTitle')}</h1>
        <p className="page-subtitle text-emerald-100">{t('marks.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === id ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'subjects' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{subjects.length} {t('marks.subjectCount')}</p>
            <button onClick={() => setShowSubjectForm(true)} className="btn-primary btn-sm bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus size={14} className="mr-1 inline" /> {t('marks.addSubject')}
            </button>
          </div>
          {showSubjectForm && (
            <form onSubmit={handleCreateSubject} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 flex gap-3 items-end">
              <input placeholder={t('marks.name')} value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} className="input-field text-sm flex-1" required />
              <input placeholder={t('marks.code')} value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} className="input-field text-sm w-24" required />
              <select value={newSubject.class_id} onChange={e => setNewSubject({ ...newSubject, class_id: e.target.value })} className="select-field text-sm flex-1">
                <option value="">{t('common.allClasses')}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
              <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('save')}</button>
              <button type="button" onClick={() => setShowSubjectForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('marks.name')}</th>
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('marks.code')}</th>
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('common.class')}</th>
                <th className="text-right py-2 px-3 text-xs text-emerald-100">{t('action')}</th>
              </tr></thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id} className="border-b border-white/10 text-white">
                    <td className="py-2 px-3">{s.name}</td>
                    <td className="py-2 px-3 font-mono">{s.code}</td>
                    <td className="py-2 px-3">{s.class_name ? s.class_name + ' ' + s.section : t('common.all')}</td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => handleDeleteSubject(s.id)} className="p-1 hover:bg-white/10 rounded"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'exams' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{exams.length} {t('marks.examCount')}</p>
            <button onClick={() => setShowExamForm(true)} className="btn-primary btn-sm bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus size={14} className="mr-1 inline" /> {t('marks.addExam')}
            </button>
          </div>
          {showExamForm && (
            <form onSubmit={handleCreateExam} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
              <input placeholder={t('marks.name')} value={newExam.name} onChange={e => setNewExam({ ...newExam, name: e.target.value })} className="input-field text-sm" required />
              <select value={newExam.type} onChange={e => setNewExam({ ...newExam, type: e.target.value })} className="select-field text-sm">
                <option>CAT 1</option><option>CAT 2</option><option>Exam</option>
              </select>
              <input placeholder={t('marks.year')} value={newExam.academic_year} onChange={e => setNewExam({ ...newExam, academic_year: e.target.value })} className="input-field text-sm" required />
              <input placeholder={t('marks.term')} value={newExam.term} onChange={e => setNewExam({ ...newExam, term: e.target.value })} className="input-field text-sm" />
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('save')}</button>
                <button type="button" onClick={() => setShowExamForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('marks.name')}</th>
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('marks.type')}</th>
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('marks.year')}</th>
                <th className="text-left py-2 px-3 text-xs text-emerald-100">{t('marks.term')}</th>
                <th className="text-right py-2 px-3 text-xs text-emerald-100">{t('action')}</th>
              </tr></thead>
              <tbody>
                {exams.map(e => (
                  <tr key={e.id} className="border-b border-white/10 text-white">
                    <td className="py-2 px-3">{e.name}</td>
                    <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-white/20">{e.type}</span></td>
                    <td className="py-2 px-3">{e.academic_year}</td>
                    <td className="py-2 px-3">{e.term || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => handleDeleteExam(e.id)} className="p-1 hover:bg-white/10 rounded"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'marks' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('common.exam')}</label>
              <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="select-field text-sm">
                <option value="">{t('common.selectExam')}</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('common.class')}</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="select-field text-sm">
                <option value="">{t('marks.selectClass')}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('student')}</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="select-field text-sm">
                <option value="">{t('common.selectStudent')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </div>
          </div>

          {markEntries.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="space-y-3 mb-4">
                {markEntries.map((entry, i) => {
                  const sub = subjects.find(s => s.id === entry.subject_id)
                  return (
                    <div key={entry.subject_id} className="flex items-center gap-3 text-white">
                      <span className="w-40 text-sm font-medium">{sub?.name || t('subject')}</span>
                      <span className="text-xs text-white/50">{t('marks.marksLabel')}</span>
                      <input type="number" min="0" max={entry.max_marks} value={entry.marks}
                        onChange={e => { const updated = [...markEntries]; updated[i].marks = e.target.value; setMarkEntries(updated) }}
                        className="input-field text-sm w-24 bg-white/10 text-white border-white/20" placeholder="0" />
                      <span className="text-xs text-white/50">/</span>
                      <input type="number" min="1" value={entry.max_marks}
                        onChange={e => { const updated = [...markEntries]; updated[i].max_marks = e.target.value; setMarkEntries(updated) }}
                        className="input-field text-sm w-20 bg-white/10 text-white border-white/20" />
                    </div>
                  )
                })}
              </div>
              <button onClick={handleSaveMarks} disabled={loading} className="btn-primary bg-white text-emerald-700 hover:bg-white/90">
                {loading ? t('common.saving') : t('marks.saveMarks')}
              </button>
            </div>
          )}
          {selectedExam && selectedClass && !selectedStudent && (
            <p className="text-sm text-emerald-100/60 mt-4">{t('marks.selectStudentToEnterMarks')}</p>
          )}
        </div>
      )}

      {tab === 'report' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('common.class')}</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); setReportData(null) }} className="select-field text-sm">
                <option value="">{t('marks.selectClass')}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('student')}</label>
              <select value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); setReportData(null) }} className="select-field text-sm">
                <option value="">{t('common.selectStudent')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-emerald-100 mb-1">{t('common.exam')}</label>
              <select value={reportExamId} onChange={e => { setReportExamId(e.target.value); setReportData(null) }} className="select-field text-sm">
                <option value="">{t('common.selectExam')}</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleGenerateReport} disabled={loading || !selectedStudent || !reportExamId}
            className="btn-primary bg-white text-emerald-700 hover:bg-white/90 mb-6">
            {loading ? t('common.generating') : t('marks.generateReportCard')}
          </button>
          {reportData && <ReportCard data={reportData} onPrint={handlePrint} />}
        </div>
      )}
    </div>
  )
}
