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
  intro: {
    de: 'Seit 2023 baue ich bei hulle24 einen kompletten Online-Shop: Laravel im Backend, React im Frontend, Typesense für die Suche. Davor Web-Entwicklung in der IT-Abteilung der National Iranian Gas Company und freiberuflich für Web und Android.',
    en: 'Since 2023 I have been building a complete online shop at hulle24: Laravel on the back end, React on the front, Typesense for search. Before that, web development in the IT department of the National Iranian Gas Company and freelance work for web and Android.',
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
    stack: ['Laravel', 'React', 'Typesense', 'CI/CD'],
    bullets: {
      de: [
        'Planung und Entwicklung eines kompletten Online-Shops: Laravel im Backend, React im Frontend.',
        'Entwicklung der Suche mit Typesense.',
        'CI/CD-Pipeline für den Shop implementiert.',
      ],
      en: [
        'Full-stack planning and development of a complete online shop: Laravel on the back end, React on the front.',
        'Built the search with Typesense.',
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
      de: 'Programmier-Nachhilfe und Englischnachhilfe',
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

/** Self-assessed, 1–5, exactly as the CV's filled dots.
 *  `level` is optional: a skill added since the CV shows no rating until you
 *  give it one, rather than being assigned a number I made up. */
export type Skill = { name: string; level?: number }

export const skills: { group: T; items: Skill[] }[] = [
  {
    group: { de: 'Frontend', en: 'Frontend' },
    items: [
      { name: 'React', level: 5 },
      { name: 'Tailwind CSS', level: 5 },
      { name: 'HTML', level: 5 },
      { name: 'CSS', level: 5 },
      { name: 'Responsives Webdesign', level: 5 },
      { name: 'jQuery', level: 4 },
      { name: 'JavaScript', level: 3 },
    ],
  },
  {
    group: { de: 'Backend', en: 'Backend' },
    items: [
      { name: 'Laravel', level: 5 },
      { name: 'PHP', level: 4 },
      { name: 'Django', level: undefined }, // TODO: 1–5
      { name: 'Go', level: undefined }, // TODO: 1–5
      { name: 'PostgreSQL', level: 4 },
      { name: 'MariaDB', level: 4 },
    ],
  },
  {
    group: { de: 'DevOps & Tools', en: 'DevOps & Tools' },
    items: [
      { name: 'Docker', level: 4 },
      { name: 'Docker Compose', level: 4 },
      { name: 'Git', level: 4 },
      { name: 'GitHub', level: 4 },
      { name: 'GitLab', level: 4 },
      { name: 'CI/CD', level: 4 },
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
    start: '2022-02',
    end: '2022-10',
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
  /** Says what the dots mean, so they are not read as a certified rating. */
  levelNote: {
    de: 'Selbsteinschätzung, 1–5.',
    en: 'Self-assessed, 1–5.',
  } satisfies T,
  /** Tab names. Plain section names: an invented `.json`/`.sh` extension
   *  claimed a file type that nothing here actually is. */
  tabs: {
    start: { de: 'Start', en: 'Start' } satisfies T,
  },
  toTop: { de: 'Nach oben', en: 'Back to top' } satisfies T,
  menu: { de: 'Menü', en: 'Menu' } satisfies T,
  langLabel: { de: 'Sprache wechseln', en: 'Switch language' } satisfies T,
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
