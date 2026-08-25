import { useEffect, useMemo, useState } from 'react'
import { nav, profile, ui } from '../../content/resume'
import { useActiveSection } from '../../lib/hooks'
import { useLang } from '../../lib/lang-context'
import { useLook } from '../../lib/look-context'

/** Section ids read as files here — the nav is an editor tab bar. */
const FILES: Record<string, string> = {
  about: 'about.ts',
  experience: 'experience.ts',
  skills: 'skills.json',
  projects: 'projects.md',
  contact: 'contact.sh',
}

export function CodeNav() {
  const { lang, setLang, t } = useLang()
  const { toggle } = useLook()
  const ids = useMemo(() => nav.map((n) => n.id), [])
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-c-line bg-c-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <a
          href="#top"
          className="shrink-0 font-mono text-xs text-c-dim transition-colors hover:text-c-ok"
        >
          <span className="text-c-ok">~</span>/{profile.name.split(' ')[0].toLowerCase()}
        </a>

        {/* Tabs scroll horizontally on narrow screens rather than wrapping into
            a second row that would double the height of a fixed bar. */}
        <nav className="hidden min-w-0 flex-1 gap-1 overflow-x-auto md:flex">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className={`shrink-0 border-b-2 px-3 py-1.5 font-mono text-xs transition-colors ${
                active === item.id
                  ? 'border-c-ok text-c-text'
                  : 'border-transparent text-c-dim hover:text-c-text'
              }`}
            >
              {FILES[item.id] ?? item.id}
            </a>
          ))}
        </nav>

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
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="code-nav"
            aria-label={t(ui.menu)}
            className="text-c-dim transition-colors hover:text-c-text md:hidden"
          >
            {open ? '[x]' : '[≡]'}
          </button>
        </div>
      </div>

      <div
        id="code-nav"
        className={`overflow-hidden border-t border-c-line transition-[max-height] duration-300 md:hidden ${
          open ? 'max-h-80' : 'max-h-0 border-t-transparent'
        }`}
      >
        <nav className="flex flex-col px-4 py-1 sm:px-6">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="border-b border-c-line py-3 font-mono text-xs text-c-dim last:border-b-0 hover:text-c-text"
            >
              {FILES[item.id] ?? item.id}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
