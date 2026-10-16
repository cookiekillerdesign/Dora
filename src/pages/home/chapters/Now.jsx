import { Link } from 'react-router-dom'
import { tr } from '../../../lib/tr'
import CoverArt from '../../../components/CoverArt'
import { Listen, yearsOf } from '../shared'

/* Сейчас: синглы ведут сразу на трек в плеере, при наведении покрываются инеем */
export default function Now({ era, t, lang }) {
  return (
    <section className="panel panel--now">
      <span className="era-kind">{yearsOf(era, lang)}, {tr(era.kind, lang)}</span>
      <h2 className="now-title f-now">{tr(era.title, lang)}</h2>
      <p className="era-text now-text">{tr(era.text, lang)}</p>
      <Listen era={era} />
      <ul className="now-covers" aria-label={t.singlesLabel}>
        {(era.tracks || []).filter((x) => x.single).map((x, i) => (
          <li key={x.t} className={`now-cover now-cover--${i}`} data-snow>
            <Link to={`/music?era=now&track=${encodeURIComponent(x.t)}`} aria-label={x.t}>
              <CoverArt src={x.cover} title={x.t} index={i} label={t.photo.cover} />
              <span className="now-cover-name">{x.t}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
