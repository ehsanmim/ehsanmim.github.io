import { contact, profile, ui } from '../../content/resume'
import { useLang } from '../../lib/lang-context'
import { Reveal } from './Section'

export function Contact() {
  const { t } = useLang()

  return (
    <section id="contact" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <Reveal>
        <p className="eyebrow">{t(contact.eyebrow)}</p>
        <h2 className="display mt-4 text-[length:var(--text-display)]">
          <span className="italic text-accent">{t(contact.heading)}</span>
        </h2>
      </Reveal>

      <Reveal delay={120} className="mt-8 max-w-lg">
        <p className="text-lg leading-relaxed text-ink-muted text-pretty">
          {t(contact.body)}
        </p>
      </Reveal>

      <Reveal delay={200} className="mt-10">
        <a
          href={`mailto:${profile.email}`}
          className="group inline-flex items-center gap-3 border border-rule px-6 py-3.5 text-sm text-ink transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          {t(contact.cta)}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </Reveal>
    </section>
  )
}

export function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <p className="text-xs text-ink-faint">
          © {year} {profile.name}. {t(ui.rights)}
        </p>
        <div className="flex items-center gap-6">
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ink-faint transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#top"
            className="text-xs text-ink-faint transition-colors hover:text-accent"
          >
            {t(ui.toTop)} ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
