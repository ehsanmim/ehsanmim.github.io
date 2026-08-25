/* eslint-disable react/jsx-key --
 * The arrays here are "lines of a file", not a rendered list: CodeBlock puts
 * each one inside its own keyed row, so a key on the member would be dead
 * weight. Verified against React's runtime key warning, which does not fire. */
import {
  about,
  contact,
  education,
  experience,
  profile,
  projects,
  skills,
  ui,
} from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { Reveal } from '../../lib/reveal'
import { C, CodeBlock, CodeSection, F, K, N, P, Str } from './primitives'

/* ── hero: a terminal session ─────────────────────────────────────────────── */

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <span>
      <span className="text-c-ok">$</span> <span className="text-c-text">{children}</span>
    </span>
  )
}

export function CodeHero() {
  const { t } = useLang()

  return (
    <section
      id="top"
      className="mx-auto max-w-4xl px-4 pt-24 pb-10 sm:px-6 sm:pt-28"
    >
      <Reveal>
        <div className="overflow-hidden rounded-lg border border-c-line bg-c-panel">
          <div className="flex items-center gap-3 border-b border-c-line px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="font-mono text-xs text-c-dim">
              {profile.name.split(' ')[0].toLowerCase()}@web — zsh
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="space-y-1 p-5 font-mono text-[0.8125rem] leading-[1.9] sm:p-6">
              <div>
                <Prompt>whoami</Prompt>
              </div>
              <div className="text-c-ok">
                {profile.name} — {t(profile.role)}
              </div>

              <div className="pt-3">
                <Prompt>cat intro.txt</Prompt>
              </div>
              <p className="max-w-2xl whitespace-normal text-c-text">
                {t(profile.intro)}
              </p>

              <div className="pt-3">
                <Prompt>stats --short</Prompt>
              </div>
              {profile.facts.map((fact) => (
                <div key={fact.value} className="flex gap-4">
                  <span className="w-24 shrink-0 text-c-num">{fact.value}</span>
                  <span className="text-c-dim">{t(fact.label)}</span>
                </div>
              ))}

              <div className="pt-3">
                <Prompt>contact --email</Prompt>
              </div>
              <div>
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
                    className="ml-4 text-c-dim transition-colors hover:text-c-text"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-3">
                <Prompt>
                  <span className="text-c-dim">
                    {/* The status line doubles as the resting prompt. */}
                    {t(profile.availability).toLowerCase()}
                  </span>
                </Prompt>
                <span className="caret inline-block h-4 w-2 bg-c-ok align-middle" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ── about.ts: a doc comment ──────────────────────────────────────────────── */

export function CodeAbout() {
  const { t } = useLang()
  const paras = t(about.body)

  return (
    <CodeSection id="about" label={t(about.eyebrow).toLowerCase()}>
      <Reveal>
        <CodeBlock
          file="about.ts"
          lines={[
            <C>/**</C>,
            <C> * {t(about.heading)}</C>,
            <C> *</C>,
            ...paras.flatMap((para) => [
              <C className="whitespace-normal"> * {para}</C>,
              <C> *</C>,
            ]),
            <C> */</C>,
            <>
              <K>export const</K> <F>location</F> <P>=</P> <Str>{t(profile.location)}</Str>
              <P>;</P>
            </>,
          ]}
        />
      </Reveal>
    </CodeSection>
  )
}

/* ── experience.ts: an array of objects ───────────────────────────────────── */

export function CodeExperience() {
  const { t } = useLang()

  const lines: React.ReactNode[] = [
    <>
      <K>const</K> <F>experience</F><P>:</P> <span className="text-c-fn">Job</span>
      <P>[] = [</P>
    </>,
  ]

  experience.forEach((job) => {
    lines.push(
      <P>{'  {'}</P>,
      <>
        {'    '}
        <span className="text-c-num">period</span>
        <P>: </P>
        <Str>{job.period}</Str>
        <P>,</P>
      </>,
      <>
        {'    '}
        <span className="text-c-num">role</span>
        <P>: </P>
        <Str>{t(job.role)}</Str>
        <P>,</P>
      </>,
      <>
        {'    '}
        <span className="text-c-num">company</span>
        <P>: </P>
        <Str>{job.company}</Str>
        <P>, </P>
        <C>// {t(job.location)}</C>
      </>,
      <>
        {'    '}
        <span className="text-c-num">stack</span>
        <P>: [</P>
        {job.stack.map((s, i) => (
          <span key={s}>
            <Str>{s}</Str>
            {i < job.stack.length - 1 && <P>, </P>}
          </span>
        ))}
        <P>],</P>
      </>,
      <>
        {'    '}
        <span className="text-c-num">impact</span>
        <P>: [</P>
      </>,
      ...t(job.bullets).map((b) => (
        <>
          {'      '}
          <Str>{b}</Str>
          <P>,</P>
        </>
      )),
      <P>{'    ],'}</P>,
      <P>{'  },'}</P>,
    )
  })

  lines.push(
    <P>];</P>,
    <>&nbsp;</>,
    <C>// {t(ui.sections.education).toLowerCase()}</C>,
    ...education.map((e) => (
      <>
        <K>const</K> <F>degree</F> <P>=</P> <Str>{t(e.what)}</Str>
        <P>;</P>{' '}
        <C>
          // {e.where}, {e.period}
        </C>
      </>
    )),
  )

  return (
    <CodeSection id="experience" label={t(ui.sections.experience).toLowerCase()}>
      <Reveal>
        <CodeBlock file="experience.ts" lines={lines} />
      </Reveal>
    </CodeSection>
  )
}

/* ── skills.json ──────────────────────────────────────────────────────────── */

export function CodeSkills() {
  const { t } = useLang()

  const lines: React.ReactNode[] = [<P>{'{'}</P>]
  skills.forEach((group, gi) => {
    lines.push(
      <>
        {'  '}
        <Str>{t(group.group).toLowerCase()}</Str>
        <P>: [</P>
      </>,
      ...group.items.map((item) => (
        <>
          {'    '}
          <Str>{item}</Str>
          <P>,</P>
        </>
      )),
      <P>{gi < skills.length - 1 ? '  ],' : '  ]'}</P>,
    )
  })
  lines.push(<P>{'}'}</P>)

  return (
    <CodeSection id="skills" label={t(ui.sections.skills).toLowerCase()}>
      <Reveal>
        <CodeBlock file="skills.json" lines={lines} />
      </Reveal>
    </CodeSection>
  )
}

/* ── projects.md ──────────────────────────────────────────────────────────── */

export function CodeProjects() {
  const { t } = useLang()

  const lines: React.ReactNode[] = [
    <>
      <K># </K>
      <span className="text-c-text">{t(ui.sections.projects)}</span>
    </>,
    <>&nbsp;</>,
  ]

  projects.forEach((p, i) => {
    lines.push(
      <>
        <K>## </K>
        {p.href ? (
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="text-c-text underline underline-offset-4 hover:text-c-ok"
          >
            {p.name}
          </a>
        ) : (
          <span className="text-c-text">{p.name}</span>
        )}
        <P> · </P>
        <N>{p.year}</N>
      </>,
      <span className="whitespace-normal text-c-dim">{t(p.blurb)}</span>,
      <>
        {p.stack.map((s) => (
          <span key={s} className="text-c-str">
            `{s}`{' '}
          </span>
        ))}
      </>,
    )
    if (i < projects.length - 1) lines.push(<>&nbsp;</>)
  })

  return (
    <CodeSection id="projects" label={t(ui.sections.projects).toLowerCase()}>
      <Reveal>
        <CodeBlock file="projects.md" lines={lines} />
      </Reveal>
    </CodeSection>
  )
}

/* ── contact.sh ───────────────────────────────────────────────────────────── */

export function CodeContact() {
  const { t } = useLang()

  return (
    <CodeSection id="contact" label={t(contact.eyebrow).toLowerCase()}>
      <Reveal>
        <CodeBlock
          file="contact.sh"
          lines={[
            <C>#!/bin/sh</C>,
            <C># {t(contact.body)}</C>,
            <>&nbsp;</>,
            <>
              <F>mail</F> <P>-s</P> <Str>{t(contact.heading)}</Str> \
            </>,
            <>
              {'  '}
              <Str>{profile.email}</Str>
            </>,
          ]}
        />
      </Reveal>

      <Reveal delay={120} className="mt-6">
        <a
          href={`mailto:${profile.email}`}
          className="group inline-flex items-center gap-2 rounded border border-c-line px-4 py-2.5 font-mono text-xs text-c-text transition-colors hover:border-c-ok hover:text-c-ok"
        >
          <span className="text-c-ok">$</span>
          {t(contact.cta).toLowerCase()}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </Reveal>
    </CodeSection>
  )
}

export function CodeFooter() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-c-line">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-xs text-c-dim sm:px-6">
        <span>
          <C># </C>© {year} {profile.name}. {t(ui.rights)}
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
