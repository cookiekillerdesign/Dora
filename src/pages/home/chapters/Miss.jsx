import { useEffect, useRef } from 'react'
import { tr } from '../../../lib/tr'
import { burst, sparkleTrail } from '../../../lib/fx'
import { Listen, EraSlot, yearsOf } from '../shared'

/* MISS: за курсором остаётся след из страз, тап рассыпает стразы */
export default function Miss({ era, t, lang }) {
  const root = useRef(null)
  useEffect(() => sparkleTrail(root.current, { colors: ['#fff', '#fff', '#FFD6F2', '#F6B8E6'], every: 20, max: 60, perMove: 2, size: [9, 26] }), [])
  const tap = (e) => {
    if (e.pointerType !== 'touch') return
    const r = root.current.getBoundingClientRect()
    burst(root.current, e.clientX - r.left, e.clientY - r.top, { shape: 'star', colors: ['#fff', '#F6B8E6'], count: 10, spread: 100, size: [10, 20] })
  }
  return (
    <section className="panel panel--miss" ref={root} onPointerDown={tap}>
      <h2 className="miss-title f-miss" data-shine>MISS</h2>
      <div className="miss-card">
        <span className="era-kind">{yearsOf(era, lang)}, {tr(era.kind, lang)}</span>
        <p className="era-text">{tr(era.text, lang)}</p>
        <Listen era={era} />
      </div>
      <EraSlot era={era} lang={lang} />
    </section>
  )
}
