/**
 * The mark.
 *
 * The site's own motif turned into a monogram: a lane with three commits on it,
 * which is also the letter E. Drawn rather than lettered so it survives at 16px
 * in a browser tab, where a serif initial would collapse into a smudge.
 *
 * Everything but the middle node is `currentColor`, so the mark inverts with
 * the theme by inheriting from whatever it sits on. The one accent node is the
 * same blue the page uses everywhere else — the mark carries no colour of its
 * own that the palette would have to make room for.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M9.5 8v16" />
        <path d="M9.5 8h8.5" />
        <path d="M9.5 16h6.5" />
        <path d="M9.5 24h8.5" />
      </g>
      <circle cx="20.5" cy="8" r="2.9" fill="currentColor" />
      <circle cx="18.5" cy="16" r="2.9" className="fill-p" />
      <circle cx="20.5" cy="24" r="2.9" fill="currentColor" />
    </svg>
  )
}
