# Ehsan Moradpour

Software Engineer in Dortmund. I build back ends that move data through
stages — media pipelines, search indexing, CI/CD — and I work test-driven.
Full-stack developer at hulle24 since 2023, with a B.Sc. in applied computer
science completed in September 2026.

**Site:** <https://ehsanmim.github.io>

This repo is that site: one page, in German and English, with my work history
drawn as a `git log`-style commit graph.

## Stack

React 19, TypeScript, Vite and Tailwind CSS 4. Linted with Oxlint.

## Working on it

```sh
pnpm install
pnpm dev      # dev server with HMR
pnpm build    # type-check and build into dist/
pnpm lint
```

## Where things are

- `src/content/site.ts` — every word on the page, as `{ de, en }` pairs.
  Edit this to change the content; the sections build themselves from it.
- `src/looks/editorial/` — the layout: masthead, sections and the commit graph.
- `src/lib/` — language, theme and scroll hooks.

## Deploy

Every push to `main` builds the site and publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`).
