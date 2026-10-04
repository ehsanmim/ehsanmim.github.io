/* ─────────────────────────────────────────────────────────────────────────────
 * Content for the site.
 *
 * Facts here are real. Where there is nothing to say yet (per-job tech stacks,
 * personal projects) the field is empty rather than filled with a guess — see
 * the TODOs.
 * Every visible string is a { de, en } pair. German is the default language.
 * ────────────────────────────────────────────────────────────────────────── */

export type Lang = 'de' | 'en'

/** A translated string. */
export type T = Record<Lang, string>

/** A translated list. */
export type TList = Record<Lang, string[]>

/** 'YYYY-MM'. Null as an end date means "still running". */
export type YearMonth = string

const LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' }

/** 'Jul 2019' / 'Jul 2019' — month names follow the active language. */
export function formatMonth(ym: YearMonth, lang: Lang): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString(LOCALE[lang], {
    month: 'short',
    year: 'numeric',
  })
}

/** A fractional year, so the timeline can measure a span to the month. */
export function toYears(ym: YearMonth): number {
  const [y, m] = ym.split('-').map(Number)
  return y + ((m ?? 1) - 1) / 12
}

/**
 * The displayed period. Derived, so the label and the timeline cannot drift.
 * An entry with no start date shows its end date alone rather than a dash
 * hanging off nothing.
 */
export function period(
  span: { start?: YearMonth | null; end: YearMonth | null },
  lang: Lang,
  present: string,
): string {
  const to = span.end ? formatMonth(span.end, lang) : present
  return span.start ? `${formatMonth(span.start, lang)} – ${to}` : to
}

export const profile = {
  name: 'Ehsan Moradpour',
  role: { de: 'Web-Entwickler', en: 'Web Developer' } satisfies T,
  /* TODO: this is the one line that is mine rather than yours — change the
     wording if it is not how you would introduce yourself. */
  headline: {
    de: ['Web-Entwickler', 'aus Dortmund,', 'der gerne erklärt.'],
    en: ['Web developer', 'in Dortmund', 'who likes to explain.'],
  } satisfies Record<Lang, string[]>,
  /* The first line a reader sees, so it leads with the years and the
     specialism rather than the employers. The seven years match the 2019 in
     `facts`.

     "Pipelines and process automation", deliberately, and never "data
     engineering": the latter reads as Spark/Airflow/dbt to anyone screening
     CVs and invites the wrong interview. */
  intro: {
    de: 'Entwickler mit sieben Jahren Erfahrung: Backends, die Daten stufenweise verarbeiten, von Medien-Pipelines über Suchindexierung bis CI/CD. Versionskontrolle und Tests haben Vorrang, entwickelt wird testgetrieben. Mit KI im Alltag baue ich mehr Automatisierung, inklusive eigener MCP-Server. Seit 2023 Full-Stack-Entwickler bei hulle24, daneben das Studium der Angewandten Informatik, Abschluss 2026.',
    en: 'Developer with seven years of experience building back ends that move data through stages, from media pipelines through search indexing to CI/CD. Version control and testing take priority, and I work test-driven. With AI in the mix I build more automation, my own MCP servers included. Full-stack developer at hulle24 since 2023, applied computer science alongside it, finishing 2026.',
  } satisfies T,
  location: { de: 'Dortmund, Deutschland', en: 'Dortmund, Germany' } satisfies T,
  availability: {
    de: 'Offen für neue Projekte',
    en: 'Open to new projects',
  } satisfies T,
  email: 'ehsan.webent@gmail.com',
  /* Email is the only contact detail published. The other personal details the
     personal details stay out of this file: a public page is read by
     scrapers. */
  links: [
    { label: 'GitHub', href: 'https://github.com/ehsanmim' },
    // TODO: LinkedIn URL, if you have one.
  ],
  facts: [
    {
      // Matches the earliest role listed below — keep the two in step.
      value: '2019',
      label: { de: 'im Berufsleben seit', en: 'working since' } satisfies T,
    },
    {
      value: '2026',
      label: {
        de: 'B.Sc. Angewandte Informatik',
        en: 'B.Sc. Applied Computer Science',
      } satisfies T,
    },
  ],
}

export const about = {
  eyebrow: { de: 'Über mich', en: 'About' } satisfies T,
  heading: {
    de: 'Planung ist der halbe Weg.',
    en: 'Planning is half the work.',
  } satisfies T,
  body: {
    de: [
      'Heute arbeite ich als Full-Stack-Entwickler bei hulle24. Davor: die IT-Abteilung der National Iranian Gas Company, freiberufliche Projekte über Parscoders, und über Jahre Programmier- und Englischnachhilfe für Gruppen und Einzelpersonen.',
      'Seit Oktober 2022 studiere ich Angewandte Informatik, Abschluss im September 2026. Die Ecke, in der Technik, Prozesse und Software zusammenkommen, ist genau die, in der ich arbeiten will.',
    ],
    en: [
      'Today I work as a full-stack developer at hulle24. Before that: the IT department of the National Iranian Gas Company, freelance projects through Parscoders, and years of coding and English tuition for groups and individuals.',
      'Since October 2022 I have been studying applied computer science, finishing in September 2026. The corner where engineering, process and software meet is exactly where I want to work.',
    ],
  } satisfies TList,
}

/**
 * A role: what, where and when, and nothing more. This is a portfolio, not a
 * CV — the detail of each job stays in the CV, and the work worth showing goes
 * under Projects.
 */
export type Job = {
  /** Null while the start date is unknown: the entry still lists, but it is
   *  left off the timeline rather than drawn at a guessed year. */
  start: YearMonth | null
  end: YearMonth | null
  role: T
  company: string
  location: T
}

export const experience: Job[] = [
  {
    start: '2023-01',
    end: null,
    role: {
      de: 'Full-Stack-Entwickler (Teilzeit)',
      en: 'Full-Stack Developer (part-time)',
    },
    company: 'hulle24 GmbH',
    location: { de: 'Deutschland', en: 'Germany' },
  },
  {
    start: '2020-01',
    end: '2021-04',
    role: { de: 'Freiberuflicher Entwickler', en: 'Freelance Developer' },
    company: 'Parscoders',
    location: { de: 'Remote', en: 'Remote' },
  },
  {
    start: '2019-07',
    end: '2022-01',
    role: {
      de: 'Web-Entwickler, IT-Abteilung',
      en: 'Web Developer, IT Department',
    },
    company: 'National Iranian Gas Company',
    location: { de: 'Iran', en: 'Iran' },
  },
  {
    start: '2019-03',
    end: '2022-01',
    role: {
      de: 'Programmier- und Englischnachhilfe',
      en: 'Coding and English Tutor',
    },
    company: 'Toseye Fanavari Aria Kavosh',
    location: { de: 'Iran', en: 'Iran' },
  },
]

/**
 * A skill, with how well I can do it on a scale of 1 to 10 — drawn as the
 * narrow bar under each pill, where there is a level to draw.
 */
export type Skill = {
  /** The canonical name — the key the brand mark and the tech colour are
   *  looked up by, and never translated: 'React' is 'React' in both. */
  name: string
  /** Only for the handful of skills whose *name* is a German phrase rather
   *  than a product: without this they would print untranslated on the
   *  English page. */
  label?: T
  /** 1–10. Left out for the principles, which are ways of working rather
   *  than tools and do not rate on a scale. */
  level?: number
}

/**
 * Grouped for scanning, not ranked. The canonical `name` is what a keyword
 * matcher reads and what the brand mark is drawn from; `label` appears only
 * where a term is a phrase that genuinely has a German form — product names
 * and the loanwords German developers actually use are left alone.
 */
export const skills: { group: T; items: Skill[] }[] = [
  {
    group: { de: 'Backend', en: 'Backend' },
    items: [
      { name: 'PHP', level: 8 },
      { name: 'Laravel', level: 9 },
      { name: 'Node.js', level: 6 },
      { name: 'Bun', level: 5 },
      { name: 'Python', level: 6 },
      { name: 'FastAPI', level: 5 },
      { name: 'Flask', level: 5 },
      { name: 'Go', level: 4 },
      { name: 'Echo', level: 4 },
      { name: 'Laravel Reverb', level: 6 },
    ],
  },
  {
    group: { de: 'Frontend', en: 'Frontend' },
    items: [
      { name: 'TypeScript', level: 7 },
      { name: 'JavaScript', level: 8 },
      { name: 'React', level: 9 },
      { name: 'React Router', level: 7 },
      { name: 'Vue', level: 5 },
      { name: 'Alpine.js', level: 6 },
      { name: 'jQuery', level: 7 },
      { name: 'Vite', level: 7 },
      { name: 'Inertia.js', level: 7 },
      { name: 'Zustand', level: 6 },
      { name: 'HTML', level: 9 },
      { name: 'CSS', level: 9 },
      { name: 'Tailwind CSS', level: 9 },
      { name: 'Bootstrap', level: 7 },
      { name: 'Twig', level: 6 },
      { name: 'Blade', level: 8 },
    ],
  },
  {
    group: { de: 'DevOps', en: 'DevOps' },
    items: [
      { name: 'Linux', level: 7 },
      { name: 'Bash', level: 6 },
      { name: 'Docker', level: 8 },
      { name: 'Docker Compose', level: 8 },
      { name: 'Docker Swarm', level: 5 },
      { name: 'CI/CD', level: 8 },
      { name: 'AWS', level: 5 },
      { name: 'GCP', level: 4 },
      { name: 'Hetzner', level: 7 },
      { name: 'RustFS', level: 7 },
      { name: 'Selenium', level: 5 },
      { name: 'BrowserStack', level: 6 },
      { name: 'Git', level: 10 },
      { name: 'GitHub', level: 10 },
      { name: 'GitLab', level: 10 },
    ],
  },
  {
    group: { de: 'Datenbanken', en: 'Databases' },
    items: [
      { name: 'MySQL', level: 8 },
      { name: 'MariaDB', level: 8 },
      { name: 'PostgreSQL', level: 8 },
      { name: 'SQLite', level: 6 },
      { name: 'Redis', level: 6 },
    ],
  },
  {
    group: { de: 'Konzepte', en: 'Principles' },
    items: [
      { name: 'TDD' },
      { name: 'Microservices' },
      {
        name: 'Modular data processing',
        label: { de: 'Modulare Datenverarbeitung', en: 'Modular data processing' },
      },
      { name: 'Serverless' },
      { name: 'Authentication', label: { de: 'Authentifizierung', en: 'Authentication' } },
      { name: 'Validation', label: { de: 'Validierung', en: 'Validation' } },
      { name: 'Broadcasting' },
      { name: 'Notifications', label: { de: 'Benachrichtigungen', en: 'Notifications' } },
      { name: 'Search engines', label: { de: 'Suchmaschinen', en: 'Search engines' } },
      { name: 'Caching' },
      { name: 'Queueing' },
      { name: 'Rate limiting' },
      { name: 'Localization', label: { de: 'Lokalisierung', en: 'Localization' } },
      { name: 'Optimization', label: { de: 'Optimierung', en: 'Optimization' } },
      { name: 'Logging' },
    ],
  },
]

export const languages: { name: T; level: T; note: T }[] = [
  {
    name: { de: 'Deutsch', en: 'German' },
    level: { de: 'C1', en: 'C1' },
    note: { de: 'telc Hochschule, Aug 2022', en: 'telc Hochschule, Aug 2022' },
  },
  {
    name: { de: 'Englisch', en: 'English' },
    level: { de: 'C1', en: 'C1' },
    note: {
      de: 'Academic IELTS 7.5, Dez 2021',
      en: 'Academic IELTS 7.5, Dec 2021',
    },
  },
  {
    name: { de: 'Persisch', en: 'Persian' },
    level: { de: 'Muttersprache', en: 'Native' },
    note: { de: '', en: '' },
  },
]

export type Project = {
  name: string
  year: string
  blurb: T
  stack: string[]
  href?: string
}

/* TODO: no personal projects yet, and I will not invent any. Add real
   ones here and the Projects section and its nav entry appear on their own. */
export const projects: Project[] = []

export const education: {
  /** Optional: an entry known only by its completion date lists just that. */
  start?: YearMonth
  end: YearMonth | null
  what: T
  where: string
  note: T
  /** false = listed, but kept off the timeline. School-level entries stretch
   *  the axis back years and crowd everything that matters. */
  chart?: boolean
  /** Label for a bar too narrow for the full name. Beats the automatic
   *  initialism, which turns a four-word phrase into alphabet soup. */
  short?: string
  /** Colours its bar on the timeline. A language course is not a degree. */
  kind?: 'degree' | 'language'
}[] = [
  {
    /* TODO: institution. */
    start: '2022-10',
    end: '2026-09',
    kind: 'degree',
    what: {
      de: 'B.Sc. Angewandte Informatik',
      en: 'B.Sc. Applied Computer Science',
    },
    where: '',
    note: { de: '', en: '' },
  },
  {
    /* Fills the gap between the roles in Iran ending and hulle24 starting. */
    start: '2022-04',
    end: '2022-08',
    kind: 'language',
    what: {
      de: 'Deutschkurs & Umzug nach Deutschland',
      en: 'German course & move to Germany',
    },
    short: 'DE',
    where: '',
    note: { de: 'telc Hochschule C1, Aug 2022', en: 'telc Hochschule C1, Aug 2022' },
  },
  {
    start: '2014-09',
    end: '2018-09',
    kind: 'degree',
    what: { de: 'B.Sc. Maschinenbau', en: 'B.Sc. Mechanical Engineering' },
    where: 'Azad-Universität, Niederlassung für Wissenschaften und Forschung',
    /* Off the chart: it pulled the axis back to 2014, squeezing every role
       into the right-hand third. Still listed under Ausbildung. */
    chart: false,
    note: { de: '', en: '' },
  },
]

export const contact = {
  eyebrow: { de: 'Kontakt', en: 'Contact' } satisfies T,
  heading: { de: 'Lass uns reden.', en: 'Let’s talk.' } satisfies T,
  body: {
    de: 'Ob ein konkretes Projekt oder ein loses Gespräch: schreib mir einfach.',
    en: 'Whether it is a concrete project or a loose conversation, just write.',
  } satisfies T,
  cta: { de: 'E-Mail schreiben', en: 'Send an email' } satisfies T,
}

export const ui = {
  sections: {
    experience: { de: 'Erfahrung', en: 'Experience' } satisfies T,
    experienceHeading: {
      de: 'Wo ich gearbeitet habe.',
      en: 'Where I have worked.',
    } satisfies T,
    skills: { de: 'Kenntnisse', en: 'Skills' } satisfies T,
    skillsHeading: { de: 'Womit ich arbeite.', en: 'What I work with.' } satisfies T,
    projects: { de: 'Projekte', en: 'Projects' } satisfies T,
    projectsHeading: { de: 'Ausgewählte Arbeiten.', en: 'Selected work.' } satisfies T,
    education: { de: 'Ausbildung', en: 'Education' } satisfies T,
    languages: { de: 'Sprachen', en: 'Languages' } satisfies T,
  },
  /** Tab names. Plain section names: an invented `.json`/`.sh` extension
   *  claimed a file type that nothing here actually is. */
  tabs: {
    start: { de: 'Start', en: 'Start' } satisfies T,
  },
  /** The hero's lede label and the two buttons under it. */
  hero: {
    mailCta: { de: 'Schreib mir', en: 'Get in touch' } satisfies T,
    viewWork: { de: 'Erfahrung ansehen', en: 'See my experience' } satisfies T,
  },
  toTop: { de: 'Nach oben', en: 'Back to top' } satisfies T,
  menu: { de: 'Menü', en: 'Menu' } satisfies T,
  langLabel: { de: 'Sprache wechseln', en: 'Switch language' } satisfies T,
  themeLabel: { de: 'Ansicht wechseln', en: 'Switch theme' } satisfies T,
  /** The commit graph's legend: what each lane holds. Keyed by branch name,
   *  which is printed as-is — a branch is not translated. */
  branches: {
    main: { de: 'Arbeit', en: 'Work' } satisfies T,
    edu: { de: 'Ausbildung', en: 'Studies' } satisfies T,
  },
  /** The legend doubles as a filter: a branch can be soloed out of the graph. */
  soloOn: { de: 'Nur diesen Branch zeigen', en: 'Show only this branch' } satisfies T,
  soloOff: { de: 'Alle Branches zeigen', en: 'Show all branches' } satisfies T,
  present: { de: 'heute', en: 'present' } satisfies T,
  rights: { de: 'Alle Rechte vorbehalten.', en: 'All rights reserved.' } satisfies T,
}

/** Projects only earns a nav entry once there is something in it. */
export const nav: { id: string; label: T }[] = [
  { id: 'about', label: { de: 'Über mich', en: 'About' } },
  { id: 'experience', label: ui.sections.experience },
  { id: 'skills', label: ui.sections.skills },
  ...(projects.length ? [{ id: 'projects', label: ui.sections.projects }] : []),
  { id: 'contact', label: contact.eyebrow },
]
