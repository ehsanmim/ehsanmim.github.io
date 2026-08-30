import type { ComponentType } from 'react'
import {
  SiAlpinedotjs,
  SiBootstrap,
  SiBun,
  SiCss,
  SiDocker,
  SiFastapi,
  SiGit,
  SiGithub,
  SiGitlab,
  SiGnubash,
  SiGo,
  SiGooglecloud,
  SiHetzner,
  SiHtml5,
  SiInertia,
  SiJavascript,
  SiJquery,
  SiLaravel,
  SiLinux,
  SiMariadb,
  SiMysql,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiReactrouter,
  SiRedis,
  SiSelenium,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiVuedotjs,
} from 'react-icons/si'
import { techColor } from './tech-colors'

/**
 * Brand marks for the skills that have one, keyed by the name in the content
 * file. Imported individually so the bundle carries these glyphs rather than
 * the whole Simple Icons set.
 *
 * Not every skill gets one, and the gaps are deliberate. Simple Icons carries
 * no mark for AWS, BrowserStack, Twig, Zustand or Echo — AWS and a few others
 * because the trademark holders asked for them to be removed — so those fall
 * through to a plain dot. Drawing something approximate in their place would
 * be inventing a brand.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  // Backend
  php: SiPhp,
  laravel: SiLaravel,
  'node.js': SiNodedotjs,
  bun: SiBun,
  python: SiPython,
  fastapi: SiFastapi,
  go: SiGo,
  // Reverb is Laravel's own websocket server, and carries Laravel's mark.
  'laravel reverb': SiLaravel,

  // Frontend
  typescript: SiTypescript,
  javascript: SiJavascript,
  react: SiReact,
  'react router': SiReactrouter,
  vue: SiVuedotjs,
  'alpine.js': SiAlpinedotjs,
  jquery: SiJquery,
  vite: SiVite,
  'inertia.js': SiInertia,

  // DevOps
  linux: SiLinux,
  bash: SiGnubash,
  docker: SiDocker,
  'docker compose': SiDocker,
  'docker swarm': SiDocker,
  gcp: SiGooglecloud,
  hetzner: SiHetzner,
  selenium: SiSelenium,
  git: SiGit,
  github: SiGithub,
  gitlab: SiGitlab,

  // Design
  html: SiHtml5,
  css: SiCss,
  'tailwind css': SiTailwindcss,
  bootstrap: SiBootstrap,
  // Blade is Laravel's template engine, so it carries Laravel's mark too.
  blade: SiLaravel,

  // Databases
  mysql: SiMysql,
  mariadb: SiMariadb,
  postgresql: SiPostgresql,
  sqlite: SiSqlite,
  redis: SiRedis,
}

/** A dot, for the skills with no brand mark — "CI/CD", "Caching", "AWS". */
function GenericMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: techColor(name) }}
    />
  )
}

/**
 * The mark for one skill: its brand glyph where there is one, tinted with the
 * same colour the rest of the page uses for that technology, and a plain dot
 * where there is not — a made-up glyph would read as a brand that does not
 * exist.
 */
export function SkillIcon({ name }: { name: string }) {
  const Icon = ICONS[name.toLowerCase()]
  if (!Icon) return <GenericMark name={name} />
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center"
      style={{ color: techColor(name) }}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}
