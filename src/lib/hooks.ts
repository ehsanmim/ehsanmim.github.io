import { useEffect, useRef } from 'react'

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
