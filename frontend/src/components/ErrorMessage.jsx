import { AlertTriangle } from 'lucide-react'
import { useI18n } from '../i18n/context'

export default function ErrorMessage({ message, onRetry }) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-school-text mb-1">{t('error')}</p>
      <p className="text-sm text-school-muted mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary btn-sm">
          {t('tryAgain')}
        </button>
      )}
    </div>
  )
}
