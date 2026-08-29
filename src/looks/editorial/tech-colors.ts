/**
 * Tech name -> colour. Its own module because a file that exports both a
 * component and a plain function loses React Fast Refresh.
 */
/* GitHub-ish language colours. Anything unlisted falls back to grey rather
 * than getting a random hue, so an unknown tag reads as "no colour assigned"
 * instead of as a category of its own. */
const TECH_COLORS: Record<string, string> = {
  php: '#787CB5',
  laravel: '#FF2D20',
  javascript: '#f1e05a',
  typescript: '#3178c6',
  react: '#61dafb',
  vue: '#41b883',
  inertia: '#9553e9',
  vite: '#646cff',
  'tailwind css': '#38bdf8',
  node: '#539e43',
  docker: '#2496ed',
  traefik: '#24a1c1',
  'docker compose': '#2496ed',
  git: '#f05033',
  github: '#6e7781',
  gitlab: '#fc6d26',
  nginx: '#009639',
  linux: '#fcc624',
  bash: '#89e051',
  python: '#3572A5',
  django: '#44b78b',
  go: '#00add8',
  postgresql: '#4d94c4',
  typesense: '#d52d7f',
  redis: '#dc382d',
  mysql: '#00758f',
  mariadb: '#c0765a',
  'mysql / mariadb': '#00758f',
  'github actions': '#2088ff',
  s3: '#e25444',
  minio: '#c72e49',
  rustfs: '#ce422b',
  'ci/cd': '#8b949e',
  rest: '#8b949e',
  queues: '#8b949e',
}

export function techColor(name: string): string {
  return TECH_COLORS[name.toLowerCase()] ?? '#6b7689'
}
