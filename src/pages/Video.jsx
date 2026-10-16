import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { store } from '../store'
import { useContent } from '../content/ContentProvider'
import { useConsent, setConsent } from '../lib/consent'
import { youtubeId } from '../data/videos'
import SiteFooter from '../components/SiteFooter'

// Страница клипов. Плеер YouTube (домен youtube-nocookie) и превью клипов грузятся
// только после согласия на сторонние плееры: до этого - стилизованные карточки без запросов к Google.
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

export default function Video() {
  const { t } = useLang()
  const consent = useConsent()
  const videos = useContent('videos').map((v) => ({ ...v, yt: youtubeId(v.youtube) })).filter((v) => v.yt)
  const sorted = [...videos].sort((a, b) => (b.year || 0) - (a.year || 0))
  const [current, setCurrent] = useState(sorted[0]?.id)
  const [autoplay, setAutoplay] = useState(false)
  const stage = useRef(null)
  const playing = sorted.find((v) => v.id === current) || sorted[0]
  const allowed = consent === 'all'

  useEffect(() => { store.eraTarget = 5 }, [])

  const pick = (v) => {
    setCurrent(v.id); setAutoplay(true)
    stage.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="video">
      <header className="video-head">
        <h1 className="video-title">{t.video.title}</h1>
        <p className="video-sub">{t.video.sub}</p>
      </header>

      <section className="video-stage" ref={stage} aria-label={playing?.title}>
        <div className="video-screen">
          {!playing ? null : allowed ? (
            <iframe key={playing.yt + autoplay} className="video-frame" title={`${playing.title} - YouTube`}
              src={`https://www.youtube-nocookie.com/embed/${playing.yt}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          ) : (
            <div className="video-gate">
              <p>{t.video.gate}</p>
              <div className="player-consent-actions">
                <button type="button" className="consent-btn consent-btn--all" onClick={() => setConsent('all')}>{t.video.enable}</button>
                <Link to="/cookies" className="player-consent-more">{t.legal.more}</Link>
              </div>
            </div>
          )}
        </div>
        {playing && (
          <div className="video-now">
            <span className="video-now-year">{playing.year}</span>
            <h2 className="video-now-title">{playing.title}</h2>
            <a className="video-now-yt" href={`https://www.youtube.com/watch?v=${playing.yt}`} target="_blank" rel="noreferrer">{t.video.openYt}</a>
          </div>
        )}
      </section>

      <ul className="video-grid" aria-label={t.video.list}>
        {sorted.map((v, i) => (
          <li key={v.id}>
            <button type="button" className={`video-card ${v.id === playing?.id ? 'is-on' : ''}`} onClick={() => pick(v)} aria-current={v.id === playing?.id}>
              <span className="video-thumb" style={{ '--i': i }}>
                {allowed ? <img src={thumb(v.yt)} alt="" loading="lazy" /> : <span className="video-thumb-ph" aria-hidden="true" />}
                <span className="video-play" aria-hidden="true" />
              </span>
              <span className="video-card-meta"><span className="video-card-title">{v.title}</span><span className="video-card-year">{v.year}</span></span>
            </button>
          </li>
        ))}
      </ul>
      <SiteFooter />
    </div>
  )
}
