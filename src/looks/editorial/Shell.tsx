import { useEffect, useMemo, useRef } from 'react'
import { about, contact, profile, projects, ui } from '../../content/resume'
import { useActiveSection, useHashScroll } from '../../lib/hooks'
import { useLang } from '../../lib/lang-context'
import { useTheme } from '../../lib/theme'
import { LangControl, ThemeControl } from './Controls'
import { About, Contact, Experience, Footer, Hero, Projects, Skills } from './Sections'

/**
 * The masthead and the section index.
 *
 * One continuous document: every section is on the page and the reader scrolls
 * through it. The index at the top is navigation rather than a set of tabs —
 * it jumps to a section, and it follows along, marking whichever one is being
 * read.
 */
export function Shell() {
  const { lang, toggle, t } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()
  useHashScroll()

  const entries = useMemo(
    () => [
      { id: 'top', label: t(ui.tabs.start) },
      { id: 'about', label: t(about.eyebrow) },
      { id: 'experience', label: t(ui.sections.experience) },
      { id: 'skills', label: t(ui.sections.skills) },
      ...(projects.length ? [{ id: 'projects', label: t(ui.sections.projects) }] : []),
      { id: 'contact', label: t(contact.eyebrow) },
    ],
    // The labels are translated, so they are rebuilt on a language change — the
    // ids they are keyed by deliberately are not.
    [t],
  )

  const ids = useMemo(() => entries.map((e) => e.id), [entries])
  const active = useActiveSection(ids)

  // On a phone the index scrolls sideways, so the entry it is marking has to be
  // brought into view — otherwise the mark is on something off-screen.
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const box = nav.current
    const mark = box?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!box || !mark || box.scrollWidth <= box.clientWidth) return
    box.scrollTo({
      left: mark.offsetLeft - box.clientWidth / 2 + mark.clientWidth / 2,
      behavior: 'smooth',
    })
  }, [active])

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
    // replaceState, not a hash assignment: the URL stays shareable without
    // stacking a history entry for every section the reader passes.
    history.replaceState(null, '', id === 'top' ? './' : `#${id}`)
  }

  return (
    <>
      {/* Sticky, and translucent over the page: the index has to stay reachable
          from the middle of a long section without costing a fixed strip of a
          phone's screen. */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="flex items-center gap-3 py-3">
            <button
              type="button"
              onClick={() => go('top')}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              {/* Initials in place of a photograph — the CV supplies no
                  portrait, and a generic avatar would say less than nothing. */}
              <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base text-p-ink">
                {initials(profile.name)}
              </span>
              <span className="min-w-0">
                <span className="display block truncate text-lg text-text">
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
              page itself off the first screen. */}
          <nav
            ref={nav}
            aria-label={t(ui.menu)}
            className="scrollbar-none -mx-5 flex overflow-x-auto px-5 sm:-mx-8 sm:px-8"
          >
            {entries.map((entry, i) => {
              const on = entry.id === active
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  onClick={() => go(entry.id)}
                  className={`eyebrow flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 transition-colors first:pl-0 ${
                    on
                      ? 'border-p-ink text-text'
                      : 'border-transparent text-dim hover:text-text'
                  }`}
                >
                  <span className={on ? 'text-p-ink' : 'text-dim/60'}>
                    {String(i).padStart(2, '0')}
                  </span>
                  {entry.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl">
        <Hero />
        <About />
        <Experience />
        <Skills />
        {projects.length > 0 && <Projects />}
        <Contact />
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
