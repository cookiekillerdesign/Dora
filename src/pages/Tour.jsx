import { useEffect, useLayoutEffect, useRef } from 'react'
import { isPast } from '../data/tour'
import { useContent } from '../content/ContentProvider'
import { useLang } from '../i18n'
import { store } from '../store'
import { gsap, reduceMotion } from '../lib/smooth'
import SiteFooter from '../components/SiteFooter'

const fmt = (iso, lang, opts) => new Date(iso + 'T12:00:00').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', opts)

function Show({ s, lang, t, past, tickets }) {
  const day = fmt(s.date, lang, { day: '2-digit' })
  const mon = fmt(s.date, lang, { month: 'short' }).replace('.', '')
  const wd = fmt(s.date, lang, { weekday: 'short' }).replace('.', '')
  return (
    <li className={`ticket ${past ? 'is-past' : ''} ${s.home ? 'is-home' : ''}`}>
      <div className="ticket-date">
        <span className="ticket-day">{day}</span>
        <span className="ticket-mon">{mon}, {wd}</span>
      </div>
      <div className="ticket-main">
        <span className="ticket-city f-now">{s.city?.[lang] || s.city?.ru}</span>
        <span className="ticket-venue">{s.venue || t.tour.venueTbc}{s.note ? `, ${s.note}` : ''}</span>
      </div>
      {s.home && <span className="ticket-home f-love" aria-label={t.tour.homeLabel}>{t.tour.home}</span>}
      <div className="ticket-stub">
        {past
          ? <span className="ticket-done">{t.tour.done}</span>
          : <a className="ticket-buy" href={s.url || tickets} target="_blank" rel="noreferrer">{t.tour.tickets}</a>}
      </div>
    </li>
  )
}

export default function Tour() {
  const { t, lang } = useLang()
  const root = useRef(null)
  useEffect(() => { store.eraTarget = 5 }, [])
  const settings = useContent('settings')
  const shows = useContent('tour').filter((s) => s.date).slice().sort((a, b) => a.date.localeCompare(b.date))
  const upcoming = shows.filter((s) => !isPast(s.date))
  const past = shows.filter((s) => isPast(s.date)).reverse()

  useLayoutEffect(() => {
    if (reduceMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.ticket').forEach((el) => {
        gsap.from(el, { xPercent: -6, rotate: -1.5, opacity: 0, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } })
      })
    }, root)
    return () => ctx.revert()
  }, [lang, shows.length])

  return (
    <div className="tour" ref={root}>
      <header className="tour-head">
        <h1 className="tour-title f-now">{t.tour.title}</h1>
        <div className="tour-lead">
          <p>{t.tour.lead}</p>
          <a className="listen tour-cta" href={settings.tourUrl} target="_blank" rel="noreferrer">{t.tour.all}</a>
        </div>
      </header>

      <section aria-labelledby="up">
        <h2 id="up" className="tour-h">{t.tour.upcoming} <span className="tour-count">{upcoming.length}</span></h2>
        {upcoming.length
          ? <ol className="tickets">{upcoming.map((s) => <Show key={s.id || s.date + s.venue} s={s} lang={lang} t={t} tickets={settings.tourUrl} />)}</ol>
          : <p className="tour-empty">{t.tour.empty}</p>}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past" className="tour-past">
          <h2 id="past" className="tour-h">{t.tour.past}</h2>
          <ol className="tickets tickets--past">{past.map((s) => <Show key={s.id || s.date + s.venue} s={s} lang={lang} t={t} past />)}</ol>
        </section>
      )}
      <p className="tour-note">{t.tour.note}</p>
      <SiteFooter />
    </div>
  )
}
