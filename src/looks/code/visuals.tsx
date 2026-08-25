import { toYears, type YearMonth } from '../../content/resume'
import { seriesColor, techColor } from './tech-colors'

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

/** A tech tag: dot + name, compact enough to sit several to a row. */
export function Tag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-c-line bg-c-bg/60 px-2 py-0.5 font-mono text-[0.6875rem] text-c-dim">
      <Dot name={name} />
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
      <Dot name={name} />
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

export type Span = {
  /** Ties a bar to its entry below, so hovering one can highlight the other. */
  id: string
  label: string
  /** Overrides the automatic initialism on a narrow bar. */
  short?: string
  start: YearMonth | null
  end: YearMonth | null
}

/**
 * A label that survives a narrow bar. Drops any trailing qualifier, then
 * initialises a multi-word name — "National Iranian Gas Company" reads as
 * NIGC at 9% width, where the full name would just be clipped to "Nation".
 */
function shortLabel(label: string): string {
  const head = label.split(/\s+[—–]\s+|,|\(/)[0].trim()
  if (head.length <= 20) return head
  const words = head.split(/\s+/).filter((w) => /^[A-ZÄÖÜ0-9]/.test(w))
  if (words.length >= 2) return words.map((w) => w[0]).join('').slice(0, 5)
  return head.slice(0, 10) + '…'
}

/** The abbreviated form of a span's label. */
const text = (s: { label: string; short?: string }) => s.short ?? shortLabel(s.label)

/** One band of the chart: work above the rule, studies below it. */
export type TimelineGroup = {
  key: string
  spans: Span[]
  /** Studies are context, not the subject — drawn in one flat tone. */
  muted?: boolean
}

/**
 * The career as one chart: each span scaled by its real duration.
 *
 * Spans overlap — development ran alongside tutoring, and studying alongside
 * both — so each band packs its spans into lanes rather than drawing them on
 * one row, where they would sit on top of each other and misreport the history.
 * Every band shares one time axis, so a bar below the rule lines up with the
 * bar above it.
 */
export function Timeline({
  groups,
  presentLabel,
  activeId = null,
  onHover,
}: {
  groups: TimelineGroup[]
  presentLabel: string
  /** When set, that bar is held and the rest recede. */
  activeId?: string | null
  /** Hovering a bar highlights its entry below — the same link, reversed. */
  onHover?: (id: string | null) => void
}) {
  const now = new Date()
  const nowYears = now.getFullYear() + now.getMonth() / 12

  // An undated span cannot be placed; it is listed below instead of guessed at.
  const resolve = (spans: Span[]) =>
    spans
      .filter((s): s is Span & { start: YearMonth } => s.start !== null)
      .map((s) => ({
        id: s.id,
        label: s.label,
        short: s.short,
        from: toYears(s.start),
        to: s.end ? toYears(s.end) : nowYears,
        // Kept as written: a fractional year rounded to the nearest integer
        // reports Juli 2019 as 2020. The label must not round at all.
        fromYear: s.start.slice(0, 4),
        toYear: s.end ? s.end.slice(0, 4) : null,
      }))
      .sort((a, b) => a.from - b.from)

  const bands = groups
    .map((g) => ({ ...g, items: resolve(g.spans) }))
    .filter((g) => g.items.length > 0)

  if (bands.length === 0) return null

  // One axis across every band, or the two halves would not line up.
  const all = bands.flatMap((b) => b.items)
  const first = Math.min(...all.map((s) => s.from))
  const last = Math.max(...all.map((s) => s.to))
  const total = Math.max(last - first, 1)

  const ROW = 26

  return (
    <div>
      {bands.map((band, bi) => {
        // Greedy lane packing: reuse the first lane that has already ended.
        const laneEnds: number[] = []
        const placed = band.items.map((s) => {
          let lane = laneEnds.findIndex((end) => end <= s.from)
          if (lane === -1) lane = laneEnds.length
          laneEnds[lane] = s.to
          return { ...s, lane }
        })

        return (
          <div
            key={band.key}
            className={bi > 0 ? 'mt-3 border-t border-c-line pt-3' : undefined}
          >
            <div className="relative" style={{ height: laneEnds.length * ROW }}>
              {placed.map((s, i) => {
                const left = ((s.from - first) / total) * 100
                const width = Math.max(((s.to - s.from) / total) * 100, 3)
                const dimmed = activeId !== null && activeId !== s.id
                return (
                  <span
                    key={s.id}
                    title={`${s.label} · ${s.fromYear}—${s.toYear ?? presentLabel}`}
                    onMouseEnter={() => onHover?.(s.id)}
                    onMouseLeave={() => onHover?.(null)}
                    // A narrow bar cannot afford px-2: on a phone the padding
                    // is wider than the text it is meant to inset.
                    className={`absolute flex cursor-default items-center overflow-hidden rounded-sm transition-all duration-200 ${
                      width > 10 ? 'px-2' : 'px-1'
                    } ${
                      dimmed ? 'opacity-20' : 'opacity-100'
                    } ${activeId === s.id ? 'ring-2 ring-c-text/70' : ''}`}
                    style={{
                      top: s.lane * ROW,
                      height: ROW - 6,
                      // Inset rather than a gap, so a span still begins at its
                      // true date — the 2px is taken from the paint, not the
                      // duration.
                      left: `calc(${left}% + 1px)`,
                      width: `calc(${width}% - 2px)`,
                      backgroundColor: band.muted ? '#3b4252' : seriesColor(i),
                    }}
                  >
                    {/* Labelled in place: a phone has no hover to reveal a
                        title attribute. Narrow bars fall back to an initialism
                        rather than to nothing. */}
                    {(width > 7 || (text(s).length <= 3 && width > 3.5)) && (
                      <span
                        className={`truncate font-mono text-[0.625rem] font-medium ${
                          band.muted ? 'text-c-dim' : 'text-c-bg'
                        }`}
                      >
                        {width > 24 && s.label.length <= 28 ? s.label : text(s)}
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="mt-2 flex justify-between font-mono text-[0.6875rem] text-c-dim">
        <span>{Math.floor(first)}</span>
        {/* "heute" only when the axis really ends now — an in-progress degree
            can run past today, and labelling that edge "heute" would lie. */}
        <span>{last > nowYears + 0.05 ? Math.floor(last) : presentLabel}</span>
      </div>
    </div>
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
