import { useState } from 'react'
import { Search, DollarSign, CheckCircle, CreditCard, AlertCircle, Receipt, ChevronRight, ArrowLeft } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

export default function ParentPayFees() {
  const [step, setStep] = useState('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [feeData, setFeeData] = useState(null)
  const [loadingFees, setLoadingFees] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Online')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [paymentError, setPaymentError] = useState(null)

  const { t } = useI18n()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    setSearching(true)
    setSearchError(null)
    setResults([])
    try {
      const res = await fetch(`${API}/portal/search-student?query=${encodeURIComponent(query.trim())}`)
      if (!res.ok) throw new Error(t('searchFailed'))
      const data = await res.json()
      setResults(data)
      if (data.length === 0) setSearchError(t('noStudentsFound'))
    } catch {
      setSearchError(t('parentPayFees.searchFailedRetry'))
    } finally {
      setSearching(false)
    }
  }

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setStep('fees')
    setLoadingFees(true)
    try {
      const res = await fetch(`${API}/portal/fees/${student.id}`)
      if (!res.ok) throw new Error(t('parentPayFees.failedLoadFees'))
      const data = await res.json()
      setFeeData(data)
    } catch {
      setSearchError(t('parentPayFees.failedLoadFeeInfo'))
      setStep('search')
    } finally {
      setLoadingFees(false)
    }
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setSubmitting(true)
    setPaymentError(null)
    try {
      const res = await fetch(`${API}/portal/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          fee_id: selectedFee.id,
          amount_paid: parseFloat(amount),
          payment_method: method,
          notes: notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPaymentResult(data)
      setStep('success')
    } catch (err) {
      setPaymentError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetAll = () => {
    setStep('search')
    setQuery('')
    setResults([])
    setSelectedStudent(null)
    setFeeData(null)
    setSelectedFee(null)
    setAmount('')
    setMethod('Online')
    setNotes('')
    setPaymentResult(null)
    setPaymentError(null)
    setSearchError(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <DollarSign size={28} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('parentPayFees.title')}</h1>
        <p className="text-gray-500">{t('parentPayFees.subtitle')}</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['search', 'fees', 'pay', 'success'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-emerald-600 text-white scale-110' :
              ['search','fees','pay','success'].indexOf(step) > i ? 'bg-emerald-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {['search','fees','pay','success'].indexOf(step) > i ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < 3 && <div className={`w-8 h-0.5 ${['search','fees','pay','success'].indexOf(step) > i ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Search */}
      {step === 'search' && (
        <div className="animate-fade-in">
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchStudentPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <button type="submit" disabled={searching || query.trim().length < 2}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {searching ? t('searching') : t('search')}
            </button>
          </form>

          {searchError && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} /> {searchError}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 mb-2">{results.length} {t('studentsFound')}</p>
              {results.map((s) => (
                <button key={s.id} onClick={() => handleSelectStudent(s)}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    {s.first_name?.[0]}{s.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-gray-500">{s.class_name} {s.section} &middot; {t('id')}: {s.id}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Fees */}
      {step === 'fees' && (
        <div className="animate-fade-in">
          <button onClick={resetAll} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> {t('backToSearch')}
          </button>

          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                {selectedStudent?.first_name?.[0]}{selectedStudent?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                <p className="text-xs text-gray-500">{selectedStudent?.class_name} {selectedStudent?.section}</p>
              </div>
            </div>
          </div>

          {loadingFees ? (
            <div className="text-center py-8 text-gray-500 text-sm">{t('parentPayFees.loadingFeeInfo')}</div>
          ) : feeData?.fees?.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500">{t('outstandingFees')}</p>
              {feeData.fees.map((fee) => {
                const balance = parseFloat(fee.amount) - parseFloat(fee.total_paid)
                const isPaid = balance <= 0
                return (
                  <button key={fee.id} disabled={isPaid} onClick={() => { setSelectedFee(fee); setAmount(balance.toFixed(2)); setStep('pay') }}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isPaid ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' :
                      'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{fee.fee_type}</p>
                        <p className="text-xs text-gray-500">{fee.academic_year} &middot; {t('parentPayFees.due')}: {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : t('na')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isPaid ? 'text-gray-400' : 'text-red-600'}`}>
                          {isPaid ? t('parentPayFees.paid') : `$${balance.toFixed(2)}`}
                        </p>
                        {!isPaid && <p className="text-[10px] text-gray-400">{t('parentPayFees.of')} ${parseFloat(fee.amount).toFixed(2)}</p>}
                      </div>
                    </div>
                    {!isPaid && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseFloat(fee.total_paid) / parseFloat(fee.amount)) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{t('parentPayFees.paid')}: ${parseFloat(fee.total_paid).toFixed(2)} {t('parentPayFees.of')} ${parseFloat(fee.amount).toFixed(2)}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">{t('parentPayFees.noFeesFound')}</div>
          )}

          {feeData?.payments?.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-medium text-gray-500 mb-3">{t('parentPayFees.paymentHistory')}</p>
              <div className="space-y-2">
                {feeData.payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Receipt size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{p.fee_type}</p>
                      <p className="text-[10px] text-gray-400">{p.payment_date} &middot; {p.receipt_number}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">-${parseFloat(p.amount_paid).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Payment Form */}
      {step === 'pay' && selectedFee && (
        <div className="animate-fade-in">
          <button onClick={() => setStep('fees')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> {t('parentPayFees.backToFees')}
          </button>

          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <p className="text-xs font-medium text-gray-500 mb-1">{t('parentPayFees.payingFor')}</p>
            <p className="font-semibold text-gray-900">{selectedFee.fee_type} &mdash; {selectedStudent?.first_name} {selectedStudent?.last_name}</p>
            <p className="text-xs text-gray-500 mt-1">{t('parentPayFees.outstanding')}: ${(parseFloat(selectedFee.amount) - parseFloat(selectedFee.total_paid)).toFixed(2)}</p>
          </div>

          {paymentError && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} /> {paymentError}
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('parentPayFees.amountWithCurrency')}</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" step="0.01" min="0.01" max={parseFloat(selectedFee.amount) - parseFloat(selectedFee.total_paid)}
                  value={amount} onChange={(e) => setAmount(e.target.value)} required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('paymentMethod')}</label>
              <div className="grid grid-cols-2 gap-2">
                {['Online', 'Cash', 'Bank Transfer', 'Card'].map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      method === m ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('parentPayFees.notesOptional')}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('parentPayFees.anyNotes')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none" />
            </div>

            <button type="submit" disabled={submitting || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CreditCard size={16} />
              )}
              {submitting ? t('parentPayFees.processing') : `${t('parentPayFees.pay')} $${parseFloat(amount || 0).toFixed(2)}`}
            </button>
          </form>
        </div>
      )}

      {/* STEP 4: Success */}
      {step === 'success' && paymentResult && (
        <div className="animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('parentPayFees.paymentSubmitted')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('parentPayFees.paymentRecorded')}</p>

          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left max-w-sm mx-auto mb-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('parentPayFees.receiptNumber')}</span>
                <span className="font-mono font-medium text-gray-900">{paymentResult.receipt_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('student')}</span>
                <span className="font-medium text-gray-900">{selectedStudent?.first_name} {selectedStudent?.last_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('feeType')}</span>
                <span className="font-medium text-gray-900">{selectedFee?.fee_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('amount')}</span>
                <span className="font-bold text-emerald-600">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('parentPayFees.method')}</span>
                <span className="font-medium text-gray-900">{method}</span>
              </div>
            </div>
          </div>

          <button onClick={resetAll} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors">
            {t('parentPayFees.payAnotherStudent')}
          </button>
        </div>
      )}
    </div>
  )
}
