import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { projects } from '../../content/resume'
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
 * The whole code look as one editor window: traffic lights, a tab strip, and
 * exactly one open file.
 *
 * The point is vertical: as a single scrolling document this look ran past four
 * phone screens, and a CV nobody scrolls to the end of has not been read. One
 * panel at a time means the reader chooses what to open instead of paging
 * through everything to reach it.
 */
export function CodeShell() {
  const tabs = useMemo<Tab[]>(
    () => [
      { id: 'top', file: 'readme.md', panel: <CodeHero /> },
      { id: 'about', file: 'about.ts', panel: <CodeAbout /> },
      { id: 'experience', file: 'experience.ts', panel: <CodeExperience /> },
      { id: 'skills', file: 'skills.json', panel: <CodeSkills /> },
      ...(projects.length
        ? [{ id: 'projects', file: 'projects.md', panel: <CodeProjects /> }]
        : []),
      { id: 'contact', file: 'contact.sh', panel: <CodeContact /> },
    ],
    [],
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
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-10 sm:px-6 sm:pt-24">
      <div className="overflow-hidden rounded-lg border border-c-line bg-c-panel">
        <div className="flex items-center gap-3 border-b border-c-line pr-3">
          <span className="flex shrink-0 gap-1.5 py-3 pl-4" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>

          {/* Scrolls sideways rather than wrapping: a second row of tabs would
              push the content itself off the first screen. */}
          <div
            role="tablist"
            className="scrollbar-none -mb-px flex min-w-0 flex-1 overflow-x-auto"
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
                className={`shrink-0 border-b-2 px-3 py-3 font-mono text-xs transition-colors ${
                  active === tab.id
                    ? 'border-c-ok bg-c-bg/40 text-c-text'
                    : 'border-transparent text-c-dim hover:text-c-text'
                }`}
              >
                {tab.file}
              </button>
            ))}
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
