// Сливает повторные определения одного селектора (в одном медиа-контексте) в первое определение.
// Более поздние значения свойств побеждают, как в каскаде. Ключевые кадры (@keyframes) не трогает.
// Запуск: node tools/cssmerge.mjs [--skip "селектор1;;селектор2"]
import postcss from 'postcss'
import fs from 'fs'
const skipArg = process.argv.indexOf('--skip')
const SKIP = new Set(skipArg > 0 ? process.argv[skipArg + 1].split(';;') : [])
let total = 0
for (const f of ['base', 'home', 'chapters', 'pages', 'video', 'news']) {
  const file = `src/styles/${f}.css`
  const root = postcss.parse(fs.readFileSync(file, 'utf8'))
  const first = new Map()
  const dupes = []
  root.walkRules((r) => {
    if (r.parent.type === 'atrule' && /keyframes/.test(r.parent.name)) return
    const ctx = []; let p = r.parent
    while (p && p.type === 'atrule') { ctx.unshift('@' + p.name + ' ' + p.params); p = p.parent }
    const sel = r.selector.replace(/\s+/g, ' ').trim()
    if (SKIP.has(sel)) return
    const key = ctx.join('|') + '::' + sel
    if (first.has(key)) dupes.push([first.get(key), r]); else first.set(key, r)
  })
  for (const [a, b] of dupes) {
    b.walkDecls((d) => {
      a.walkDecls(d.prop, (old) => old.remove())
      a.append(d.clone())
    })
    const parent = b.parent
    b.remove()
    if (parent.type === 'atrule' && !parent.nodes.length) parent.remove()
  }
  total += dupes.length
  fs.writeFileSync(file, root.toString())
  console.log(`${f}.css: слито ${dupes.length}`)
}
console.log('всего слито:', total)
