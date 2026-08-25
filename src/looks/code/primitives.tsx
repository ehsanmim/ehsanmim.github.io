import type { ReactNode } from 'react'

/* Syntax tokens. Deliberately tiny names — they appear inline inside the
 * "source" and long ones would drown the text they are colouring. */
export const K = ({ children }: { children: ReactNode }) => (
  <span className="text-c-key">{children}</span>
)
export const S = ({ children }: { children: ReactNode }) => (
  <span className="text-c-str">{children}</span>
)
/** Comments wrap, so a long prose line is not one endless horizontal scroll. */
export const C = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => <span className={`text-c-dim italic ${className}`}>{children}</span>
export const N = ({ children }: { children: ReactNode }) => (
  <span className="text-c-num">{children}</span>
)
export const F = ({ children }: { children: ReactNode }) => (
  <span className="text-c-fn">{children}</span>
)
export const P = ({ children }: { children: ReactNode }) => (
  <span className="text-c-dim">{children}</span>
)

/** A quoted string, so the quotes are coloured with the value rather than
 *  written by hand at every call site. */
export const Str = ({ children }: { children: ReactNode }) => (
  <S>&quot;{children}&quot;</S>
)

/**
 * A file panel: window chrome, a filename, then numbered lines.
 *
 * Lines are passed as an array rather than as children so the gutter can number
 * them without inspecting the tree — and so a line is always exactly one row,
 * which is what keeps the numbers honest.
 */
export function CodeBlock({
  file,
  lines,
  startAt = 1,
}: {
  file: string
  lines: ReactNode[]
  startAt?: number
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-c-line bg-c-panel">
      <div className="flex items-center gap-3 border-b border-c-line px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="font-mono text-xs text-c-dim">{file}</span>
      </div>

      {/* Word wrap rather than a horizontally scrolling pre: a prose comment
       * that has to be dragged sideways to be read is worse than a code line
       * that wraps, and on a phone the scroll would be the only way to see it.
       * overflow-x-auto stays as the safety net for anything unbreakable. */}
      <div className="overflow-x-auto">
        <pre className="py-4 font-mono text-[0.8125rem] leading-[1.75]">
          {lines.map((line, i) => (
            <div
              key={i}
              className="group flex px-4 transition-colors hover:bg-c-line/40"
            >
              <span
                aria-hidden="true"
                className="w-10 shrink-0 pr-4 text-right text-c-dim/50 select-none"
              >
                {startAt + i}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-c-text">
                {line}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

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
    <section id={id} className="mx-auto max-w-4xl scroll-mt-28 px-4 py-12 sm:px-6">
      <div className="mb-5 flex items-center gap-3 font-mono text-xs">
        <span className="text-c-ok">//</span>
        <span className="text-c-dim">{label}</span>
        <span className="h-px flex-1 bg-c-line" />
      </div>
      {children}
    </section>
  )
}
