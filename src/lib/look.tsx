import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LookContext, type Look, type LookCtx } from './look-context'

const STORAGE_KEY = 'look'
const DEFAULT: Look = 'editorial'

/** `?look=code` wins over the stored choice — it makes the two comparable by
 *  link, which is the whole point while both still exist. */
function initial(): Look {
  try {
    const q = new URLSearchParams(window.location.search).get('look')
    if (q === 'code' || q === 'editorial') return q
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'code' || saved === 'editorial') return saved
  } catch {
    /* storage blocked — fall through */
  }
  return DEFAULT
}

export function LookProvider({ children }: { children: ReactNode }) {
  const [look, setLookState] = useState<Look>(initial)

  const setLook = useCallback((l: Look) => {
    setLookState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  // Drives the body background, so the page behind the content matches the
  // skin in front of it.
  useEffect(() => {
    document.documentElement.dataset.look = look
  }, [look])

  const value = useMemo<LookCtx>(
    () => ({
      look,
      setLook,
      toggle: () => setLook(look === 'editorial' ? 'code' : 'editorial'),
    }),
    [look, setLook],
  )

  return <LookContext.Provider value={value}>{children}</LookContext.Provider>
}
