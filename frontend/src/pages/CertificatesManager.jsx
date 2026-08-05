import { useState, useEffect } from 'react'
import { Award, Printer, CheckCircle, X, FileText } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

function transferGrade(avg, t) {
  if (avg === null) return t('certificates.notAvailable')
  if (avg >= 90) return t('certificates.excellentA')
  if (avg >= 80) return t('certificates.veryGoodA')
  if (avg >= 70) return t('certificates.goodB')
  if (avg >= 60) return t('certificates.aboveAverageB')
  if (avg >= 50) return t('certificates.averageC')
  if (avg >= 40) return t('certificates.passC')
  return t('certificates.belowAverage')
}

function TransferCertificate({ data }) {
  const { t } = useI18n()
  const { student, certificate_no, issued_on, days_present, days_absent, average, incidents } = data
  return (
    <div id="cert-print" className="bg-white rounded-xl border-4 border-emerald-600 p-8 max-w-3xl mx-auto relative">
      <div className="text-center border-b-4 border-double border-emerald-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">{t('appName')}</h1>
        <p className="text-xs text-gray-500 mt-1">{t('certificates.address')}</p>
        <h2 className="text-lg font-bold text-school-text mt-3 tracking-wide">{t('certificates.transferTitle')}</h2>
      </div>
      <div className="text-sm text-school-text leading-7">
        <p>{t('certificates.certifyStart')} <span className="font-bold underline">{student.first_name} {student.last_name}</span>, {t('certificates.sonOf')} {student.parent_first || ''} {student.parent_last || ''}, {t('certificates.bonafide')}</p>
        <p className="mt-3">{t('certificates.admissionDetails')}</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
          <p><span className="text-gray-500">{t('certificates.studentId')}</span> <span className="font-semibold">{student.id}</span></p>
          <p><span className="text-gray-500">{t('common.classLabel')}</span> <span className="font-semibold">{student.class_name} {student.section}</span></p>
          <p><span className="text-gray-500">{t('certificates.gender')}</span> <span className="font-semibold">{student.gender}</span></p>
          <p><span className="text-gray-500">{t('certificates.dateOfBirthLabel')}</span> <span className="font-semibold">{student.date_of_birth || 'N/A'}</span></p>
          <p><span className="text-gray-500">{t('certificates.daysPresent')}</span> <span className="font-semibold">{days_present}</span></p>
          <p><span className="text-gray-500">{t('certificates.daysAbsent')}</span> <span className="font-semibold">{days_absent}</span></p>
          <p><span className="text-gray-500">{t('certificates.academicStanding')}</span> <span className="font-semibold">{transferGrade(Number(average), t)}</span></p>
          <p><span className="text-gray-500">{t('certificates.conduct')}</span> <span className="font-semibold">{incidents === 0 ? t('certificates.satisfactory') : t('certificates.underObservation')}</span></p>
        </div>
        <p className="mt-6">{t('certificates.relieved')}</p>
      </div>
      <div className="flex justify-between items-end mt-10 pt-6 border-t border-gray-200">
        <div><p className="text-sm text-school-text">{t('certificates.certificateNo')} <span className="font-semibold">{certificate_no}</span></p><p className="text-xs text-gray-500">{t('certificates.issuedOn')} {issued_on}</p></div>
        <div className="text-center"><p className="text-sm font-semibold text-school-text">{t('principal')}</p><div className="w-40 mt-8 border-t border-school-text" /></div>
      </div>
      <div className="text-right mt-4">
        <button onClick={() => printCert(t('certificates.printTitle'))} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"><Printer size={14} /> {t('certificates.print')}</button>
      </div>
    </div>
  )
}

function ReportCardCert({ data }) {
  const { t } = useI18n()
  const { student, exam, marks, summary } = data
  return (
    <div id="cert-print" className="bg-white rounded-xl border-4 border-emerald-600 p-8 max-w-3xl mx-auto">
      <div className="text-center border-b-4 border-double border-emerald-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">{t('appName')}</h1>
        <h2 className="text-lg font-bold text-school-text mt-3 tracking-wide">{t('certificates.reportCardTitle')}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-school-text mb-6">
        <p><span className="text-gray-500">{t('common.studentLabel')}</span> <span className="font-semibold">{student.first_name} {student.last_name}</span></p>
        <p><span className="text-gray-500">{t('common.classLabel')}</span> <span className="font-semibold">{student.class_name} {student.section}</span></p>
        <p><span className="text-gray-500">{t('common.examLabel')}</span> <span className="font-semibold">{exam.name}</span></p>
        <p><span className="text-gray-500">{t('certificates.yearLabel')}</span> <span className="font-semibold">{exam.academic_year}</span></p>
      </div>
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-4">
        <thead className="bg-gray-50">
          <tr><th className="text-left py-2 px-3 font-medium text-gray-600 text-xs">{t('subject')}</th><th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('common.marks')}</th><th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('common.max')}</th><th className="text-right py-2 px-3 font-medium text-gray-600 text-xs">{t('common.percentage')}</th></tr>
        </thead>
        <tbody>
          {marks.map(m => (
            <tr key={m.id} className="border-t border-gray-100">
              <td className="py-2 px-3 font-medium">{m.subject_name}</td>
              <td className="py-2 px-3 text-right">{parseFloat(m.marks).toFixed(0)}</td>
              <td className="py-2 px-3 text-right text-gray-500">{parseFloat(m.max_marks).toFixed(0)}</td>
              <td className="py-2 px-3 text-right">{parseFloat(m.max_marks) > 0 ? ((parseFloat(m.marks) / parseFloat(m.max_marks)) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-emerald-50 rounded-lg p-4 flex justify-between items-center">
        <span className="text-sm text-school-text">{t('common.totalLabel')} <span className="font-bold">{summary.totalMarks.toFixed(0)} / {summary.totalMax.toFixed(0)}</span></span>
        <span className="text-sm text-school-text">{t('common.averageLabel')} <span className="font-bold">{summary.average}%</span></span>
        <span className="text-sm text-school-text">{t('common.gradeLabel')} <span className="font-bold text-emerald-700">{summary.average >= 90 ? 'A+' : summary.average >= 80 ? 'A' : summary.average >= 70 ? 'B+' : summary.average >= 60 ? 'B' : summary.average >= 50 ? 'C+' : summary.average >= 40 ? 'C' : summary.average >= 30 ? 'D' : 'F'}</span></span>
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={() => printCert(t('certificates.printTitle'))} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"><Printer size={14} /> {t('certificates.print')}</button>
      </div>
    </div>
  )
}

function printCert(title) {
  const content = document.getElementById('cert-print')
  if (!content) return
  const w = window.open('', '_blank')
  w.document.write('<html><head><title>' + title + '</title><style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left}th{background:#f3f4f6}.bg-emerald-50{background:#ecfdf5}.rounded-lg{border-radius:8px}.p-4{padding:16px}.font-bold{font-weight:bold}.text-sm{font-size:14px}.text-emerald-700{color:#047857}.flex{display:flex}.justify-between{justify-content:space-between}.items-center{align-items:center}</style></head><body>')
  w.document.write(content.innerHTML)
  w.document.write('</body></html>')
  w.document.close()
  w.print()
}

export default function CertificatesManager() {
  const { t } = useI18n()
  const [tab, setTab] = useState('transfer')
  const [students, setStudents] = useState([])
  const [exams, setExams] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [cert, setCert] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.all([
          fetch(API + '/students?limit=300').then(r => r.json()),
          fetch(API + '/exams').then(r => r.json()),
        ])
        setStudents(Array.isArray(s) ? s : s.students || [])
        setExams(e)
      } catch { setMsg({ type: 'error', text: t('common.failedToLoadData') }) }
    })()
  }, [])

  const generate = async () => {
    if (!selectedStudent) return setMsg({ type: 'error', text: t('certificates.selectStudentMsg') })
    setLoading(true)
    try {
      const url = tab === 'transfer'
        ? API + '/certificates/transfer/' + selectedStudent
        : API + '/certificates/report-card/' + selectedStudent + '/' + selectedExam
      const res = await fetch(url, { headers: authHeaders })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setCert(data)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-white">{t('certificates')}</h1>
        <p className="page-subtitle text-emerald-100">{t('certificates.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => { setTab('transfer'); setCert(null) }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'transfer' ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}><Award size={15} /> {t('certificates.transfer')}</button>
        <button onClick={() => { setTab('report'); setCert(null) }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'report' ? 'bg-white text-emerald-700' : 'text-white/70 hover:text-white'}`}><FileText size={15} /> {t('reportCard')}</button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-emerald-100 mb-1">{t('student')}</label>
          <select value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); setCert(null) }} className="select-field text-sm w-64">
            <option value="">{t('common.selectStudent')}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        {tab === 'report' && (
          <div>
            <label className="block text-xs text-emerald-100 mb-1">{t('common.exam')}</label>
            <select value={selectedExam} onChange={e => { setSelectedExam(e.target.value); setCert(null) }} className="select-field text-sm w-64">
              <option value="">{t('common.selectExam')}</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
        <button onClick={generate} disabled={loading || !selectedStudent || (tab === 'report' && !selectedExam)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
          <Award size={14} className="mr-1 inline" /> {loading ? t('common.generating') : t('certificates.generateCertificate')}
        </button>
      </div>

      {cert && (tab === 'transfer' ? <TransferCertificate data={cert} /> : <ReportCardCert data={cert} />)}
    </div>
  )
}
