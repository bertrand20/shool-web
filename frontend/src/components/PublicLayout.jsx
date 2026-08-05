import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/context'
import LanguageSwitcher from './LanguageSwitcher'
import {
  Home,
  Megaphone,
  Image,
  Info,
  Phone,
  Menu,
  School,
  X,
  UserPlus,
  DollarSign,
  FileText,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'home', icon: Home },
  { to: '/announcements', label: 'announcements', icon: Megaphone },
  { to: '/register', label: 'register', icon: UserPlus },
  { to: '/pay-fees', label: 'payFees', icon: DollarSign },
  { to: '/report-card', label: 'reportCard', icon: FileText },
  { to: '/gallery', label: 'gallery', icon: Image },
  { to: '/about', label: 'aboutUs', icon: Info },
  { to: '/contact', label: 'contact', icon: Phone },
]

export default function PublicLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <School size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base text-gray-900 leading-tight">{t('appName')}</h1>
                <p className="text-xs text-gray-500 leading-tight">{t('schoolPortal')}</p>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon size={16} />
                  {t(label)}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <NavLink
                to="/admin/login"
                className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-emerald-600 border border-gray-200 rounded-lg hover:border-emerald-300 transition-all"
              >
                {t('adminLogin')}
              </NavLink>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white pb-3">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm font-medium ${
                    isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon size={16} />
                {t(label)}
              </NavLink>
            ))}
            <NavLink
              to="/admin/login"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-400 hover:bg-gray-50"
            >
              {t('adminLogin')}
            </NavLink>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <School size={18} className="text-emerald-400" />
                <span className="font-bold text-white">{t('appName')}</span>
              </div>
              <p className="text-sm">{t('nurturingMinds')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-2">{t('quickLinks')}</h3>
              <div className="space-y-1">
                {navItems.map(({ to, label }) => (
                  <NavLink key={to} to={to} className="block text-sm hover:text-emerald-400 transition-colors">{t(label)}</NavLink>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-2">{t('contactInfo')}</h3>
              <p className="text-sm">{t('address')}</p>
              <p className="text-sm">{t('phone')}</p>
              <p className="text-sm">{t('email')}</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-4 text-xs text-center">
            &copy; 2026 {t('appName')}. {t('allRightsReserved')}
          </div>
        </div>
      </footer>
    </div>
  )
}