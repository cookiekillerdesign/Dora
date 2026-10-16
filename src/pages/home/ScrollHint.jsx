import { useEffect, useRef } from 'react'
import { store } from '../../store'

// Ненавязчивая подсказка «листай вниз».
// Появляется через 2.5 с после приземления логотипа, если человек ещё не начал листать,
// держится 4.5 с и плавно гаснет. Если человек так и стоит на обложке - напоминает ещё
// максимум два раза с паузой 10 с. После первой прокрутки исчезает и больше не возвращается.
const FIRST_DELAY = 2500, SHOW_FOR = 4500, REPEAT_AFTER = 10000, MAX_SHOWS = 3
const scrolled = () => window.scrollY > 40 || store.progress > 0.015

export default function ScrollHint({ t }) {
  const ref = useRef(null)
  useEffect(() => {
    let shows = 0, done = false, timer
    const el = ref.current
    const hide = () => el?.classList.remove('is-on')
    const finish = () => { done = true; clearTimeout(timer); hide() }
    const schedule = (ms) => {
      timer = setTimeout(() => {
        if (done) return
        if (scrolled()) return finish() // уже листает
        el?.classList.add('is-on'); shows++
        timer = setTimeout(() => {
          hide()
          if (shows < MAX_SHOWS) schedule(REPEAT_AFTER)
        }, SHOW_FOR)
      }, ms)
    }
    // первый показ отсчитываем от появления логотипа (если заставка уже прошла - от открытия главной)
    const start = () => schedule(FIRST_DELAY)
    if (store.ready) start(); else window.addEventListener('dora-ready', start, { once: true })

    // первая прокрутка - подсказка больше не нужна. Смотрим на прокрутку страницы, а не на сдвиг
    // ленты: на обложке у ленты пауза, и первые сотни пикселей прокрутки она стоит на месте
    let raf
    const watch = () => {
      if (scrolled()) return finish()
      raf = requestAnimationFrame(watch)
    }
    raf = requestAnimationFrame(watch)
    return () => { done = true; clearTimeout(timer); cancelAnimationFrame(raf); window.removeEventListener('dora-ready', start) }
  }, [])

  return (
    <div className="scroll-hint" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="scroll-hint-ico">
        <rect x="13" y="2" width="14" height="22" rx="7" />
        <path className="scroll-hint-wheel" d="M20 8v5" />
        <path className="scroll-hint-arrow" d="M8 30h22m-5-5 5 5-5 5" />
      </svg>
      <span>{t.hero.hint}</span>
    </div>
  )
}
