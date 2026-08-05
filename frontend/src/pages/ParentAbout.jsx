import { useState, useEffect } from 'react'
import { Info, Star, TrendingUp, BookOpen } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function ParentAbout() {
  const { t } = useI18n()
  const [schoolInfo, setSchoolInfo] = useState({})

  useEffect(() => {
    fetch(`${API}/portal/school-info`)
      .then((r) => r.json())
      .then(setSchoolInfo)
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Info size={24} className="text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('parentAbout.aboutTitle')}</h1>
          <p className="text-sm text-gray-500">{t('parentAbout.subtitle')}</p>
        </div>
      </div>

      {schoolInfo.about && (
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('parentAbout.ourStory')}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{schoolInfo.about}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {schoolInfo.mission && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Star size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t('ourMission')}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{schoolInfo.mission}</p>
          </div>
        )}
        {schoolInfo.vision && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t('ourVision')}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{schoolInfo.vision}</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-emerald-700 to-teal-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={24} />
          <h2 className="text-xl font-bold">{t('parentAbout.ourValues')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: t('parentAbout.excellence'), desc: t('parentAbout.excellenceDesc') },
            { title: t('parentAbout.integrity'), desc: t('parentAbout.integrityDesc') },
            { title: t('parentAbout.innovation'), desc: t('parentAbout.innovationDesc') },
            { title: t('parentAbout.community'), desc: t('parentAbout.communityDesc') },
          ].map((v) => (
            <div key={v.title} className="bg-white/10 rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold mb-1">{v.title}</h3>
              <p className="text-emerald-100 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
