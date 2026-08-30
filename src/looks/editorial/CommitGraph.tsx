import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { LuBriefcase, LuGraduationCap } from 'react-icons/lu'
import { Reveal } from '../../lib/reveal'
import { SkillIcon } from './skill-icons'
import { Tag } from './visuals'

/**
 * `git log --graph` as a deck.
 *
 * One commit is in focus at a time, its neighbours sit above and below it,
 * scaled back and faded, and everything further away is gone.
 *
 * The deck is *pinned* rather than scroll-jacked: it sticks to the top of the
 * viewport while the page scrolls through a track as long as the history, and
 * the scroll position inside that track picks the commit. Nothing is
 * preventDefault-ed, so the page keeps its own inertia, its own rubber band and
 * its own scrollbar — which is the only way this behaves on a phone, where the
 * browser claims a touch gesture before script gets a say and cancelling it
 * mid-flight is what makes the page jump. Scroll past the track and the deck
 * simply unpins.
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
/** The fewest commits the deck will ever show. Below three it stops reading as
 *  a deck at all. */
const SLOTS_MIN = 3
/** Kept clear under the deck for the controls and for whatever the commit in
 *  focus has to say for itself. */
const RESERVE = 130
/** How far the focused commit comes forward, and how far each ring back from it
 *  falls away. */
const ZOOM = 1.06
const FALLOFF = 0.09
/** Fallback for where the pinned deck sits, until the masthead has been
 *  measured. */
const PIN_FALLBACK = 92

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

export function CommitGraph({
  commits,
  header,
}: {
  commits: Commit[]
  header?: ReactNode
}) {
  const [index, setIndex] = useState(0)
  const deck = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const pinned = useRef<HTMLDivElement>(null)

  // The masthead is sticky and its height depends on the type inside it, so it
  // is measured rather than assumed. Guessing it low puts the section's heading
  // underneath the nav.
  const [pinTop, setPinTop] = useState(PIN_FALLBACK)
  useEffect(() => {
    const bar = document.querySelector('header')
    if (!bar) return
    const measure = () => setPinTop(bar.offsetHeight + 12)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])
  const last = commits.length - 1

  // The focused commit opens in place, and everything below it moves down by
  // however tall its detail turns out to be. Measured rather than assumed: one
  // role has three bullets and a stack, another has none at all, and a fixed
  // allowance would leave a hole under the short ones.
  // The deck shows as many commits as the pinned screen has room for, rather
  // than a number picked in advance: too few and the screen has a hole in it,
  // too many and the deck runs off the bottom of the phone it is on.
  const headBox = useRef<HTMLDivElement>(null)
  const [slots, setSlots] = useState(SLOTS_MIN)
  useEffect(() => {
    const fit = () => {
      const room =
        window.innerHeight - pinTop - (headBox.current?.offsetHeight ?? 0) - RESERVE
      setSlots(
        Math.max(SLOTS_MIN, Math.min(commits.length, Math.floor(room / STEP) || SLOTS_MIN)),
      )
    }
    fit()
    const ro = new ResizeObserver(fit)
    if (headBox.current) ro.observe(headBox.current)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [commits.length, pinTop])

  // The track is exactly as long as the deck plus the scrolling it has to do.
  // Guessing an allowance for the tallest possible deck left a screen of empty
  // page under the last commit; measuring leaves none.
  const [boxH, setBoxH] = useState(0)
  useEffect(() => {
    const el = pinned.current
    if (!el) return
    const measure = () => setBoxH(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
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

  /**
   * How far the page scrolls per commit, and how much room the pinned deck is
   * given inside its track. Both are constants on purpose: deriving the track's
   * length from the deck's own height would feed the opened detail back into
   * the sums that decide which commit is open.
   */
  const step = slots <= SLOTS_MIN ? 96 : 120
  const span = (commits.length - 1) * step

  // The scroll position inside the track is the only thing that picks the
  // commit — there is no second source of truth to fall out of step with it.
  useEffect(() => {
    const el = track.current
    if (!el) return

    let raf = 0
    const read = () => {
      raf = 0
      // A single commit has nothing to travel: its track is zero long, and
      // dividing by that span would set the index to NaN. Soloing a branch can
      // leave exactly one commit, so this is reachable, not theoretical.
      if (span <= 0) {
        setIndex(0)
        return
      }
      const top = el.getBoundingClientRect().top
      const travelled = Math.min(span, Math.max(0, pinTop - top))
      setIndex(Math.round((travelled / span) * (commits.length - 1)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [span, commits.length, pinTop])

  /** Move by scrolling, so the buttons and the keys land where the wheel would. */
  const move = useCallback(
    (by: number) => {
      const el = track.current
      if (!el) return
      const to = Math.min(last, Math.max(0, index + by))
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - pinTop + to * step,
        behavior: 'smooth',
      })
    },
    [index, last, step, pinTop],
  )

  const onKey = (e: React.KeyboardEvent) => {
    const by = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key]
    if (by) {
      e.preventDefault()
      move(by)
    } else if (e.key === 'Home') {
      e.preventDefault()
      move(-commits.length)
    } else if (e.key === 'End') {
      e.preventDefault()
      move(commits.length)
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

  const VISIBLE = slots
  const reach = Math.floor((slots - 1) / 2)
  // The deck keeps the focused commit centred, but never at the price of empty
  // slots: at the ends it stops moving and the focus travels within the window
  // instead. Three blank rows above the newest commit is not a deck, it is a
  // hole.
  const start = Math.min(Math.max(index - reach, 0), Math.max(0, commits.length - VISIBLE))
  const height = STEP * VISIBLE + detailH

  return (
    // The track is as long as the history. The deck sticks to the top of it and
    // stays there while the page scrolls the rest of the way down, which is
    // what turns page scroll into deck movement without taking the scroll away
    // from the browser.
    <div ref={track} style={{ height: span + boxH }}>
      {/* The pinned box fills the screen — sized to the deck alone it was much
          shorter than a phone's viewport, and the rest of the track showed
          through underneath it as a screenful of nothing.
          Its contents are anchored to the top, not centred: the deck's height
          changes every time a commit opens its detail, and centred content
          would slide the heading up and down on every step. */}
      <div
        ref={pinned}
        className="sticky flex flex-col justify-start gap-6 pt-2"
        style={{ top: pinTop, minHeight: `calc(100svh - ${pinTop}px)` }}
      >
        {header && <div ref={headBox}>{header}</div>}
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

      {/* Pushed to the foot of the pinned screen. Left directly under the deck
          it dumped whatever height the screen had spare between itself and the
          next section, which read as a hole rather than as layout. */}
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-3">
          <Step label="↑" onClick={() => move(-1)} disabled={index === 0} />
          <Step label="↓" onClick={() => move(1)} disabled={index === last} />
          <span className="meta text-dim">
            {index + 1} / {commits.length}
          </span>
        </div>
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
            className="rounded-full border px-1.5 py-px text-[0.6875rem] tracking-wide"
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
          /* The stack, as the brand marks themselves rather than the colour
             each one is drawn in: a row of dots said only "four things", and
             the reader had to open the commit to learn which four. */
          <span className="flex shrink-0 items-center gap-1.5">
            {commit.stack.slice(0, 4).map((tech) => (
              <SkillIcon key={tech} name={tech} size="h-3 w-3" />
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
