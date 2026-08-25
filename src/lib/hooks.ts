import { useEffect, useRef, useState } from 'react'

/**
 * Adds `is-visible` the first time the element scrolls into view, then stops
 * observing — a reveal that replayed on every scroll-by would be a distraction
 * rather than an effect.
 */
export function useReveal<E extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<E>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Without IntersectionObserver the element simply stays visible.
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-visible')
        io.disconnect()
      },
      // Fire a little before the element is fully on screen, so the motion is
      // finishing rather than starting as the reader arrives.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}

/**
 * The id of the section currently occupying the reading position. Used to mark
 * the active entry in the section index.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    // A band across the upper third: whichever section crosses it is the one
    // being read. Tracking entry alone would keep the previous section active
    // for a whole viewport height.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    )

    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [ids])

  return active
}

/**
 * Honours a #hash in the URL on first load.
 *
 * The browser resolves the hash while the page is still an empty
 * <div id="root">, finds no such element, and gives up — so a shared deep link
 * like /#experience would otherwise always land at the top. Re-run it once the
 * sections exist.
 */
export function useHashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return

    // Two frames: one for React to commit, one for layout to settle.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: 'auto', block: 'start' })
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [])
}
