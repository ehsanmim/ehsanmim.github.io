import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { about, contact, projects, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { LangControl } from './Controls'
import {
  CodeAbout,
  CodeContact,
  CodeExperience,
  CodeHero,
  CodeProjects,
  CodeSkills,
} from './CodeLook'

type Tab = { id: string; file: string; panel: ReactNode }

/**
 * The whole code look as one editor window: a tab strip and exactly one open
 * file.
 *
 * The point is vertical: as a single scrolling document this look ran past four
 * phone screens, and a CV nobody scrolls to the end of has not been read. One
 * panel at a time means the reader chooses what to open instead of paging
 * through everything to reach it.
 */
export function CodeShell() {
  const { lang, toggle, t } = useLang()
  const tabs = useMemo<Tab[]>(
    () => [
      { id: 'top', file: t(ui.tabs.start), panel: <CodeHero /> },
      { id: 'about', file: t(about.eyebrow), panel: <CodeAbout /> },
      { id: 'experience', file: t(ui.sections.experience), panel: <CodeExperience /> },
      { id: 'skills', file: t(ui.sections.skills), panel: <CodeSkills /> },
      ...(projects.length
        ? [{ id: 'projects', file: t(ui.sections.projects), panel: <CodeProjects /> }]
        : []),
      { id: 'contact', file: t(contact.eyebrow), panel: <CodeContact /> },
    ],
    // The tab names are translated, so they have to be rebuilt on a language
    // change — the ids they are keyed by deliberately are not.
    [t],
  )

  const known = useCallback(
    (id: string) => tabs.some((t) => t.id === id),
    [tabs],
  )

  // A shared link like /#experience has to open that file, not land on readme.
  const [active, setActive] = useState(() => {
    const hash = window.location.hash.slice(1)
    return hash && tabs.some((t) => t.id === hash) ? hash : 'top'
  })

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1)
      if (hash && known(hash)) setActive(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [known])

  const select = (id: string) => {
    setActive(id)
    // replaceState, not a hash assignment: the URL should stay shareable
    // without stacking a history entry for every tab the reader tries.
    history.replaceState(null, '', id === 'top' ? './' : `#${id}`)
  }

  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div className="mx-auto max-w-4xl px-2 pt-3 pb-8 sm:px-6 sm:pt-10">
      <div className="overflow-hidden rounded-lg border border-c-line bg-c-panel">
        {/* No traffic lights: on a phone three decorative dots cost a fifth
            of the row that the tab names need. */}
        <div className="flex items-center gap-2 border-b border-c-line bg-c-bg/70 pr-2 pl-1">
          {/* Scrolls sideways rather than wrapping: a second row of tabs would
              push the content itself off the first screen. */}
          <div
            role="tablist"
            className="scrollbar-none flex min-w-0 flex-1 overflow-x-auto"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => select(tab.id)}
                // The active tab is lifted out of the strip the way an editor
                // does it: panel-coloured, brighter text, a rule along the top.
                className={`shrink-0 border-t-2 px-3 py-2.5 font-mono text-[0.8125rem] transition-colors ${
                  active === tab.id
                    ? 'border-c-ok bg-c-panel font-medium text-c-text'
                    : 'border-transparent text-c-dim hover:bg-c-line/40 hover:text-c-text'
                }`}
              >
                {tab.file}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center pl-2">
            <LangControl lang={lang} toggle={toggle} label={t(ui.langLabel)} />
          </div>
        </div>

        <div
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
          // Keyed so each tab mounts fresh — the reveal animations replay and
          // the experience folds reset to their default state.
          key={current.id}
        >
          {current.panel}
        </div>
      </div>
    </div>
  )
}
