// Wiki search, on the server (GET /api/wiki/search?q=&lang=): the browser no longer holds the pages, it sends the query.
// What is searched, from most to least weight: page name, its name in the other language and its item id
// (« press », « mechanical_press » find the Presse mécanique), category and mod, description and recipe
// ingredients, section titles, then the text of the sections. Accents, case and apostrophes are ignored, every
// word of the query must match somewhere (prefix of a word, or one typo on words of 5+ letters).
// A hit found in a section (and not in the page name) links to that section: /wiki/<slug>#<section>.

import type { WikiLocale, WikiPageView, WikiSearchResult } from '../../utils/wiki'
import type { Wiki } from './wikiCore'

export interface WikiSearchDoc {
  page: WikiPageView
  icon: string | null
  category: string
  mod: string
  fields: { name: string; alt: string; meta: string; desc: string }
  sections: { id: string; title: string; text: string; ntitle: string; ntext: string }[]
}

export interface WikiSearchHit {
  doc: WikiSearchDoc
  score: number
  /** set when the best match is inside a section */
  section?: { id: string; title: string }
  href: string
  /** plain text excerpt around the first match */
  snippet: string
  /** [start, end) ranges of the matched words in the snippet */
  marks: [number, number][]
}

const STOP = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'de', 'du', 'd', 'a', 'au', 'aux', 'et', 'en', 'pour', 'avec', 'sur', 'dans',
  'comment', 'faire', 'quoi', 'est', 'ce', 'que', 'qui', 'the', 'an', 'of', 'to', 'how', 'in', 'on', 'for', 'and', 'with', 'is',
])

/** lower case, no accents, apostrophes/dashes/underscores/colons as spaces */
export function normalize(s: string): string {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[’'`´_:\-/]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripHtml(html: string): string {
  return (html || '').replace(/<\/?(strong|em|b|i|a|code|span|abbr|kbd|sub|sup)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
}

export function queryTokens(q: string): string[] {
  const all = normalize(q).split(' ').filter(Boolean)
  const kept = all.filter((w) => !STOP.has(w))
  return kept.length ? kept : all
}

const cache = new WeakMap<Wiki, Map<WikiLocale, WikiSearchDoc[]>>()

export function wikiSearchIndex(w: Wiki, lang: WikiLocale): WikiSearchDoc[] {
  let byLang = cache.get(w)
  if (!byLang) {
    byLang = new Map()
    cache.set(w, byLang)
  }
  const hit = byLang.get(lang)
  if (hit) return hit
  const other: WikiLocale = lang === 'en' ? 'fr' : 'en'
  const docs = w.pagesIn(lang).map((page) => {
    const raw = w.get(page.slug)!
    const otherName = w.localize(raw, other).name
    const cat = w.category(page.category, lang)
    const mod = w.mod(cat?.mod || 'create', lang)
    const items = (page.recipe?.grid || []).flat().filter(Boolean).join(' ')
    return {
      page,
      icon: w.icon(page.blockId),
      category: cat?.name || '',
      mod: mod?.name || '',
      fields: {
        name: normalize(page.name),
        alt: normalize(`${otherName} ${page.blockId.split(':')[1]}`),
        meta: normalize(`${cat?.name || ''} ${mod?.name || ''}`),
        desc: normalize(`${page.description} ${items} ${page.facts.map((f) => f.value).join(' ')}`),
      },
      sections: page.sections.map((s) => {
        const text = stripHtml(s.html)
        return { id: s.id, title: s.title, text, ntitle: normalize(s.title), ntext: normalize(text) }
      }),
    }
  })
  byLang.set(lang, docs)
  return docs
}

/** position of `tok` at a word start in `hay` (-1 if none); exact word gets priority through `wordHit`. */
function wordStart(hay: string, tok: string): number {
  let i = hay.indexOf(tok)
  while (i !== -1) {
    if (i === 0 || hay[i - 1] === ' ') return i
    i = hay.indexOf(tok, i + 1)
  }
  return -1
}

function wordStarts(hay: string, tok: string): number[] {
  const out: number[] = []
  let i = hay.indexOf(tok)
  while (i !== -1) {
    if (i === 0 || hay[i - 1] === ' ') out.push(i)
    i = hay.indexOf(tok, i + 1)
  }
  return out
}

/** one substitution, insertion or deletion between a word prefix and the token (words of 5+ letters) */
function fuzzyIn(hay: string, tok: string): boolean {
  if (tok.length < 5) return false
  for (const w of hay.split(' ')) {
    if (Math.abs(w.length - tok.length) > 1 && w.length < tok.length) continue
    const a = w.slice(0, tok.length + 1)
    if (lev1(a, tok) || lev1(w.slice(0, tok.length), tok) || lev1(w.slice(0, tok.length - 1), tok)) return true
  }
  return false
}

function lev1(a: string, b: string): boolean {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (a.length < b.length) j++
    else { i++; j++ }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

export function wikiSearch(w: Wiki, lang: WikiLocale, q: string, limit = 8): WikiSearchHit[] {
  const toks = queryTokens(q)
  if (!toks.length) return []
  const phrase = normalize(q)
  const hits: WikiSearchHit[] = []
  for (const doc of wikiSearchIndex(w, lang)) {
    const f = doc.fields
    let score = 0
    let ok = true
    const secScore = new Map<number, number>()
    for (const tok of toks) {
      let best = 0
      const n = wordStart(f.name, tok)
      if (n === 0) best = 40
      else if (n > 0) best = 28
      else if (f.name.includes(tok)) best = 14
      if (wordStart(f.alt, tok) >= 0) best = Math.max(best, 24)
      if (wordStart(f.meta, tok) >= 0) best = Math.max(best, 10)
      if (wordStart(f.desc, tok) >= 0) best = Math.max(best, 7)
      doc.sections.forEach((s, k) => {
        const v = wordStart(s.ntitle, tok) >= 0 ? 9 : wordStart(s.ntext, tok) >= 0 ? 3 : 0
        if (v) {
          secScore.set(k, (secScore.get(k) || 0) + v)
          best = Math.max(best, v)
        }
      })
      if (!best && (fuzzyIn(f.name, tok) || fuzzyIn(f.alt, tok))) best = 12
      if (!best) { ok = false; break }
      score += best
    }
    if (!ok) continue
    if (f.name === phrase) score += 60
    else if (f.name.startsWith(phrase)) score += 30
    else if (wordStart(f.alt, phrase) >= 0) score += 15

    // section that matches the most words (only shown when the page name itself does not match the query)
    let section: WikiSearchHit['section']
    let secIdx = -1
    let secBest = 0
    secScore.forEach((v, k) => { if (v > secBest) { secBest = v; secIdx = k } })
    const nameMatches = toks.every((t) => f.name.includes(t) || f.alt.includes(t))
    if (secIdx >= 0 && !nameMatches) {
      const s = doc.sections[secIdx]
      section = { id: s.id, title: s.title }
    }
    hits.push({
      doc,
      score,
      section,
      href: section ? `${doc.page.path}#${section.id}` : doc.page.path,
      snippet: section ? doc.sections[secIdx].text : doc.page.description,
      marks: [],
    })
  }
  hits.sort((a, b) => b.score - a.score || a.doc.page.name.localeCompare(b.doc.page.name, lang))
  return hits.slice(0, limit).map((h) => ({ ...h, ...excerpt(h.snippet, toks) }))
}

/** ~140 characters around the first matched word, with the ranges to highlight (on the original text). */
function excerpt(text: string, toks: string[], width = 140): { snippet: string; marks: [number, number][] } {
  // map normalized positions back to the original text: normalize char by char
  const norm: string[] = []
  const back: number[] = []
  for (let i = 0; i < text.length; i++) {
    const c = normalize(text[i]) || ' '
    for (const ch of c) { norm.push(ch); back.push(i) }
  }
  const ntext = norm.join('')
  let first = -1
  for (const t of toks) {
    const p = wordStart(ntext, t)
    if (p >= 0 && (first < 0 || p < first)) first = p
  }
  const center = first >= 0 ? back[first] : 0
  let start = Math.max(0, center - Math.floor(width / 3))
  if (start > 0) { const sp = text.indexOf(' ', start); start = sp >= 0 && sp < center ? sp + 1 : start }
  let end = Math.min(text.length, start + width)
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); end = sp > start ? sp : end }
  const snippet = (start > 0 ? '… ' : '') + text.slice(start, end) + (end < text.length ? ' …' : '')
  const shift = start > 0 ? 2 - start : -start
  const marks: [number, number][] = []
  for (const t of toks) {
    for (const p of wordStarts(ntext, t)) {
      const a = back[p]
      const b = back[Math.min(p + t.length - 1, back.length - 1)] + 1
      if (a >= start && b <= end) marks.push([a + shift, b + shift])
    }
  }
  marks.sort((x, y) => x[0] - y[0])
  const merged: [number, number][] = []
  for (const m of marks) {
    const last = merged[merged.length - 1]
    if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1])
    else merged.push([...m] as [number, number])
  }
  return { snippet, marks: merged }
}

/** what the browser receives: no page data, only what the result list shows */
export function toResult(h: WikiSearchHit): WikiSearchResult {
  return {
    name: h.doc.page.name,
    icon: h.doc.icon,
    mod: h.doc.mod,
    category: h.doc.category,
    section: h.section?.title,
    href: h.href,
    snippet: h.snippet,
    marks: h.marks,
  }
}
