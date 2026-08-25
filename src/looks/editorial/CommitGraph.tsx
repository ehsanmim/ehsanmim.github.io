import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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
/** How many commits are visible either side of the one in focus. */
const REACH = 2
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
   * The deck takes the wheel only while it still has somewhere to go. Once it
   * is at either end the event is left alone and the page scrolls on past it —
   * a section that swallows the scroll and will not give it back is a trap, not
   * an effect.
   */
  useEffect(() => {
    const el = deck.current
    if (!el) return

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
      if (!room) return
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

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      if (quiet) clearTimeout(quiet)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [index, last, move])

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

  const current = commits[index]
  const height = STEP * (REACH * 2 + 1)

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
          style={{ height }}
        >
          {/* The whole stack moves as one, so the lanes stay joined. */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              transform: `translateY(${REACH * STEP - index * STEP}px)`,
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
                  role="option"
                  aria-selected={off === 0}
                  className="absolute inset-x-0 grid"
                  style={{
                    top: i * STEP,
                    height: STEP,
                    gridTemplateColumns: `${GUTTER}px 1fr`,
                    // Everything past the reach is gone rather than merely
                    // faint: a deck you can see the whole of is a list.
                    opacity: away > REACH ? 0 : 1 - away * 0.38,
                    transition: 'opacity 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
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
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setIndex(i)}
                    className="deck-card flex h-full min-w-0 items-center text-left"
                    style={{
                      transform: `scale(${off === 0 ? ZOOM : 1 - away * FALLOFF})`,
                      cursor: off === 0 ? 'default' : 'pointer',
                    }}
                  >
                    <Card commit={commit} focused={off === 0} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Softens the top and bottom edges so commits leave the deck rather
              than being cut off by it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(var(--color-bg), transparent ${STEP * 0.9}px, transparent calc(100% - ${STEP * 0.9}px), var(--color-bg))`,
            }}
          />
        </div>
      </Reveal>

      {/* What the focused commit did. Keyed, so it crossfades in as the deck
          settles rather than swapping under the reader. */}
      <div className="mt-5 border-t border-line pt-5">
        <div key={current.id} className="deck-detail min-h-[6rem]">
          {current.body}
          {current.stack?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {current.stack.map((tech) => (
                <Tag key={tech} name={tech} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-3">
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

/** The commit dot. Ringed in the page background so the lane line stops at it
 *  rather than running underneath; filled while its commit has the deck. */
function Node({
  lane,
  head,
  focused,
}: {
  lane: number
  head?: boolean
  focused: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className="deck-node absolute"
      style={{
        left: LANE_X[lane] - 5.5,
        top: NODE_Y - 5.5,
        transform: focused ? 'scale(1.5)' : undefined,
      }}
    >
      <span
        className="relative block h-[11px] w-[11px] rounded-full ring-4 ring-bg transition-colors duration-300"
        style={{
          background: head || focused ? laneColor(lane) : 'var(--color-bg)',
          boxShadow: `inset 0 0 0 2px ${laneColor(lane)}`,
        }}
      >
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
