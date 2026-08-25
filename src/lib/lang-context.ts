import { createContext, useContext } from 'react'
import type { Lang } from '../content/resume'

export type LangCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  /** Pick the current language out of a { de, en } pair. */
  t: <V>(pair: Record<Lang, V>) => V
}

/** Kept out of i18n.tsx: a module that exports both a component and a hook
 *  loses React Fast Refresh, and this one is imported by every section. */
export const LangContext = createContext<LangCtx | null>(null)

export function useLang(): LangCtx {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
