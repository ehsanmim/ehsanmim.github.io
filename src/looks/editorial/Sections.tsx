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
import { useState, type ReactNode } from 'react'
import { useLang } from '../../lib/lang-context'
import { Reveal } from '../../lib/reveal'
import { CommitGraph, type Commit, type Lane } from './CommitGraph'
import { Dot, Points, Tag } from './visuals'

/* ── the editorial furniture ──────────────────────────────────────────────── */

/**
 * Every section is headed the same way: a numbered label out in the left
 * margin, a display line, a rule. On a phone the margin folds up above the
 * heading rather than squeezing the column.
 */
function Section({
  id,
  n,
  label,
  heading,
  children,
}: {
  id: string
  n: string
  label: string
  heading: string
  children: ReactNode
}) {
  return (
    <section id={id} className="px-5 pt-8 pb-14 sm:px-8">
      <Reveal>
        <header className="mb-8">
          <div className="grid gap-2 md:grid-cols-[7rem_1fr] md:gap-8">
            <div className="eyebrow flex items-center gap-2 text-dim md:pt-2.5">
              <span className="text-p-ink">{n}</span>
              <span aria-hidden="true" className="h-px w-4 bg-line md:hidden" />
              <span>{label}</span>
            </div>
            <h2 className="display text-[2rem] text-text sm:text-[2.5rem]">{heading}</h2>
          </div>
          <div className="rule mt-6" />
        </header>
      </Reveal>
      <div className="md:grid md:grid-cols-[7rem_1fr] md:gap-8">
        <div aria-hidden="true" />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

/* ── start ────────────────────────────────────────────────────────────────── */

export function Hero() {
  const { t } = useLang()

  return (
    <div id="top" className="px-5 pt-10 pb-14 sm:px-8 sm:pt-14">
      <Reveal>
        <p className="eyebrow flex items-center gap-3 text-dim">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="pulse absolute inset-0 rounded-full" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-p-ink" />
          </span>
          {t(profile.availability)}
        </p>
      </Reveal>

      {/* The headline is written as three lines in the content file, and it is
          set as three lines — the break is the design, not the container's. */}
      <Reveal delay={60}>
        <h1 className="display mt-5 text-[2.75rem] text-text sm:text-[4.25rem]">
          {t(profile.headline).map((line, i) => (
            <span key={line} className="block">
              {i === 2 ? <em className="text-p-ink not-italic">{line}</em> : line}
            </span>
          ))}
        </h1>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-8 grid gap-8 md:grid-cols-[7rem_1fr] md:gap-8">
          <div className="eyebrow text-dim md:pt-1.5">{t(profile.location)}</div>
          <p className="max-w-xl text-[1.0625rem] leading-relaxed text-dim">
            {t(profile.intro)}
          </p>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-p-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            {t(ui.hero.mailCta)}
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          {/* An ordinary hash link: the shell listens for the hash and opens
              that section, so this works before hydration and in a new tab. */}
          <a
            href="#experience"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-text transition-colors hover:border-p-ink/50 hover:text-p-ink"
          >
            {t(ui.hero.viewWork)}
          </a>
        </div>
      </Reveal>

      {/* The two figures the CV actually carries, set as a masthead strip. */}
      <Reveal delay={240}>
        <dl className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {profile.facts.map((fact) => (
            <div key={fact.value} className="bg-surface px-5 py-4">
              <dt className="eyebrow text-dim">{t(fact.label)}</dt>
              <dd className="display mt-1.5 text-3xl text-text">{fact.value}</dd>
            </div>
          ))}
          <div className="bg-surface px-5 py-4">
            <dt className="eyebrow text-dim">E-Mail</dt>
            <dd className="mt-2">
              <a
                href={`mailto:${profile.email}`}
                className="link-underline text-sm break-all text-p-ink"
              >
                {profile.email}
              </a>
            </dd>
          </div>
        </dl>
      </Reveal>
    </div>
  )
}

/* ── about ────────────────────────────────────────────────────────────────── */

export function About() {
  const { t } = useLang()
  const [lede, ...rest] = t(about.body)

  return (
    <Section id="about" n="01" label={t(about.eyebrow)} heading={t(about.heading)}>
      <Reveal>
        {/* A pull-lede in display type, then the body at reading size. The
            first paragraph is the one that gets read; it is set like it. */}
        <p className="display max-w-2xl text-[1.5rem] leading-snug text-text sm:text-[1.75rem]">
          {lede}
        </p>
        {rest.length > 0 && (
          <div className="mt-6 max-w-2xl space-y-4 text-[0.9375rem] leading-relaxed text-dim">
            {rest.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="link-underline meta text-p-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

/* ── experience: the history as a commit graph ────────────────────────────── */

/** The graph's own lane colours, for the legend that stands above it, and the
 *  lane each branch name stands for. Work is one branch: splitting the running
 *  job onto a second lane made two labels out of one idea. */
const BRANCHES = [
  { name: 'main', lane: 0 as Lane, color: 'var(--color-p-ink)' },
  { name: 'edu', lane: 2 as Lane, color: 'var(--color-edu)' },
] as const

export function Experience() {
  const { t, lang } = useLang()
  const present = t(ui.present)
  // Solo, as a mixer does it: one branch at a time, and clicking the one that
  // is already soloed puts the rest back.
  const [solo, setSolo] = useState<Lane | null>(null)

  // Work on main, studies on edu — newest first, in `git log` order.
  const commits: (Commit & { sort: string })[] = [
    ...experience.map((job) => ({
      id: `${job.company}-${job.start ?? 'undated'}`,
      lane: 0 as Lane,
      sort: job.start ?? job.end ?? '0000-00',
      when: period(job, lang, present),
      title: t(job.role),
      where: job.company,
      meta: t(job.location),
      stack: job.stack,
      head: job.end === null,
      body: t(job.bullets).length > 0 ? <Points lines={t(job.bullets)} /> : undefined,
    })),
    ...education.map((e) => ({
      id: `edu-${e.what.de}`,
      lane: 2 as Lane,
      sort: e.start ?? e.end ?? '0000-00',
      when: period(e, lang, present),
      title: t(e.what),
      where: e.where || undefined,
      meta: t(e.note) || undefined,
    })),
  ].sort((a, b) => b.sort.localeCompare(a.sort))

  // The refs go on the newest entry of each lane, the way `git log` prints
  // them. HEAD is on main, because that is the work that is still going.
  const firstOf = (lane: Lane) => commits.find((c) => c.lane === lane)
  const named: [Lane, string][] = [
    [0, 'HEAD → main'],
    [2, 'edu'],
  ]
  for (const [lane, ref] of named) {
    const commit = firstOf(lane)
    if (commit) commit.ref = ref
  }

  // Refs are worked out on the whole history, so the branch tips keep the names
  // they have in it rather than being handed to whatever survives the filter.
  const shown = solo === null ? commits : commits.filter((c) => c.lane === solo)

  const legend = (
    <>
      <div className="grid gap-2 md:grid-cols-[7rem_1fr] md:gap-8">
        <div className="eyebrow flex items-center gap-2 text-dim md:pt-2.5">
          <span className="text-p-ink">02</span>
          <span aria-hidden="true" className="h-px w-4 bg-line md:hidden" />
          <span>{t(ui.sections.experience)}</span>
        </div>
        <h2 className="display text-[2rem] text-text sm:text-[2.5rem]">
          {t(ui.sections.experienceHeading)}
        </h2>
      </div>
      <div className="rule mt-5" />
      {/* A legend, because the lanes are one thing a reader will not infer —
          and, since it already names the branches, the place to solo one.
          Each branch name is printed in its own lane's colour. */}
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {BRANCHES.map(({ name, lane, color }) => {
          const on = solo === lane
          // Hollow only when another branch is soloed: with nothing soloed the
          // legend should look the way it always did.
          const off = solo !== null && !on
          return (
            <li key={name}>
              <button
                type="button"
                aria-pressed={on}
                title={t(on ? ui.soloOff : ui.soloOn)}
                onClick={() => {
                  setSolo(on ? null : lane)
                  // The track shrinks under the reader when a branch drops out
                  // of it. Back to the top of the section, so the deck reopens
                  // at the newest commit rather than wherever the old scroll
                  // position happens to land in the shorter one.
                  document.getElementById('experience')?.scrollIntoView()
                }}
                className={`meta flex cursor-pointer items-center gap-2 text-dim outline-none transition-opacity hover:opacity-100 focus-visible:underline ${
                  off ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: off ? 'transparent' : color,
                    boxShadow: off ? `inset 0 0 0 1.5px ${color}` : 'none',
                  }}
                />
                <span style={{ color }}>{name}</span>
                <span>{t(ui.branches[name])}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )

  // No <Section> wrapper: the heading, the legend and the deck are pinned
  // together as one screen, so they have to live inside the graph's own track.
  return (
    <section id="experience" className="px-5 sm:px-8">
      <CommitGraph key={solo ?? 'all'} commits={shown} header={legend} />
    </section>
  )
}

/* ── skills ───────────────────────────────────────────────────────────────── */

export function Skills() {
  const { t } = useLang()

  return (
    <Section
      id="skills"
      n="03"
      label={t(ui.sections.skills)}
      heading={t(ui.sections.skillsHeading)}
    >
      {/* Pills, wrapped, rather than a row per skill: sixty skills as a list
          was a column of sixty lines, and the group is the only grouping that
          carries meaning — the order inside it never did. Each group is a full
          measure so the pills reflow, instead of two narrow columns forcing a
          break every three names. */}
      <div className="space-y-6">
        {skills.map((group, i) => (
          <Reveal key={t(group.group)} delay={i * 50}>
            <h3 className="eyebrow text-dim">{t(group.group)}</h3>
            <div className="rule mt-3" />
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item.name}>
                  <Tag name={item.name} label={item.label ? t(item.label) : undefined} />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}

        <Reveal delay={skills.length * 50}>
          <h3 className="eyebrow text-dim">{t(ui.sections.languages)}</h3>
          <div className="rule mt-3" />
          <ul className="mt-4 divide-y divide-line">
            {languages.map((l) => (
              <li key={t(l.name)} className="flex items-center gap-3 py-2">
                <span className="min-w-0 flex-1 truncate text-[0.875rem] text-text">
                  {t(l.name)}
                </span>
                {t(l.note) && (
                  <span className="meta hidden text-dim sm:inline">{t(l.note)}</span>
                )}
                <span className="meta rounded-full bg-p-wash px-2 py-0.5 text-p-ink">
                  {t(l.level)}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}

/* ── projects ─────────────────────────────────────────────────────────────── */

export function Projects() {
  const { t } = useLang()

  return (
    <Section
      id="projects"
      n="04"
      label={t(ui.sections.projects)}
      heading={t(ui.sections.projectsHeading)}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project, i) => {
          const Wrapper = project.href ? 'a' : 'div'
          return (
            <Reveal as="li" key={project.name} delay={i * 60}>
              <Wrapper
                {...(project.href
                  ? { href: project.href, target: '_blank', rel: 'noreferrer' }
                  : {})}
                className="block h-full rounded-xl border border-line bg-surface p-5 transition-colors hover:border-p-ink/50"
              >
                <div className="flex items-baseline gap-2">
                  <Dot name={project.stack[0] ?? ''} />
                  <span className="text-[0.9375rem] font-medium text-text">
                    {project.name}
                  </span>
                  <span className="meta ml-auto text-dim">{project.year}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-dim">
                  {t(project.blurb)}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Tag key={tech} name={tech} />
                  ))}
                </div>
              </Wrapper>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}

/* ── contact ──────────────────────────────────────────────────────────────── */

export function Contact() {
  const { t } = useLang()

  return (
    <Section
      id="contact"
      n={projects.length ? '05' : '04'}
      label={t(contact.eyebrow)}
      heading={t(contact.heading)}
    >
      <Reveal>
        <p className="max-w-xl text-[1.0625rem] leading-relaxed text-dim">
          {t(contact.body)}
        </p>
        {/* The address, set large. It is the one thing this section is for. */}
        <a
          href={`mailto:${profile.email}`}
          className="display mt-8 block text-[1.75rem] break-all text-p-ink transition-opacity hover:opacity-80 sm:text-[2.5rem]"
        >
          {profile.email}
        </a>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-p-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            {t(contact.cta)}
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-text transition-colors hover:border-p-ink/50 hover:text-p-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

/* ── footer ───────────────────────────────────────────────────────────────── */

export function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-4 border-t border-line">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-7 sm:px-8">
        <span className="meta text-dim">
          © {year} {profile.name}. {t(ui.rights)}
        </span>
        <a href="#top" className="meta text-dim transition-colors hover:text-p-ink">
          {t(ui.toTop)} ↑
        </a>
      </div>
    </footer>
  )
}
