import type { ComponentType } from 'react'
import {
  SiCss,
  SiDjango,
  SiDocker,
  SiGit,
  SiGithub,
  SiGitlab,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJquery,
  SiLaravel,
  SiMariadb,
  SiPhp,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
} from 'react-icons/si'
import { techColor } from './tech-colors'

/**
 * Brand marks for the skills that have one, keyed by the name in the content
 * file. Imported individually so the bundle carries these seventeen glyphs
 * rather than the whole Simple Icons set.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  react: SiReact,
  'tailwind css': SiTailwindcss,
  html: SiHtml5,
  css: SiCss,
  jquery: SiJquery,
  javascript: SiJavascript,
  laravel: SiLaravel,
  php: SiPhp,
  django: SiDjango,
  go: SiGo,
  postgresql: SiPostgresql,
  mariadb: SiMariadb,
  docker: SiDocker,
  'docker compose': SiDocker,
  git: SiGit,
  github: SiGithub,
  gitlab: SiGitlab,
}

/** A dot, for the skills with no brand mark — "CI/CD", "Responsives Webdesign". */
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
