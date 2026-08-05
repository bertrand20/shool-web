import { useState, useEffect } from 'react'
import { Image, X } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

const categories = ['All', 'School', 'Student', 'Event', 'Activity']

export default function ParentGallery() {
  const { t } = useI18n()
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch(`${API}/portal/gallery`)
      .then((r) => r.json())
      .then(setGallery)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? gallery : gallery.filter((g) => g.category === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Image size={24} className="text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('parentGallery.photoGallery')}</h1>
          <p className="text-sm text-gray-500">{t('parentGallery.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'All' ? t('parentGallery.all') : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t('parentGallery.noPhotos')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div
              key={g.id}
              onClick={() => setSelected(g)}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={g.image_url}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {g.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{g.title}</h3>
                {g.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{selected.title}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{selected.category}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <img src={selected.image_url} alt={selected.title} className="w-full max-h-[60vh] object-contain bg-gray-50" />
            {selected.description && (
              <div className="p-4">
                <p className="text-gray-600">{selected.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
