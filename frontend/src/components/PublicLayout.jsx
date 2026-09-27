import { useEffect, useState } from 'react'
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
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  GraduationCap,
  UserRound,
  Users,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'home', icon: Home },
  { to: '/about', label: 'aboutUs', icon: Info },
  { to: '/academics', label: 'academics', icon: BookOpen },
  { to: '/admissions', label: 'admissions', icon: UserRound },
  { to: '/student-life', label: 'studentLife', icon: Users },
  { to: '/news', label: 'news', icon: Megaphone },
  { to: '/events', label: 'events', icon: CalendarDays },
  { to: '/gallery', label: 'gallery', icon: Image },
  { to: '/achievements', label: 'achievements', icon: Award },
  { to: '/staff', label: 'staff', icon: Users },
  { to: '/alumni', label: 'alumni', icon: GraduationCap },
  { to: '/contact', label: 'contact', icon: Phone },
]

export default function PublicLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [sidebarOpen])

  return (
    <div className="public-shell min-h-screen flex flex-col">
      <header className="bg-white/95 backdrop-blur border-b border-school-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 min-h-[4.25rem] py-2.5">
            <NavLink to="/" className="flex items-center gap-3 min-w-0 flex-1" aria-label="Petit Séminaire Saint Vincent de Paul Ndera home">
              <div className="w-11 h-11 shrink-0 bg-school-primary flex items-center justify-center border-b-4 border-school-accent">
                <School size={22} className="text-white" strokeWidth={1.7} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[0.85rem] sm:text-base font-bold text-school-primary leading-tight truncate">{t('appName')}</h1>
                <p className="text-[0.65rem] sm:text-[0.68rem] text-school-muted uppercase tracking-[0.13em] leading-tight mt-1 truncate">{t('schoolPortal')}</p>
              </div>
            </NavLink>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-3">
                <LanguageSwitcher />
                <NavLink
                  to="/register"
                  className="inline-flex items-center gap-2 bg-school-burgundy text-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold hover:bg-[#641e2c] transition-colors whitespace-nowrap"
                >
                  {t('register')} <ArrowUpRight size={15} className="shrink-0" />
                </NavLink>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden shrink-0 p-2 text-school-primary hover:bg-school-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-school-accent"
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={sidebarOpen}
                aria-controls="public-mobile-nav"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav
            className="hidden lg:flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 pb-3"
            aria-label="Primary navigation"
          >
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `public-link-underline py-2 px-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-school-primary' : 'text-school-muted hover:text-school-primary'}`
                }
              >
                {t(label)}
              </NavLink>
            ))}
          </nav>
        </div>

        {sidebarOpen && (
          <div
            id="public-mobile-nav"
            className="lg:hidden border-t border-school-border bg-white max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2 py-3 text-sm font-semibold border-b border-school-border/60 last:border-b-0 ${isActive ? 'text-school-primary bg-school-surface' : 'text-school-muted hover:bg-school-surface'}`
                  }
                >
                  <Icon size={16} className="text-school-accent shrink-0" />
                  <span className="truncate">{t(label)}</span>
                </NavLink>
              ))}
              <div className="sm:hidden flex items-center justify-between gap-3 py-4">
                <LanguageSwitcher />
                <NavLink
                  to="/register"
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex items-center gap-2 bg-school-burgundy px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap"
                >
                  {t('register')} <ArrowUpRight size={15} className="shrink-0" />
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-school-primary text-white/70 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <School size={22} className="text-school-accent mt-1" />
                <span className="font-bold text-white leading-snug">{t('appName')}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">{t('nurturingMinds')}</p>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-4">{t('quickLinks')}</h3>
              <div className="space-y-2">
                {navItems.map(({ to, label }) => (
                  <NavLink key={to} to={to} className="block text-sm hover:text-school-accent transition-colors">{t(label)}</NavLink>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-4">{t('contactInfo')}</h3>
              <p className="text-sm mb-2">{t('address')}</p>
              <p className="text-sm mb-2">{t('phone')}</p>
              <p className="text-sm">{t('email')}</p>
            </div>
          </div>
          <div className="border-t border-white/15 mt-10 pt-5 text-xs flex flex-col sm:flex-row justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}</span>
            <NavLink to="/admin/login" className="hover:text-school-accent transition-colors">{t('adminLogin')}</NavLink>
          </div>
        </div>
      </footer>
    </div>
  )
}