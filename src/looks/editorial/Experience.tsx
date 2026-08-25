import { about, education, experience, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { Reveal, Section } from './Section'

export function About() {
  const { t } = useLang()
  return (
    <Section id="about" eyebrow={t(about.eyebrow)} heading={t(about.heading)}>
      <div className="grid gap-10 sm:grid-cols-[1fr_2fr]">
        <Reveal className="hidden sm:block">
          <div className="h-px w-16 bg-accent" />
        </Reveal>
        <div className="space-y-6">
          {t(about.body).map((para, i) => (
            <Reveal key={para.slice(0, 24)} delay={i * 90} as="p">
              <span className="block text-lg leading-relaxed text-ink-muted text-pretty">
                {para}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}

export function Experience() {
  const { t } = useLang()

  return (
    <Section
      id="experience"
      eyebrow={t(ui.sections.experience)}
      heading={t(ui.sections.experienceHeading)}
    >
      <ol className="space-y-px">
        {experience.map((job, i) => (
          <Reveal as="li" key={`${job.company}-${job.from}`} delay={i * 80}>
            {/* The whole row lights up on hover — the group is the entry, not
                a button inside it. */}
            <article className="group grid gap-4 border-b border-rule py-8 transition-colors duration-300 hover:border-accent-dim sm:grid-cols-[10rem_1fr] sm:gap-8">
              <div className="pt-1">
                <div className="font-mono text-xs tracking-wide text-ink-faint transition-colors duration-300 group-hover:text-accent">
                  {job.period}
                </div>
                <div className="mt-1.5 text-xs text-ink-faint">{t(job.location)}</div>
              </div>

              <div>
                <h3 className="display text-2xl text-ink sm:text-3xl">
                  {t(job.role)}
                </h3>
                <div className="mt-1 text-sm text-ink-muted">{job.company}</div>

                <ul className="mt-5 space-y-2.5">
                  {t(job.bullets).map((line) => (
                    <li
                      key={line.slice(0, 24)}
                      className="relative pl-5 text-[0.9375rem] leading-relaxed text-ink-muted text-pretty"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute top-[0.6em] left-0 h-px w-2.5 bg-ink-faint"
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                  {job.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-rule px-2.5 py-1 font-mono text-[0.6875rem] text-ink-faint transition-colors duration-300 group-hover:border-accent-dim/50 group-hover:text-ink-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-14">
        <h3 className="eyebrow">{t(ui.sections.education)}</h3>
        <ul className="mt-5 space-y-3">
          {education.map((item) => (
            <li
              key={item.period}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-1"
            >
              <span className="font-mono text-xs text-ink-faint">{item.period}</span>
              <span className="text-[0.9375rem] text-ink">{t(item.what)}</span>
              <span className="text-sm text-ink-muted">{item.where}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
