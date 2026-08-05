import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Megaphone,
  Image,
  Users,
  GraduationCap,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Star,
  ChevronRight,
  TrendingUp,
  Shield,
  UserPlus,
} from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

const priorityColor = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ParentDashboard() {
  const { t } = useI18n()
  const [announcements, setAnnouncements] = useState([])
  const [gallery, setGallery] = useState([])
  const [schoolInfo, setSchoolInfo] = useState({})
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/portal/announcements`).then((r) => r.json()),
      fetch(`${API}/portal/gallery?category=School`).then((r) => r.json()),
      fetch(`${API}/portal/school-info`).then((r) => r.json()),
      fetch(`${API}/portal/stats`).then((r) => r.json()),
    ]).then(([ann, gal, info, st]) => {
      setAnnouncements(ann)
      setGallery(gal)
      setSchoolInfo(info)
      setStats(st)
    }).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {t('parentDashboard.welcome')}
            </h1>
            <p className="text-emerald-100 text-lg mb-8">
              {t('parentDashboard.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition-colors"
              >
                {t('parentDashboard.registerStudent')} <UserPlus size={16} />
              </NavLink>
              <NavLink
                to="/about"
                className="inline-flex items-center gap-2 bg-emerald-800/50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-800/70 border border-emerald-500/30 transition-colors"
              >
                {t('parentDashboard.learnAboutUs')} <ArrowRight size={16} />
              </NavLink>
              <NavLink
                to="/announcements"
                className="inline-flex items-center gap-2 bg-emerald-800/50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-800/70 border border-emerald-500/30 transition-colors"
              >
                {t('parentDashboard.viewAnnouncements')} <Megaphone size={16} />
              </NavLink>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                { icon: Users, label: t('students'), value: stats.studentCount, color: 'bg-emerald-800/40' },
                { icon: GraduationCap, label: t('staff'), value: stats.staffCount, color: 'bg-emerald-800/40' },
                { icon: BookOpen, label: t('parentDashboard.classes'), value: stats.classCount, color: 'bg-emerald-800/40' },
                { icon: Shield, label: t('parents'), value: stats.parentCount, color: 'bg-emerald-800/40' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`${color} backdrop-blur rounded-xl p-4 border border-white/10`}>
                  <Icon size={20} className="text-emerald-200 mb-2" />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-emerald-200 text-sm">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </section>

      {/* Latest Announcements */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Megaphone size={20} className="text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">{t('parentDashboard.latestAnnouncements')}</h2>
            </div>
            <NavLink to="/announcements" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              {t('viewAll')} <ChevronRight size={14} />
            </NavLink>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColor[a.priority]}`}>
                    {a.priority}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{a.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Image size={20} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('parentDashboard.schoolGallery')}</h2>
              </div>
              <NavLink to="/gallery" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                {t('viewAll')} <ChevronRight size={14} />
              </NavLink>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((g) => (
                <div key={g.id} className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                  <img src={g.image_url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {g.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Phone size={20} className="text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('parentDashboard.getInTouch')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolInfo.contact_address && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <MapPin size={18} className="text-emerald-600 mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('address')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_address}</p>
            </div>
          )}
          {schoolInfo.contact_phone && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Phone size={18} className="text-emerald-600 mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('phone')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_phone}</p>
            </div>
          )}
          {schoolInfo.contact_email && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Mail size={18} className="text-emerald-600 mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('email')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_email}</p>
            </div>
          )}
          {schoolInfo.contact_hours && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Clock size={18} className="text-emerald-600 mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('parentDashboard.hours')}</h3>
              <p className="text-gray-600 text-sm">{schoolInfo.contact_hours}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
