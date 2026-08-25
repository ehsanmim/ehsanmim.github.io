import type { Lang } from '../../content/resume'
import type { Theme } from '../../lib/theme'

/** Every control in the masthead sits in the same box. */
const CONTROL =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-dim transition-colors hover:border-p-ink/50 hover:text-p-ink'

/* Drawn rather than 🇩🇪/🇬🇧: Windows renders emoji flags as bare letter pairs,
 * so the emoji would silently degrade to "DE"/"US" on the machine this is
 * built on. Both are drawn into the same box so the two buttons sit level. */
function Flag({ lang }: { lang: Lang }) {
  const box = 'block h-[11px] w-4 shrink-0 rounded-[1px] ring-1 ring-line'

  if (lang === 'de') {
    // Schwarz-Rot-Gold: equal horizontal bands, top to bottom.
    return (
      <svg viewBox="0 0 60 30" className={box} aria-hidden="true">
        <rect width="60" height="10" fill="#000000" />
        <rect width="60" height="10" y="10" fill="#dd0000" />
        <rect width="60" height="10" y="20" fill="#ffce00" />
      </svg>
    )
  }

  // Stars and Stripes: 13 stripes, canton over the top seven, 50 stars. At
  // 16px the stars can only be dots — a five-pointed star renders as a smudge
  // at that size, where a clean dot grid still reads as a star field.
  const STRIPE = 32 / 13
  return (
    <svg viewBox="0 0 60 32" className={box} aria-hidden="true">
      <rect width="60" height="32" fill="#ffffff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect
          key={i}
          y={i * 2 * STRIPE}
          width="60"
          height={STRIPE}
          fill="#b31942"
        />
      ))}
      <rect width="24" height={STRIPE * 7} fill="#0a3161" />
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={2.4 + col * 3.9}
            cy={1.9 + row * 3.3}
            r="0.7"
            fill="#ffffff"
          />
        )),
      )}
    </svg>
  )
}

/**
 * One button, not two: it shows the language you are reading in and switches
 * to the other. Two buttons spent twice the width to say the same thing, and
 * on a phone that width comes out of the section index.
 */
export function LangControl({
  lang,
  toggle,
  label,
}: {
  lang: Lang
  toggle: () => void
  label: string
}) {
  const other: Lang = lang === 'de' ? 'en' : 'de'
  return (
    <button
      type="button"
      onClick={toggle}
      title={`${label} → ${other.toUpperCase()}`}
      aria-label={`${label} → ${other.toUpperCase()}`}
      className={CONTROL}
    >
      <Flag lang={lang} />
    </button>
  )
}

/** Sun or moon — whichever theme the button would switch you to. */
export function ThemeControl({
  theme,
  toggle,
  label,
}: {
  theme: Theme
  toggle: () => void
  label: string
}) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={CONTROL}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[15px] w-[15px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  )
}
