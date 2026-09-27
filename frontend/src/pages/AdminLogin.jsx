import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { School, LogIn, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, Shield } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api'

function ForgotPasswordModal({ onClose }) {
  const { t } = useI18n()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await fetch(`${API}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      setSent(true)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('adminLogin.checkEmail')}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('adminLogin.resetLinkIntro')} <strong>{username}</strong>, {t('adminLogin.resetLinkOutro')}
            </p>
            <button onClick={onClose} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors">
              {t('adminLogin.backToLoginTitle')}
            </button>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
              <ArrowLeft size={14} /> {t('backToLogin')}
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('resetPassword')}</h3>
            <p className="text-sm text-gray-500 mb-5">{t('enterUsername')}</p>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('username')}</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="admin" />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {loading ? <><Loader2 size={16} className="animate-spin" /> {t('adminLogin.sending')}</> : t('sendResetLink')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function ResetPasswordPage({ onDone }) {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError(t('adminLogin.passwordMismatch')); return }
    if (password.length < 6) { setError(t('adminLogin.passwordTooShort')); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        {success ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('passwordReset')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('passwordUpdated')}</p>
            <button onClick={onDone} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors">
              {t('goToLogin')}
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Shield size={24} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('newPassword')}</h2>
            </div>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('newPassword')}</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('minChars')} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('confirmPassword')}</label>
                <input type={showPass ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('repeatPassword')} />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {loading ? <><Loader2 size={16} className="animate-spin" /> {t('resetting')}</> : t('resetPasswordBtn')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminLogin() {
  const { t } = useI18n()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  if (searchParams.get('token')) {
    return <ResetPasswordPage onDone={() => navigate('/admin/login')} />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('adminLogin.loginFailed'))
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.admin))
      if (remember) localStorage.setItem('admin_remember', 'true')
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-school-surface">
      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-school-surface">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-school-primary flex items-center justify-center mx-auto mb-3 border-b-4 border-school-accent">
              <School size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('adminLogin.schoolManagementSystem')}</p>
          </div>

          <div className="bg-white p-7 sm:p-9 border border-school-border shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('welcomeBack')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('signInToDashboard')}</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">{t('username')}</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-school-border focus:outline-none focus:ring-2 focus:ring-school-accent/30 focus:border-school-primary transition-all bg-school-surface focus:bg-white"
                  placeholder={t('adminLogin.enterUsernamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">{t('password')}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 text-sm border border-school-border focus:outline-none focus:ring-2 focus:ring-school-accent/30 focus:border-school-primary transition-all bg-school-surface focus:bg-white"
                    placeholder={t('adminLogin.enterPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-600">{t('rememberMe')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm text-school-burgundy hover:text-school-primary font-medium transition-colors"
                >
                  {t('forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-school-primary text-white py-3 font-semibold text-sm hover:bg-school-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {t('signingIn')}</>
                ) : (
                  <><LogIn size={18} /> {t('signIn')}</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <a href="/" className="text-sm text-school-muted hover:text-school-burgundy transition-colors">
                &larr; {t('backToPublicSite')}
              </a>
            </div>
          </div>

        </div>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  )
}
