import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/context'
import LanguageSwitcher from './LanguageSwitcher'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  DollarSign,
  Menu,
  School,
  UserCheck,
  Briefcase,
  Megaphone,
  Image,
  Settings,
  LogOut,
  Receipt,
  BookOpen,
  CalendarClock,
  BookOpenCheck,
  Bell,
  Download,
  BookMarked,
  Bus,
  Stethoscope,
  Wallet,
  CalendarOff,
  CalendarDays,
  ClipboardList,
  Boxes,
  ShieldCheck,
  Award,
} from 'lucide-react'

const navSections = [
  {
    label: 'overview',
    items: [
      { to: '/admin', label: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'management',
    items: [
      { to: '/admin/enrollment', label: 'students', icon: Users },
      { to: '/admin/parents', label: 'parents', icon: UserCheck },
      { to: '/admin/staff', label: 'staffTeachers', icon: Briefcase },
      { to: '/admin/behavior', label: 'behaviorDiscipline', icon: ClipboardList },
    ],
  },
  {
    label: 'operations',
    items: [
      { to: '/admin/attendance', label: 'attendance', icon: CalendarCheck },
      { to: '/admin/timetable', label: 'timetable', icon: CalendarClock },
      { to: '/admin/library', label: 'library', icon: BookMarked },
      { to: '/admin/transport', label: 'transport', icon: Bus },
      { to: '/admin/health', label: 'healthRecords', icon: Stethoscope },
    ],
  },
  {
    label: 'finance',
    items: [
      { to: '/admin/billing', label: 'billing', icon: DollarSign },
      { to: '/admin/payments', label: 'payments', icon: Receipt },
      { to: '/admin/payroll', label: 'payroll', icon: Wallet },
    ],
  },
  {
    label: 'academic',
    items: [
      { to: '/admin/marks', label: 'marksReports', icon: BookOpen },
      { to: '/admin/homework', label: 'homework', icon: BookOpenCheck },
      { to: '/admin/certificates', label: 'certificates', icon: Award },
    ],
  },
  {
    label: 'staff',
    items: [
      { to: '/admin/leave', label: 'leaveRequests', icon: CalendarOff },
    ],
  },
  {
    label: 'content',
    items: [
      { to: '/admin/announcements', label: 'announcements', icon: Megaphone },
      { to: '/admin/events', label: 'events', icon: CalendarDays },
      { to: '/admin/gallery', label: 'gallery', icon: Image },
      { to: '/admin/school-info', label: 'schoolInfo', icon: Settings },
    ],
  },
  {
    label: 'system',
    items: [
      { to: '/admin/notifications', label: 'notifications', icon: Bell },
      { to: '/admin/inventory', label: 'inventory', icon: Boxes },
      { to: '/admin/reports', label: 'reportsExports', icon: Download },
      { to: '/admin/audit-logs', label: 'auditLogs', icon: ShieldCheck },
    ],
  },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useI18n()
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-school-primary-dark text-white
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col overflow-y-auto
        `}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-school-accent flex items-center justify-center">
            <School size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">{t('appName')}</h1>
            <p className="text-xs text-blue-200 leading-tight">{t('adminPanel')}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-300/60">
                {t(section.label)}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/admin'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-blue-200 hover:bg-white/8 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {t(label)}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/8 hover:text-white transition-all"
          >
            <School size={18} />
            {t('viewPublicSite')}
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/8 hover:text-white transition-all w-full"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-blue-300">{t('academicYear')}</p>
          <p className="text-xs text-blue-200/60 mt-0.5">v2.0.0</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="h-14 bg-white border-b border-school-border flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 mr-3 transition-colors"
          >
            <Menu size={20} className="text-school-muted" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-school-text leading-tight">{adminUser.full_name || t('admin')}</p>
              <p className="text-xs text-school-muted leading-tight">{t('schoolAdministrator')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-school-primary-light text-white flex items-center justify-center text-sm font-bold">
              {adminUser.full_name?.[0] || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto relative bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl m-2 lg:m-3">
          {/* Animated Bubbles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute rounded-full bg-white/10 blur-sm" style={{ width: 120, height: 120, top: '5%', right: '10%', animation: 'bubbleFloat1 14s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/8 blur-xs" style={{ width: 80, height: 80, top: '20%', left: '5%', animation: 'bubbleFloat2 18s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/12 blur-sm" style={{ width: 160, height: 160, bottom: '10%', right: '20%', animation: 'bubbleFloat3 22s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/6 blur-md" style={{ width: 60, height: 60, top: '40%', right: '30%', animation: 'bubbleFloat4 16s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/10 blur-sm" style={{ width: 100, height: 100, bottom: '20%', left: '15%', animation: 'bubbleFloat5 20s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/8 blur-xs" style={{ width: 50, height: 50, top: '60%', left: '40%', animation: 'bubbleFloat1 15s ease-in-out infinite reverse' }} />
            <div className="absolute rounded-full bg-white/15 blur-sm" style={{ width: 140, height: 140, top: '15%', left: '25%', animation: 'bubbleFloat2 24s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/6 blur-md" style={{ width: 90, height: 90, bottom: '30%', right: '5%', animation: 'bubbleFloat3 19s ease-in-out infinite reverse' }} />
            <div className="absolute rounded-full bg-white/5 blur-3xl" style={{ width: 300, height: 300, top: '50%', left: '60%', animation: 'bubbleFloat4 30s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/3 blur-3xl" style={{ width: 350, height: 350, bottom: '0%', left: '10%', animation: 'bubbleFloat5 35s ease-in-out infinite reverse' }} />
            <div className="absolute rounded-full bg-white/10 blur-sm" style={{ width: 110, height: 110, bottom: '5%', left: '10%', animation: 'bubbleFloat1 12s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/7 blur-xs" style={{ width: 70, height: 70, bottom: '25%', left: '30%', animation: 'bubbleFloat2 15s ease-in-out infinite' }} />
            <div className="absolute rounded-full bg-white/8 blur-sm" style={{ width: 130, height: 130, bottom: '20%', right: '10%', animation: 'bubbleFloat3 21s ease-in-out infinite reverse' }} />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}