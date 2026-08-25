import { createContext, useContext } from 'react'

/** The two complete skins over the same content. */
export type Look = 'editorial' | 'code'

export type LookCtx = {
  look: Look
  setLook: (l: Look) => void
  toggle: () => void
}

/** Separate from the provider module so Fast Refresh keeps working. */
export const LookContext = createContext<LookCtx | null>(null)

export function useLook(): LookCtx {
  const ctx = useContext(LookContext)
  if (!ctx) throw new Error('useLook must be used inside <LookProvider>')
  return ctx
}
