import { useEffect, useMemo, useState } from 'react'
import { nav, profile, ui } from '../../content/resume'
import { useActiveSection, useScrolled } from '../../lib/hooks'
import { useLang } from '../../lib/lang-context'
import { useLook } from '../../lib/look-context'

export function Nav() {
  const { lang, setLang, t } = useLang()
  const { toggle: toggleLook } = useLook()
  const ids = useMemo(() => nav.map((n) => n.id), [])
  const active = useActiveSection(ids)
  const scrolled = useScrolled(32)
  const [open, setOpen] = useState(false)

  // A menu that survives the navigation it triggered would cover the target.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-rule bg-paper/85 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="display text-xl tracking-tight text-ink transition-colors hover:text-accent"
        >
          {profile.name.split(' ')[0]}
          <span className="text-accent">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className={`relative text-sm transition-colors ${
                active === item.id
                  ? 'text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t(item.label)}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300 ${
                  active === item.id ? 'w-full' : 'w-0'
                }`}
              />
            </a>
          ))}
          <LookSwitch onClick={toggleLook} />
          <LangSwitch lang={lang} setLang={setLang} label={t(ui.langLabel)} />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <LookSwitch onClick={toggleLook} />
          <LangSwitch lang={lang} setLang={setLang} label={t(ui.langLabel)} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={t(ui.menu)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`h-px w-5 bg-ink transition-transform duration-300 ${
                open ? 'translate-y-[3.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`h-px w-5 bg-ink transition-transform duration-300 ${
                open ? '-translate-y-[3.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-rule bg-paper/95 backdrop-blur-md transition-[max-height] duration-300 md:hidden ${
          open ? 'max-h-80' : 'max-h-0 border-t-transparent'
        }`}
      >
        <nav className="flex flex-col px-6 py-2">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="border-b border-rule py-3.5 text-sm text-ink-muted last:border-b-0 hover:text-ink"
            >
              {t(item.label)}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

/** Temporary, while both looks exist: swaps the whole skin. */
function LookSwitch({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Switch look"
      className="font-mono text-xs text-ink-faint transition-colors hover:text-accent"
    >
      [code]
    </button>
  )
}

function LangSwitch({
  lang,
  setLang,
  label,
}: {
  lang: 'de' | 'en'
  setLang: (l: 'de' | 'en') => void
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1 text-xs tracking-wide"
    >
      {(['de', 'en'] as const).map((code, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-ink-faint">/</span>}
          <button
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            className={`uppercase transition-colors ${
              lang === code ? 'text-accent' : 'text-ink-faint hover:text-ink-muted'
            }`}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  )
}
