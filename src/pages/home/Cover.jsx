import { useEffect, useLayoutEffect, useRef } from 'react'
import { store } from '../../store'
import { gsap, reduceMotion } from '../../lib/smooth'
import { burst } from '../../lib/fx'
import logo1400 from '../../assets/logo-hero-1400.webp'
import logo820 from '../../assets/logo-hero-820.webp'

/* Обложка: живой логотип. Желейное приземление после заставки, парит, звёзды мерцают;
   на компьютере наклоняется за курсором и по стеклу бежит блик; клик или тап - желейная встряска и звёзды */
const GLINTS = [[50, 7.5], [34, 32], [96.5, 61], [50, 92], [43.8, 66], [19.5, 68], [83, 67]]
export default function Cover({ t }) {
  const wrap = useRef(null), tilt = useRef(null), jelly = useRef(null)

  // Появление после заставки: логотип падает и приземляется, как желе.
  // Стартует по событию заставки в тот же кадр, когда шторка начинает уезжать. Пока его нет -
  // логотип скрыт, чтобы не мелькнул неподвижным. Если заставка уже прошла (вернулись на главную),
  // логотип просто стоит на месте.
  useLayoutEffect(() => {
    if (store.ready || reduceMotion()) return
    const j = jelly.current
    gsap.set(j, { opacity: 0 })
    const play = () => {
      gsap.timeline()
        .fromTo(j, { yPercent: -60, opacity: 0, scaleX: 0.85, scaleY: 1.2 },
          { yPercent: 0, opacity: 1, scaleX: 1, scaleY: 1, duration: 0.5, ease: 'power2.in' })
        .to(j, { scaleX: 1.16, scaleY: 0.82, duration: 0.11, ease: 'power2.out' })
        .to(j, { scaleX: 1, scaleY: 1, duration: 1.2, ease: 'elastic.out(1.1, 0.3)' })
    }
    window.addEventListener('dora-ready', play, { once: true })
    return () => window.removeEventListener('dora-ready', play)
  }, [])

  useEffect(() => {
    const el = wrap.current
    if (!el || reduceMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const rx = gsap.quickTo(tilt.current, 'rotationX', { duration: 0.8, ease: 'power3' })
    const ry = gsap.quickTo(tilt.current, 'rotationY', { duration: 0.8, ease: 'power3' })
    const move = (e) => {
      const r = tilt.current.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
      ry((px - 0.5) * 22); rx(-(py - 0.5) * 16)
      tilt.current.style.setProperty('--mx', `${px * 100}%`); tilt.current.style.setProperty('--my', `${py * 100}%`)
    }
    const leave = () => { rx(0); ry(0) }
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', leave, { passive: true })
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); window.removeEventListener('scroll', leave) }
  }, [])

  const wobble = (e) => {
    if (reduceMotion()) return
    gsap.timeline({ overwrite: true })
      .to(jelly.current, { scaleX: 1.12, scaleY: 0.86, duration: 0.12, ease: 'power2.out' })
      .to(jelly.current, { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1.2, 0.28)' })
    const r = wrap.current.getBoundingClientRect()
    burst(wrap.current, e.clientX - r.left, e.clientY - r.top, { shape: 'star', colors: ['#FF3D8B', '#fff', '#9FE6C8', '#F6B8E6'], count: 14, spread: 170, size: [12, 26] })
  }

  return (
    <section className="panel panel--cover" ref={wrap}>
      <h1 className="cover-logo-wrap">
        <span className="sr-only">дора</span>
        <button type="button" className="cover-logo" onClick={wobble} aria-label={t.hero.logoLabel}>
          <span className="cover-float">
            <span className="cover-tilt" ref={tilt}>
              <span className="cover-jelly" ref={jelly}>
                <img src={logo1400} srcSet={`${logo820} 820w, ${logo1400} 1400w`} sizes="(max-width: 760px) 88vw, min(56vw, 760px)"
                  width="1400" height="939" alt="" decoding="async" fetchpriority="high" draggable="false" />
                <span className="cover-shine" aria-hidden="true" style={{ WebkitMaskImage: `url(${logo820})`, maskImage: `url(${logo820})` }} />
                {GLINTS.map(([x, y], i) => <span key={i} className="cover-glint" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.47}s` }} aria-hidden="true" />)}
              </span>
            </span>
          </span>
        </button>
      </h1>
    </section>
  )
}
