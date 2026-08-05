import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import translations from './translations'

const I18nContext = createContext(null)

const STORAGE_KEY = 'preferred_language'

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && translations[stored]) return stored
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'rw' ? 'rw' : 'en'
  }, [lang])

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }, [lang])

  const changeLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLang(newLang)
    }
  }, [])

  return (
    <I18nContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}