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

/**
 * The CV control: one pill, two actions.
 *
 * The label opens the PDF in a new tab and the icon beside it saves the file —
 * a reader who wants to look and a reader who wants to keep it are after
 * different things, and a single button can only serve one of them. Both point
 * at the document in the language currently being read.
 *
 * The label is hidden on a narrow screen, where the masthead's section index
 * needs the width more than the word does.
 */
export function CvControl({
  href,
  file,
  label,
  view,
  download,
}: {
  href: string
  file: string
  label: string
  view: string
  download: string
}) {
  return (
    <span className="inline-flex h-8 items-stretch overflow-hidden rounded-full border border-line bg-surface">
      <a
        href={href}
        target="_blank"
        rel="noopener"
        title={view}
        className="flex items-center gap-1.5 px-2.5 text-dim transition-colors hover:bg-p-wash hover:text-p-ink sm:pl-3"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[14px] w-[14px] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2.5H7.5A1.5 1.5 0 0 0 6 4v16a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20V6.5z" />
          <path d="M14 2.5V6.5H18" />
          <path d="M9 12.5h6M9 16h4" />
        </svg>
        <span className="eyebrow hidden sm:inline">{label}</span>
      </a>

      {/* A hairline rather than a gap: the two actions stay one object, but the
          reader can see there are two of them. */}
      <span aria-hidden="true" className="w-px shrink-0 self-stretch bg-line" />

      <a
        href={href}
        // The attribute names the saved file, so it does not land in the
        // reader's downloads folder under whatever the server called it.
        download={file}
        title={download}
        aria-label={download}
        className="flex items-center px-2 text-dim transition-colors hover:bg-p-wash hover:text-p-ink"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[14px] w-[14px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3.5v11" />
          <path d="M8 11l4 3.5 4-3.5" />
          <path d="M4.5 18.5v1A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-1" />
        </svg>
      </a>
    </span>
  )
}
