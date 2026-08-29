import { SkillIcon } from './skill-icons'
import { techColor } from './tech-colors'

/**
 * The drawn vocabulary of the editorial look. Everything here is derived from
 * the content file; nothing invents a number that is not in it.
 */

/** The dot that turns a bare tech name into something scannable. */
export function Dot({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: techColor(name) }}
    />
  )
}

/**
 * A tech tag: mark + name, compact enough to sit several to a row.
 *
 * `name` is the canonical key the mark is drawn from and is never translated;
 * `label` is what the reader sees, which differs only where the skill's name
 * is a phrase rather than a product.
 */
export function Tag({ name, label }: { name: string; label?: string }) {
  return (
    <span className="meta inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-dim">
      <SkillIcon name={name} />
      {label ?? name}
    </span>
  )
}

/**
 * Bullet points, set as an indented list under a hairline rather than with
 * disc markers — the rule does the work the bullets were doing and keeps the
 * text aligned with everything else in the column.
 */
export function Points({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-2 border-l border-line pl-4">
      {lines.map((line) => (
        <li key={line.slice(0, 32)} className="text-[0.875rem] leading-relaxed text-dim">
          {line}
        </li>
      ))}
    </ul>
  )
}
