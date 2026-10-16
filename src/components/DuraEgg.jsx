import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, reduceMotion } from '../lib/smooth'
import { store } from '../store'
import { useLang } from '../i18n'

const SHAPES = ['heart', 'star', 'bolt', 'heart', 'circle']

function Sticker({ kind, color }) {
  if (kind === 'heart') return <svg viewBox="0 0 40 36"><path d="M20 34S2 22 2 11A9 9 0 0 1 20 7a9 9 0 0 1 18 4c0 11-18 23-18 23z" fill={color} stroke="#000" strokeWidth="2.5" /></svg>
  if (kind === 'star') return <svg viewBox="0 0 40 40"><path d="M20 2l5 12 13 1-10 8 3 13-11-7-11 7 3-13L2 15l13-1z" fill={color} stroke="#000" strokeWidth="2.5" /></svg>
  if (kind === 'bolt') return <svg viewBox="0 0 30 44"><path d="M18 2L3 26h10l-3 16 17-26H16z" fill={color} stroke="#000" strokeWidth="2.5" /></svg>
  return <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill={color} stroke="#000" strokeWidth="2.5" /></svg>
}

// Наберите «дора» или «dora» на клавиатуре
export default function DuraEgg() {
  const { t } = useLang()
  const [burst, setBurst] = useState(null)

  useEffect(() => {
    let buf = '', timer
    const fire = () => {
        const colors = ['#FF3D8B', '#FFE45C', '#9FD8FF', '#E0103A', '#FFFFFF']
        setBurst({ id: Date.now(), items: Array.from({ length: 24 }, (_, i) => ({
          id: i, kind: SHAPES[i % SHAPES.length], color: colors[i % colors.length]
        })) })
        store.dura = 1
        clearTimeout(timer)
        timer = setTimeout(() => { store.dura = 0; setBurst(null) }, 4200)
    }
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input, textarea, select')) return
      if (!e.key || e.key.length !== 1) return
      buf = (buf + e.key.toLowerCase()).slice(-6)
      if (buf.endsWith('дора') || buf.endsWith('dora')) { buf = ''; fire() }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('dora-egg', fire)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('dora-egg', fire); clearTimeout(timer); store.dura = 0 }
  }, [])

  const layer = useRef(null)
  // наклейки разлетаются из центра на пружинах, держатся и падают под «гравитацией»
  useLayoutEffect(() => {
    if (!burst || !layer.current) return
    const els = layer.current.querySelectorAll('.dura-sticker')
    const toast = layer.current.querySelector('.dura-toast')
    const W = window.innerWidth, H = window.innerHeight
    const ctx = gsap.context(() => {
      if (reduceMotion()) { gsap.set(els, { opacity: 0 }); return }
      els.forEach((el, i) => {
        const a = (i / els.length) * Math.PI * 2 + gsap.utils.random(-0.25, 0.25)
        const d = gsap.utils.random(0.22, 0.48) * Math.min(W, H * 1.4)
        const s = gsap.utils.random(0.7, 1.6)
        gsap.timeline()
          .fromTo(el, { x: 0, y: 0, scale: 0, rotate: 0 },
            { x: Math.cos(a) * d * (W > H ? 1.5 : 1), y: Math.sin(a) * d, scale: s, rotate: gsap.utils.random(-50, 50), duration: 0.8, ease: 'back.out(1.7)', delay: i * 0.012 })
          .to(el, { rotate: `+=${gsap.utils.random(-12, 12)}`, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' })
          .to(el, { y: H * 1.2, rotate: `+=${gsap.utils.random(-220, 220)}`, duration: gsap.utils.random(0.9, 1.5), ease: 'power2.in' }, 1.9 + gsap.utils.random(0, 0.5))
      })
      gsap.timeline()
        .fromTo(toast, { scale: 0.2, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: -6, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
        .to(toast, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1 }, '+=0.6')
        .to(toast, { y: -40, opacity: 0, duration: 0.5, ease: 'power2.in' }, 3.2)
    }, layer)
    return () => ctx.revert()
  }, [burst])

  if (!burst) return null
  return (
    <div className="dura" aria-live="polite" ref={layer} key={burst.id}>
      {burst.items.map((b) => (
        <span key={b.id} className="dura-sticker"><Sticker kind={b.kind} color={b.color} /></span>
      ))}
      <div className="dura-toast">{t.dura}</div>
    </div>
  )
}
