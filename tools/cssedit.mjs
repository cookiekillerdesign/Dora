// Точечная правка CSS по селектору: node tools/cssedit.mjs ops.json
// ops: [{ file, selector, media?, set?: {prop: value}, unset?: [prop], remove?: true, create?: true, after?: selector }]
// media - условие @media ('' или не задано - вне медиа). create - создать правило, если его нет (после after или в конце контекста).
import postcss from 'postcss'
import fs from 'fs'
const ops = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const roots = {}
const load = (f) => (roots[f] ||= postcss.parse(fs.readFileSync(f, 'utf8')))
const norm = (s) => s.replace(/\s+/g, ' ').trim()
const ctxOf = (r) => (r.parent.type === 'atrule' && r.parent.name === 'media' ? norm(r.parent.params) : '')
let done = 0
for (const op of ops) {
  const root = load(op.file)
  const media = norm(op.media || '')
  let found = []
  root.walkRules((r) => { if (norm(r.selector) === norm(op.selector) && ctxOf(r) === media && !(r.parent.name || '').includes('keyframes')) found.push(r) })
  if (!found.length && op.create) {
    let container = root
    if (media) {
      container = root.nodes.find((n) => n.type === 'atrule' && n.name === 'media' && norm(n.params) === media)
      if (!container) { container = postcss.atRule({ name: 'media', params: media }); root.append(container) }
    }
    const rule = postcss.rule({ selector: op.selector })
    const anchor = op.after && container.nodes.find((n) => n.type === 'rule' && norm(n.selector) === norm(op.after))
    anchor ? anchor.after(rule) : container.append(rule)
    found = [rule]
  }
  if (!found.length) { console.error('НЕ НАЙДЕНО:', op.file, op.selector, media); process.exitCode = 1; continue }
  for (const r of found) {
    if (op.remove) { const p = r.parent; r.remove(); if (p.type === 'atrule' && !p.nodes.length) p.remove(); continue }
    for (const prop of op.unset || []) r.walkDecls(prop, (d) => d.remove())
    for (const [prop, value] of Object.entries(op.set || {})) {
      let had = false
      r.walkDecls(prop, (d) => { d.value = value; had = true })
      if (!had) r.append({ prop, value })
    }
  }
  done++
}
for (const [f, root] of Object.entries(roots)) fs.writeFileSync(f, root.toString())
console.log('операций:', done, 'из', ops.length)
