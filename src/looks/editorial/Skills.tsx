import { languages, projects, skills, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { Reveal, Section } from './Section'

/** The CV's rating, set as a hairline meter rather than as dots — the
 *  editorial equivalent of the same five circles. */
function Meter({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <span
      className="flex shrink-0 gap-1"
      role="img"
      aria-label={`${level} / ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-3 w-0.5 ${i < level ? 'bg-accent' : 'bg-rule'}`}
        />
      ))}
    </span>
  )
}

export function Skills() {
  const { t } = useLang()

  return (
    <Section
      id="skills"
      eyebrow={t(ui.sections.skills)}
      heading={t(ui.sections.skillsHeading)}
    >
      <div className="grid gap-x-10 gap-y-px sm:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal key={t(group.group)} delay={i * 70}>
            <div className="border-t border-rule py-7">
              <h3 className="eyebrow text-ink-muted">{t(group.group)}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.name} className="flex items-center gap-4">
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-ink">
                      {item.name}
                    </span>
                    {item.level === undefined ? (
                      <span className="text-xs text-ink-faint">—</span>
                    ) : (
                      <Meter level={item.level} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-4">
        <p className="text-xs text-ink-faint">{t(ui.levelNote)}</p>
      </Reveal>

      <Reveal delay={120} className="mt-12">
        <h3 className="eyebrow">{t(ui.sections.languages)}</h3>
        <ul className="mt-5 space-y-3">
          {languages.map((l) => (
            <li key={t(l.name)} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="w-24 text-[0.9375rem] text-ink">{t(l.name)}</span>
              <span className="font-mono text-xs text-accent">{t(l.level)}</span>
              {t(l.note) && (
                <span className="text-xs text-ink-faint">{t(l.note)}</span>
              )}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}

export function Projects() {
  const { t } = useLang()

  return (
    <Section
      id="projects"
      eyebrow={t(ui.sections.projects)}
      heading={t(ui.sections.projectsHeading)}
    >
      <ul className="space-y-px">
        {projects.map((project, i) => {
          const Tag = project.href ? 'a' : 'div'
          return (
            <Reveal as="li" key={project.name} delay={i * 80}>
              <Tag
                {...(project.href
                  ? { href: project.href, target: '_blank', rel: 'noreferrer' }
                  : {})}
                className="group block border-b border-rule py-8 transition-colors duration-300 hover:border-accent-dim"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <h3 className="display text-2xl text-ink transition-colors duration-300 group-hover:text-accent sm:text-3xl">
                    {project.name}
                  </h3>
                  <span className="font-mono text-xs text-ink-faint">
                    {project.year}
                  </span>
                </div>

                <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted text-pretty">
                  {t(project.blurb)}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-rule px-2.5 py-1 font-mono text-[0.6875rem] text-ink-faint transition-colors duration-300 group-hover:border-accent-dim/50 group-hover:text-ink-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </Tag>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}
