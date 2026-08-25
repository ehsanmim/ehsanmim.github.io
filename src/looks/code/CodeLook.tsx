import {
  about,
  contact,
  education,
  experience,
  languages,
  period,
  profile,
  projects,
  skills,
  ui,
} from '../../content/resume'
import { useState } from 'react'
import { useLang } from '../../lib/lang-context'
import { Reveal } from '../../lib/reveal'
import { C } from './primitives'
import { DiffLines, Dot, SkillRow, Tag, Timeline } from './visuals'


/* ── hero: a terminal session ─────────────────────────────────────────────── */

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <span>
      <span className="text-c-ok">$</span> <span className="text-c-text">{children}</span>
    </span>
  )
}

/** Every panel's padding, in one place. The shell draws the frame. */
function Panel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="p-4 sm:p-6">
      {children}
    </div>
  )
}

export function CodeHero() {
  const { t } = useLang()

  return (
    <Panel id="top">
      <Reveal>
        <div className="space-y-1 font-mono text-[0.8125rem] leading-[1.85]">
            <div>
              <Prompt>whoami</Prompt>
            </div>
            <div className="text-c-ok">
              {profile.name} — {t(profile.role)}
            </div>

            <div className="pt-2">
              <Prompt>cat intro.txt</Prompt>
            </div>
            <p className="max-w-2xl text-c-text">{t(profile.intro)}</p>

            {/* The metrics as a single row rather than three lines: on a phone
                the stacked version cost a third of the first screen. */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3">
              {profile.facts.map((fact) => (
                <span key={fact.value} className="flex items-baseline gap-2">
                  <span className="text-c-num">{fact.value}</span>
                  <span className="text-[0.6875rem] text-c-dim">{t(fact.label)}</span>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
              <a
                href={`mailto:${profile.email}`}
                className="text-c-str underline underline-offset-4 transition-colors hover:text-c-ok"
              >
                {profile.email}
              </a>
              {profile.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-c-dim transition-colors hover:text-c-text"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3">
              <Prompt>
                <span className="text-c-dim">
                  {t(profile.availability).toLowerCase()}
                </span>
              </Prompt>
              <span className="caret inline-block h-4 w-2 bg-c-ok align-middle" />
            </div>
        </div>
      </Reveal>
    </Panel>
  )
}

/* ── about.ts: a doc comment, set as prose ────────────────────────────────── */

export function CodeAbout() {
  const { t } = useLang()

  return (
    <Panel id="about">
      <Reveal>
        <div>

          {/* Prose, not quoted string literals on numbered lines: a paragraph
              broken into "…" fragments with hanging indents reads as noise,
              and the point of this section is that it gets read. The comment
              delimiters carry the file metaphor on their own. */}
          <div className="font-mono text-[0.8125rem] leading-relaxed">
            <p className="text-c-dim/70">/**</p>
            <div className="my-2 space-y-3 border-l-2 border-c-dim/25 pl-4">
              <p className="text-c-text">{t(about.heading)}</p>
              {t(about.body).map((para) => (
                <p key={para.slice(0, 24)} className="text-c-dim italic">
                  {para}
                </p>
              ))}
            </div>
            <p className="text-c-dim/70">*/</p>
          </div>
        </div>
      </Reveal>
    </Panel>
  )
}

/* ── experience: a timeline bar + foldable entries ────────────────────────── */

/** Stable per-job key, shared by the timeline bar and its entry. */
const jobId = (job: { company: string; start: string | null }) =>
  `${job.company}-${job.start ?? 'undated'}`

export function CodeExperience() {
  const { t, lang } = useLang()
  const present = t(ui.present)
  // Hovering an entry's years holds its bar in the timeline and fades the rest.
  const [activeId, setActiveId] = useState<string | null>(null)

  // One chart, two bands: work above the rule, studies below it.
  const workSpans = experience.map((job) => ({
    id: jobId(job),
    label: job.company,
    start: job.start,
    end: job.end,
  }))
  const studySpans = education
    .filter((e) => e.chart !== false)
    .map((e) => ({
      id: `edu-${e.what.de}`,
      // The qualification, not the institution: "B.Sc. Maschinenbau" says
      // what the years bought; the university's full legal name does not,
      // and at 65 characters it only ever showed as a clipped fragment.
      label: t(e.what),
      short: e.short,
      start: e.start ?? null,
      end: e.end,
    }))

  return (
    <Panel id="experience">
      <Reveal>
        <div className="mb-6 rounded-lg border border-c-line bg-c-panel p-4 sm:p-5">
          <Timeline
            groups={[
              { key: 'work', spans: workSpans },
              { key: 'study', spans: studySpans, muted: true },
            ]}
            presentLabel={present}
            activeId={activeId}
            onHover={setActiveId}
          />
        </div>
      </Reveal>

      {/* <details> rather than React state: it folds without JS, it is
          keyboard- and screen-reader-correct for free, and the current role is
          the only one open — which is what makes this fit on a phone. */}
      <ul className="space-y-2">
        {experience.map((job, i) => (
          <Reveal as="li" key={`${job.company}-${job.start}`} delay={i * 60}>
            <details
              open={i === 0}
              onMouseEnter={() => setActiveId(jobId(job))}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(jobId(job))}
              onBlur={() => setActiveId(null)}
              className={`group overflow-hidden rounded-lg border bg-c-panel transition-colors duration-200 ${
                activeId === jobId(job)
                  ? 'border-c-ok/70 bg-c-line/20'
                  : 'border-c-line hover:border-c-ok/40'
              }`}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-c-line/30">
                <span
                  aria-hidden="true"
                  className="text-c-dim transition-transform duration-200 group-open:rotate-90"
                >
                  ▸
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[0.8125rem] text-c-text">
                    {t(job.role)}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[0.6875rem] text-c-dim">
                    <span className="text-c-str">{job.company}</span>
                    <span>·</span>
                    <span className="text-c-num">{period(job, lang, present)}</span>
                    <span>·</span>
                    <span>{t(job.location)}</span>
                  </span>
                </span>
                {/* Collapsed, the stack is still legible as colour alone. */}
                <span className="flex shrink-0 gap-1">
                  {job.stack.slice(0, 5).map((tech) => (
                    <Dot key={tech} name={tech} />
                  ))}
                </span>
              </summary>

              <div className="space-y-3 border-t border-c-line px-4 py-4">
                {t(job.bullets).length > 0 ? (
                  <DiffLines lines={t(job.bullets)} />
                ) : (
                  <p className="font-mono text-[0.75rem] text-c-dim italic">
                    {t(ui.noDetail)}
                  </p>
                )}
                {job.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.stack.map((tech) => (
                      <Tag key={tech} name={tech} />
                    ))}
                  </div>
                )}
              </div>
            </details>
          </Reveal>
        ))}
      </ul>

      <Reveal className="mt-4">
        <div className="rounded-lg border border-c-line bg-c-panel px-4 py-3 font-mono text-[0.75rem]">
          <span className="text-c-dim">
            <C># {t(ui.sections.education).toLowerCase()}</C>
          </span>
          {education.map((e) => (
            // Same highlight contract as a job card: hovering the row holds
            // its bar in the lower band of the chart.
            <div
              key={t(e.what)}
              {...(e.chart === false
                ? {}
                : {
                    tabIndex: 0,
                    onMouseEnter: () => setActiveId(`edu-${e.what.de}`),
                    onMouseLeave: () => setActiveId(null),
                    onFocus: () => setActiveId(`edu-${e.what.de}`),
                    onBlur: () => setActiveId(null),
                  })}
              className={`-mx-2 mt-1 flex flex-wrap gap-x-2 rounded px-2 py-1 transition-colors ${
                e.chart === false
                  ? ''
                  : activeId === `edu-${e.what.de}`
                    ? 'bg-c-line/60'
                    : 'hover:bg-c-line/40'
              }`}
            >
              <span className="text-c-text">{t(e.what)}</span>
              {e.where && <span className="text-c-dim">· {e.where}</span>}
              <span className="text-c-num">
                ·{' '}
                {period(e, lang, present)}
              </span>
              {t(e.note) && <span className="text-c-dim">· {t(e.note)}</span>}
            </div>
          ))}
        </div>
      </Reveal>
    </Panel>
  )
}

/* ── skills: the CV's own ratings, plus languages ─────────────────────────── */

export function CodeSkills() {
  const { t } = useLang()

  return (
    <Panel id="skills">
      <div className="grid gap-2 sm:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal key={t(group.group)} delay={i * 50}>
            <div className="h-full rounded-lg border border-c-line bg-c-panel p-4">
              <div className="font-mono text-[0.6875rem] text-c-dim">
                <span className="text-c-key">const</span>{' '}
                <span className="text-c-fn">
                  {t(group.group).toLowerCase().replace(/[^a-z]+/g, '_')}
                </span>
              </div>
              <ul className="mt-2 divide-y divide-c-line/60">
                {group.items.map((item) => (
                  <SkillRow key={item.name} name={item.name} level={item.level} />
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={220} className="mt-2">
        <p className="px-1 font-mono text-[0.6875rem] text-c-dim/70">
          <C>// {t(ui.levelNote)}</C>
        </p>
      </Reveal>

      <Reveal delay={260} className="mt-4">
        <div className="rounded-lg border border-c-line bg-c-panel p-4">
          <div className="font-mono text-[0.6875rem] text-c-dim">
            <span className="text-c-key">const</span>{' '}
            <span className="text-c-fn">{t(ui.sections.languages).toLowerCase()}</span>
          </div>
          <ul className="mt-2 divide-y divide-c-line/60">
            {languages.map((l) => (
              <li key={t(l.name)} className="flex flex-wrap items-baseline gap-x-3 py-1.5">
                <span className="font-mono text-[0.75rem] text-c-text">{t(l.name)}</span>
                <span className="rounded bg-c-ok/10 px-1.5 font-mono text-[0.6875rem] text-c-ok">
                  {t(l.level)}
                </span>
                {t(l.note) && (
                  <span className="font-mono text-[0.6875rem] text-c-dim">
                    {t(l.note)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Panel>
  )
}

/* ── projects: compact cards ──────────────────────────────────────────────── */

export function CodeProjects() {
  const { t } = useLang()

  return (
    <Panel id="projects">
      <ul className="grid gap-2 sm:grid-cols-2">
        {projects.map((project, i) => {
          const Tag_ = project.href ? 'a' : 'div'
          return (
            <Reveal as="li" key={project.name} delay={i * 60}>
              <Tag_
                {...(project.href
                  ? { href: project.href, target: '_blank', rel: 'noreferrer' }
                  : {})}
                className="block h-full rounded-lg border border-c-line bg-c-panel p-4 transition-colors hover:border-c-ok/40"
              >
                <div className="flex items-center gap-2">
                  <Dot name={project.stack[0] ?? ''} />
                  <span className="font-mono text-[0.8125rem] text-c-text">
                    {project.name}
                  </span>
                  <span className="ml-auto font-mono text-[0.6875rem] text-c-dim">
                    {project.year}
                  </span>
                </div>
                {/* Clamped: three cards of full prose is the wall this look
                    was accused of, and the detail belongs in a conversation. */}
                <p className="mt-2 line-clamp-3 text-[0.75rem] leading-relaxed text-c-dim">
                  {t(project.blurb)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Tag key={tech} name={tech} />
                  ))}
                </div>
              </Tag_>
            </Reveal>
          )
        })}
      </ul>
    </Panel>
  )
}

/* ── contact.sh ───────────────────────────────────────────────────────────── */

export function CodeContact() {
  const { t } = useLang()

  return (
    <Panel id="contact">
      <Reveal>
        <div>
          <div className="font-mono text-[0.8125rem]">
            <div className="text-c-dim italic"># {t(contact.body)}</div>
            <div className="mt-2">
              <span className="text-c-fn">mail</span>{' '}
              <span className="text-c-dim">-s</span>{' '}
              <span className="text-c-str">&quot;{t(contact.heading)}&quot;</span>{' '}
              <span className="text-c-str">{profile.email}</span>
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="group mt-4 inline-flex items-center gap-2 rounded border border-c-line px-4 py-2.5 text-xs text-c-text transition-colors hover:border-c-ok hover:text-c-ok"
            >
              <span className="text-c-ok">$</span>
              {t(contact.cta).toLowerCase()}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </Reveal>
    </Panel>
  )
}

export function CodeFooter() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-c-line">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-[0.6875rem] text-c-dim sm:px-6">
        <span>
          # © {year} {profile.name}. {t(ui.rights)}
        </span>
        <div className="flex items-center gap-5">
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-c-ok"
            >
              {link.label}
            </a>
          ))}
          <a href="#top" className="transition-colors hover:text-c-ok">
            {t(ui.toTop).toLowerCase()} ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
