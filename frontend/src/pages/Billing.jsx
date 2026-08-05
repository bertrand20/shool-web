import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/context'
import { DollarSign, Plus, Receipt, AlertTriangle } from 'lucide-react'
import StatCard from '../components/StatCard'
import PaymentModal from '../components/PaymentModal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'

const API = '/api'

const TAB_LABEL_KEYS = { overview: 'overview', balances: 'billing.tabBalances', 'fee structure': 'billing.tabFeeStructure' }

export default function Billing() {
  const { t } = useI18n()
  const [revenue, setRevenue] = useState(null)
  const [outstanding, setOutstanding] = useState([])
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchBilling = async () => {
    setLoading(true)
    setError(null)
    try {
      const [revRes, outRes, feesRes, stuRes] = await Promise.all([
        fetch(`${API}/revenue`),
        fetch(`${API}/outstanding`),
        fetch(`${API}/fees`),
        fetch(`${API}/students?status=Active&limit=200`),
      ])

      if (!revRes.ok) throw new Error(t('billing.loadFailed'))

      setRevenue(await revRes.json())
      if (outRes.ok) setOutstanding(await outRes.json())
      if (feesRes.ok) setFees(await feesRes.json())
      if (stuRes.ok) {
        const data = await stuRes.json()
        setStudents(data.students)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBilling()
  }, [])

  const handleRecordPayment = async (formData) => {
    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || t('billing.recordFailed'))
    }

    fetchBilling()
  }

  if (loading) return <LoadingSpinner message={t('billing.loadingInfo')} />
  if (error) return <ErrorMessage message={error} onRetry={fetchBilling} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">{t('billing.title')}</h1>
          <p className="page-subtitle">{t('billing.subtitle')}</p>
        </div>
        <button
          onClick={() => setPaymentModalOpen(true)}
          className="btn-primary btn-sm flex items-center gap-1.5 self-start"
        >
          <Plus size={15} />
          {t('billing.recordPayment')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label={t('billing.totalCollected')}
          value={`$${parseInt(revenue?.total_collected || 0).toLocaleString()}`}
          color="green"
          delay={1}
        />
        <StatCard
          icon={AlertTriangle}
          label={t('billing.outstanding')}
          value={`$${parseInt(revenue?.outstanding || 0).toLocaleString()}`}
          color="red"
          delay={2}
        />
        <StatCard
          icon={Receipt}
          label={t('billing.totalExpected')}
          value={`$${parseInt(revenue?.total_expected || 0).toLocaleString()}`}
          color="blue"
          delay={3}
        />
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {['overview', 'balances', 'fee structure'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
              activeTab === tab
                ? 'bg-white text-school-text shadow-sm'
                : 'text-school-muted hover:text-school-text'
            }`}
          >
            {t(TAB_LABEL_KEYS[tab])}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-school-text mb-4">{t('billing.revenueTrend')}</h3>
            {revenue?.monthly_revenue?.length > 0 ? (
              <div className="space-y-3">
                {revenue.monthly_revenue.map((item) => {
                  const max = Math.max(...revenue.monthly_revenue.map(m => m.total))
                  const w = max > 0 ? (item.total / max) * 100 : 0
                  return (
                    <div key={item.month} className="flex items-center gap-3">
                      <span className="text-xs text-school-muted w-16 shrink-0 font-mono">{item.month}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded transition-all duration-500"
                          style={{ width: `${w}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-16 text-right">${parseInt(item.total).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-school-muted text-center py-6">{t('billing.noRevenueData')}</p>
            )}
          </div>

          <div className="panel-card">
            <h3 className="text-sm font-semibold text-school-text mb-4">{t('billing.latestPayments')}</h3>
            {revenue?.recent_payments?.length > 0 ? (
              <div className="divide-y divide-school-border/60">
                {revenue.recent_payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-school-text truncate">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-xs text-school-muted">{p.fee_type}</p>
                    </div>
                    <span className="text-sm font-semibold text-school-success">
                      +${parseInt(p.amount_paid).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-school-muted text-center py-6">{t('billing.noPayments')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="panel-card animate-fade-in">
          {outstanding.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-school-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-school-border">
                    <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('student')}</th>
                    <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden sm:table-cell">{t('class')}</th>
                    <th className="text-right px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('billing.totalFees')}</th>
                    <th className="text-right px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('paid')}</th>
                    <th className="text-right px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('billing.balance')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-school-border/60">
                  {outstanding.map((o) => (
                    <tr key={o.student_id} className="table-row-interactive">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {o.first_name?.[0]}{o.last_name?.[0]}
                          </div>
                          <span className="font-medium text-school-text">{o.first_name} {o.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {o.class_name} - {o.class_section}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-school-muted">${parseInt(o.total_fees).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-school-success font-medium">${parseInt(o.total_paid).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">${parseInt(o.balance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={t('billing.allClear')}
              description={t('billing.noOutstandingDesc')}
              icon={DollarSign}
            />
          )}
        </div>
      )}

      {activeTab === 'fee structure' && (
        <div className="panel-card animate-fade-in">
          {fees.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-school-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-school-border">
                    <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('feeType')}</th>
                    <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden sm:table-cell">{t('class')}</th>
                    <th className="text-right px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('amount')}</th>
                    <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden md:table-cell">{t('billing.dueDate')}</th>
                    <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden lg:table-cell">{t('description')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-school-border/60">
                  {fees.map((f) => (
                    <tr key={f.id} className="table-row-interactive">
                      <td className="px-4 py-3 font-medium text-school-text">{f.fee_type}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {f.class_name} - {f.class_section}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-school-text">${parseInt(f.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-school-muted hidden md:table-cell">{f.due_date || '---'}</td>
                      <td className="px-4 py-3 text-school-muted text-xs hidden lg:table-cell max-w-[200px] truncate">{f.description || '---'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={t('billing.noFeeStructure')}
              description={t('billing.noFeeStructureDesc')}
              icon={Receipt}
            />
          )}
        </div>
      )}

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleRecordPayment}
        students={students}
        fees={fees}
      />
    </div>
  )
}
