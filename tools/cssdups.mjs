import postcss from 'postcss'
import fs from 'fs'
for (const f of ['base', 'home', 'chapters', 'pages', 'video', 'news']) {
  const root = postcss.parse(fs.readFileSync(`src/styles/${f}.css`, 'utf8'))
  const seen = new Map(); let dups = 0, rules = 0, imp = 0
  root.walkRules((r) => {
    if (r.parent.type === 'atrule' && /keyframes/.test(r.parent.name)) return
    rules++
    const ctx = []; let p = r.parent; while (p && p.type === 'atrule') { ctx.unshift('@' + p.name + ' ' + p.params); p = p.parent }
    const key = ctx.join('|') + '::' + r.selector.replace(/\s+/g, ' ')
    if (seen.has(key)) dups++; else seen.set(key, r)
    r.walkDecls((d) => { if (d.important) imp++ })
  })
  console.log(`${f}.css: правил ${rules}, повторных селекторов ${dups}, !important ${imp}, строк ${fs.readFileSync(`src/styles/${f}.css`, 'utf8').split('\n').length}`)
}
