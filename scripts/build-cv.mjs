/* ─────────────────────────────────────────────────────────────────────────────
 * Builds the downloadable CV, one PDF per language, into `public/`.
 *
 * The content comes from `src/content/resume.ts` — the same module the site
 * renders — so the PDF a visitor downloads can never disagree with the page
 * they downloaded it from. Node strips the types on import; no build step and
 * no second copy of the facts.
 *
 *   node scripts/build-cv.mjs        (also runs as part of `pnpm build`)
 * ────────────────────────────────────────────────────────────────────────── */

import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

import {
  about,
  cv,
  education,
  experience,
  languages,
  period,
  profile,
  projects,
  skills,
  ui,
} from '../src/content/resume.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const FONTS = join(HERE, 'fonts')
const OUT = join(ROOT, 'public')

/* The light theme's tokens, lifted from src/index.css. The PDF prints on white
 * whatever the reader's theme is, so only the light set applies. */
const INK = '#14181f'
const DIM = '#626c7c'
const LINE = '#e4e7ec'
const ACCENT = '#0369a1'

/* A4 in points, and the margin everything is measured from. */
const W = 595.28
const H = 841.89
const M = 40
const CONTENT_W = W - M * 2

/* Two columns, as on the reference: the narrative on the left, the scannable
 * lists on the right. The gutter is wide enough that a long skill name never
 * reads as a continuation of the bullet beside it. */
const MAIN_W = 296
const GUTTER = 22
const SIDE_W = CONTENT_W - MAIN_W - GUTTER

/* Where body content has to stop — the footer line lives below this. */
const BOTTOM = H - M - 16

const FONT_FILES = {
  serif: 'InstrumentSerif-Regular.ttf',
  sans: 'Inter-Regular.ttf',
  'sans-md': 'Inter-Medium.ttf',
  'sans-sb': 'Inter-SemiBold.ttf',
  mono: 'JetBrainsMono-Regular.ttf',
  'mono-md': 'JetBrainsMono-Medium.ttf',
}

function makeDoc(lang) {
  const doc = new PDFDocument({
    size: 'A4',
    // A tagged PDF carries an explicit structure tree, and that tree — not the
    // position of the ink on the page — is the reading order a parser is meant
    // to follow. It is what lets this stay a two-column document without the
    // columns interleaving when the text is pulled back out.
    pdfVersion: '1.7',
    tagged: true,
    margins: { top: M, bottom: M, left: M, right: M },
    bufferPages: true,
    info: {
      Title: `${profile.name} — ${cv.docTitle[lang]}`,
      Author: profile.name,
      Subject: profile.role[lang],
      Keywords: skills.flatMap((g) => g.items.map((s) => s.name)).join(', '),
    },
    lang: lang === 'de' ? 'de-DE' : 'en-GB',
    displayTitle: true,
  })
  for (const [name, file] of Object.entries(FONT_FILES)) {
    doc.registerFont(name, join(FONTS, file))
  }
  return doc
}

/**
 * Lays the document out once.
 *
 * `d` scales every piece of vertical breathing room — never a font size, so a
 * tightened page is denser but never smaller to read. The caller uses it to
 * pull a document that overruns by a line or two back onto a single page.
 */
function build(lang, d = 1) {
  const doc = makeDoc(lang)
  const t = (v) => (v && typeof v === 'object' ? v[lang] : v)
  const g = (n) => n * d
  const state = { pages: 1 }

  /* ── Structure tree ─────────────────────────────────────────────────────
   * Elements are appended in the order they are drawn, and the main column is
   * drawn before the sidebar — so the logical order a parser reads is
   * header, profile, experience, skills, languages, education, whatever the
   * geometry does. `open` starts a section; `emit` files one drawn run under
   * whichever section is current.
   */
  const root = doc.struct('Document')
  doc.addStructure(root)
  const opened = []
  let parent = root

  const open = (role = 'Sect') => {
    const el = doc.struct(role)
    root.add(el)
    opened.push(el)
    parent = el
    return el
  }

  const emit = (role, draw, host = parent) => {
    const el = doc.struct(role, {}, draw)
    host.add(el)
    el.end()
    return el
  }

  /* ── Column cursors ─────────────────────────────────────────────────────
   * Each column carries its own page and baseline, so the two flow
   * independently: a sidebar that runs onto a second page does not push the
   * experience list down. `bufferPages` is what keeps every page open for
   * writing until the document is flushed, which makes that possible.
   */
  const at = (col) => doc.switchToPage(col.page)

  /** Makes room for `need` points, starting a continuation page if short. */
  const ensure = (col, need) => {
    if (col.y + need <= BOTTOM) return
    col.page += 1
    if (col.page >= state.pages) {
      doc.addPage()
      state.pages = col.page + 1
    }
    col.y = M
  }

  /** Draws a run of text at the cursor and advances it. */
  const write = (col, str, { font, size, color, gap = 0, lineGap = 0, role = 'P', ...rest }) => {
    doc.font(font).fontSize(size).fillColor(color)
    const opts = { width: col.w, lineGap: g(lineGap), ...rest }
    const h = doc.heightOfString(str, opts)
    ensure(col, h)
    at(col)
    emit(role, () => {
      doc.font(font).fontSize(size).fillColor(color)
      doc.text(str, col.x, col.y, opts)
    })
    col.y += h + g(gap)
  }

  const rule = (col) => {
    at(col)
    doc.markContent('Artifact')
    doc
      .moveTo(col.x, col.y)
      .lineTo(col.x + col.w, col.y)
      .lineWidth(0.5)
      .strokeColor(LINE)
      .stroke()
    doc.endMarkedContent()
  }

  /** The eyebrow that heads every section: mono, letterspaced, over a rule. */
  const head = (col, label, first = false) => {
    if (!first) col.y += g(16)
    // The heading and whatever follows it are reserved together: a section
    // title stranded at the foot of a column is worse than a short page.
    ensure(col, g(20) + 26)
    doc.font('mono-md').fontSize(7.2).fillColor(ACCENT)
    at(col)
    open()
    // The heading is tagged with the word as it reads, not as it is set: the
    // page shows 'ERFAHRUNG', and a parser is handed 'Erfahrung'.
    emit('H2', () => {
      doc.font('mono-md').fontSize(7.2).fillColor(ACCENT)
      doc.text(label.toUpperCase(), col.x, col.y, {
        width: col.w,
        characterSpacing: 1.4,
        lineBreak: false,
      })
    })
    col.y += g(11)
    rule(col)
    col.y += g(9)
  }

  /** A bullet: an accent tick in the margin, the text hung off it. */
  /** A bullet: an accent tick in the margin, the text hung off it. */
  const bullet = (col, str, list) => {
    const indent = 9
    doc.font('sans').fontSize(8.6).fillColor(INK)
    const opts = { width: col.w - indent, lineGap: g(1.1) }
    const h = doc.heightOfString(str, opts)
    ensure(col, h)
    at(col)
    // Tagged as a list item, so a parser reads the four bullets under a job as
    // four separate points rather than one run-on paragraph. The tick itself
    // is decoration and is marked artifact — it must not reach the text.
    const li = doc.struct('LI')
    list.add(li)
    li.add(
      doc.struct('LBody', {}, () => {
        doc.markContent('Artifact')
        doc
          .rect(col.x + 1.5, col.y + 3.4, 3, 1.1)
          .fillColor(ACCENT)
          .fill()
        doc.endMarkedContent()
        doc.font('sans').fontSize(8.6).fillColor(INK)
        doc.text(str, col.x + indent, col.y, opts)
      }),
    )
    li.end()
    col.y += h + g(2.6)
  }

  /* ── Header ──────────────────────────────────────────────────────────── */
  const header = () => {
    doc.switchToPage(0)
    let y = M
    open()

    emit('H1', () => {
      doc.font('serif').fontSize(29).fillColor(INK)
      doc.text(profile.name, M, y, { width: CONTENT_W, lineBreak: false })
    })
    y += 31

    emit('P', () => {
      doc.font('sans-md').fontSize(10.5).fillColor(ACCENT)
      doc.text(t(profile.role), M, y, { width: CONTENT_W, lineBreak: false })
    })
    y += 15

    // The contact line is drawn piece by piece rather than as one string, so
    // the email and the profile links can carry real PDF link annotations.
    const items = [
      { text: t(profile.location) },
      { text: profile.email, href: `mailto:${profile.email}` },
      ...profile.links.map((l) => ({
        text: l.href.replace(/^https?:\/\/(www\.)?/, ''),
        href: l.href,
      })),
      { text: t(profile.availability) },
    ]
    doc.fontSize(8).font('mono')
    emit('P', () => {
      let x = M
      items.forEach((item, i) => {
        doc.fontSize(8)
        if (i > 0) {
          const sep = ' · '
          doc.font('mono').fillColor(LINE)
          doc.text(sep, x, y, { lineBreak: false, width: doc.widthOfString(sep) + 1 })
          x += doc.widthOfString(sep)
        }
        const w = doc.widthOfString(item.text)
        doc.font('mono').fillColor(item.href ? ACCENT : DIM)
        // An explicit width is required alongside `link`: the annotation's
        // rectangle is derived from it, and `lineBreak: false` leaves it
        // unmeasured.
        doc.text(item.text, x, y, {
          lineBreak: false,
          width: w + 1,
          ...(item.href ? { link: item.href } : {}),
        })
        x += w
      })
    })
    y += 15

    doc.markContent('Artifact')
    doc
      .moveTo(M, y)
      .lineTo(M + CONTENT_W, y)
      .lineWidth(0.8)
      .strokeColor(INK)
      .stroke()
    doc.endMarkedContent()

    return y + g(15)
  }

  const top = header()
  const main = { x: M, w: MAIN_W, y: top, page: 0 }
  const side = { x: M + MAIN_W + GUTTER, w: SIDE_W, y: top, page: 0 }

  /* ── Main column: the profile, then the work ─────────────────────────── */
  head(main, t(cv.summary), true)
  for (const para of [t(profile.intro), t(about.body).at(-1)]) {
    if (para) write(main, para, { font: 'sans', size: 8.8, color: INK, lineGap: 1.4, gap: 6 })
  }

  head(main, t(ui.sections.experience))
  experience.forEach((job, i) => {
    if (i > 0) main.y += g(9)
    // The entry's identity — role, employer, dates — is reserved as one block,
    // so a page break can never land between a job title and its dates.
    ensure(main, 34)
    write(main, t(job.role), {
      font: 'sans-sb',
      size: 9.6,
      color: INK,
      lineBreak: false,
      role: 'H3',
    })
    main.y += g(1.5)
    write(main, job.company, { font: 'sans-md', size: 9, color: ACCENT, lineBreak: false })
    main.y += g(1.5)
    // Single-spaced separators, not the wider setting the eye would prefer: a
    // text extractor treats a wide gap as a column break and shatters the line
    // into fragments.
    write(main, `${period(job, lang, t(ui.present))} · ${t(job.location)}`, {
      font: 'mono',
      size: 7.4,
      color: DIM,
      lineBreak: false,
      gap: 5,
    })
    if (t(job.bullets).length) {
      const list = doc.struct('L')
      parent.add(list)
      for (const b of t(job.bullets)) bullet(main, b, list)
      list.end()
    }
    if (job.stack.length) {
      main.y += g(2)
      write(main, job.stack.join(' · '), {
        font: 'mono',
        size: 7.2,
        color: DIM,
        lineGap: 1.5,
      })
    }
  })

  /* ── Sidebar: the scannable lists ────────────────────────────────────── */
  head(side, t(ui.sections.skills), true)
  skills.forEach((group, gi) => {
    if (gi > 0) side.y += g(6)
    write(side, t(group.group), {
      font: 'sans-sb',
      size: 8.4,
      color: INK,
      lineBreak: false,
      gap: 4,
    })
    for (const skill of group.items) {
      const shown = skill.label ? t(skill.label) : skill.name
      doc.font('sans').fontSize(8.2)
      const dotsW = skill.level ? 5 * 5.2 : 0
      const nameW = side.w - dotsW - 8
      const h = Math.max(doc.heightOfString(shown, { width: nameW }), 9)
      ensure(side, h)
      at(side)
      emit('P', () => {
        doc.font('sans').fontSize(8.2).fillColor(INK)
        doc.text(shown, side.x, side.y, { width: nameW })
      })
      if (skill.level) {
        // The CV's filled dots, kept as dots: a five-step self-assessment is
        // more honest as a scale than as a word like "advanced". They are
        // marked artifact — a parser should come away with 'React', not with
        // 'React' followed by a rating it will read as noise.
        doc.markContent('Artifact')
        for (let dot = 0; dot < 5; dot++) {
          doc
            .circle(side.x + side.w - dotsW + 2.4 + dot * 5.2, side.y + 4, 1.7)
            .fillColor(dot < skill.level ? ACCENT : LINE)
            .fill()
        }
        doc.endMarkedContent()
      }
      side.y += h + g(1.4)
    }
  })
  write(side, t(ui.levelNote), { font: 'mono', size: 6.6, color: DIM, lineGap: 1 })

  head(side, t(ui.sections.languages))
  languages.forEach((l, i) => {
    if (i > 0) side.y += g(3)
    ensure(side, 20)
    at(side)
    // Name and level are set at the two ends of one line; filing them as a
    // single paragraph keeps 'German' and 'C1' together when the text is
    // pulled out, instead of stranding the levels in a column of their own.
    emit('P', () => {
      doc.font('sans-sb').fontSize(8.4).fillColor(INK)
      doc.text(t(l.name), side.x, side.y, { width: side.w - 46, lineBreak: false })
      doc.font('mono').fontSize(7.4).fillColor(ACCENT)
      doc.text(t(l.level), side.x, side.y + 0.6, {
        width: side.w,
        align: 'right',
        lineBreak: false,
      })
    })
    side.y += g(10.5)
    if (t(l.note)) write(side, t(l.note), { font: 'sans', size: 7.4, color: DIM, lineGap: 1 })
  })

  head(side, t(ui.sections.education))
  education.forEach((e, i) => {
    if (i > 0) side.y += g(6)
    ensure(side, 26)
    write(side, t(e.what), {
      font: 'sans-sb',
      size: 8.4,
      color: INK,
      lineGap: 1,
      gap: 1,
      role: 'H3',
    })
    if (e.where) write(side, e.where, { font: 'sans', size: 7.8, color: DIM, lineGap: 1, gap: 1 })
    write(side, period(e, lang, t(ui.present)), {
      font: 'mono',
      size: 7.2,
      color: ACCENT,
      lineBreak: false,
      gap: t(e.note) ? 1.5 : 0,
    })
    if (t(e.note)) write(side, t(e.note), { font: 'sans', size: 7.4, color: DIM, lineGap: 1 })
  })

  if (projects.length) {
    head(side, t(ui.sections.projects))
    projects.forEach((p, i) => {
      if (i > 0) side.y += g(6)
      ensure(side, 26)
      write(side, p.name, { font: 'sans-sb', size: 8.4, color: INK, lineBreak: false, gap: 1.5 })
      write(side, t(p.blurb), { font: 'sans', size: 7.8, color: DIM, lineGap: 1, gap: 1.5 })
      if (p.stack.length) {
        write(side, p.stack.join(' · '), { font: 'mono', size: 7, color: ACCENT, lineGap: 1 })
      }
    })
  }

  /* ── Footer, stamped once the page count is known ────────────────────── */
  for (let p = 0; p < state.pages; p++) {
    doc.switchToPage(p)
    const y = H - M + 2
    // The footer deliberately sits below the bottom margin, and pdfkit breaks
    // to a fresh page for any text that crosses it — which silently appended a
    // blank page to every document. Dropping the margin for the duration of
    // the call is the supported way to write into that band.
    const keep = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    // Running content: marked artifact so it does not land in the middle of
    // the extracted text once per page.
    doc.markContent('Artifact')
    doc.font('mono').fontSize(6.8).fillColor(DIM)
    doc.text(`${profile.name} · ${profile.email}`, M, y, {
      width: CONTENT_W,
      lineBreak: false,
    })
    if (state.pages > 1) {
      doc.text(`${p + 1} / ${state.pages}`, M, y, {
        width: CONTENT_W,
        align: 'right',
        lineBreak: false,
      })
    }
    doc.endMarkedContent()
    doc.page.margins.bottom = keep
  }

  for (const el of opened) el.end()
  root.end()

  // Read back from the document rather than trusting the running tally: it is
  // the number the reader will actually see, and it catches any page pdfkit
  // added on its own.
  return { doc, pages: doc.bufferedPageRange().count }
}

/**
 * Lays the CV out at its natural spacing, and only tightens if that would
 * spill a mostly empty extra page. A CV with enough on it to genuinely fill
 * two pages keeps the roomier setting; this one, a line or two over, comes
 * back to one.
 */
const DENSITIES = [1, 0.94, 0.88, 0.82]

/** The loosest spacing at which this language still fits on one page. */
function fits(lang) {
  for (const d of DENSITIES) {
    if (build(lang, d).pages === 1) return d
  }
  // Genuinely more than a page of content: lay it out roomily and let it run.
  return 1
}

await mkdir(OUT, { recursive: true })

const LANGS = ['de', 'en']

// One density for both documents. German runs about a tenth longer than the
// same text in English, and letting each language pick its own spacing would
// leave the pair visibly different — the same CV, set two ways.
const density = Math.min(...LANGS.map(fits))
if (density < 1) console.log(`cv: spacing tightened to ${Math.round(density * 100)}% to hold one page`)

for (const lang of LANGS) {
  const { doc, pages } = build(lang, density)
  const file = cv.file[lang]
  await new Promise((resolve, reject) => {
    const out = createWriteStream(join(OUT, file))
    out.on('finish', resolve)
    out.on('error', reject)
    doc.pipe(out)
    doc.flushPages()
    doc.end()
  })
  console.log(`cv: ${file} — ${pages} page${pages > 1 ? 's' : ''}`)
}
