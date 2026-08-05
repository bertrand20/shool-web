import { Loader2 } from 'lucide-react'
import { useI18n } from '../i18n/context'

export default function LoadingSpinner({ message }) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-school-muted">
      <Loader2 size={32} className="animate-spin mb-3 text-school-primary-light" />
      <p className="text-sm">{message || t('loadingData')}</p>
    </div>
  )
}
