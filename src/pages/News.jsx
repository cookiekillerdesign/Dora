import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../content/ContentProvider'
import { useLang } from '../i18n'
import { store } from '../store'
import SiteFooter from '../components/SiteFooter'

// «Анонсы»: редакционная лента. Первый анонс - главный (крупная карточка с фото),
// остальные - сеткой карточек. Фильтр по рубрикам, если рубрик больше одной.
const fmt = (iso, lang) => new Date(iso + 'T12:00:00').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// Вся карточка - ссылка (внутренняя или внешняя); без ссылки - просто карточка
function CardLink({ item, className, children }) {
  if (!item.link) return <div className={className}>{children}</div>
  return item.internal
    ? <Link className={`${className} is-link`} to={item.link}>{children}</Link>
    : <a className={`${className} is-link`} href={item.link} target="_blank" rel="noreferrer">{children}</a>
}

function Meta({ item, t, lang }) {
  return (
    <div className="nw-meta">
      <span className={`nw-kind nw-kind--${item.kind}`}>{t.news.kinds[item.kind] || item.kind}</span>
      {item.date && <time dateTime={item.date} className="nw-date">{fmt(item.date, lang)}</time>}
    </div>
  )
}

const cta = (item, t) => item.link ? <span className="nw-cta">{item.kind === 'release' ? t.news.listen : t.news.read}<span aria-hidden="true"> →</span></span> : null

export default function News() {
  const { t, lang } = useLang()
  useEffect(() => { store.eraTarget = 4 }, [])
  const news = useContent('news')
  const fallback = useContent('clips').find((c) => c.id === 'now') || {}
  const kinds = useMemo(() => [...new Set(news.map((n) => n.kind).filter(Boolean))], [news])
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? news : news.filter((n) => n.kind === filter)
  const [lead, ...rest] = shown
  // у главного анонса своё фото; если не загружено - фото из «Фото глав» -> «Сейчас»
  const leadPhoto = lead?.photo || (filter === 'all' ? fallback.src : null)

  return (
    <div className="nw">
      <header className="nw-head">
        <div>
          <h1 className="nw-title">{t.news.title}</h1>
          <p className="nw-sub">{t.news.sub}</p>
        </div>
        {kinds.length > 1 && (
          <div className="nw-filter" role="tablist" aria-label={t.news.title}>
            {['all', ...kinds].map((k) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} className={`nw-chip ${filter === k ? 'is-on' : ''}`} onClick={() => setFilter(k)}>
                {k === 'all' ? t.news.all : t.news.kindsPlural[k] || k}
              </button>
            ))}
          </div>
        )}
      </header>

      {lead && (
        <CardLink item={lead} className="nw-lead">
          <span className="nw-lead-photo">
            {leadPhoto ? <img src={leadPhoto} alt="" loading="lazy" decoding="async" /> : <span className="nw-ph" aria-hidden="true">дора</span>}
          </span>
          <span className="nw-lead-body">
            <Meta item={lead} t={t} lang={lang} />
            <span className="nw-lead-head">{lead.head?.[lang]}</span>
            <span className="nw-lead-text">{lead.text?.[lang]}</span>
            {cta(lead, t)}
          </span>
        </CardLink>
      )}

      {rest.length > 0 && (
        <ul className="nw-grid">
          {rest.map((n) => (
            <li key={n.id || n.head?.ru}>
              <CardLink item={n} className="nw-card">
                {n.photo && <span className="nw-card-photo"><img src={n.photo} alt="" loading="lazy" decoding="async" /></span>}
                <span className="nw-card-body">
                  <Meta item={n} t={t} lang={lang} />
                  <span className="nw-card-head">{n.head?.[lang]}</span>
                  <span className="nw-card-text">{n.text?.[lang]}</span>
                  {cta(n, t)}
                </span>
              </CardLink>
            </li>
          ))}
        </ul>
      )}
      {!lead && <p className="nw-empty">{t.news.empty}</p>}
      <SiteFooter />
    </div>
  )
}
