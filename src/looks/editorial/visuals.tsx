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

/** A tech tag: mark + name, compact enough to sit several to a row. */
export function Tag({ name }: { name: string }) {
  return (
    <span className="meta inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-dim">
      <SkillIcon name={name} />
      {name}
    </span>
  )
}

/**
 * The CV's five filled circles, redrawn as a rule that fills — a measure, the
 * way a magazine prints one. `level` of five segments are inked.
 */
export function Meter({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <span
      className="inline-flex shrink-0 gap-[3px]"
      role="img"
      aria-label={`${level} / ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-[3px] w-4 rounded-full ${i < level ? 'bg-p-ink' : 'bg-line'}`}
        />
      ))}
    </span>
  )
}

/** One skill: mark, name, and its measure where the CV gives one. */
export function SkillRow({ name, level }: { name: string; level?: number }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <SkillIcon name={name} />
      <span className="min-w-0 flex-1 truncate text-[0.875rem] text-text">{name}</span>
      {level === undefined ? (
        <span className="meta text-dim/60">—</span>
      ) : (
        <Meter level={level} />
      )}
    </li>
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
