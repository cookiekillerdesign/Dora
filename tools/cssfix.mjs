// Разовая чистка !important-заплаток после слияния правил
import postcss from 'postcss'
import fs from 'fs'
const file = 'src/styles/pages.css'
const root = postcss.parse(fs.readFileSync(file, 'utf8'))
const BIG = ['.sheet', '.kit-card', '.org-photo', '.pd-card']
root.walkRules((r) => {
  const sel = r.selector.replace(/\s+/g, ' ').trim()
  if (sel === '.stage-side') r.walkDecls('padding-top', (d) => { d.important = false })
  if (sel === '.legal-back') { r.selector = '.legal-paper .legal-back'; r.walkDecls('margin-top', (d) => { d.important = false }) }
  // крупные блоки: размытие фона убираем прямо в их правилах, а не перебиваем потом
  if (BIG.includes(sel) && !(r.parent.type === 'atrule')) r.walkDecls(/backdrop-filter$/, (d) => d.remove())
  if (sel === BIG.join(', ')) r.remove()
})
fs.writeFileSync(file, root.toString())
