/* ─────────────────────────────────────────────────────────────────────────────
 * Content — taken from Lebenslauf (18).pdf, 2026-08-25.
 *
 * Facts here are real. Where the CV said nothing (per-job tech stacks, personal
 * projects) the field is empty rather than filled with a guess — see the TODOs.
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
  return span.start ? `${formatMonth(span.start, lang)} — ${to}` : to
}

export const profile = {
  name: 'Ehsan Moradpour',
  role: { de: 'Web-Entwickler', en: 'Web Developer' } satisfies T,
  /* TODO: this is the one line that is mine rather than the CV's — change the
     wording if it is not how you would introduce yourself. */
  headline: {
    de: ['Web-Entwickler', 'aus Dortmund,', 'der gerne erklärt.'],
    en: ['Web developer', 'in Dortmund', 'who likes to explain.'],
  } satisfies Record<Lang, string[]>,
  /* The first line a recruiter reads, so it names the specialism rather than
     the employers — the employers are three centimetres below it either way.
     Every claim here is already evidenced by the roles: the media pipeline,
     the Typesense index and the CI/CD pipeline are all bullets under hulle24.

     "Pipelines and process automation", deliberately, and never "data
     engineering": the latter reads as Spark/Airflow/dbt to anyone screening
     CVs and invites the wrong interview. */
  intro: {
    de: 'Ich baue Backends, die Daten stufenweise verarbeiten — Medien-Pipelines, Suchindexierung, CI/CD — von der Datenbank bis zum Interface. Seit 2023 Laravel und React bei hulle24, daneben das Studium der Angewandten Informatik, Abschluss 2026.',
    en: 'I build back ends that move data through stages — media pipelines, search indexing, CI/CD — from the database through to the interface. Laravel and React at hulle24 since 2023; applied computer science alongside it, finishing 2026.',
  } satisfies T,
  location: { de: 'Dortmund, Deutschland', en: 'Dortmund, Germany' } satisfies T,
  availability: {
    de: 'Offen für neue Projekte',
    en: 'Open to new projects',
  } satisfies T,
  email: 'ehsan.webent@gmail.com',
  /* Email is the only contact detail published. The other personal details the
     Lebenslauf carries stay out of this file: a CV goes to one employer, a
     public page is read by scrapers. */
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
    de: 'Erklären ist die Hälfte der Arbeit.',
    en: 'Explaining is half the work.',
  } satisfies T,
  body: {
    de: [
      'Heute baue ich bei hulle24 einen Online-Shop von der Datenbank bis zum Interface. Davor: die IT-Abteilung der National Iranian Gas Company, freiberufliche Projekte über Parscoders, und über Jahre Programmier- und Englischnachhilfe für Gruppen und Einzelpersonen.',
      'Seit Oktober 2022 studiere ich Angewandte Informatik, Abschluss im September 2026 — die Ecke, in der Technik, Prozesse und Software zusammenkommen, ist genau die, in der ich arbeiten will.',
    ],
    en: [
      'Today I build an online shop at hulle24, from the database through to the interface. Before that: the IT department of the National Iranian Gas Company, freelance projects through Parscoders, and years of coding and English tuition for groups and individuals.',
      'Since October 2022 I have been studying applied computer science, finishing in September 2026 — the corner where engineering, process and software meet is exactly where I want to work.',
    ],
  } satisfies TList,
}

export type Job = {
  /** Null while the start date is unknown: the entry still lists, but it is
   *  left off the timeline rather than drawn at a guessed year. */
  start: YearMonth | null
  end: YearMonth | null
  role: T
  company: string
  location: T
  /** TODO: the CV names no per-job technologies. Fill these in and the
   *  timeline, the tags and the colour dots all populate themselves. */
  stack: string[]
  bullets: TList
}

export const experience: Job[] = [
  {
    start: '2023-01',
    end: null,
    role: {
      de: 'Full-Stack-Entwickler E-Commerce (Teilzeit)',
      en: 'E-commerce Full-Stack Developer (part-time)',
    },
    company: 'hulle24 GmbH',
    location: { de: 'Deutschland', en: 'Germany' },
    stack: ['Laravel', 'React', 'Typesense', 'S3', 'MinIO', 'CI/CD'],
    bullets: {
      de: [
        'Planung und Entwicklung eines kompletten Online-Shops: Laravel im Backend, React im Frontend.',
        'Entwicklung der Suche mit Typesense.',
        'Medien-Pipeline mit automatisch erzeugten responsiven Varianten, abgelegt in S3-kompatiblem Objektspeicher.',
        'CI/CD-Pipeline für den Shop implementiert.',
      ],
      en: [
        'Full-stack planning and development of a complete online shop: Laravel on the back end, React on the front.',
        'Built the search with Typesense.',
        'Media pipeline with responsive variants generated automatically, stored in S3-compatible object storage.',
        'Implemented the CI/CD pipeline for the shop.',
      ],
    },
  },
  {
    start: '2020-01',
    end: '2021-04',
    role: { de: 'Freiberuflicher Entwickler', en: 'Freelance Developer' },
    company: 'Parscoders',
    location: { de: 'Remote', en: 'Remote' },
    stack: [],
    bullets: {
      de: ['Webentwicklung.', 'Android-Anwendungsentwicklung.'],
      en: ['Web development.', 'Android application development.'],
    },
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
    stack: [],
    /* TODO: the CV gives no detail for this role — the most important gap to
       fill, since it is the longest piece of development experience on here. */
    bullets: { de: [], en: [] },
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
    stack: [],
    bullets: {
      de: ['Online- und Präsenzunterricht für Gruppen und Einzelpersonen.'],
      en: ['Online and in-person teaching, for groups and individuals.'],
    },
  },
]

/**
 * A skill.
 *
 * No rating: the CV's five filled dots are gone. A parser never read them —
 * they carry no keyword — and against a human they only ever cost something,
 * since a number you gave yourself is either a wound (a 3 beside a 5) or a
 * dare. What a skill is worth is settled by the bullet it appears in.
 */
export type Skill = {
  /** The canonical name — the key the brand mark and the tech colour are
   *  looked up by, and never translated: 'React' is 'React' in both. */
  name: string
  /** Only for the handful of skills whose *name* is a German phrase rather
   *  than a product: without this they would print untranslated in the
   *  English CV. */
  label?: T
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
      { name: 'PHP' },
      { name: 'Laravel' },
      { name: 'Node.js' },
      { name: 'Bun' },
      { name: 'Python' },
      { name: 'FastAPI' },
      { name: 'Flask' },
      { name: 'Go' },
      { name: 'Echo' },
      { name: 'Laravel Reverb' },
    ],
  },
  {
    group: { de: 'Frontend', en: 'Frontend' },
    items: [
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'React' },
      { name: 'React Router' },
      { name: 'Vue' },
      { name: 'Alpine.js' },
      { name: 'jQuery' },
      { name: 'Vite' },
      { name: 'Inertia.js' },
      { name: 'Zustand' },
    ],
  },
  {
    group: { de: 'DevOps', en: 'DevOps' },
    items: [
      { name: 'Linux' },
      { name: 'Bash' },
      { name: 'Docker' },
      { name: 'Docker Compose' },
      { name: 'Docker Swarm' },
      { name: 'CI/CD' },
      { name: 'AWS' },
      { name: 'GCP' },
      { name: 'Hetzner' },
      { name: 'Selenium' },
      { name: 'BrowserStack' },
      { name: 'Git' },
      { name: 'GitHub' },
      { name: 'GitLab' },
    ],
  },
  {
    group: { de: 'Design', en: 'Design' },
    items: [
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'Tailwind CSS' },
      { name: 'Bootstrap' },
      { name: 'Twig' },
      { name: 'Blade' },
    ],
  },
  {
    group: { de: 'Datenbanken', en: 'Databases' },
    items: [
      { name: 'MySQL' },
      { name: 'MariaDB' },
      { name: 'PostgreSQL' },
      { name: 'SQLite' },
      { name: 'Redis' },
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

/* TODO: the CV lists no personal projects, and I will not invent any. Add real
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
    where: 'Azad-Universität — Niederlassung für Wissenschaften und Forschung',
    /* Off the chart: it pulled the axis back to 2014, squeezing every role
       into the right-hand third. Still listed under Ausbildung. */
    chart: false,
    note: {
      de: 'Schwerpunkt: Modellierung und Simulation mit Matlab',
      en: 'Focus: modelling and simulation with Matlab',
    },
  },
  {
    start: '2010-09',
    end: '2014-06',
    what: {
      de: 'Abitur in Mathematik & Physik (GPA 4/4)',
      en: 'Abitur in mathematics & physics (GPA 4/4)',
    },
    where: 'Shohadaye-Enghelab-Gymnasium',
    note: { de: '', en: '' },
    chart: false,
  },
  {
    start: '2008-12',
    end: '2013-09',
    what: { de: 'Englischdiplom', en: 'English diploma' },
    where: 'Iran Language Institute (ILI)',
    note: {
      de: 'Teilnahme an allen Kursstufen',
      en: 'Completed every course level',
    },
    chart: false,
  },
]

export const contact = {
  eyebrow: { de: 'Kontakt', en: 'Contact' } satisfies T,
  heading: { de: 'Lass uns reden.', en: 'Let’s talk.' } satisfies T,
  body: {
    de: 'Ob ein konkretes Projekt oder ein loses Gespräch — schreib mir einfach.',
    en: 'Whether it is a concrete project or a loose conversation — just write.',
  } satisfies T,
  cta: { de: 'E-Mail schreiben', en: 'Send an email' } satisfies T,
}

/**
 * The downloadable CV. `scripts/build-cv.mjs` renders one PDF per language
 * from this very module and writes it to `public/` under these names, so the
 * file a visitor downloads always matches the page they downloaded it from.
 * The German reader gets the German document; the English reader the English.
 */
export const cv = {
  file: {
    de: 'Ehsan-Moradpour-Lebenslauf.pdf',
    en: 'Ehsan-Moradpour-CV.pdf',
  } satisfies T,
  /** Names the document in the PDF's own metadata and the browser tab. */
  docTitle: { de: 'Lebenslauf', en: 'CV' } satisfies T,
  /** The PDF's opening section — the site says the same thing as a hero. */
  summary: { de: 'Profil', en: 'Profile' } satisfies T,
}

/** '/Ehsan-Moradpour-Lebenslauf.pdf' — served straight from `public/`. */
export function cvHref(lang: Lang): string {
  return `/${cv.file[lang]}`
}

export const ui = {
  sections: {
    experience: { de: 'Erfahrung', en: 'Experience' } satisfies T,
    experienceHeading: {
      de: 'Mein Werdegang.',
      en: 'How I got here.',
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
    viewWork: { de: 'Werdegang ansehen', en: 'See the history' } satisfies T,
  },
  toTop: { de: 'Nach oben', en: 'Back to top' } satisfies T,
  /** The masthead's CV control: one label, two actions. */
  cv: {
    label: { de: 'Lebenslauf', en: 'Résumé' } satisfies T,
    view: { de: 'Lebenslauf ansehen (PDF)', en: 'View résumé (PDF)' } satisfies T,
    download: {
      de: 'Lebenslauf herunterladen (PDF)',
      en: 'Download résumé (PDF)',
    } satisfies T,
  },
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
