import { useEffect, useRef, useState } from 'react'
import { tr } from '../../../lib/tr'
import { gsap, reduceMotion } from '../../../lib/smooth'
import { Listen, EraSlot, yearsOf } from '../shared'

/* LOVESONGS: телефон вибрирует; ответишь - идёт таймер, бегут волны голоса
   и печатается мамин вопрос; сбросишь - останется пропущенный */
export default function LoveSongs({ era, t, lang }) {
  const [state, setState] = useState('ringing')
  const [sec, setSec] = useState(0)
  const [typed, setTyped] = useState('')
  const card = useRef(null)

  useEffect(() => {
    const el = card.current // ссылку берём сразу: при уходе со страницы React успевает её обнулить
    if (state !== 'ringing' || reduceMotion() || !el) return
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.1 })
      .to(el, { rotate: 2, x: 3, duration: 0.05, repeat: 9, yoyo: true, ease: 'sine.inOut' })
      .to(el, { rotate: 0, x: 0, duration: 0.1 })
    return () => { tl.kill(); gsap.set(el, { rotate: 0, x: 0 }) }
  }, [state])

  // таймер и печать считаются от реально прошедшего времени: на слабом устройстве не растягиваются
  useEffect(() => {
    if (state !== 'answered') return
    const q = t.call.question
    const t0 = performance.now()
    setSec(0); setTyped(reduceMotion() ? q : '')
    const id = setInterval(() => {
      const ms = performance.now() - t0
      setSec(Math.floor(ms / 1000))
      if (!reduceMotion()) setTyped(q.slice(0, Math.min(q.length, Math.floor(ms / 70))))
    }, 50)
    return () => clearInterval(id)
  }, [state, t.call.question])

  const mmss = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
  return (
    <section className="panel panel--love">
      <div className="love-left">
        <span className="era-kind">{yearsOf(era, lang)}, {tr(era.kind, lang)}</span>
        <h2 className="love-title f-love">Lovesongs</h2>
        <p className="era-text">{tr(era.text, lang)}</p>
        <Listen era={era} />
      </div>
      <div className="call-tilt">
        <div className={`call call--${state}`} data-notify ref={card}>
        <div className="call-avatar" aria-hidden="true">м</div>
        <div className="call-name">{t.call.from}</div>
        <div className="call-stage" key={state}>
          {state === 'ringing' && <>
            <div className="call-status">{t.call.incoming}</div>
            <div className="call-actions">
              <button className="call-btn call-btn--no" onClick={() => setState('missed')}>{t.call.decline}</button>
              <button className="call-btn call-btn--yes" onClick={() => setState('answered')}>{t.call.answer}</button>
            </div>
          </>}
          {state === 'answered' && <>
            <div className="call-status">{mmss}</div>
            <div className="call-wave" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 7) * 0.09}s` }} />)}</div>
            <p className="f-love call-question" aria-live="polite">{typed}<span className="call-caret" aria-hidden="true" /></p>
            {typed.length === t.call.question.length && <p className="call-after">{t.call.after}</p>}
            <div className="call-actions">
              <button className="call-btn call-btn--no call-btn--wide" onClick={() => setState('ended')}>{t.call.hangup}</button>
            </div>
          </>}
          {(state === 'missed' || state === 'ended') && <>
            <div className="call-status">{state === 'missed' ? t.call.missed : `${t.call.ended} · ${mmss}`}</div>
            <div className="call-actions">
              <button className="call-btn call-btn--yes call-btn--wide" onClick={() => setState('ringing')}>{t.call.callback}</button>
            </div>
          </>}
        </div>
      </div>
      </div>
      <EraSlot era={era} lang={lang} />
    </section>
  )
}
