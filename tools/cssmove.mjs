// Переносит правила, селектор которых подходит под регулярное выражение, из одного файла в другой,
// сохраняя медиа-контекст и порядок. node tools/cssmove.mjs from.css to.css "regex"
import postcss from 'postcss'
import fs from 'fs'
const [from, to, re] = process.argv.slice(2)
const rx = new RegExp(re)
const src = postcss.parse(fs.readFileSync(from, 'utf8'))
const dst = fs.existsSync(to) ? postcss.parse(fs.readFileSync(to, 'utf8')) : postcss.root()
let moved = 0
const mediaIn = (params) => {
  let m = dst.nodes.find((n) => n.type === 'atrule' && n.name === 'media' && n.params === params)
  if (!m) { m = postcss.atRule({ name: 'media', params }); dst.append(m) }
  return m
}
src.walkRules((r) => {
  if (!rx.test(r.selector)) return
  if (r.parent.type === 'atrule' && r.parent.name.includes('keyframes')) return
  const inMedia = r.parent.type === 'atrule' && r.parent.name === 'media'
  const target = inMedia ? mediaIn(r.parent.params) : dst
  const parent = r.parent
  target.append(r.clone()); r.remove(); moved++
  if (parent.type === 'atrule' && !parent.nodes.length) parent.remove()
})
fs.writeFileSync(from, src.toString()); fs.writeFileSync(to, dst.toString())
console.log('перенесено правил:', moved)
