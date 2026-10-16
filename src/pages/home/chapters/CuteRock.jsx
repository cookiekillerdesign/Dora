import { useLayoutEffect, useRef, useState } from 'react'
import { tr } from '../../../lib/tr'
import { gsap, reduceMotion } from '../../../lib/smooth'
import { burst } from '../../../lib/fx'
import { NoBr } from '../../../lib/nobr'
import { Listen, EraSlot, yearsOf } from '../shared'

/* Кьют-рок: «Втюрилась» ↔ «Innamorata» переворачивается по буквам,
   из переключателя вылетают сердечки */
export default function CuteRock({ era, t, lang }) {
  const [it, setIt] = useState(false)
  const [word, setWord] = useState('Втюрилась')
  const hit = useRef(null), root = useRef(null)
  const busy = useRef(false), want = useRef('Втюрилась'), shown = useRef('Втюрилась'), first = useRef(true)

  // Буквы появляются. Потом, если пока шла анимация выбрали другое слово, переворачиваем ещё раз.
  const animateIn = () => {
    gsap.fromTo(hit.current.children, { rotationX: -90, opacity: 0 },
      { rotationX: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'back.out(2)', overwrite: true,
        onComplete: () => { busy.current = false; if (want.current !== shown.current) flip() } })
  }
  // Буквы уходят. Переворот запускается, только если выбранное слово отличается от показанного.
  const flip = () => {
    if (busy.current || want.current === shown.current) return
    busy.current = true
    gsap.to(hit.current.children, {
      rotationX: 90, opacity: 0, duration: 0.18, stagger: 0.03, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        const target = want.current
        if (target === shown.current) { animateIn(); return } // вернулись к тому же слову: просто проявляем
        shown.current = target
        setWord(target) // появление запустит эффект ниже, когда новое слово уже в DOM
      }
    })
  }
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!reduceMotion()) animateIn()
  }, [word])

  const toggle = (e) => {
    // состояние берём из ссылки: она меняется сразу, даже если клики быстрее перерисовки
    const next = want.current !== 'Innamorata'
    want.current = next ? 'Innamorata' : 'Втюрилась'
    setIt(next)
    const r = root.current.getBoundingClientRect()
    const b = e.currentTarget.getBoundingClientRect()
    burst(root.current, b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top,
      { colors: next ? ['#2a9d4b', '#fff', '#E0103A'] : ['#E0103A', '#FFB3D9', '#fff'], count: 12 })
    if (reduceMotion()) { shown.current = want.current; setWord(want.current); return }
    flip()
  }
  return (
    <section className="panel panel--cuterock" ref={root}>
      <EraSlot era={era} lang={lang} />
      <div className="cr-text">
        <span className="era-kind cr-kind">{yearsOf(era, lang)}, {tr(era.kind, lang)}</span>
        <h2 className="cr-title f-bubble" data-bounce><NoBr>{tr(era.title, lang)}</NoBr></h2>
        <div className="cr-row">
          <p className="cr-hit f-bubble" aria-live="polite" data-word={word}>
            <span className="sr-only">{word}</span>
            <span ref={hit} className="cr-hit-chars" aria-hidden="true">
              {word.split('').map((ch, i) => <span key={word + i}>{ch}</span>)}
            </span>
          </p>
          <button className={`cr-it ${it ? 'on' : ''}`} onClick={toggle} aria-pressed={it} aria-label={t.it.label}>
            <span>RU</span><span>IT</span>
          </button>
        </div>
        <div className="cr-bottom">
          <p className="era-text">{tr(era.text, lang)}</p>
          <Listen era={era} />
        </div>
      </div>
    </section>
  )
}
