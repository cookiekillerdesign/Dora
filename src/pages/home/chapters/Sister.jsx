import { useEffect, useRef } from 'react'
import { tr } from '../../../lib/tr'
import { gsap, reduceMotion } from '../../../lib/smooth'
import { burst } from '../../../lib/fx'
import { Listen, EraSlot, yearsOf } from '../shared'

/* «Младшая сестра»: значок «дорадура» крутится; наведение разгоняет его,
   клик «шлёпает» штампом по заголовку */
export default function Sister({ era, t, lang }) {
  const badge = useRef(null)
  const spin = useRef(null)
  const root = useRef(null)
  useEffect(() => {
    if (reduceMotion()) return
    spin.current = gsap.to(badge.current, { rotate: 360, duration: 14, ease: 'none', repeat: -1 })
    return () => spin.current.kill()
  }, [])
  const speed = (v) => spin.current && gsap.to(spin.current, { timeScale: v, duration: 0.6, ease: 'power2.out' })
  const stamp = (e) => {
    if (reduceMotion()) return
    const title = root.current.querySelector('.sis-title')
    gsap.timeline()
      .to(title, { scale: 1.06, duration: 0.08, ease: 'power2.out' })
      .to(title, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' })
    gsap.fromTo(root.current.querySelectorAll('.tape-strip'), { rotate: '+=0' }, { rotate: '+=6', yoyo: true, repeat: 3, duration: 0.06 })
    const r = root.current.getBoundingClientRect()
    burst(root.current, e.clientX - r.left, e.clientY - r.top, { shape: 'star', colors: ['#FFE45C', '#FF3D8B', '#fff'], count: 12, spread: 140 })
  }
  return (
    <section className="panel panel--sister" ref={root}>
      <div className="sis-stamp">
        <span className="tape-strip tape-strip--a" /><span className="tape-strip tape-strip--b" />
        <h2 className="sis-title f-spray" data-stamp>{tr(era.title, lang)}</h2>
      </div>
      <div className="sis-label">
        <span className="era-kind">{yearsOf(era, lang)}, {tr(era.kind, lang)}</span>
        <p className="era-text">{tr(era.text, lang)}</p>
        <Listen era={era} />
      </div>
      <button type="button" className="sis-badge" ref={badge} aria-label={t.eggs.badge}
        onPointerEnter={(e) => e.pointerType === 'mouse' && speed(7)} onPointerLeave={() => speed(1)} onPointerCancel={() => speed(1)} onClick={stamp}>
        <svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="circ" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" /></defs>
          <text><textPath href="#circ" textLength="276" lengthAdjust="spacing">дорадура ✦ дорадура ✦ дорадура ✦</textPath></text></svg>
      </button>
      <EraSlot era={era} lang={lang} />
      <EraSlot era={era} lang={lang} which="second" />
    </section>
  )
}
