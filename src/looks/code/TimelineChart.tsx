import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { toYears, type YearMonth } from '../../content/resume'
import { seriesColor } from './tech-colors'

export type Span = {
  /** Ties a bar to its entry below, so hovering one highlights the other. */
  id: string
  label: string
  /** Shown on the axis when the full label is too wide. */
  short?: string
  start: YearMonth | null
  end: YearMonth | null
  /** Studies are context rather than the subject, and a language course is
   *  not a degree — each gets its own muted tone. */
  tone?: 'degree' | 'language'
  /** Second line of the popover: the role, the institution. */
  detail?: string
  /** The period as written for the reader, e.g. "Jan. 2023 — heute". */
  periodLabel?: string
}

type Row = {
  id: string
  label: string
  axis: string
  offset: number
  duration: number
  color: string
  /** Absolute fractional years, for testing the crosshair against. */
  fromValue: number
  toValue: number
  periodLabel: string
  study: boolean
  detail?: string
}

/* Desaturated on purpose: the study band sits behind the roles rather than
 * competing with the work palette, but a degree and a language course still
 * have to be told apart at a glance. */
const TONES = {
  degree: '#4d5b7c',
  language: '#7a6a4a',
} as const

/**
 * The career as one chart: a bar per role, scaled to its real duration.
 *
 * Built on Recharts rather than by hand so the reading aids come from a
 * library that has solved them — a row cursor that tracks the pointer, year
 * gridlines to measure against, and popovers that work under touch as well as
 * under a mouse.
 *
 * A Gantt is not one of Recharts' chart types, so each row is a stack of two
 * bars: a transparent one holding the offset from the axis start, and the
 * visible one holding the duration.
 */
export function TimelineChart({
  spans,
  presentLabel,
  activeId = null,
  onHover,
}: {
  spans: Span[]
  presentLabel: string
  activeId?: string | null
  onHover?: (id: string | null) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  // Below this the bars are too short to hold their own names.
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) =>
      setNarrow(entry.contentRect.width < 560),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Crosshair position and the year under it, both resolved in the pointer
  // handler — that is where the box is measured, and a ref must not be read
  // during render.
  const [cursor, setCursor] = useState<{
    x: number
    plot: number
    year: number
    /** Fractional year under the crosshair, for hit-testing the spans. */
    value: number
  } | null>(null)

  const now = new Date()
  const nowYears = now.getFullYear() + now.getMonth() / 12

  // An undated span cannot be placed; it is listed below rather than guessed at.
  const dated = spans.filter(
    (s): s is Span & { start: YearMonth } => s.start !== null,
  )
  if (dated.length === 0) return null

  const starts = dated.map((s) => toYears(s.start))
  const ends = dated.map((s) => (s.end ? toYears(s.end) : nowYears))
  const first = Math.floor(Math.min(...starts))
  // Not ceiled: rounding the end up to the next whole year added a tick for a
  // year nothing on the chart reaches.
  const last = Math.max(...ends)

  const rows: Row[] = dated.map((s, i) => {
    const from = toYears(s.start)
    const to = s.end ? toYears(s.end) : nowYears
    return {
      id: s.id,
      label: s.label,
      axis: s.short ?? s.label,
      offset: from - first,
      duration: Math.max(to - from, 0.15),
      color: s.tone ? TONES[s.tone] : seriesColor(i),
      study: s.tone !== undefined,
      fromValue: from,
      toValue: to,
      periodLabel:
        s.periodLabel ??
        `${s.start.slice(0, 4)} — ${s.end ? s.end.slice(0, 4) : presentLabel}`,
      detail: s.detail,
    }
  })

  // A tick per year is unreadable across a decade on a phone; step so that
  // roughly six labels fit whatever the span.
  const step = Math.max(1, Math.ceil((last - first) / 6))
  const ticks: number[] = []
  for (let y = first; y <= last; y += step) ticks.push(y - first)

  // Everything that was running at the crosshair's position.
  const hits = cursor
    ? rows.filter((r) => cursor.value >= r.fromValue && cursor.value <= r.toValue)
    : []

  // Taller rows on a phone, because the name sits above the bar rather than
  // inside it.
  const ROW = narrow ? 48 : 32
  // Headroom for the first row's label, which sits above its bar when narrow.
  const TOP = narrow ? 14 : 0
  const AXIS_H = 26
  const RIGHT = 6
  const POPOVER_W = 210
  const CHAR = 5.6
  const CAP_W = 13

  /** A mortarboard: the board, then the cap and tassel beneath it. */
  const Cap = ({ x, y, fill }: { x: number; y: number; fill: string }) => (
    <g transform={`translate(${x}, ${y})`} fill={fill}>
      <path d="M0 3 L5.5 0 L11 3 L5.5 6 Z" />
      <path d="M2.4 4.4 L2.4 6.6 Q5.5 8.4 8.6 6.6 L8.6 4.4 L5.5 6.1 Z" />
      <rect x="10.4" y="3" width="0.8" height="3.6" rx="0.4" />
    </g>
  )

  /**
   * The bar's name. Inside the bar where it fits, and above it when it does
   * not — which on a phone is every bar. Anonymous coloured blocks were the
   * previous behaviour and told the reader nothing without a hover.
   */
  const renderLabel = (props: {
    x?: string | number
    y?: string | number
    width?: string | number
    height?: string | number
    value?: unknown
    index?: number
  }) => {
    const px = Number(props.x)
    const py = Number(props.y)
    const w = Number(props.width)
    const h = Number(props.height)
    if (![px, py, w, h].every(Number.isFinite)) return null

    const row = props.index != null ? rows[props.index] : undefined
    const cap = row?.study ?? false
    const capW = cap ? CAP_W : 0
    const full = String(props.value ?? '')
    const text = full.length > 26 ? `${full.slice(0, 25)}…` : full
    const fits = w >= text.length * CHAR + 14 + capW

    if (fits) {
      return (
        <g>
          {cap && <Cap x={px + 6} y={py + h / 2 - 4} fill="#0b0e14" />}
          <text
            x={px + 7 + capW}
            y={py + h / 2}
            dominantBaseline="central"
            fill="#0b0e14"
            fontSize={10}
            fontFamily="JetBrains Mono"
            fontWeight={500}
          >
            {text}
          </text>
        </g>
      )
    }

    if (!narrow) return null

    // Above the bar, nudged left when the text would run past the right edge.
    const plot = Math.max((wrapRef.current?.clientWidth ?? 0) - RIGHT, 0)
    const width = text.length * CHAR + capW
    const x = plot > 0 ? Math.min(px, Math.max(plot - width, 0)) : px
    const colour = row?.color ?? '#9aa4b2'
    return (
      <g>
        {cap && <Cap x={x} y={py - 12} fill={colour} />}
        <text
          x={x + capW}
          y={py - 4}
          fill={colour}
          fontSize={9.5}
          fontFamily="JetBrains Mono"
        >
          {text}
        </text>
      </g>
    )
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const box = wrapRef.current?.getBoundingClientRect()
    if (!box) return
    const plot = Math.max(box.width - RIGHT, 1)
    const x = Math.min(Math.max(e.clientX - box.left, 0), plot)
    // Read off the same domain the axis is drawn on, so the label under the
    // crosshair agrees with the ticks.
    const value = first + (x / plot) * (last - first)
    setCursor({ x, plot, year: Math.round(value), value })
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setCursor(null)}
      // pan-y, not none: a finger dragging sideways moves the crosshair, but
      // dragging up the page still scrolls it.
      className="chart-in relative touch-pan-y"
    >
      {cursor && hits.length > 0 && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-md border border-c-line bg-c-bg/95 px-3 py-2 shadow-lg backdrop-blur-sm"
          style={{
            // Clamped to the plot, so the popover never hangs off the panel.
            left: Math.min(
              Math.max(cursor.x - POPOVER_W / 2, 0),
              Math.max(cursor.plot - POPOVER_W, 0),
            ),
            width: POPOVER_W,
          }}
        >
          <div className="font-mono text-[0.625rem] tracking-wide text-c-dim">
            {cursor.year}
          </div>
          <ul className="mt-1 space-y-1.5">
            {hits.map((row) => (
              <li key={row.id}>
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="truncate font-mono text-[0.75rem] text-c-text">
                    {row.label}
                  </span>
                </div>
                {row.detail && (
                  <div className="ml-3 truncate font-mono text-[0.625rem] text-c-dim">
                    {row.detail}
                  </div>
                )}
                {/* The span the indicator is inside — the reason it is showing. */}
                <div className="ml-3 font-mono text-[0.625rem] text-c-num">
                  {row.periodLabel}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cursor && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 w-px bg-c-ok/45"
            style={{ left: cursor.x, bottom: AXIS_H }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 -translate-x-1/2 rounded bg-c-ok px-1 font-mono text-[0.625rem] leading-4 text-c-bg"
            style={{ left: cursor.x }}
          >
            {cursor.year}
          </div>
        </>
      )}
      <ResponsiveContainer width="100%" height={rows.length * ROW + 28 + TOP}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: TOP, right: RIGHT, bottom: 0, left: 0 }}
        // An explicit size, with the row height providing the breathing room.
        // Deriving thickness from barCategoryGap collapsed the bars to strips
        // as soon as the gap grew.
        barCategoryGap="18%"
        barSize={narrow ? 18 : 20}
        onMouseLeave={() => onHover?.(null)}
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--color-c-line)"
          strokeDasharray="2 4"
        />
        <XAxis
          type="number"
          domain={[0, last - first]}
          ticks={ticks}
          tickFormatter={(v: number) => String(first + v)}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7689', fontSize: 10, fontFamily: 'JetBrains Mono' }}
        />
        {/* Hidden: a left-hand label column costs a third of a phone's width
            and repeats what the bar itself can say. Names ride in the bars,
            and the popover carries the full text. */}
        <YAxis type="category" dataKey="axis" hide />
        {/* The spacer. Transparent, and never the tooltip's subject. */}
        <Bar dataKey="offset" stackId="span" fill="transparent" isAnimationActive={false} />
        <Bar
          dataKey="duration"
          stackId="span"
          radius={3}
          isAnimationActive={false}
          onMouseEnter={(_, index: number) => onHover?.(rows[index]?.id ?? null)}
        >
          <LabelList dataKey="axis" content={renderLabel} />
          {rows.map((row) => (
            <Cell
              key={row.id}
              fill={row.color}
              fillOpacity={activeId && activeId !== row.id ? 0.2 : 1}
              stroke={activeId === row.id ? '#c9d1d9' : 'none'}
              strokeWidth={activeId === row.id ? 1.5 : 0}
            />
          ))}
        </Bar>
      </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
