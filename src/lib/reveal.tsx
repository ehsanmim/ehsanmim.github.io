import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from './hooks'

/**
 * Wraps any block in the shared scroll-reveal, with an optional stagger.
 * Shared by both looks — the motion is the same even where nothing else is.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'header' | 'p' | 'section'
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
