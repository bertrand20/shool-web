import { useState, useEffect } from 'react'
import { Megaphone, Plus, Trash2, Edit, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
})

const priorityColor = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
}

const emptyForm = { title: '', content: '', image_url: '', priority: 'Medium', is_published: 1 }

export default function AnnouncementsManager() {
  const { t } = useI18n()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/admin/announcements`, { headers: getHeaders() })
      if (res.ok) setAnnouncements(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const method = editItem ? 'PUT' : 'POST'
    const url = editItem ? `${API}/admin/announcements/${editItem.id}` : `${API}/admin/announcements`
    await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) })
    setModalOpen(false)
    setEditItem(null)
    setForm(emptyForm)
    fetchAll()
  }

  const handleDelete = async (id) => {
    if (!confirm(t('announcements.deleteConfirm'))) return
    await fetch(`${API}/admin/announcements/${id}`, { method: 'DELETE', headers: getHeaders() })
    fetchAll()
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ title: item.title, content: item.content, image_url: item.image_url || '', priority: item.priority, is_published: item.is_published })
    setModalOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Megaphone size={20} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">{t('announcements')}</h2>
        </div>
        <button
          onClick={() => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Plus size={14} /> {t('add')}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">{t('loading')}</p>
      ) : announcements.length === 0 ? (
        <p className="text-gray-400 text-sm">{t('announcements.none')}</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityColor[a.priority]}`}>{a.priority}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.is_published ? t('published') : t('draft')}
                    </span>
                    <span className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{a.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-emerald-600"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editItem ? t('announcements.editTitle') : t('announcements.newTitle')}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('title')}</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('content')}</label>
                <textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('announcements.imageUrlOptional')}</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('announcements.priority')}</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option value="High">{t('announcements.priorityHigh')}</option><option value="Medium">{t('announcements.priorityMedium')}</option><option value="Low">{t('announcements.priorityLow')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('status')}</label>
                  <select value={form.is_published} onChange={(e) => setForm({ ...form, is_published: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option value={1}>{t('published')}</option><option value={0}>{t('draft')}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
