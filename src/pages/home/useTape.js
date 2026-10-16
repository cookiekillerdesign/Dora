import { useEffect, useLayoutEffect } from 'react'
import { store } from '../../store'
import { gsap, ScrollTrigger, initSmooth, reduceMotion, isTouchUI } from '../../lib/smooth'
import { buildIntros } from './intros'
import { attachSnapper } from './snapper'
import { PANELS, TOTAL, SNAPS, posAt } from './tape'

// Горизонтальная лента главной: скролл вниз двигает её вбок, с паузами на главах.
// Обновляет общий store (прогресс, текущая эпоха для фона) и проигрывает появление глав.
// deps - то, от чего зависит ширина ленты (язык, тексты): при их смене ленту пересчитываем.
export function useTape(wrapRef, trackRef, deps) {
  useLayoutEffect(() => {
    store.eraTarget = -1 // обложка: свой фон
    const mm = gsap.matchMedia()
    mm.add('(min-width: 0px)', () => {
      const intros = reduceMotion() ? {} : buildIntros(wrapRef.current)
      const played = new Set()
      const proxy = { p: 0 }
      const apply = () => {
        if (!trackRef.current) return
        const pos = posAt(proxy.p)
        gsap.set(trackRef.current, { x: -pos * window.innerWidth })
        store.progress = pos / (PANELS - 1)
        store.eraTarget = Math.min(5, Math.max(-1, pos - 1)) // -1 обложка, 0..5 главы
        const near = Math.round(pos)
        if (Math.abs(pos - near) < 0.45 && !played.has(near)) { played.add(near); intros[near]?.play() }
      }
      const tween = gsap.to(proxy, {
        p: 1, ease: 'none', onUpdate: apply,
        scrollTrigger: {
          trigger: wrapRef.current, pin: true, scrub: isTouchUI() ? 0.15 : 0.6, invalidateOnRefresh: true,
          end: () => '+=' + Math.round(window.innerWidth * TOTAL * 0.9),
          onRefresh: apply
        }
      })
      apply()
      const detachTouchSnaps = attachTouchSnaps(tween.scrollTrigger)
      // initSmooth, а не getLenis: эффект главной срабатывает раньше, чем App создаёт Lenis
      const detachSnapper = attachSnapper(initSmooth(), tween.scrollTrigger)
      return () => { detachSnapper(); detachTouchSnaps(); Object.values(intros).forEach((tl) => tl.kill()) }
    })
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => mm.revert()
  }, [])

  // другая длина текста или подгрузившийся шрифт меняют ширину ленты
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, deps)
  useEffect(() => { document.fonts?.ready?.then(() => ScrollTrigger.refresh()) }, [])
}

// Тач-экраны: невидимые точки привязки прокрутки в середине каждой главы.
// scroll-snap-stop: always - браузер вместе со своей инерцией останавливается на следующей главе
// и не проскакивает дальше. Это нативное поведение, которое не спорит с пальцем, в отличие от JS-доводки.
function attachTouchSnaps(st) {
  if (!isTouchUI() || reduceMotion()) return () => {}
  const box = document.createElement('div')
  box.className = 'tape-snaps'
  box.setAttribute('aria-hidden', 'true')
  const marks = SNAPS.map(() => box.appendChild(document.createElement('i')))
  const place = () => {
    const len = st.end - st.start
    SNAPS.forEach((p, i) => { marks[i].style.top = `${Math.round(st.start + p * len)}px` })
  }
  document.body.appendChild(box)
  place()
  const html = document.documentElement
  html.classList.add('tape-snap')
  ScrollTrigger.addEventListener('refresh', place)
  return () => { ScrollTrigger.removeEventListener('refresh', place); html.classList.remove('tape-snap'); box.remove() }
}
