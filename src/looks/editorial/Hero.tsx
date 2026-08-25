import { profile } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { Reveal } from './Section'

export function Hero() {
  const { t } = useLang()
  const headline = t(profile.headline)

  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-[92svh] max-w-5xl flex-col justify-center overflow-hidden px-6 pt-28 pb-16"
    >
      {/* A single soft light behind the headline. The whole page's only
          gradient — it lifts the type off the paper without decorating it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-32 h-[38rem] w-[38rem] rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)',
        }}
      />

      <Reveal className="relative">
        <p className="eyebrow">
          {t(profile.role)} — {t(profile.location)}
        </p>
      </Reveal>

      <h1 className="display relative mt-8 text-[length:var(--text-display)]">
        {headline.map((line, i) => (
          <Reveal key={line} delay={120 + i * 110}>
            <span className="block">
              {/* The last line carries the accent, so the eye lands on the
                  statement rather than on the job title. */}
              {i === headline.length - 1 ? (
                <span className="italic text-accent">{line}</span>
              ) : (
                line
              )}
            </span>
          </Reveal>
        ))}
      </h1>

      <Reveal delay={480} className="relative mt-10 max-w-xl">
        <p className="text-lg leading-relaxed text-ink-muted text-pretty">
          {t(profile.intro)}
        </p>
      </Reveal>

      <Reveal delay={580} className="relative mt-12">
        {/* Grid rather than flex-wrap: three metrics with very different label
            lengths wrap 1-then-2 on a phone, which reads like a mistake. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:items-start sm:gap-x-12">
          {profile.facts.map((fact) => (
            <div key={fact.value}>
              <div className="display text-3xl text-ink">{fact.value}</div>
              <div className="eyebrow mt-1.5">{t(fact.label)}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={660} className="relative mt-12">
        <div className="flex flex-wrap items-center gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 border-b border-accent pb-1 text-sm text-ink transition-colors hover:text-accent"
          >
            {profile.email}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="border-b border-transparent pb-1 text-sm text-ink-muted transition-colors hover:border-rule hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Reveal>

      <Reveal delay={800} className="relative mt-16 flex items-center gap-3">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="text-xs tracking-wide text-ink-muted">
          {t(profile.availability)}
        </span>
      </Reveal>
    </section>
  )
}
