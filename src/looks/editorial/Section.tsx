import type { ReactNode } from 'react'
import { Reveal } from '../../lib/reveal'

export { Reveal }

/**
 * One page section: the eyebrow/heading pair, a hairline rule, and the content.
 * Every section shares this rhythm — the repetition is what makes it read as
 * one document rather than a stack of components.
 */
export function Section({
  id,
  eyebrow,
  heading,
  children,
}: {
  id: string
  eyebrow: string
  heading: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-24 px-6 py-20 sm:py-28">
      <Reveal as="header" className="mb-12 sm:mb-16">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display mt-4 text-[length:var(--text-section)] text-balance">
          {heading}
        </h2>
        <div className="mt-8 h-px w-full bg-rule" />
      </Reveal>
      {children}
    </section>
  )
}
