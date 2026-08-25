import { useEffect, useRef } from 'react'

/** How much overscroll counts as "and I meant it". */
const THRESHOLD = 90
/** A gesture is over once this long passes with no wheel or touch event. */
const QUIET = 320
/** A wheel in line mode reports rows, not pixels. */
const LINE_HEIGHT = 16

type Chain = {
  /** Called on overscroll past the bottom. Returns false if there is nowhere
   *  to go, so the gesture is not swallowed at the last section. */
  onNext: () => boolean
  onPrev: () => boolean
}

/**
 * Turns the sections into one continuous document.
 *
 * Scrolling past the bottom of a section opens the next one; scrolling past the
 * top opens the previous. The intent has to be deliberate — a threshold of
 * overscroll in one direction — because a phone's rubber band and a trackpad's
 * momentum both deliver a burst of events at the edge, and neither of them
 * means "next section". Once a switch fires it is locked out until the input
 * has been quiet, so one flick moves exactly one section.
 */
export function useScrollChain({ onNext, onPrev }: Chain) {
  // Kept in a ref so the listeners are attached once and still call the
  // current section's handlers.
  const handlers = useRef<Chain>({ onNext, onPrev })
  useEffect(() => {
    handlers.current = { onNext, onPrev }
  })

  useEffect(() => {
    let acc = 0
    let dir = 0
    let locked = false
    let quiet: ReturnType<typeof setTimeout> | undefined

    const atTop = () => window.scrollY <= 1
    const atBottom = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 1

    const settle = () => {
      if (quiet) clearTimeout(quiet)
      quiet = setTimeout(() => {
        locked = false
        acc = 0
        dir = 0
      }, QUIET)
    }

    const push = (delta: number) => {
      settle()
      if (locked || delta === 0) return

      const d = Math.sign(delta)
      if (d !== dir) {
        dir = d
        acc = 0
      }

      // Only overscroll counts. Anything else is ordinary scrolling within the
      // section, and resets whatever had been building up at the edge.
      if (d > 0 ? !atBottom() : !atTop()) {
        acc = 0
        return
      }

      acc += delta
      if (Math.abs(acc) < THRESHOLD) return

      acc = 0
      const moved = d > 0 ? handlers.current.onNext() : handlers.current.onPrev()
      if (moved) locked = true
    }

    const onWheel = (e: WheelEvent) => {
      push(e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT : e.deltaY)
    }

    let lastTouch: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      lastTouch = e.touches[0]?.clientY ?? null
      acc = 0
      dir = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (y === undefined || lastTouch === null) return
      // A finger moving up drags the page down: same sign as a wheel.
      push(lastTouch - y)
      lastTouch = y
    }
    const onTouchEnd = () => {
      lastTouch = null
      settle()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      if (quiet) clearTimeout(quiet)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
