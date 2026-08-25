import type { ReactNode } from 'react'

/**
 * Comment text — the one syntax token that survived.
 *
 * The look originally rendered whole sections as numbered source lines, with a
 * full set of tokens (keyword, string, number…) to colour them. That reads as
 * noise at prose length and was replaced by drawn content: a timeline, rating
 * dots, diff lines. What is left is the comment style and the section rule.
 */
export const C = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => <span className={`text-c-dim italic ${className}`}>{children}</span>

/** Section wrapper for the code look: a `// ── name ──` rule, then the panel. */
export function CodeSection({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mx-auto max-w-4xl scroll-mt-28 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-5 flex items-center gap-3 font-mono text-xs">
        <span className="text-c-ok">//</span>
        <span className="text-c-dim">{label}</span>
        <span className="h-px flex-1 bg-c-line" />
      </div>
      {children}
    </section>
  )
}
