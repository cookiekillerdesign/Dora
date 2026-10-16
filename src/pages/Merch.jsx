import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../content/ContentProvider'
import { useLang } from '../i18n'
import { tr } from '../lib/tr'
import { store } from '../store'
import { reduceMotion } from '../lib/smooth'
import MerchArt from '../components/MerchArt'
import SiteFooter from '../components/SiteFooter'

const ROT = [-6, 4, -2, 7, -4, 3, -7, 5, -3]

// Наклейку можно утащить мышью; короткий клик без движения открывает товар
function Sticker({ item, i, lang, t }) {
  const el = useRef(null)
  const st = useRef({ x: 0, y: 0, sx: 0, sy: 0, down: false, moved: false })
  const canDrag = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches && !reduceMotion()
  const rot = ROT[i % ROT.length]

  const set = (scale = 1, r = rot) => {
    el.current.style.transform = `translate(${st.current.x}px, ${st.current.y}px) rotate(${r}deg) scale(${scale})`
  }
  useEffect(() => { set() }, [])

  const down = (e) => {
    if (!canDrag || e.button !== 0) return
    const s = st.current
    s.down = true; s.moved = false; s.sx = e.clientX - s.x; s.sy = e.clientY - s.y
    el.current.setPointerCapture(e.pointerId)
    el.current.classList.add('is-grab')
  }
  const move = (e) => {
    const s = st.current
    if (!s.down) return
    const nx = e.clientX - s.sx, ny = e.clientY - s.sy
    if (!s.moved && Math.hypot(nx - s.x, ny - s.y) < 6) return
    s.moved = true; s.x = nx; s.y = ny
    set(1.08, rot * 0.3)
  }
  const up = () => {
    const s = st.current
    if (!s.down) return
    s.down = false
    el.current.classList.remove('is-grab')
    set()
  }
  const click = (e) => { if (st.current.moved) { e.preventDefault(); st.current.moved = false } }

  return (
    <li className="sticker-cell">
      <Link ref={el} className="sticker" to={`/merch/${item.id}`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click}
        onDragStart={(e) => e.preventDefault()}
        style={{ '--r': `${rot}deg`, touchAction: canDrag ? 'none' : 'auto' }}
        aria-label={`${tr(item.name, lang)}. ${t.merch.more}`}>
        {item.photo ? <span className="sticker-photo"><img src={item.photo} alt="" loading="lazy" draggable="false" /></span> : <MerchArt kind={item.art || 'stickers'} />}
        <span className="sticker-name">{item.name?.[lang]}</span>
        {item.desc?.[lang] && <span className="sticker-desc">{tr(item.desc, lang)}</span>}
      </Link>
    </li>
  )
}

export default function Merch() {
  const { t, lang } = useLang()
  const merch = useContent('merch')
  const store_url = useContent('settings').storeUrl
  useEffect(() => { store.eraTarget = 2 }, [])
  return (
    <div className="merch">
      <header className="merch-head">
        <h1 className="merch-title f-bubble">{t.merch.title}</h1>
        <div className="merch-lead">
          <p>{t.merch.lead}</p>
          <a className="listen merch-cta" href={store_url} target="_blank" rel="noreferrer">{t.merch.all}</a>
        </div>
      </header>
      <ul className="sheet">
        {merch.map((m, i) => <Sticker key={m.id || i} item={m} i={i} lang={lang} t={t} />)}
      </ul>
      <p className="merch-note">{t.merch.note}</p>
      <SiteFooter />
    </div>
  )
}
