import type { ReactNode } from 'react'
import { LuBriefcase, LuGraduationCap } from 'react-icons/lu'
import { Reveal } from '../../lib/reveal'
import { SkillIcon } from './skill-icons'

/**
 * `git log --graph`, drawn as a static list: every entry on the page at once,
 * so the history reads with the page's own scroll and nothing else.
 *
 * Three lanes, and they mean what their names mean. `main` carries the finished
 * roles. `wip` carries whatever is still running — branched off main and
 * deliberately never merged, because that work is not done. `edu` carries the
 * studying, merging into main at its newest entry and forking off at the
 * oldest, so the years spent studying alongside a job read as exactly that
 * rather than as a second list further down the page.
 *
 * Every row is exactly STEP tall, so the lane lines drawn in each row's gutter
 * meet the ones above and below them seamlessly.
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
  /** The role still running: its node is the one with the pulse. */
  head?: boolean
}

const LANE_X = [12, 28, 44]
const LANE_VAR = ['--color-p', '--color-wip', '--color-edu']
/** One row. Every commit occupies exactly this. */
const STEP = 76
/** Where a node sits inside its row — dead centre. */
const NODE_Y = STEP / 2
/** How far a fork takes to travel between lanes. Has to fit inside a row. */
const CURVE = 26
/* Wider than the lanes need: the slack is the gap between the graph and the
 * commit, which the lanes would otherwise sit right up against. */
const GUTTER = 76

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

  return (
    <div className="flex flex-col gap-6 pt-4 pb-8 sm:pt-2 sm:pb-14">
      {header && <div>{header}</div>}
      {/* Indented on a wide screen to the column the section titles start
          in — the 7rem label column plus its 2rem gap — like every other
          section's content. */}
      <ol className="relative md:pl-[9rem]">
        {commits.map((commit, i) => {
          const lanes = [
            { lane: 0, seg: segment(mainSpan, i) },
            { lane: 1, seg: segment(wipSpan, i) },
            { lane: 2, seg: segment(eduSpan, i) },
          ]

          return (
            <Reveal as="li" key={commit.id} delay={i * 40}>
              <div
                className="grid"
                style={{ height: STEP, gridTemplateColumns: `${GUTTER}px 1fr` }}
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
                <Node lane={commit.lane} head={commit.head} />
              </div>
              <div className="flex min-w-0 items-center">
                <Card commit={commit} />
              </div>
              </div>
            </Reveal>
          )
        })}
      </ol>
    </div>
  )
}

/** A commit's one line in the deck. */
function Card({ commit }: { commit: Commit }) {
  const ref = commit.ref && (
    <span
      className="shrink-0 rounded-full border px-1.5 py-px text-[0.6875rem] tracking-wide"
      style={{
        borderColor: `color-mix(in oklab, ${laneColor(commit.lane)} 55%, transparent)`,
        color: laneColor(commit.lane),
      }}
    >
      {commit.ref}
    </span>
  )

  // On a phone the date heads the entry, with the ref beside it. On a wide
  // screen it moves out to the right edge, where the dates line up in a column
  // of their own, and the ref sits beside the title instead.
  return (
    <span className="flex min-w-0 flex-1 items-center gap-6">
      <span className="min-w-0 flex-1">
        <span className="meta flex flex-wrap items-center gap-x-2 text-dim md:hidden">
          <span>{commit.when}</span>
          {ref}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-2 md:mt-0">
          <span className="truncate text-[0.9375rem] leading-snug font-semibold text-text">
            {commit.title}
          </span>
          <span className="meta hidden md:inline-flex">{ref}</span>
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
      <span className="meta hidden shrink-0 text-right whitespace-nowrap text-dim md:block">
        {commit.when}
      </span>
    </span>
  )
}

/**
 * The commit mark: a cap for the studying, a case for the work, ringed in the
 * page background so the lane line stops at it rather than running underneath.
 * The role still running carries the pulse. 20px across, which is exactly
 * narrow enough to sit between the lanes either side of it without covering
 * them.
 */
function Node({ lane, head }: { lane: number; head?: boolean }) {
  const color = laneColor(lane)
  const Icon = lane === 2 ? LuGraduationCap : LuBriefcase
  return (
    <span
      aria-hidden="true"
      className="absolute flex items-center justify-center rounded-full"
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
      {head && (
        <span
          className="pulse absolute inset-0 rounded-full"
          style={{ ['--pulse-color' as string]: color }}
        />
      )}
      <Icon className="relative h-3 w-3" />
    </span>
  )
}
