import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { about, contact, profile, projects, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { useScrollChain } from '../../lib/scroll-chain'
import { useTheme } from '../../lib/theme'
import { LangControl, ThemeControl } from './Controls'
import { About, Contact, Experience, Footer, Hero, Projects, Skills } from './Sections'

type Panel = { id: string; label: string; node: ReactNode }

/** Which section is open, and which edge the reader arrives at it from. */
type View = { id: string; land: 'top' | 'bottom' | 'smooth-top' }

/**
 * The masthead and the section index.
 *
 * One section is open at a time — a CV read on a phone as a single document ran
 * past four screens, and the end of a document nobody scrolls to has not been
 * read. The index is the navigation; the reader picks the section instead of
 * paging through everything to reach it.
 *
 * Scrolling still works the way a single document does, though: pushing past
 * the bottom of a section opens the next one at its top, and pushing past the
 * top opens the previous one at its bottom — so scrolling back up carries on
 * reading rather than skipping a screen.
 */
export function Shell() {
  const { lang, toggle, t } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()

  const panels = useMemo<Panel[]>(
    () => [
      { id: 'top', label: t(ui.tabs.start), node: <Hero /> },
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

  // The open section, and the edge it should be entered from — one value,
  // because the two are decided together and applied together.
  const [view, setView] = useState<View>(() => {
    // A shared link like /#experience has to open that section, not the start.
    const hash = window.location.hash.slice(1)
    const deep = ['about', 'experience', 'skills', 'projects', 'contact']
    return { id: deep.includes(hash) ? hash : 'top', land: 'top' }
  })
  const active = view.id

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1)
      if (hash && known(hash)) setView({ id: hash, land: 'smooth-top' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [known])

  const select = useCallback(
    (id: string, land: View['land'] = 'smooth-top') => {
      if (id === active) return
      setView({ id, land })
      // replaceState, not a hash assignment: the URL should stay shareable
      // without stacking a history entry for every section the reader opens.
      history.replaceState(null, '', id === 'top' ? './' : `#${id}`)
    },
    [active],
  )

  // The new section is entered from the chosen edge, once it has rendered —
  // its height is not a real number until then.
  useLayoutEffect(() => {
    const land = view.land
    if (land === 'smooth-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // Instant, not smooth: the reader is mid-gesture, and animating the jump
    // would land them somewhere they did not aim at. Two frames — one for the
    // commit, one for layout — before the bottom is a real number.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.scrollTo({
          top:
            land === 'bottom'
              ? document.documentElement.scrollHeight - window.innerHeight
              : 0,
          behavior: 'auto',
        })
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [view])

  const index = panels.findIndex((p) => p.id === active)
  const current = panels[index] ?? panels[0]
  const next = panels[index + 1]
  const prev = panels[index - 1]

  // Forward lands at the top of the next section, backward at the foot of the
  // previous one — the position the reader would have been at had it all been
  // one page.
  useScrollChain({
    onNext: () => {
      if (!next) return false
      select(next.id, 'top')
      return true
    },
    onPrev: () => {
      if (!prev) return false
      select(prev.id, 'bottom')
      return true
    },
  })

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

        {/* Says what is below, and is the thing scrolling past the bottom
            reaches — the chaining is invisible otherwise. */}
        {next && (
          <div className="px-5 pb-12 sm:px-8">
            <button
              type="button"
              onClick={() => select(next.id, 'top')}
              className="group flex w-full items-center gap-4 border-t border-line pt-5 text-left"
            >
              <span className="eyebrow text-dim">{t(ui.next)}</span>
              <span className="display text-[1.375rem] text-text transition-colors group-hover:text-p-ink">
                {next.label}
              </span>
              <span
                aria-hidden="true"
                className="eyebrow ml-auto text-p-ink transition-transform group-hover:translate-y-0.5"
              >
                ↓
              </span>
            </button>
          </div>
        )}
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
