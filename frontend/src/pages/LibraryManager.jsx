import { useState, useEffect } from 'react'
import { BookMarked, Plus, Trash2, Pencil, CheckCircle, X, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function LibraryManager() {
  const { t } = useI18n()
  const [tab, setTab] = useState('books')
  const [books, setBooks] = useState([])
  const [issues, setIssues] = useState([])
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [msg, setMsg] = useState(null)
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', category: '', total_copies: 1, shelf_location: '' })
  const [issueForm, setIssueForm] = useState({ book_id: '', student_id: '', due_date: '', notes: '' })

  const token = localStorage.getItem('admin_token')
  const authHeaders = { Authorization: 'Bearer ' + token }

  const fetchData = async (url) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) throw new Error('Fetch failed')
    return res.json()
  }

  useEffect(() => {
    (async () => {
      try {
        const [b, i, s, sum] = await Promise.all([
          fetchData(API + '/library/books'),
          fetchData(API + '/library/issues'),
          fetchData(API + '/students?limit=200'),
          fetchData(API + '/library/summary'),
        ])
        setBooks(b)
        setIssues(i)
        setStudents(Array.isArray(s) ? s : s.students || [])
        setSummary(sum)
      } catch { setMsg({ type: 'error', text: t('loadFailed') }) }
    })()
  }, [])

  const handleBookSave = async (e) => {
    e.preventDefault()
    try {
      const opts = { method: editingBook ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(bookForm) }
      const res = await fetch(API + (editingBook ? '/library/books/' + editingBook.id : '/library/books'), opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('saveFailed'))
      setMsg({ type: 'success', text: editingBook ? t('library.bookUpdated') : t('library.bookAdded') })
      setShowBookForm(false)
      setEditingBook(null)
      setBookForm({ title: '', author: '', isbn: '', category: '', total_copies: 1, shelf_location: '' })
      const [b, sum] = await Promise.all([fetchData(API + '/library/books'), fetchData(API + '/library/summary')])
      setBooks(b)
      setSummary(sum)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDeleteBook = async (id) => {
    if (!confirm(t('library.deleteBookConfirm'))) return
    await fetch(API + '/library/books/' + id, { method: 'DELETE', headers: authHeaders })
    setBooks(books.filter(b => b.id !== id))
  }

  const startEditBook = (b) => {
    setEditingBook(b)
    setBookForm({ title: b.title, author: b.author || '', isbn: b.isbn || '', category: b.category || '', total_copies: b.total_copies, shelf_location: b.shelf_location || '' })
    setShowBookForm(true)
  }

  const handleIssue = async (e) => {
    e.preventDefault()
    if (!issueForm.book_id || !issueForm.student_id || !issueForm.due_date) return setMsg({ type: 'error', text: t('library.issueRequired') })
    try {
      const res = await fetch(API + '/library/issue', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ ...issueForm, book_id: parseInt(issueForm.book_id), student_id: parseInt(issueForm.student_id) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('library.issueFailed'))
      setMsg({ type: 'success', text: t('library.bookIssued') })
      setShowIssueForm(false)
      setIssueForm({ book_id: '', student_id: '', due_date: '', notes: '' })
      const [i, b, sum] = await Promise.all([fetchData(API + '/library/issues'), fetchData(API + '/library/books'), fetchData(API + '/library/summary')])
      setIssues(i)
      setBooks(b)
      setSummary(sum)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleReturn = async (id) => {
    const res = await fetch(API + '/library/return/' + id, { method: 'POST', headers: authHeaders })
    const data = await res.json()
    if (!res.ok) return setMsg({ type: 'error', text: data.error || t('library.returnFailed') })
    setMsg({ type: 'success', text: t('library.bookReturned') })
    const [i, b, sum] = await Promise.all([fetchData(API + '/library/issues'), fetchData(API + '/library/books'), fetchData(API + '/library/summary')])
    setIssues(i)
    setBooks(b)
    setSummary(sum)
  }

  const statusColor = (s) => s === 'Returned' ? 'bg-emerald-400/20 text-emerald-100' : s === 'Overdue' ? 'bg-red-400/20 text-red-100' : 'bg-amber-400/20 text-amber-100'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('library')}</h1>
        <p className="page-subtitle">{t('library.subtitle')}</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle size={16} /> {msg.text} <button onClick={() => setMsg(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="panel-card"><p className="text-2xl font-bold">{summary.total_books}</p><p className="text-xs text-school-muted">{t('library.totalTitles')}</p></div>
          <div className="panel-card"><p className="text-2xl font-bold">{summary.available}</p><p className="text-xs text-school-muted">{t('library.copiesAvailable')}</p></div>
          <div className="panel-card"><p className="text-2xl font-bold">{summary.issued}</p><p className="text-xs text-school-muted">{t('library.currentlyIssued')}</p></div>
          <div className="panel-card"><p className="text-2xl font-bold text-amber-600">{summary.overdue}</p><p className="text-xs text-school-muted">{t('library.overdue')}</p></div>
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 w-fit border border-school-border">
        <button onClick={() => setTab('books')} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'books' ? 'bg-school-primary text-white' : 'text-school-muted hover:text-school-primary'}`}>{t('library.books')} ({books.length})</button>
        <button onClick={() => setTab('issues')} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'issues' ? 'bg-school-primary text-white' : 'text-school-muted hover:text-school-primary'}`}>{t('library.issues')} ({issues.length})</button>
      </div>

      {tab === 'books' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{books.length} {t('library.bookTitles')}</p>
            <button onClick={() => { setEditingBook(null); setShowBookForm(true) }} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><Plus size={14} className="mr-1 inline" /> {t('library.addBook')}</button>
          </div>
          {showBookForm && (
            <form onSubmit={handleBookSave} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input placeholder={t('title')} value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} className="input-field text-sm" required />
              <input placeholder={t('library.author')} value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} className="input-field text-sm" />
              <input placeholder={t('library.isbn')} value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} className="input-field text-sm" />
              <input placeholder={t('category')} value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} className="input-field text-sm" />
              <input type="number" min="1" placeholder={t('library.copies')} value={bookForm.total_copies} onChange={e => setBookForm({ ...bookForm, total_copies: e.target.value })} className="input-field text-sm" />
              <input placeholder={t('library.shelfLocation')} value={bookForm.shelf_location} onChange={e => setBookForm({ ...bookForm, shelf_location: e.target.value })} className="input-field text-sm" />
              <div className="col-span-2 sm:col-span-3 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{editingBook ? t('update') : t('library.addBook')}</button>
                <button type="button" onClick={() => { setShowBookForm(false); setEditingBook(null) }} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {books.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('library.noBooks')}</p>}
            {books.map(b => (
              <div key={b.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><BookMarked size={16} className="text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{b.title}</p>
                  <p className="text-xs text-emerald-100/70 truncate">{b.author || t('library.unknownAuthor')} · {b.category || t('library.uncategorised')} {b.isbn ? '· ' + b.isbn : ''}</p>
                </div>
                <span className="text-xs text-emerald-100/70">{b.available_copies}/{b.total_copies} {t('library.left')}</span>
                <button onClick={() => startEditBook(b)} className="p-1 hover:bg-white/15 rounded text-white/70"><Pencil size={13} /></button>
                <button onClick={() => handleDeleteBook(b.id)} className="p-1 hover:bg-white/15 rounded text-red-300"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'issues' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-100">{issues.length} {t('library.issueRecords')}</p>
            <button onClick={() => setShowIssueForm(true)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90"><ArrowRightCircle size={14} className="mr-1 inline" /> {t('library.issueBook')}</button>
          </div>
          {showIssueForm && (
            <form onSubmit={handleIssue} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={issueForm.book_id} onChange={e => setIssueForm({ ...issueForm, book_id: e.target.value })} className="select-field text-sm" required>
                <option value="">{t('library.book')}</option>
                {books.filter(b => b.available_copies > 0).map(b => <option key={b.id} value={b.id}>{b.title} ({b.available_copies})</option>)}
              </select>
              <select value={issueForm.student_id} onChange={e => setIssueForm({ ...issueForm, student_id: e.target.value })} className="select-field text-sm" required>
                <option value="">{t('student')}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <input type="date" value={issueForm.due_date} onChange={e => setIssueForm({ ...issueForm, due_date: e.target.value })} className="input-field text-sm" required />
              <input placeholder={t('notes')} value={issueForm.notes} onChange={e => setIssueForm({ ...issueForm, notes: e.target.value })} className="input-field text-sm" />
              <div className="col-span-2 sm:col-span-4 flex gap-2">
                <button type="submit" className="btn-primary btn-sm bg-white text-emerald-700">{t('library.issueBook')}</button>
                <button type="button" onClick={() => setShowIssueForm(false)} className="btn-secondary btn-sm bg-white/10 text-white">{t('cancel')}</button>
              </div>
            </form>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {issues.length === 0 && <p className="p-6 text-center text-sm text-emerald-100/60">{t('library.noIssues')}</p>}
            {issues.map(i => (
              <div key={i.id} className="px-4 py-3 border-b border-white/10 last:border-0 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{i.book_title}</p>
                  <p className="text-xs text-emerald-100/70 truncate">{i.student_name} · {t('library.issued')} {i.issue_date} · {t('library.due')} {i.due_date}{i.return_date ? ' · ' + t('library.returned') + ' ' + i.return_date : ''}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${statusColor(i.status)}`}>{i.status}</span>
                {i.status === 'Issued' && (
                  <button onClick={() => handleReturn(i.id)} className="btn-primary btn-sm bg-white text-emerald-700 hover:bg-white/90">
                    <ArrowLeftCircle size={13} className="mr-1 inline" /> {t('library.return')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
