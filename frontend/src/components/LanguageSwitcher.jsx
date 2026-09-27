import { useState, useRef, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { useI18n } from '../i18n/context'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Ikinyarwanda' },
]

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const current = languages.find((l) => l.code === lang) || languages[0]

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-school-border bg-white text-sm font-medium text-school-muted hover:text-school-primary hover:border-school-primary/40 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
        title="Language / Ururimi"
      >
        <Globe size={15} />
        <span>{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-school-border rounded-xl shadow-lg py-1 z-50">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                changeLanguage(l.code)
                setOpen(false)
              }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-school-surface transition-colors ${
                lang === l.code ? 'text-school-primary font-semibold' : 'text-school-text'
              }`}
            >
              {l.label}
              {lang === l.code && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}