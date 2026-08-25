import { SkillIcon } from './skill-icons'
import { techColor } from './tech-colors'

/**
 * The visual vocabulary of the code look — the parts that are drawn rather
 * than written. All of it is derived from the CV; nothing here invents a
 * number that is not in the content file.
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
    <span className="inline-flex items-center gap-1.5 rounded border border-c-line bg-c-bg/60 px-2 py-0.5 font-mono text-[0.6875rem] text-c-dim">
      <SkillIcon name={name} />
      {name}
    </span>
  )
}

/**
 * The CV's filled-circle rating, redrawn. Five dots, `level` of them filled —
 * the same scale the Lebenslauf uses, so the two documents cannot disagree.
 */
export function LevelDots({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <span
      className="inline-flex shrink-0 gap-1"
      role="img"
      aria-label={`${level} / ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            i < level ? 'bg-c-ok' : 'border border-c-dim/40'
          }`}
        />
      ))}
    </span>
  )
}

/** One skill row: name on the left, its rating on the right when it has one. */
export function SkillRow({ name, level }: { name: string; level?: number }) {
  return (
    <li className="flex items-center gap-3 py-1">
      <SkillIcon name={name} />
      <span className="min-w-0 flex-1 truncate font-mono text-[0.75rem] text-c-text">
        {name}
      </span>
      {level === undefined ? (
        <span className="font-mono text-[0.625rem] text-c-dim/50">—</span>
      ) : (
        <LevelDots level={level} />
      )}
    </li>
  )
}

/** Bullet points as added lines in a diff — green, prefixed, compact. */
export function DiffLines({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-1">
      {lines.map((line) => (
        <li
          key={line.slice(0, 32)}
          className="flex gap-2 border-l-2 border-c-ok/40 bg-c-ok/[0.04] py-0.5 pr-2 pl-2 font-mono text-[0.75rem] leading-relaxed text-c-text"
        >
          <span aria-hidden="true" className="shrink-0 text-c-ok">
            +
          </span>
          <span className="min-w-0">{line}</span>
        </li>
      ))}
    </ul>
  )
}
