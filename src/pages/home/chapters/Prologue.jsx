import { useEffect, useRef } from 'react'
import { tr } from '../../../lib/tr'
import { gsap, reduceMotion } from '../../../lib/smooth'
import HeartSticker from '../HeartSticker'
import { Listen, EraSlot, yearsOf } from '../shared'

/* Пролог: старый псевдоним зачёркивается от руки, «дора» дописывается поверх.
   Наведение или тап по заголовку перечёркивает заново. */
export default function Prologue({ era, t, lang }) {
  const title = useRef(null)
  const tl = useRef(null)
  useEffect(() => {
    const el = title.current
    const paths = el.querySelectorAll('.pro-scribble path')
    // pathLength=1: длина каждого штриха нормирована, растяжение SVG не ломает пунктир
    paths.forEach((p) => { p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1 })
    if (!reduceMotion()) el.querySelector('.pro-new').style.clipPath = 'inset(0 100% 0 0)'
    tl.current = gsap.timeline({ paused: true })
      .set(paths, { strokeDashoffset: 1 })
      .set(el.querySelector('.pro-new'), { clipPath: 'inset(0 100% 0 0)' })
      .to(paths, { strokeDashoffset: 0, duration: 0.35, stagger: 0.18, ease: 'power1.inOut' })
      .to(el.querySelector('.pro-new'), { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power2.out' }, '+=0.05')
    if (reduceMotion()) tl.current.progress(1)
    el.__play = () => tl.current.restart()
    return () => tl.current.kill()
  }, [])
  const replay = () => { if (!reduceMotion()) tl.current?.restart() }
  return (
    <section className="panel panel--prologue">
      <div className="pro-note">
        <span className="era-kind f-hand">{yearsOf(era, lang)}, {tr(era.kind, lang)}</span>
        <h2 className="pro-title f-hand" ref={title} data-prologue onPointerEnter={(e) => e.pointerType === 'mouse' && replay()} onClick={replay}>
          <span className="pro-old">
            Mental Affection
            <svg className="pro-scribble" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 34 C 25 28, 55 40, 98 30" pathLength="1" />
              <path d="M3 72 C 30 64, 60 78, 97 66" pathLength="1" />
              <path d="M5 55 C 35 48, 70 60, 95 50" pathLength="1" />
            </svg>
          </span>
          <span className="pro-new">дора</span>
        </h2>
        <p className="era-text f-hand pro-text">{tr(era.text, lang)}</p>
        <Listen era={era} />
      </div>
      <HeartSticker className="pro-heart" />
      <EraSlot era={era} lang={lang} />
    </section>
  )
}
