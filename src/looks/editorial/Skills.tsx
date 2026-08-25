import { projects, skills, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { Reveal, Section } from './Section'

export function Skills() {
  const { t } = useLang()

  return (
    <Section
      id="skills"
      eyebrow={t(ui.sections.skills)}
      heading={t(ui.sections.skillsHeading)}
    >
      <div className="grid gap-px sm:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal key={group.items[0]} delay={i * 70}>
            <div className="border-t border-rule py-7 sm:pr-10">
              <h3 className="eyebrow text-ink-muted">{t(group.group)}</h3>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-[0.9375rem] text-ink transition-colors hover:text-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
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
