import { useEffect, useRef, useState } from 'react'
import { gsap, reduceMotion } from '../lib/smooth'
import { store } from '../store'
import logo520 from '../assets/logo-hero-520.webp'

// Заставка: логотип и тонкая полоса реальной загрузки (шрифты и главный логотип).
// Как только всё готово, логотип пружинит и экран уезжает вверх.
const MIN_MS = 350 // чтобы не мелькала на быстром интернете

function whenLoaded() {
  const fonts = document.fonts?.ready || Promise.resolve()
  const hero = new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = resolve
    img.src = logo520
  })
  // на очень медленном интернете не держим посетителя дольше 4 секунд: сайт откроется,
  // а шрифты и логотип догрузятся сами
  const cap = new Promise((resolve) => setTimeout(resolve, 4000))
  return Promise.race([Promise.all([fonts, hero]), cap])
}

export default function Preloader({ onDone = () => {} }) {
  const root = useRef(null), bar = useRef(null), logo = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (reduceMotion()) { store.ready = true; setGone(true); onDone(); return }
    let alive = true
    const progress = { v: 0 }
    // полоса идёт к 90%, пока грузится, и добегает до конца, когда готово
    const crawl = gsap.to(progress, { v: 0.9, duration: 2.4, ease: 'power2.out', onUpdate: () => bar.current && (bar.current.style.transform = `scaleX(${progress.v})`) })
    gsap.fromTo(logo.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
    const started = performance.now()
    whenLoaded().then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started))
      setTimeout(() => {
        if (!alive) return
        crawl.kill()
        // шторка уезжает сразу, а сайт получает «готово» в начале подъёма:
        // логотип на обложке начинает падать вместе со шторкой, без паузы
        gsap.timeline({ onComplete: () => { if (alive) setGone(true) } })
          .to(progress, { v: 1, duration: 0.15, ease: 'power1.out', onUpdate: () => bar.current && (bar.current.style.transform = `scaleX(${progress.v})`) })
          // сигнал обложке напрямую, без ожидания перерисовки React: логотип стартует в этот же кадр
          .call(() => { if (!alive) return; store.ready = true; window.dispatchEvent(new Event('dora-ready')); onDone() })
          .to(root.current, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' })
      }, wait)
    })
    return () => { alive = false; crawl.kill() }
  }, [])

  if (gone) return null
  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <img ref={logo} className="pl-logo" src={logo520} alt="" width="520" height="349" />
      <div className="pl-track"><div className="pl-bar" ref={bar} /></div>
    </div>
  )
}
