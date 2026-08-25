/* ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  PLACEHOLDER CONTENT — every fact below is invented scaffolding.
 *
 * Company names, dates, bullet points and numbers are NOT real. They exist so
 * the layout can be judged with realistic text lengths. Replace them before
 * this ever goes public; nothing outside this file needs to change.
 *
 * Every visible string is a { de, en } pair. German is the default language.
 * ────────────────────────────────────────────────────────────────────────── */

export type Lang = 'de' | 'en'

/** A translated string. */
export type T = Record<Lang, string>

/** A translated list. */
export type TList = Record<Lang, string[]>

export const profile = {
  name: 'Ehsan Moradpour',
  initials: 'EM',
  role: {
    de: 'Full-Stack-Entwickler',
    en: 'Full-Stack Engineer',
  } satisfies T,
  /** The oversized hero statement. Kept short — it is set at display size. */
  headline: {
    de: ['Full-Stack-', 'Entwickler,', 'der fürs Web baut.'],
    en: ['Full-stack', 'engineer', 'building for the web.'],
  } satisfies Record<Lang, string[]>,
  intro: {
    de: 'Ich baue Webanwendungen von der Datenbank bis zum letzten Pixel — Laravel im Backend, React im Frontend, und die Infrastruktur, auf der beides läuft.',
    en: 'I build web applications from the database to the last pixel — Laravel on the back end, React on the front, and the infrastructure both run on.',
  } satisfies T,
  location: { de: 'Deutschland', en: 'Germany' } satisfies T,
  availability: {
    de: 'Offen für neue Projekte',
    en: 'Open to new projects',
  } satisfies T,
  email: 'ehsanmimpe@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/ehsanmim' },
    { label: 'LinkedIn', href: '#' }, // TODO: real URL
  ],
  /** Shown as a metric strip under the headline. */
  facts: [
    { value: '8+', label: { de: 'Jahre Erfahrung', en: 'years experience' } satisfies T },
    { value: '30+', label: { de: 'Projekte ausgeliefert', en: 'projects shipped' } satisfies T },
    { value: 'DE / EN / FA', label: { de: 'Sprachen', en: 'languages' } satisfies T },
  ],
}

export const nav: { id: string; label: T }[] = [
  { id: 'about', label: { de: 'Über mich', en: 'About' } },
  { id: 'experience', label: { de: 'Erfahrung', en: 'Experience' } },
  { id: 'skills', label: { de: 'Skills', en: 'Skills' } },
  { id: 'projects', label: { de: 'Projekte', en: 'Projects' } },
  { id: 'contact', label: { de: 'Kontakt', en: 'Contact' } },
]

export const about = {
  eyebrow: { de: 'Über mich', en: 'About' } satisfies T,
  heading: {
    de: 'Ich mag Systeme, die man erklären kann.',
    en: 'I like systems you can explain.',
  } satisfies T,
  body: {
    de: [
      'Seit über acht Jahren baue ich Webanwendungen — meistens Laravel und React, immer mit dem Anspruch, dass die Lösung einfacher ist als das Problem.',
      'Am liebsten arbeite ich dort, wo Produkt und Infrastruktur sich berühren: eine Deployment-Pipeline, die niemanden nachts weckt, ein Datenmodell, das die zweite Anforderung überlebt, ein Interface, das keine Erklärung braucht.',
    ],
    en: [
      'For over eight years I have been building web applications — mostly Laravel and React, always with the aim that the solution be simpler than the problem.',
      'I do my best work where product meets infrastructure: a deployment pipeline that wakes nobody at night, a data model that survives the second requirement, an interface that needs no explanation.',
    ],
  } satisfies TList,
}

export type Job = {
  period: string
  from: string
  role: T
  company: string
  location: T
  stack: string[]
  bullets: TList
}

/* TODO: replace all of these with the real roles. */
export const experience: Job[] = [
  {
    period: '2023 — heute',
    from: '2023',
    role: { de: 'Senior Full-Stack-Entwickler', en: 'Senior Full-Stack Engineer' },
    company: 'Firma GmbH',
    location: { de: 'Remote', en: 'Remote' },
    stack: ['Laravel', 'React', 'Inertia', 'Docker', 'MariaDB'],
    bullets: {
      de: [
        'Verantwortlich für die Architektur der Kernanwendung und die Migration auf eine service-orientierte Struktur.',
        'Deployment-Pipeline von Hand auf CI/CD umgestellt — Releases von wöchentlich auf täglich.',
        'Team von drei Entwicklern fachlich geführt, Code-Reviews und Onboarding verantwortet.',
      ],
      en: [
        'Owned the architecture of the core application and its migration to a service-oriented structure.',
        'Moved deployment from manual steps to CI/CD — releases went from weekly to daily.',
        'Led three engineers technically, owning code review and onboarding.',
      ],
    },
  },
  {
    period: '2020 — 2023',
    from: '2020',
    role: { de: 'Full-Stack-Entwickler', en: 'Full-Stack Engineer' },
    company: 'Agentur XYZ',
    location: { de: 'Berlin', en: 'Berlin' },
    stack: ['Laravel', 'Vue', 'MySQL', 'Redis'],
    bullets: {
      de: [
        'Kundenprojekte von der Anforderung bis zum Livegang umgesetzt.',
        'Wiederverwendbares Komponenten-Paket aufgebaut, das die Projektlaufzeit spürbar verkürzt hat.',
      ],
      en: [
        'Delivered client projects from requirements through to launch.',
        'Built a reusable component package that measurably shortened project timelines.',
      ],
    },
  },
  {
    period: '2018 — 2020',
    from: '2018',
    role: { de: 'Backend-Entwickler', en: 'Backend Engineer' },
    company: 'Startup AG',
    location: { de: 'Remote', en: 'Remote' },
    stack: ['PHP', 'MySQL', 'REST'],
    bullets: {
      de: ['API für die mobile App entwickelt und dokumentiert.'],
      en: ['Built and documented the API behind the mobile app.'],
    },
  },
]

export const skills: { group: T; items: string[] }[] = [
  {
    group: { de: 'Backend', en: 'Backend' },
    items: ['PHP', 'Laravel', 'MySQL / MariaDB', 'Redis', 'REST', 'Queues'],
  },
  {
    group: { de: 'Frontend', en: 'Frontend' },
    items: ['TypeScript', 'React', 'Inertia', 'Vite', 'Tailwind CSS'],
  },
  {
    group: { de: 'Infrastruktur', en: 'Infrastructure' },
    items: ['Docker', 'Traefik', 'Linux', 'CI/CD', 'GitHub Actions', 'Nginx'],
  },
  {
    group: { de: 'Arbeitsweise', en: 'Practice' },
    // Tool and practice names stay untranslated in both languages.
    items: ['Testing', 'Code Review', 'Refactoring', 'Documentation'],
  },
]

export type Project = {
  name: string
  year: string
  blurb: T
  stack: string[]
  href?: string
}

/* TODO: replace with real projects — these are placeholders. */
export const projects: Project[] = [
  {
    name: 'Platform',
    year: '2026',
    blurb: {
      de: 'Lokale Entwicklungsplattform: Traefik plus eigene CA, die jedes Projekt unter einer eigenen Domain mit gültigem Zertifikat ausliefert — ohne Portkonflikte.',
      en: 'A local development platform: Traefik plus a private CA that serves every project on its own domain with a trusted certificate — and no port conflicts.',
    },
    stack: ['Docker', 'Traefik', 'Bash', 'Python'],
  },
  {
    name: 'Projekt Zwei',
    year: '2025',
    blurb: {
      de: 'Kurzbeschreibung des Projekts — was es löst und warum die Lösung interessant war.',
      en: 'A short description — what it solves and why the solution was interesting.',
    },
    stack: ['Laravel', 'React'],
  },
  {
    name: 'Projekt Drei',
    year: '2024',
    blurb: {
      de: 'Kurzbeschreibung des Projekts — was es löst und warum die Lösung interessant war.',
      en: 'A short description — what it solves and why the solution was interesting.',
    },
    stack: ['TypeScript', 'Node'],
  },
]

export const education: { period: string; what: T; where: string }[] = [
  {
    period: '2014 — 2018',
    what: { de: 'B.Sc. Informatik', en: 'B.Sc. Computer Science' },
    where: 'Universität', // TODO
  },
]

export const contact = {
  eyebrow: { de: 'Kontakt', en: 'Contact' } satisfies T,
  heading: {
    de: 'Lass uns reden.',
    en: 'Let’s talk.',
  } satisfies T,
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
    skills: { de: 'Skills', en: 'Skills' } satisfies T,
    skillsHeading: { de: 'Womit ich arbeite.', en: 'What I work with.' } satisfies T,
    projects: { de: 'Projekte', en: 'Projects' } satisfies T,
    projectsHeading: { de: 'Ausgewählte Arbeiten.', en: 'Selected work.' } satisfies T,
    education: { de: 'Ausbildung', en: 'Education' } satisfies T,
  },
  toTop: { de: 'Nach oben', en: 'Back to top' } satisfies T,
  menu: { de: 'Menü', en: 'Menu' } satisfies T,
  langLabel: { de: 'Sprache wechseln', en: 'Switch language' } satisfies T,
  present: { de: 'heute', en: 'present' } satisfies T,
  rights: { de: 'Alle Rechte vorbehalten.', en: 'All rights reserved.' } satisfies T,
}
