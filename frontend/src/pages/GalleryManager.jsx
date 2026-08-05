import { useState, useEffect } from 'react'
import { Image, Plus, Trash2, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
})

const emptyForm = { title: '', image_url: '', category: 'School', description: '' }

export default function GalleryManager() {
  const { t } = useI18n()
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/admin/gallery`, { headers: getHeaders() })
      if (res.ok) setGallery(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    await fetch(`${API}/admin/gallery`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(form) })
    setModalOpen(false)
    setForm(emptyForm)
    fetchAll()
  }

  const handleDelete = async (id) => {
    if (!confirm(t('gallery.deleteConfirm'))) return
    await fetch(`${API}/admin/gallery/${id}`, { method: 'DELETE', headers: getHeaders() })
    fetchAll()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image size={20} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">{t('gallery.photoGallery')}</h2>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModalOpen(true) }}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Plus size={14} /> {t('gallery.addPhoto')}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">{t('loading')}</p>
      ) : gallery.length === 0 ? (
        <p className="text-gray-400 text-sm">{t('gallery.none')}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gallery.map((g) => (
            <div key={g.id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="aspect-[4/3] bg-gray-100">
                <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{g.category}</span>
                <h3 className="text-xs font-semibold text-gray-900 mt-1 truncate">{g.title}</h3>
              </div>
              <button
                onClick={() => handleDelete(g.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{t('gallery.addPhoto')}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('title')}</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('gallery.imageUrl')}</label>
                <input type="url" required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('category')}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="School">{t('gallery.categorySchool')}</option><option value="Student">{t('student')}</option><option value="Event">{t('gallery.categoryEvent')}</option><option value="Activity">{t('gallery.categoryActivity')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('gallery.descriptionOptional')}</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" />
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
