import { useI18n } from '../i18n/context'

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useI18n()

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
          lang === 'en'
            ? 'bg-white text-school-primary-dark shadow-sm'
            : 'text-blue-200 hover:text-white'
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('rw')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
          lang === 'rw'
            ? 'bg-white text-school-primary-dark shadow-sm'
            : 'text-blue-200 hover:text-white'
        }`}
      >
        Kinyarwanda
      </button>
    </div>
  )
}