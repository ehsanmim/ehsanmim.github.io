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
 * A skill pill with how well I can do it underneath: a hairline track and an
 * accent fill to `level` out of ten. The fill grows in when its group is
 * revealed. The number itself is in the tooltip and the meter's value, not in
 * the pill, so the row stays a row of names.
 */
export function SkillPill({
  name,
  label,
  level,
}: {
  name: string
  label?: string
  level?: number
}) {
  // No level, no bar: the pill is then the plain tag it always was.
  if (level === undefined) return <Tag name={name} label={label} />

  return (
    <span
      title={`${label ?? name} · ${level}/10`}
      className="meta inline-flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-2.5 pt-1.5 pb-2 text-dim"
    >
      <span className="inline-flex items-center gap-1.5">
        <SkillIcon name={name} />
        {label ?? name}
      </span>
      <span
        role="meter"
        aria-label={label ?? name}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={level}
        className="relative block h-[3px] w-full overflow-hidden rounded-full bg-line"
      >
        <span
          className="skill-fill absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${level * 10}%`,
            background:
              'linear-gradient(90deg, color-mix(in oklab, var(--color-p-ink) 45%, transparent), var(--color-p-ink))',
          }}
        />
      </span>
    </span>
  )
}
