import type { Lang } from '../../content/resume'

/* Drawn rather than 🇩🇪/🇬🇧: Windows renders emoji flags as bare letter pairs,
 * so the emoji would silently degrade to "DE"/"US" on the machine this is
 * built on. Both are drawn into the same box so the two buttons sit level. */
function Flag({ lang }: { lang: Lang }) {
  const box = 'block h-[11px] w-4 shrink-0 rounded-[1px] ring-1 ring-c-line/80'

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

/** The language switch: two codes, each over its flag. */
export function LangControl({
  lang,
  setLang,
  label,
}: {
  lang: Lang
  setLang: (l: Lang) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      {(['de', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`flex flex-col items-center gap-1 rounded px-1.5 py-1 font-mono text-[0.625rem] uppercase transition-all ${
            lang === code
              ? 'text-c-text opacity-100'
              : 'text-c-dim opacity-45 hover:opacity-80'
          }`}
        >
          {code}
          <Flag lang={code} />
        </button>
      ))}
    </div>
  )
}
