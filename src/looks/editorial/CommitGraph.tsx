import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { LuBriefcase, LuGraduationCap } from 'react-icons/lu'
import { Reveal } from '../../lib/reveal'
import { Dot, Tag } from './visuals'

/**
 * `git log --graph` as a deck.
 *
 * One commit is in focus at a time, its neighbours sit above and below it,
 * scaled back and faded, and everything further away is gone. Rolling the wheel
 * over it — or dragging, or pressing a cursor key — moves the deck by exactly
 * one commit rather than scrolling the page. At either end the page takes the
 * scroll back, so the reader is never trapped in it.
 *
 * Three lanes, and they mean what their names mean. `main` carries the finished
 * roles. `wip` carries whatever is still running — branched off main and
 * deliberately never merged, because that work is not done. `edu` carries the
 * studying, merging into main at its newest entry and forking off at the
 * oldest, so the years spent studying alongside a job read as exactly that
 * rather than as a second list further down the page.
 *
 * Every slot is exactly STEP tall and the stack only ever translates, so the
 * lane lines drawn in each slot's gutter meet the ones above and below them
 * seamlessly however far through the deck the reader is. The scaling that makes
 * the focused commit come forward is applied to the text column alone, which is
 * why it can never pull the graph apart.
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
/** One slot. Every commit occupies exactly this, in focus or not. */
const STEP = 76
/** Where a node sits inside its slot — dead centre, so the focused commit's
 *  node lands on the deck's centre line. */
const NODE_Y = STEP / 2
/** How far a fork takes to travel between lanes. Has to fit inside a slot. */
const CURVE = 26
/* Wider than the lanes need: the slack is the gap between the graph and the
 * commit, which the lanes would otherwise sit right up against. */
const GUTTER = 76
/** How many commits are visible either side of the one in focus. Three on a
 *  screen with room for them; on a phone just one, so the deck is the previous
 *  commit, this one, and the next — a seven-slot deck is taller than the phone
 *  it is on, which puts the commit in focus somewhere off the screen. */
const REACH = 3
const REACH_NARROW = 1
/** How far the focused commit comes forward, and how far each ring back from it
 *  falls away. */
const ZOOM = 1.06
const FALLOFF = 0.09
/** Wheel travel that counts as "one commit". */
const THRESHOLD = 60
/** Quiet time before the deck will accept another turn. */
const COOLDOWN = 260

const laneColor = (lane: number) => `var(${LANE_VAR[lane]})`

/** A point in the graph: a row, and a height within that row. */
type Anchor = { row: number; y: number }
type Span = { from: Anchor; to: Anchor }

/** Compare two points by row first, then by height within the row. */
const before = (a: Anchor, b: Anchor) => a.row - b.row || a.y - b.y
const earlier = (a: Anchor, b: Anchor): Anchor => (before(a, b) <= 0 ? a : b)
const later = (a: Anchor, b: Anchor): Anchor => (before(a, b) >= 0 ? a : b)

/** The piece of a lane that falls inside one slot, if any. */
function segment(span: Span | null, i: number) {
  if (!span || i < span.from.row || i > span.to.row) return null
  return {
    from: i === span.from.row ? span.from.y : 0,
    to: i === span.to.row ? span.to.y : null,
  }
}

/** A lane's vertical run. `to === null` means "carry on to the slot's bottom". */
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

/** The curve that joins a branch to the trunk, in either direction. */
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
  const [index, setIndex] = useState(0)
  const deck = useRef<HTMLDivElement>(null)
  const last = commits.length - 1

  // The focused commit opens in place, and everything below it moves down by
  // however tall its detail turns out to be. Measured rather than assumed: one
  // role has three bullets and a stack, another has none at all, and a fixed
  // allowance would leave a hole under the short ones.
  const [reach, setReach] = useState(REACH)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const read = () => setReach(mq.matches ? REACH_NARROW : REACH)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])

  const detail = useRef<HTMLDivElement>(null)
  const [detailH, setDetailH] = useState(0)
  useEffect(() => {
    const el = detail.current
    if (!el) {
      setDetailH(0)
      return
    }
    const measure = () => setDetailH(el.scrollHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [index, commits])

  const move = useCallback(
    (by: number) => {
      let moved = false
      setIndex((i) => {
        const next = Math.min(last, Math.max(0, i + by))
        moved = next !== i
        return next
      })
      return moved
    },
    [last],
  )

  /**
   * While the deck is the thing on screen, the page's scroll belongs to it —
   * wherever the pointer happens to be. It hands the scroll back the moment the
   * deck runs out of commits in the direction you are going, so the page moves
   * on as normal past either end. A section that swallows the scroll and will
   * not give it back is a trap, not an effect.
   */
  useEffect(() => {
    const el = deck.current
    if (!el) return

    // The deck is "the thing on screen" while it crosses the middle of the
    // viewport. Measured per event rather than observed, because it is the
    // position at the moment of the scroll that decides.
    const holding = () => {
      const r = el.getBoundingClientRect()
      const h = window.innerHeight
      return r.top < h * 0.62 && r.bottom > h * 0.38
    }

    let acc = 0
    let locked = false
    let quiet: ReturnType<typeof setTimeout> | undefined

    const settle = () => {
      if (quiet) clearTimeout(quiet)
      quiet = setTimeout(() => {
        locked = false
        acc = 0
      }, COOLDOWN)
    }

    const turn = (delta: number, cancel: () => void) => {
      const room = delta > 0 ? index < last : index > 0
      if (!room || !holding()) return
      // The page must not scroll underneath a deck that is about to move.
      cancel()
      settle()
      if (locked) return
      acc += delta
      if (Math.abs(acc) < THRESHOLD) return
      acc = 0
      if (move(Math.sign(delta))) locked = true
    }

    const onWheel = (e: WheelEvent) => {
      turn(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY, () => e.preventDefault())
    }

    let from: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      from = e.touches[0]?.clientY ?? null
      acc = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (y === undefined || from === null) return
      turn(from - y, () => e.preventDefault())
      from = y
    }

    // On the window, not the deck: the scroll is the deck's while the deck is
    // what you are looking at, whether or not the pointer is over it.
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      if (quiet) clearTimeout(quiet)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [index, last, move])

  // Bring the commit in focus to the middle of the screen if it has drifted
  // off it. On a phone the deck is most of the viewport, so a commit two steps
  // in can sit under the fold — moving the deck to it is no use if the reader
  // cannot see where it moved to.
  useEffect(() => {
    const el = deck.current?.querySelector<HTMLElement>(`[data-slot="${index}"]`)
    if (!el) return
    // Two frames: the slot is mid-transition on the first one.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        // The header, not the opened detail — it is the commit's own line that
        // should land in the middle, not the middle of everything it says.
        const centre = r.top + Math.min(r.height, STEP) / 2
        const drift = centre - window.innerHeight / 2
        if (Math.abs(drift) > window.innerHeight * 0.2) {
          window.scrollBy({ top: drift, behavior: 'smooth' })
        }
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [index])

  const onKey = (e: React.KeyboardEvent) => {
    const by = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key]
    if (by) {
      e.preventDefault()
      move(by)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setIndex(last)
    }
  }

  // ── the lanes, in slot coordinates ────────────────────────────────────────
  const rowsOf = (lane: Lane) =>
    commits.reduce<number[]>((rows, c, i) => (c.lane === lane ? [...rows, i] : rows), [])
  const main = rowsOf(0)
  const wip = rowsOf(1)
  const edu = rowsOf(2)

  const branchSpan = (rows: number[]): Span | null =>
    rows.length
      ? {
          from: { row: rows[0], y: NODE_Y },
          to: { row: rows[rows.length - 1], y: NODE_Y },
        }
      : null

  const wipSpan = branchSpan(wip)
  const eduSpan = branchSpan(edu)
  const wipFork = wip.length ? { row: wip[wip.length - 1], y: NODE_Y + CURVE } : null
  const eduMerge = edu.length && edu[0] > 0 ? { row: edu[0], y: 0 } : null
  const eduFork = edu.length ? { row: edu[edu.length - 1], y: NODE_Y + CURVE } : null

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

  const VISIBLE = reach * 2 + 1
  // The deck keeps the focused commit centred, but never at the price of empty
  // slots: at the ends it stops moving and the focus travels within the window
  // instead. Three blank rows above the newest commit is not a deck, it is a
  // hole.
  const start = Math.min(Math.max(index - reach, 0), Math.max(0, commits.length - VISIBLE))
  const height = STEP * VISIBLE + detailH

  return (
    <div>
      <Reveal>
        <div
          ref={deck}
          role="listbox"
          tabIndex={0}
          aria-label={`${index + 1} / ${commits.length}`}
          aria-activedescendant={`commit-${index}`}
          onKeyDown={onKey}
          className="deck relative overflow-hidden outline-none"
          style={{ height, transition: 'height 0.52s cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          {/* The whole stack moves as one, so the lanes stay joined. */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              transform: `translateY(${-start * STEP}px)`,
              transition: 'transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {commits.map((commit, i) => {
              const off = i - index
              const away = Math.abs(off)
              const lanes = [
                { lane: 0, seg: segment(mainSpan, i) },
                { lane: 1, seg: segment(wipSpan, i) },
                { lane: 2, seg: segment(eduSpan, i) },
              ]

              return (
                <div
                  key={commit.id}
                  id={`commit-${i}`}
                  data-slot={i}
                  role="option"
                  aria-selected={off === 0}
                  className="absolute inset-x-0 grid"
                  style={{
                    // Only what is below the focused commit moves down, so the
                    // focused commit itself never leaves the centre line.
                    top: i * STEP + (i > index ? detailH : 0),
                    height: STEP + (off === 0 ? detailH : 0),
                    gridTemplateColumns: `${GUTTER}px 1fr`,
                    transition:
                      'top 0.52s cubic-bezier(0.22, 1, 0.36, 1), height 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {/* The graph never fades. The commits come and go through the
                      deck, but the path they sit on is the shape of the whole
                      history, and it is drawn end to end. */}
                  <div className="relative">
                    {lanes.map(({ lane, seg }) =>
                      seg ? (
                        <Line key={lane} lane={lane} from={seg.from} to={seg.to} />
                      ) : null,
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
                    <Node lane={commit.lane} head={commit.head} focused={off === 0} />
                  </div>

                  {/* Only the text column scales, so the graph beside it cannot
                      be pulled out of true. */}
                  <div
                    className="flex min-w-0 flex-col"
                    style={{
                      // The text is what recedes, not the graph beside it — and
                      // never past legibility while it is inside the window.
                      opacity:
                        i < start || i >= start + VISIBLE
                          ? 0
                          : Math.max(0.34, 1 - away * 0.22),
                      transition: 'opacity 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setIndex(i)}
                      className="deck-card flex min-w-0 shrink-0 items-center text-left"
                      style={{
                        height: STEP,
                        // Only the header scales. A tall opened card scaled up
                        // would push its own detail out of the deck.
                        transform: `scale(${off === 0 ? ZOOM : 1 - away * FALLOFF})`,
                        cursor: off === 0 ? 'default' : 'pointer',
                      }}
                    >
                      <Card commit={commit} focused={off === 0} />
                    </button>

                    {/* Boolean(), not the raw expression: `stack.length` is 0
                        for a role the CV lists no technologies for, and JSX
                        renders a 0 rather than nothing. */}
                    {off === 0 && Boolean(commit.body || commit.stack?.length) && (
                      <div ref={detail} className="deck-detail min-w-0 pb-6">
                        {commit.body}
                        {commit.stack?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {commit.stack.map((tech) => (
                              <Tag key={tech} name={tech} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Softens an edge only where the deck actually continues past it.
              Clamped at either end there is nothing beyond the frame, and a
              fade there would just be dimming the first commit's own date. */}
          {start > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{
                height: STEP * 0.9,
                background: 'linear-gradient(var(--color-bg), transparent)',
              }}
            />
          )}
          {start + VISIBLE < commits.length && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: STEP * 0.9,
                background: 'linear-gradient(transparent, var(--color-bg))',
              }}
            />
          )}
        </div>
      </Reveal>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <Step label="↑" onClick={() => move(-1)} disabled={index === 0} />
          <Step label="↓" onClick={() => move(1)} disabled={index === last} />
          <span className="meta text-dim">
            {index + 1} / {commits.length}
          </span>
        </div>
      </div>
    </div>
  )
}

/** One step through the deck, for anyone not using a wheel. */
function Step({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="meta flex h-8 w-8 items-center justify-center rounded-full border border-line text-dim transition-colors hover:border-p-ink/50 hover:text-p-ink disabled:opacity-35 disabled:hover:border-line disabled:hover:text-dim"
    >
      {label}
    </button>
  )
}

/** A commit's one line in the deck. */
function Card({ commit, focused }: { commit: Commit; focused: boolean }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="meta flex flex-wrap items-center gap-x-2 text-dim">
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
      </span>
      <span
        className={`mt-0.5 block truncate text-[0.9375rem] leading-snug transition-[font-weight] ${
          focused ? 'font-semibold text-text' : 'font-medium text-dim'
        }`}
      >
        {commit.title}
      </span>
      <span className="meta mt-0.5 flex items-center gap-2 text-dim">
        <span className="truncate">
          {[commit.where, commit.meta].filter(Boolean).join(' · ')}
        </span>
        {commit.stack?.length ? (
          <span className="flex shrink-0 gap-1">
            {commit.stack.slice(0, 4).map((tech) => (
              <Dot key={tech} name={tech} />
            ))}
          </span>
        ) : null}
      </span>
    </span>
  )
}

/**
 * The commit dot. Ringed in the page background so the lane line stops at it
 * rather than running underneath.
 *
 * The commit in focus opens into its kind — a cap for the studying, a case for
 * the work. Only that one: nine marks down the deck would be wallpaper, and on
 * the commit being read it says at a glance which of the two histories you are
 * in. It is 20px across, which is exactly narrow enough to sit between the
 * lanes either side of it without covering them.
 */
function Node({
  lane,
  head,
  focused,
}: {
  lane: number
  head?: boolean
  focused: boolean
}) {
  const color = laneColor(lane)

  if (focused) {
    const Icon = lane === 2 ? LuGraduationCap : LuBriefcase
    return (
      <span
        aria-hidden="true"
        className="deck-kind absolute flex items-center justify-center rounded-full"
        style={{
          left: LANE_X[lane] - 10,
          top: NODE_Y - 10,
          width: 20,
          height: 20,
          color,
          background: `color-mix(in oklab, ${color} 14%, var(--color-bg))`,
          // The inner ring is the node; the outer one is the page, punching the
          // lane out from behind the mark.
          boxShadow: `0 0 0 1.5px ${color}, 0 0 0 4px var(--color-bg)`,
        }}
      >
        <Icon className="h-3 w-3" />
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="deck-node absolute"
      style={{ left: LANE_X[lane] - 5.5, top: NODE_Y - 5.5 }}
    >
      <span
        className="relative block h-[11px] w-[11px] rounded-full ring-4 ring-bg transition-colors duration-300"
        style={{
          background: head ? color : 'var(--color-bg)',
          boxShadow: `inset 0 0 0 2px ${color}`,
        }}
      >
        {head && (
          <span
            className="pulse absolute inset-0 rounded-full"
            style={{ ['--pulse-color' as string]: color }}
          />
        )}
      </span>
    </span>
  )
}
