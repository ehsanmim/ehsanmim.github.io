import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../content/resume'
import { LangContext, type LangCtx } from './lang-context'

const STORAGE_KEY = 'lang'
const DEFAULT: Lang = 'de'

/** A stored choice wins; otherwise German, regardless of the browser locale —
 *  this is a German-first CV, not a locale-detecting app. */
function initial(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'de' || saved === 'en') return saved
  } catch {
    /* private mode / storage blocked — fall through to the default */
  }
  return DEFAULT
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* not being able to remember the choice is no reason not to make it */
    }
  }, [])

  // Screen readers and hyphenation both key off this.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === 'de' ? 'en' : 'de'),
      t: (pair) => pair[lang],
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
