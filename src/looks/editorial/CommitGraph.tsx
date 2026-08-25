import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Reveal } from '../../lib/reveal'
import { Dot, Tag } from './visuals'

/**
 * `git log --graph`, drawn in HTML.
 *
 * Three lanes, and they mean what their names mean. `main` carries the finished
 * roles. `wip` carries whatever is still running — it is branched off main and
 * deliberately never merged, because that work is not done. `edu` carries the
 * studying, merging into main at its newest entry and forking off it at the
 * oldest, so the years spent studying alongside a job read as exactly that
 * rather than as a second list further down the page.
 *
 * The gutter is absolutely positioned hairlines plus one small SVG curve per
 * junction. No chart library, and nothing distorts when a row grows because the
 * reader unfolded it.
 */

/** 0 = main, 1 = wip, 2 = edu. */
export type Lane = 0 | 1 | 2

export type Commit = {
  id: string
  lane: Lane
  when: string
  title: string
  /** Company, or institution. */
  where?: string
  meta?: string
  ref?: string
  stack?: string[]
  body?: ReactNode
  /** The role still running: its node is the one with the pulse. */
  head?: boolean
}

const LANE_X = [12, 28, 44]
const LANE_VAR = ['--color-p', '--color-wip', '--color-edu']
/** Where a node sits inside its row — level with the first line of the title. */
const NODE_Y = 21
/** How far a fork takes to travel between lanes. */
const CURVE = 24
/* Wider than the lanes need: the slack is the gap between the graph and the
 * commit, which the lanes would otherwise sit right up against. */
const GUTTER = 76
/** The space each row leaves under itself — `pb-6`. */
const ROW_GAP = 24

const laneColor = (lane: number) => `var(${LANE_VAR[lane]})`

/** A point in the graph: a row, and a height within that row. */
type Anchor = { row: number; y: number }
type Span = { from: Anchor; to: Anchor }

const earlier = (a: Anchor, b: Anchor) => (a.row - b.row || a.y - b.y) <= 0 ? a : b
const later = (a: Anchor, b: Anchor) => (a.row - b.row || a.y - b.y) >= 0 ? a : b

/** The piece of a lane that falls inside one row, if any. */
function segment(span: Span | null, i: number) {
  if (!span || i < span.from.row || i > span.to.row) return null
  return {
    from: i === span.from.row ? span.from.y : 0,
    to: i === span.to.row ? span.to.y : null,
  }
}

/** A vertical hairline. `to === null` means "carry on to the row's bottom". */
function Line({ lane, from, to }: { lane: number; from: number; to: number | null }) {
  return (
    <span
      aria-hidden="true"
      className="absolute w-px"
      style={{
        left: LANE_X[lane] - 0.5,
        top: from,
        ...(to === null ? { bottom: 0 } : { height: Math.max(0, to - from) }),
        background: laneColor(lane),
        opacity: 0.45,
      }}
    />
  )
}

/** The diagonal that joins two lanes, drawn in the colour of the branch. */
function Curve({
  a,
  b,
  top,
  height,
  tint,
}: {
  a: number
  b: number
  top: number
  height: number
  tint: number
}) {
  const [x1, x2] = [LANE_X[a], LANE_X[b]]
  return (
    <svg
      aria-hidden="true"
      className="absolute"
      width={GUTTER}
      height={height}
      style={{ left: 0, top }}
    >
      <path
        d={`M ${x1} 0 C ${x1} ${height * 0.55}, ${x2} ${height * 0.45}, ${x2} ${height}`}
        fill="none"
        stroke={laneColor(tint)}
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  )
}

export function CommitGraph({ commits }: { commits: Commit[] }) {
  // Held here rather than in the row: the node is drawn in the gutter and the
  // row in the column beside it, and both have to answer to the same pointer.
  // Two sources, and the pointer always wins.
  const [hovered, setHovered] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState<string | null>(null)
  const active = hovered ?? scrolled
  const list = useRef<HTMLOListElement>(null)

  // A touch device has no hover to give, so the commit crossing the middle of
  // the screen is the one that lifts — scrolling the list is the touch
  // equivalent of running down it with a cursor.
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const read = () => setCoarse(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])

  useEffect(() => {
    if (!coarse) return
    const rows = list.current?.querySelectorAll<HTMLElement>('[data-commit]')
    if (!rows?.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setScrolled(hit.target.getAttribute('data-commit'))
      },
      // Between two rows nothing crosses the band; the last one stays lifted
      // rather than the whole list flickering back in the gap.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    rows.forEach((row) => io.observe(row))
    return () => io.disconnect()
  }, [coarse, commits])

  // The highlight is one panel for the whole list, not one per row: it slides
  // and stretches from the commit you left to the commit you arrived at, which
  // is the whole effect. Measured off the rows rather than assumed, because a
  // row's height depends on whether it is unfolded.
  const [box, setBox] = useState<{ top: number; height: number } | null>(null)
  useEffect(() => {
    const ol = list.current
    if (!active || !ol) return
    const row = ol.querySelector<HTMLElement>(`[data-commit="${CSS.escape(active)}"]`)
    if (!row) return

    const measure = () => {
      const o = ol.getBoundingClientRect()
      const r = row.getBoundingClientRect()
      // Less the gap the row carries below it, so the panel hugs the commit
      // rather than the space after it. Kept in step with `pb-6` on the row.
      setBox({ top: r.top - o.top, height: r.height - ROW_GAP })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  const activeLane = laneColor(commits.find((c) => c.id === active)?.lane ?? 0)

  const rowsOf = (lane: Lane) =>
    commits.reduce<number[]>((rows, c, i) => (c.lane === lane ? [...rows, i] : rows), [])
  const main = rowsOf(0)
  const wip = rowsOf(1)
  const edu = rowsOf(2)

  /** A branch runs from its newest node to its oldest. */
  const branchSpan = (rows: number[]): Span | null =>
    rows.length
      ? { from: { row: rows[0], y: NODE_Y }, to: { row: rows[rows.length - 1], y: NODE_Y } }
      : null

  const wipSpan = branchSpan(wip)
  const eduSpan = branchSpan(edu)

  // wip is never merged, so it only touches main where it forks off, below its
  // oldest commit. edu touches main twice: it merges in above its newest and
  // forks off below its oldest.
  const wipFork = wip.length ? { row: wip[wip.length - 1], y: NODE_Y + CURVE } : null
  const eduMerge = edu.length && edu[0] > 0 ? { row: edu[0], y: 0 } : null
  const eduFork = edu.length ? { row: edu[edu.length - 1], y: NODE_Y + CURVE } : null

  // main has to reach every junction its branches make with it, whether or not
  // it has a commit of its own that far up or down.
  const mainSpan: Span | null = (() => {
    const tops = [
      ...(main.length ? [{ row: main[0], y: NODE_Y }] : []),
      ...(wipFork ? [wipFork] : []),
      ...(eduMerge ? [eduMerge] : []),
    ]
    const bottoms = [
      ...(main.length ? [{ row: main[main.length - 1], y: NODE_Y }] : []),
      ...(wipFork ? [wipFork] : []),
      ...(eduFork ? [eduFork] : []),
    ]
    if (!tops.length || !bottoms.length) return null
    return { from: tops.reduce(earlier), to: bottoms.reduce(later) }
  })()

  return (
    <ol ref={list} className="relative isolate">
      {/* Behind every row, and the only thing that moves. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 rounded-xl"
        style={{
          transform: `translateY(${box?.top ?? 0}px)`,
          height: box?.height ?? 0,
          opacity: active && box ? 1 : 0,
          background: `color-mix(in oklab, ${activeLane} 9%, var(--color-surface))`,
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${activeLane} 22%, transparent)`,
          transition:
            'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), height 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, background-color 0.38s ease',
        }}
      />
      {commits.map((commit, i) => {
        const lanes = [
          { lane: 0, seg: segment(mainSpan, i) },
          { lane: 1, seg: segment(wipSpan, i) },
          { lane: 2, seg: segment(eduSpan, i) },
        ]

        return (
          <Reveal
            as="li"
            key={commit.id}
            delay={Math.min(i, 6) * 55}
            className="relative z-10"
          >
            <div
              data-commit={commit.id}
              className="grid"
              style={{ gridTemplateColumns: `${GUTTER}px 1fr` }}
            >
              <div className="relative">
                {lanes.map(({ lane, seg }) =>
                  seg ? <Line key={lane} lane={lane} from={seg.from} to={seg.to} /> : null,
                )}
                {wipFork?.row === i && (
                  <Curve a={1} b={0} top={NODE_Y} height={CURVE} tint={1} />
                )}
                {eduMerge?.row === i && (
                  <Curve a={0} b={2} top={0} height={NODE_Y} tint={2} />
                )}
                {eduFork?.row === i && (
                  <Curve a={2} b={0} top={NODE_Y} height={CURVE} tint={2} />
                )}
                <Node
                  lane={commit.lane}
                  head={commit.head}
                  active={active === commit.id}
                  dim={active !== null && active !== commit.id}
                />
              </div>

              <Row
                commit={commit}
                open={i === 0}
                dim={active !== null && active !== commit.id}
                onActive={(on) => setHovered(on ? commit.id : null)}
              />
            </div>
          </Reveal>
        )
      })}
    </ol>
  )
}

/** The commit dot. Ringed in the page background so the lane line stops at it
 *  rather than running underneath. It fills and grows with its row, and settles
 *  back with the rest of the list when another row has the pointer. */
function Node({
  lane,
  head,
  active,
  dim,
}: {
  lane: number
  head?: boolean
  active?: boolean
  dim?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className="commit absolute"
      style={{
        left: LANE_X[lane] - 5.5,
        top: NODE_Y - 5.5,
        transformOrigin: 'center',
        transform: active ? 'scale(1.3)' : undefined,
        opacity: dim ? 0.5 : 1,
      }}
    >
      <span
        className="relative block h-[11px] w-[11px] rounded-full ring-4 ring-bg transition-colors duration-200"
        style={{
          background: head || active ? laneColor(lane) : 'var(--color-bg)',
          boxShadow: `inset 0 0 0 2px ${laneColor(lane)}`,
        }}
      >
        {/* The ring that marks the work still in progress. */}
        {head && (
          <span
            className="pulse absolute inset-0 rounded-full"
            style={{ ['--pulse-color' as string]: laneColor(lane) }}
          />
        )}
      </span>
    </span>
  )
}

function Row({
  commit,
  open,
  dim,
  onActive,
}: {
  commit: Commit
  open: boolean
  dim: boolean
  onActive: (on: boolean) => void
}) {
  const foldable = Boolean(commit.body || commit.stack?.length)

  const head = (
    <div className="min-w-0 flex-1">
      <div className="meta flex flex-wrap items-center gap-x-2 gap-y-1 text-dim">
        <span className="text-p-ink">{shortHash(commit.id)}</span>
        <span aria-hidden="true">·</span>
        <span>{commit.when}</span>
        {commit.ref && (
          <span
            className="rounded-full border px-1.5 py-px text-[0.625rem]"
            style={{
              borderColor: `color-mix(in oklab, ${laneColor(commit.lane)} 55%, transparent)`,
              color: laneColor(commit.lane),
            }}
          >
            {commit.ref}
          </span>
        )}
      </div>
      <div className="mt-1 text-[0.9375rem] leading-snug font-medium text-text">
        {commit.title}
      </div>
      {(commit.where || commit.meta) && (
        <div className="meta mt-0.5 text-dim">
          {[commit.where, commit.meta].filter(Boolean).join(' · ')}
        </div>
      )}
    </div>
  )

  const stackDots = commit.stack?.length ? (
    <span className="flex shrink-0 gap-1 pt-1">
      {commit.stack.slice(0, 5).map((tech) => (
        <Dot key={tech} name={tech} />
      ))}
    </span>
  ) : null

  const inner = (
    <>
      {head}
      {stackDots}
    </>
  )

  const shell = 'px-2'

  const detail = (
    <div className="space-y-3 pt-1 pb-4 pl-px">
      {commit.body}
      {commit.stack?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {commit.stack.map((tech) => (
            <Tag key={tech} name={tech} />
          ))}
        </div>
      ) : null}
    </div>
  )

  // Pointer rather than mouse events, so a tap — which fires a synthetic
  // mouseenter that never gets a matching leave — cannot leave a row stuck
  // lifted on a phone, where the scroll position is what drives it. Focus
  // counts too: the folds are keyboard-operable.
  const mouse = (e: PointerEvent) => e.pointerType === 'mouse'
  const on = {
    onPointerEnter: (e: PointerEvent) => mouse(e) && onActive(true),
    onPointerLeave: (e: PointerEvent) => mouse(e) && onActive(false),
    onFocus: () => onActive(true),
    onBlur: () => onActive(false),
  }

  return (
    // The lift stays modest on purpose: enough to separate the row from the
    // ones around it, small enough that the type does not go soft.
    <div
      className="commit pb-6"
      // Everything but the lit commit settles back. The panel does the moving;
      // the rows only change how present they are.
      style={{ opacity: dim ? 0.5 : 1 }}
      {...on}
    >
      {foldable ? (
        <details open={open} className={`group ${shell}`}>
          <summary className="flex cursor-pointer list-none items-start gap-3 py-1">
            {inner}
            <span
              aria-hidden="true"
              className="meta shrink-0 pt-1 text-dim transition-transform group-open:rotate-90"
            >
              ›
            </span>
          </summary>
          {detail}
        </details>
      ) : (
        <div className={`flex items-start gap-3 py-1 ${shell}`}>{inner}</div>
      )}
    </div>
  )
}

/**
 * A stable seven-character hash for an entry. It is decoration — the point is
 * that the same job always carries the same hash, not that it means anything —
 * so a cheap FNV-1a is exactly enough.
 */
function shortHash(id: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}
