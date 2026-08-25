import { profile, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { useLook } from '../../lib/look-context'

/**
 * The top bar: identity and the two switches, nothing else.
 *
 * Section navigation lives in the editor's tab strip (CodeShell) rather than
 * here — two rows of tabs would be two ways to do one thing, and on a phone
 * the fixed bar would cost twice the height.
 */
export function CodeNav() {
  const { lang, setLang, t } = useLang()
  const { toggle } = useLook()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-c-line bg-c-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <a
          href="#top"
          className="shrink-0 font-mono text-xs text-c-dim transition-colors hover:text-c-ok"
        >
          <span className="text-c-ok">~</span>/{profile.name.split(' ')[0].toLowerCase()}
        </a>

        <div className="flex shrink-0 items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={toggle}
            title="Switch look"
            className="text-c-dim transition-colors hover:text-c-ok"
          >
            [look]
          </button>
          <span className="text-c-line">|</span>
          {(['de', 'en'] as const).map((code, i) => (
            <span key={code} className="flex items-center gap-1">
              {i > 0 && <span className="text-c-line">/</span>}
              <button
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                aria-label={`${t(ui.langLabel)}: ${code}`}
                className={`uppercase transition-colors ${
                  lang === code ? 'text-c-ok' : 'text-c-dim hover:text-c-text'
                }`}
              >
                {code}
              </button>
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
