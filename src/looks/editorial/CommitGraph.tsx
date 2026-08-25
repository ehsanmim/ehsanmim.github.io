import { useState, type ReactNode } from 'react'
import { Reveal } from '../../lib/reveal'
import { Dot, Tag } from './visuals'

/**
 * `git log --graph`, drawn in HTML.
 *
 * Two lanes: the career runs down the trunk, the studies run on a branch that
 * merges into it at the newest entry and forks off at the oldest — so the years
 * spent studying alongside a job read as exactly that, rather than as a second
 * list somewhere further down the page.
 *
 * The gutter is absolutely positioned hairlines plus two small SVG curves at
 * the fork and the merge. No chart library, and nothing distorts when a row
 * grows because the reader unfolded it.
 */

export type Commit = {
  id: string
  /** 0 = the career trunk, 1 = the studies branch. */
  lane: 0 | 1
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

const LANE_X = [13, 33]
/** Where a node sits inside its row — level with the first line of the title. */
const NODE_Y = 21
/** How far a fork or merge takes to travel between lanes. */
const CURVE = 24
const GUTTER = 46

const laneColor = (lane: number) => (lane === 0 ? 'var(--color-p)' : 'var(--color-edu)')

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
        opacity: lane === 0 ? 0.5 : 0.45,
      }}
    />
  )
}

/** The diagonal that joins the branch to the trunk, in either direction. */
function Curve({ dir, top }: { dir: 'merge' | 'fork'; top: number }) {
  const [a, b] = dir === 'merge' ? [LANE_X[0], LANE_X[1]] : [LANE_X[1], LANE_X[0]]
  const h = dir === 'merge' ? NODE_Y : CURVE
  return (
    <svg
      aria-hidden="true"
      className="absolute"
      width={GUTTER}
      height={h}
      style={{ left: 0, top }}
    >
      <path
        d={`M ${a} 0 C ${a} ${h * 0.55}, ${b} ${h * 0.45}, ${b} ${h}`}
        fill="none"
        stroke={laneColor(dir === 'merge' ? 1 : 1)}
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  )
}

export function CommitGraph({ commits }: { commits: Commit[] }) {
  // Which rows each lane runs through. The trunk carries on past its own last
  // commit down to wherever the branch forks off it — that junction is the
  // point the whole history starts from.
  const trunkFirst = commits.findIndex((c) => c.lane === 0)
  const trunkLast = commits.reduce((last, c, i) => (c.lane === 0 ? i : last), -1)
  const branchFirst = commits.findIndex((c) => c.lane === 1)
  const branchLast = commits.reduce((last, c, i) => (c.lane === 1 ? i : last), -1)
  const hasBranch = branchFirst !== -1
  // Where the fork is drawn, and therefore how far the trunk has to reach.
  const forkRow = hasBranch ? branchLast : -1
  const trunkEnd = Math.max(trunkLast, forkRow)

  return (
    <ol className="relative">
      {commits.map((commit, i) => {
        const trunkOn = i >= trunkFirst && i <= trunkEnd
        const branchOn = hasBranch && i >= branchFirst && i <= branchLast
        // On the row where the trunk stops, it stops at its own node — unless
        // the branch rejoins below, in which case it runs down to meet it.
        const trunkTo =
          i === trunkEnd ? (i === forkRow ? NODE_Y + CURVE : NODE_Y) : null

        return (
          <Reveal as="li" key={commit.id} delay={Math.min(i, 6) * 55}>
            <div className="grid" style={{ gridTemplateColumns: `${GUTTER}px 1fr` }}>
              <div className="relative">
                {trunkOn && (
                  <Line lane={0} from={i === trunkFirst ? NODE_Y : 0} to={trunkTo} />
                )}
                {branchOn && (
                  <Line
                    lane={1}
                    from={i === branchFirst ? NODE_Y : 0}
                    to={i === branchLast ? NODE_Y : null}
                  />
                )}
                {hasBranch && i === branchFirst && branchFirst > 0 && (
                  <Curve dir="merge" top={0} />
                )}
                {hasBranch && i === branchLast && <Curve dir="fork" top={NODE_Y} />}
                <Node lane={commit.lane} head={commit.head} />
              </div>

              <Row commit={commit} open={i === 0} />
            </div>
          </Reveal>
        )
      })}
    </ol>
  )
}

/** The commit dot. Ringed in the page background so the lane line stops at it
 *  rather than running underneath. */
function Node({ lane, head }: { lane: number; head?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="absolute"
      style={{ left: LANE_X[lane] - 5.5, top: NODE_Y - 5.5 }}
    >
      <span
        className={`relative block h-[11px] w-[11px] rounded-full ring-4 ring-bg ${
          head ? 'pulse' : ''
        }`}
        style={{
          background: head ? laneColor(lane) : 'var(--color-bg)',
          boxShadow: `inset 0 0 0 2px ${laneColor(lane)}`,
        }}
      />
    </span>
  )
}

function Row({ commit, open }: { commit: Commit; open: boolean }) {
  const [hover, setHover] = useState(false)
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
              color: commit.lane === 0 ? 'var(--color-p-ink)' : 'var(--color-edu)',
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

  const shell = `-mx-2 rounded-lg px-2 transition-colors ${
    hover ? 'bg-p-wash/70' : ''
  }`

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

  const on = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  }

  return (
    <div className="pb-6" {...on}>
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
