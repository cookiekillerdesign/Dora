import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../i18n'
import { tr } from '../lib/tr'
import { store } from '../store'
import { gsap, reduceMotion } from '../lib/smooth'
import { burst } from '../lib/fx'
import { useContent } from '../content/ContentProvider'
import MerchArt from '../components/MerchArt'
import SiteFooter from '../components/SiteFooter'

// Страница товара. Сайт ничего не продаёт сам: «Купить» ведёт на этот товар
// в официальном магазине артистки, оплата и доставка там.
function Visual({ item, images, active, setActive, name }) {
  const box = useRef(null), inner = useRef(null)
  useEffect(() => {
    const el = box.current
    if (!el || reduceMotion() || !window.matchMedia('(pointer: fine)').matches) return
    const rx = gsap.quickTo(inner.current, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(inner.current, 'rotationY', { duration: 0.6, ease: 'power3' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 18); rx(-((e.clientY - r.top) / r.height - 0.5) * 18)
    }
    const leave = () => { rx(0); ry(0) }
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])
  return (
    <div className="pd-visual">
      <div className="pd-stage" ref={box}>
        <div className="pd-stage-inner" ref={inner}>
          {images.length
            ? <img key={images[active]} className="pd-img" src={images[active]} alt={name} />
            : <div className="pd-art"><MerchArt kind={item.art || 'stickers'} /></div>}
        </div>
      </div>
      {images.length > 1 && (
        <div className="pd-thumbs" role="tablist" aria-label={name}>
          {images.map((src, i) => (
            <button key={src} type="button" role="tab" aria-selected={i === active} className={`pd-thumb ${i === active ? 'is-on' : ''}`} onClick={() => setActive(i)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Product() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const merch = useContent('merch')
  const storeUrl = useContent('settings').storeUrl
  const item = merch.find((m) => String(m.id) === id)
  const [active, setActive] = useState(0)
  const page = useRef(null)

  useEffect(() => { store.eraTarget = 2 }, [])
  useEffect(() => { setActive(0) }, [id])
  useEffect(() => { if (item) document.title = `${tr(item.name, lang)} | дора` }, [item, lang])

  if (!item) {
    return (
      <div className="product product--missing">
        <h1 className="pd-name f-bubble">{t.merch.notFound}</h1>
        <Link className="listen pd-back-btn" to="/merch">{t.merch.back}</Link>
      </div>
    )
  }

  const name = tr(item.name, lang)
  const images = [item.photo, ...(item.gallery || []).map((g) => g?.src)].filter(Boolean)
  const buyHref = item.url || storeUrl
  const idx = merch.indexOf(item)
  const related = [1, 2, 3].map((k) => merch[(idx + k) % merch.length]).filter((m) => m && m !== item)
    .filter((m, i, a) => a.indexOf(m) === i)
  const onBuy = (e) => {
    const r = page.current.getBoundingClientRect(), b = e.currentTarget.getBoundingClientRect()
    burst(page.current, b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top, { colors: ['#E0103A', '#FFE45C', '#9FD8FF', '#fff'], count: 14, spread: 150 })
  }
  const BuyBtn = ({ className = '' }) => (
    <a className={`pd-buy ${className}`} href={buyHref} target="_blank" rel="noreferrer" onClick={onBuy}>
      {t.merch.buy}<span className="pd-buy-sub">{t.merch.inStore}</span>
    </a>
  )

  return (
    <div className="product" ref={page}>
      <nav className="pd-crumbs" aria-label={t.merch.back}>
        <Link to="/merch">{t.merch.back}</Link><span aria-hidden="true"> / </span><span aria-current="page">{name}</span>
      </nav>
      <div className="pd-main">
        <Visual item={item} images={images} active={active} setActive={setActive} name={name} />
        <div className="pd-info">
          <span className="pd-badge">{t.merch.official}</span>
          <h1 className="pd-name f-bubble">{name}</h1>
          {tr(item.desc, lang) && <p className="pd-desc">{tr(item.desc, lang)}</p>}
          <p className="pd-price">{item.price ? item.price : t.merch.priceNote}</p>
          {item.sizes?.length > 0 && (
            <div className="pd-sizes">
              <span className="pd-label">{t.merch.sizes}</span>
              <ul>{item.sizes.filter(Boolean).map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}
          {tr(item.details, lang) && (
            <div className="pd-details">
              <span className="pd-label">{t.merch.details}</span>
              <p>{tr(item.details, lang)}</p>
            </div>
          )}
          <BuyBtn />
          <p className="pd-note">{t.merch.buyNote}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pd-related">
          <h2 className="pd-related-h">{t.merch.related}</h2>
          <ul className="pd-related-list">
            {related.map((m) => (
              <li key={m.id}>
                <Link className="pd-card" to={`/merch/${m.id}`}>
                  {m.photo ? <span className="sticker-photo"><img src={m.photo} alt="" /></span> : <MerchArt kind={m.art || 'stickers'} />}
                  <span className="sticker-name">{tr(m.name, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pd-bar" aria-hidden="false">
        <span className="pd-bar-name">{name}</span>
        <BuyBtn className="pd-buy--bar" />
      </div>
      <SiteFooter />
    </div>
  )
}
