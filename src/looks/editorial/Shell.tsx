import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { about, contact, profile, projects, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { useTheme } from '../../lib/theme'
import { LangControl, ThemeControl } from './Controls'
import { About, Contact, Experience, Footer, Hero, Projects, Skills } from './Sections'

type Panel = { id: string; label: string; node: ReactNode }

/**
 * The masthead and the section index.
 *
 * One section is open at a time, and switching does not scroll — a CV read on a
 * phone as a single document ran past four screens, and the end of a document
 * nobody scrolls to has not been read. The index is the navigation; the reader
 * picks the section instead of paging through everything to reach it.
 */
export function Shell() {
  const { lang, toggle, t } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()

  const panels = useMemo<Panel[]>(
    () => [
      { id: 'top', label: t(ui.tabs.start), node: <Hero onNavigate={(id) => select(id)} /> },
      { id: 'about', label: t(about.eyebrow), node: <About /> },
      { id: 'experience', label: t(ui.sections.experience), node: <Experience /> },
      { id: 'skills', label: t(ui.sections.skills), node: <Skills /> },
      ...(projects.length
        ? [{ id: 'projects', label: t(ui.sections.projects), node: <Projects /> }]
        : []),
      { id: 'contact', label: t(contact.eyebrow), node: <Contact /> },
    ],
    // The labels are translated, so they are rebuilt on a language change — the
    // ids they are keyed by deliberately are not.
    [t],
  )

  const known = useCallback((id: string) => panels.some((p) => p.id === id), [panels])

  // A shared link like /#experience has to open that section, not the start.
  const [active, setActive] = useState(() => {
    const hash = window.location.hash.slice(1)
    return hash && ['about', 'experience', 'skills', 'projects', 'contact'].includes(hash)
      ? hash
      : 'top'
  })

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1)
      if (hash && known(hash)) setActive(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [known])

  function select(id: string) {
    setActive(id)
    // replaceState, not a hash assignment: the URL should stay shareable
    // without stacking a history entry for every section the reader opens.
    history.replaceState(null, '', id === 'top' ? './' : `#${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const current = panels.find((p) => p.id === active) ?? panels[0]

  return (
    <>
      {/* Sticky, and translucent over the page: the index has to stay reachable
          from the bottom of a long section without costing a fixed strip of a
          phone's screen. */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="flex items-center gap-3 py-3">
            <button
              type="button"
              onClick={() => select('top')}
              className="group flex min-w-0 items-center gap-3 text-left"
            >
              {/* Initials in place of a photograph — the CV supplies no
                  portrait, and a generic avatar would say less than nothing. */}
              <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[0.9375rem] text-p-ink">
                {initials(profile.name)}
              </span>
              <span className="min-w-0">
                <span className="display block truncate text-[1.0625rem] text-text">
                  {profile.name}
                </span>
                <span className="meta block truncate text-dim">{t(profile.role)}</span>
              </span>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <ThemeControl theme={theme} toggle={toggleTheme} label={t(ui.themeLabel)} />
              <LangControl lang={lang} toggle={toggle} label={t(ui.langLabel)} />
            </div>
          </div>

          {/* Scrolls sideways rather than wrapping: a second row would push the
              section itself off the first screen. */}
          <nav
            aria-label={t(ui.menu)}
            className="scrollbar-none -mx-5 flex overflow-x-auto px-5 sm:-mx-8 sm:px-8"
          >
            {panels.map((panel, i) => {
              const on = panel.id === active
              return (
                <button
                  key={panel.id}
                  type="button"
                  aria-current={on ? 'page' : undefined}
                  onClick={() => select(panel.id)}
                  className={`eyebrow group flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 transition-colors first:pl-0 ${
                    on
                      ? 'border-p-ink text-text'
                      : 'border-transparent text-dim hover:text-text'
                  }`}
                >
                  <span className={on ? 'text-p-ink' : 'text-dim/60'}>
                    {String(i).padStart(2, '0')}
                  </span>
                  {panel.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl">
        {/* Keyed so each section mounts fresh — the reveals replay and the
            unfolded commits reset. */}
        <div key={current.id}>{current.node}</div>
      </main>
      <Footer />
    </>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
