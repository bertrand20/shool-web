import { useState, useEffect } from 'react'
import { Users, CalendarCheck, DollarSign, TrendingUp, Clock, Briefcase, UserCheck } from 'lucide-react'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function Dashboard() {
  const { t } = useI18n()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      const [studentsRes, revenueRes, attendanceRes, staffRes, parentsRes] = await Promise.all([
        fetch(`${API}/students?limit=1`, { headers }),
        fetch(`${API}/revenue`, { headers }),
        fetch(`${API}/attendance/summary`, { headers }),
        fetch(`${API}/staff/stats`, { headers }),
        fetch(`${API}/parents?limit=1`, { headers }),
      ])

      if (!studentsRes.ok || !revenueRes.ok) {
        throw new Error(t('dashboard.loadFailed'))
      }

      const studentsData = await studentsRes.json()
      const revenueData = await revenueRes.json()
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : []
      const staffData = staffRes.ok ? await staffRes.json() : { total_active: 0, by_role: [] }
      const parentsData = parentsRes.ok ? await parentsRes.json() : { pagination: { total: 0 } }

      const todayRate = attendanceData.length > 0 ? attendanceData[0]?.rate || 0 : 0

      setStats({
        totalStudents: studentsData.pagination?.total || 0,
        totalStaff: staffData.total_active || 0,
        totalParents: parentsData.pagination?.total || 0,
        staffByRole: staffData.by_role || [],
        totalCollected: revenueData.total_collected || 0,
        outstanding: revenueData.outstanding || 0,
        totalExpected: revenueData.total_expected || 0,
        recentPayments: revenueData.recent_payments || [],
        monthlyRevenue: revenueData.monthly_revenue || [],
        attendanceRate: todayRate,
        attendanceHistory: attendanceData.slice(0, 7),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) return <LoadingSpinner message={t('dashboard.loading')} />
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />

  const _collectionRate = stats.totalExpected > 0
    ? Math.round((stats.totalCollected / stats.totalExpected) * 100)
    : 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title text-school-primary">{t('dashboard')}</h1>
        <p className="page-subtitle text-school-muted">{t('overviewOfSchool')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={Users}
          label={t('totalStudents')}
          value={stats.totalStudents}
          color="blue"
          delay={1}
        />
        <StatCard
          icon={Briefcase}
          label={t('activeStaff')}
          value={stats.totalStaff}
          color="purple"
          delay={2}
        />
        <StatCard
          icon={UserCheck}
          label={t('registeredParents')}
          value={stats.totalParents}
          color="green"
          delay={3}
        />
        <StatCard
          icon={CalendarCheck}
          label={t('attendanceRate')}
          value={`${stats.attendanceRate}%`}
          trend={stats.attendanceRate >= 85 ? 3 : -2}
          trendLabel={t('dashboard.thisWeek')}
          color="amber"
          delay={4}
        />
        <StatCard
          icon={DollarSign}
          label={t('outstandingFees')}
          value={`$${stats.outstanding.toLocaleString()}`}
          color="red"
          delay={5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 panel-card animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-school-text">{t('revenueByMonth')}</h2>
            <TrendingUp size={16} className="text-school-muted" />
          </div>
          {stats.monthlyRevenue.length > 0 ? (
            <div className="space-y-3">
              {stats.monthlyRevenue.map((item) => {
                const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.total))
                const width = maxRevenue > 0 ? (item.total / maxRevenue) * 100 : 0
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-school-muted w-16 shrink-0 font-mono">{item.month}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-school-text w-20 text-right">
                      ${parseInt(item.total).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-school-muted py-4 text-center">{t('noRevenueData')}</p>
          )}
        </div>

        <div className="lg:col-span-2 panel-card animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-school-text">{t('recentPayments')}</h2>
            <Clock size={16} className="text-school-muted" />
          </div>
          {stats.recentPayments.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-school-text truncate">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="text-xs text-school-muted">{p.fee_type}</p>
                  </div>
                  <span className="text-sm font-semibold text-school-success whitespace-nowrap">
                    +${parseInt(p.amount_paid).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-school-muted py-4 text-center">{t('noPaymentsRecorded')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.attendanceHistory.length > 0 && (
          <div className="panel-card animate-slide-up stagger-3">
            <h2 className="text-sm font-semibold text-school-text mb-4">{t('attendanceTrend')}</h2>
            <div className="flex items-end gap-2 h-32">
              {stats.attendanceHistory.reverse().map((day) => {
                const height = day.rate > 0 ? Math.max(day.rate, 10) : 5
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-school-muted font-mono">{day.rate}%</span>
                    <div
                      className="w-full bg-emerald-500/80 rounded-t transition-all duration-300 hover:bg-emerald-600"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.rate}%`}
                    />
                    <span className="text-[10px] text-school-muted">{day.date?.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {stats.staffByRole.length > 0 && (
          <div className="panel-card animate-slide-up stagger-4">
            <h2 className="text-sm font-semibold text-school-text mb-4">{t('staffBreakdown')}</h2>
            <div className="space-y-3">
              {stats.staffByRole.map((item) => {
                const maxCount = Math.max(...stats.staffByRole.map(r => r.count))
                const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={item.role} className="flex items-center gap-3">
                    <span className="text-xs text-school-muted w-20 shrink-0">{item.role}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-school-text w-6 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
