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
/* The skill pills. A tinted chip rather than a grey one: it ties the group of
 * them to the accent the eyebrows and links already use, and stays legible
 * printed in greyscale, where the fill drops to a light tone and the ink to a
 * dark one. */
const PILL_BG = '#eff5fa'
const PILL_LINE = '#d8e6f1'
const PILL_INK = '#1f3346'

/* A4 in points, and the margin everything is measured from. */
const W = 595.28
const H = 841.89
const M = 40
const CONTENT_W = W - M * 2

/* One column, full measure.
 *
 * A two-column CV is the classic parser failure: extractors that sort text by
 * position — which most ATS still do — interleave the two, so the profile
 * paragraph comes back shredded through the skills list. Tagging the document
 * fixes the reading order for anything that reads tags, but not for the ones
 * that don't, and this document's job is to survive all of them. So: one
 * column, top to bottom, extracting in exactly the order it prints.
 *
 * Skills are set as one run per group rather than a list, which is both how a
 * keyword matcher wants to read them and what buys back the height the second
 * column was providing.
 *
 * The section eyebrows sit inline above their rule rather than in a gutter to
 * the left. A gutter is a second column too: with the labels set out there,
 * 'PROFILE' and 'EXPERIENCE' came back out of the file stuck together, ahead
 * of the paragraph that belongs between them. The lines that inline headings
 * cost are paid for by the measure the gutter was taking — every paragraph
 * and bullet on the page now wraps a fifth less often.
 */

/* Where body content has to stop — the footer line lives below this. */
const BOTTOM = H - M - 16

const FONT_FILES = {
  // The site's display face, in its 72pt optical cut — the serif appears in
  // the PDF only once, on the name at 29pt, which is display size.
  serif: 'Newsreader72pt-Medium.ttf',
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
      Title: `${profile.name} · ${cv.docTitle[lang]}`,
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

  /**
   * The eyebrow that heads every section, set in the gutter to the left of the
   * body with a rule running across the measure beside it.
   *
   * It is drawn first and tagged H2, so it leads its section in the extracted
   * text exactly as it does on the page.
   */
  const head = (label, first = false) => {
    if (!first) col.y += g(24)
    // The heading and whatever follows it are reserved together: a section
    // title stranded at the foot of a page is worse than a short page.
    ensure(col, g(20) + 34)
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
    doc.markContent('Artifact')
    doc
      .moveTo(col.x, col.y)
      .lineTo(col.x + col.w, col.y)
      .lineWidth(0.5)
      .strokeColor(LINE)
      .stroke()
    doc.endMarkedContent()
    col.y += g(11)
  }

  /** A bullet: an accent tick in the margin, the text hung off it. */
  const bullet = (col, str, list) => {
    const indent = 9
    doc.font('sans').fontSize(8.6).fillColor(INK)
    const opts = { width: col.w - indent, lineGap: g(1.1) }
    const h = doc.heightOfString(str, opts)
    ensure(col, h)
    at(col)
    // The tick is decoration, so it is drawn as an artifact and — importantly —
    // drawn *outside* the structure element. pdfkit opens and closes its own
    // marked-content around a struct's draw function, and a second marking
    // nested inside it closes the wrong one: the file still renders, but every
    // bullet leaves a mismatched EMC behind for the parser to trip over.
    doc.markContent('Artifact')
    doc
      .rect(col.x + 1.5, col.y + 3.4, 3, 1.1)
      .fillColor(ACCENT)
      .fill()
    doc.endMarkedContent()

    // Tagged as a list item, so a parser reads the four bullets under a job as
    // four separate points rather than one run-on paragraph.
    const li = doc.struct('LI')
    list.add(li)
    li.add(
      doc.struct('LBody', {}, () => {
        doc.font('sans').fontSize(8.6).fillColor(INK)
        doc.text(str, col.x + indent, col.y, opts)
      }),
    )
    li.end()
    col.y += h + g(2.6)
  }

  /**
   * A run of skills set as pills — a rounded chip per name, greedily wrapped
   * across the measure.
   *
   * The chips are drawn as artifacts and the names as list items, so an
   * extractor is handed the same left-to-right, top-to-bottom sequence the eye
   * reads, one skill per item, with no chrome mixed into the text. A pill is
   * never split across a page: rows are reserved whole.
   */
  const PILL = { size: 8, padX: 7, padY: 4, gapX: 5, gapY: 5 }

  /** Wraps `names` into rows of pills, and measures what that will cost. */
  const pillRows = (col, names) => {
    doc.font('sans-md').fontSize(PILL.size)
    const h = doc.currentLineHeight() + PILL.padY * 2

    // Greedy wrap. A name wider than the measure gets its own row rather than
    // being broken — there is no such name here, but a future one would
    // otherwise silently overhang the margin.
    const rows = [[]]
    let used = 0
    for (const name of names) {
      const w = Math.min(doc.widthOfString(name) + PILL.padX * 2, col.w)
      if (used > 0 && used + PILL.gapX + w > col.w) {
        rows.push([])
        used = 0
      }
      rows[rows.length - 1].push({ name, w })
      used += (used ? PILL.gapX : 0) + w
    }
    return { rows, h, total: rows.length * h + (rows.length - 1) * g(PILL.gapY) }
  }

  /**
   * Draws a measured run of pills.
   *
   * The chips are drawn as artifacts and the names as list items, so an
   * extractor is handed the same left-to-right, top-to-bottom sequence the eye
   * reads, one skill per item, with no chrome mixed into the text. A pill is
   * never split across a page: rows are reserved whole.
   */
  const pills = (col, { rows, h }) => {
    const list = doc.struct('L')
    parent.add(list)
    for (const [i, row] of rows.entries()) {
      ensure(col, h)
      at(col)
      let x = col.x
      for (const pill of row) {
        // Chrome first, and outside the structure element: pdfkit wraps a
        // struct's draw in its own marked content, and a second marking nested
        // inside it closes the wrong one.
        doc.markContent('Artifact')
        doc
          .roundedRect(x, col.y, pill.w, h, h / 2)
          .fillColor(PILL_BG)
          .fill()
        doc
          .roundedRect(x + 0.25, col.y + 0.25, pill.w - 0.5, h - 0.5, h / 2)
          .lineWidth(0.5)
          .strokeColor(PILL_LINE)
          .stroke()
        doc.endMarkedContent()

        const li = doc.struct('LI')
        list.add(li)
        const tx = x + PILL.padX
        const ty = col.y + PILL.padY
        li.add(
          doc.struct('LBody', {}, () => {
            doc.font('sans-md').fontSize(PILL.size).fillColor(PILL_INK)
            doc.text(pill.name, tx, ty, { width: pill.w - PILL.padX * 2, lineBreak: false })
          }),
        )
        li.end()
        x += pill.w + PILL.gapX
      }
      col.y += h + (i < rows.length - 1 ? g(PILL.gapY) : 0)
    }
    list.end()
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
  // One cursor now. The section eyebrow sits in a gutter to the left of the
  // body rather than above it, which keeps the vertical rhythm tight without
  // costing the text any measure.
  const col = { x: M, w: CONTENT_W, y: top, page: 0 }

  /* ── Profile ─────────────────────────────────────────────────────────── */
  head(t(cv.summary), true)
  // The intro alone. The second paragraph of `about` restates the studies,
  // which the intro now names and Education dates — three times is twice too
  // many on a page this short.
  write(col, t(profile.intro), { font: 'sans', size: 8.9, color: INK, lineGap: 1.5 })

  /* ── Experience ──────────────────────────────────────────────────────── */
  head(t(ui.sections.experience))
  experience.forEach((job, i) => {
    if (i > 0) col.y += g(10)
    // The entry's identity — role, employer, dates — is reserved as one block,
    // so a page break can never land between a job title and its dates.
    ensure(col, 40)
    write(col, t(job.role), {
      font: 'sans-sb',
      size: 9.8,
      color: INK,
      lineBreak: false,
      role: 'H3',
    })
    col.y += g(2)
    // Employer, dates and place on one line and in one run: a parser reading
    // by position must not be able to split them into three stray fragments.
    // Single-spaced separators for the same reason — a wide gap reads to an
    // extractor as a column break.
    write(col, `${job.company} · ${period(job, lang, t(ui.present))} · ${t(job.location)}`, {
      font: 'mono',
      size: 7.6,
      color: DIM,
      lineBreak: false,
      gap: 5,
    })
    if (t(job.bullets).length) {
      const list = doc.struct('L')
      parent.add(list)
      for (const b of t(job.bullets)) bullet(col, b, list)
      list.end()
    }
    if (job.stack.length) {
      col.y += g(2.5)
      write(col, job.stack.join(' · '), { font: 'mono', size: 7.4, color: ACCENT, lineGap: 1.5 })
    }
  })

  /* ── Skills ──────────────────────────────────────────────────────────── */
  head(t(ui.sections.skills))
  skills.forEach((group, i) => {
    if (i > 0) col.y += g(11)
    const laid = pillRows(col, group.items.map((sk) => (sk.label ? t(sk.label) : sk.name)))
    // A group moves to the next page whole rather than leaving one stray row
    // of pills behind it — 'DevOps' heading a page it has already left is the
    // one break that reads as a mistake. Only where a page could hold the
    // group at all; a group taller than that falls back to reserving its label
    // and first row, which is the most that can be promised.
    const block = 14 + g(5) + laid.total
    ensure(col, Math.min(block, BOTTOM - M))
    write(col, t(group.group), {
      font: 'sans-sb',
      size: 8.6,
      color: INK,
      lineBreak: false,
      gap: 5,
    })
    pills(col, laid)
  })

  /* ── Languages ───────────────────────────────────────────────────────── */
  head(t(ui.sections.languages))
  languages.forEach((l, i) => {
    if (i > 0) col.y += g(3)
    ensure(col, 14)
    // Name, level and evidence as one sentence-like run, so 'German' and 'C1'
    // cannot be separated by an extractor that sorts columns.
    const note = t(l.note)
    write(col, `${t(l.name)}: ${t(l.level)}${note ? ` · ${note}` : ''}`, {
      font: 'sans',
      size: 8.4,
      color: INK,
      lineGap: 1.4,
    })
  })

  /* ── Education ───────────────────────────────────────────────────────── */
  head(t(ui.sections.education))
  education.forEach((e, i) => {
    if (i > 0) col.y += g(6)
    ensure(col, 26)
    write(col, t(e.what), {
      font: 'sans-sb',
      size: 8.6,
      color: INK,
      lineGap: 1,
      gap: 2,
      role: 'H3',
    })
    // Institution, dates and whatever the entry notes, all on one run. Three
    // separate lines per entry spent a third of the page on the least
    // load-bearing section, and a parser reads the merged line no differently.
    const parts = [e.where, period(e, lang, t(ui.present)), t(e.note)].filter(Boolean)
    write(col, parts.join(' · '), { font: 'mono', size: 7.4, color: DIM, lineGap: 1.4 })
  })

  /* ── Projects, once there are any ────────────────────────────────────── */
  if (projects.length) {
    head(t(ui.sections.projects))
    projects.forEach((p, i) => {
      if (i > 0) col.y += g(6)
      ensure(col, 28)
      write(col, p.name, {
        font: 'sans-sb',
        size: 8.6,
        color: INK,
        lineBreak: false,
        gap: 2,
        role: 'H3',
      })
      write(col, t(p.blurb), { font: 'sans', size: 8.2, color: DIM, lineGap: 1.4, gap: 2 })
      if (p.stack.length) {
        write(col, p.stack.join(' · '), { font: 'mono', size: 7.4, color: ACCENT, lineGap: 1.4 })
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
 * Spacing is chosen, not fixed.
 *
 * `d` scales every gap and never a font size, so both directions stay legible:
 * tightening makes the page denser, loosening makes it airier, and the type is
 * the same size either way.
 *
 * A CV a line or two over one page should come back onto it, so the tight
 * settings are tried first. But a CV that genuinely needs a second page — this
 * one does, once the skills are set as pills — should use it: laid out at 1.0
 * it left the last page two-thirds empty, which reads as an accident. So when
 * one page is out of reach, the layout expands into the room it has already
 * taken rather than huddling at the top of it.
 */
const TIGHT = [1, 0.94, 0.88, 0.82]
const LOOSE = [1.3, 1.2, 1.1, 1]

await mkdir(OUT, { recursive: true })

const LANGS = ['de', 'en']

// One density for both documents. German runs about a tenth longer than the
// same text in English, and letting each language pick its own spacing would
// leave the pair visibly different — the same CV, set two ways. So every
// candidate is judged on the language that fits it worst.
const pagesAt = (d) => Math.max(...LANGS.map((lang) => build(lang, d).pages))

const natural = pagesAt(1)
const candidates = natural === 1 ? TIGHT : LOOSE
const target = natural === 1 ? 1 : natural
const density = candidates.find((d) => pagesAt(d) <= target) ?? 1

if (density !== 1) {
  const pct = Math.round(density * 100)
  const how = density < 1 ? `tightened to ${pct}%` : `opened up to ${pct}%`
  console.log(`cv: spacing ${how} for ${target} page${target > 1 ? 's' : ''}`)
}

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
