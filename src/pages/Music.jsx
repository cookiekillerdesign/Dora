import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { spotifySearch } from '../data/eras'
import { useLang } from '../i18n'
import { tr } from '../lib/tr'
import { store } from '../store'
import { useContent } from '../content/ContentProvider'
import { useConsent, setConsent } from '../lib/consent'
import { useSpotifyPlayer } from '../lib/spotifyPlayer'
import { safeGet, safeSet } from '../lib/storage'
import { YANDEX_ARTIST } from '../data/eras'
import Turntable from '../components/Turntable'
import PlayerConsent from '../components/PlayerConsent'
import { NoBr, scriptCase } from '../lib/nobr'

// Что играет: весь альбом ('album') или конкретный трек (индекс)
const yandexSrc = (era, k) => {
  if (k === 'album') return era.yandexAlbum ? `https://music.yandex.ru/iframe/album/${era.yandexAlbum}` : null
  const t = era.tracks?.[k]
  if (!t || t.single) return t?.yandexAlbum ? `https://music.yandex.ru/iframe/album/${t.yandexAlbum}` : null
  if (t.yandex && era.yandexAlbum) return `https://music.yandex.ru/iframe/album/${era.yandexAlbum}/track/${t.yandex}`
  return era.yandexAlbum ? `https://music.yandex.ru/iframe/album/${era.yandexAlbum}` : null // трек виден в списке альбома
}
const yandexWeb = (q) => `https://music.yandex.ru/search?text=${encodeURIComponent('дора ' + q)}`
const uriOf = (era, k) => {
  if (k === 'album') return era.albumId ? `spotify:album:${era.albumId}` : null
  const t = era.tracks?.[k]
  if (!t) return null
  if (t.spotify) return `spotify:track:${t.spotify}`
  if (t.album) return `spotify:album:${t.album}`
  if (!t.single && era.albumId) return `spotify:album:${era.albumId}` // трек есть в плеере альбома
  return null
}
const webOf = (uri, q) => uri ? `https://open.spotify.com/${uri.split(':')[1]}/${uri.split(':')[2]}` : spotifySearch(q || 'дора')
const defaultK = (era) => (era.albumId ? 'album' : Math.max(0, (era.tracks || []).findIndex((t) => t.spotify || t.album)))

export default function Music() {
  const { t, lang } = useLang()
  const consent = useConsent()
  const [params] = useSearchParams()
  const eras = useContent('eras').map((e, idx) => ({ ...e, idx, tracks: e.tracks || [] }))
  const found = eras.findIndex((e) => e.id === params.get('era'))
  const e0 = found >= 0 ? found : 2
  const want = (params.get('track') || '').toLowerCase()
  const ti = want ? eras[e0].tracks.findIndex((x) => x.t.toLowerCase() === want) : -1
  const [sel, setSel] = useState({ e: e0, k: ti >= 0 ? ti : defaultK(eras[e0]) })

  // переход по ссылке на другую эпоху или трек, когда страница уже открыта
  const qEra = params.get('era'), qTrack = params.get('track')
  useEffect(() => {
    if (!qEra) return
    const ei = eras.findIndex((x) => x.id === qEra)
    if (ei < 0) return
    const ti = qTrack ? eras[ei].tracks.findIndex((x) => x.t.toLowerCase() === qTrack.toLowerCase()) : -1
    setSel({ e: ei, k: ti >= 0 ? ti : defaultK(eras[ei]) })
  }, [qEra, qTrack])
  const era = eras[sel.e] || eras[0]
  const track = sel.k === 'album' ? null : era.tracks[sel.k]
  const uri = uriOf(era, sel.k)
  const title = sel.k === 'album' ? tr(era.title, lang) : track?.t
  useEffect(() => { store.eraTarget = sel.e }, [sel.e])

  const [service, setServiceState] = useState(() => safeGet('dora-player') || (lang === 'en' ? 'spotify' : 'yandex'))
  const setService = (v) => { safeSet('dora-player', v); setServiceState(v) }
  const ySrc = yandexSrc(era, sel.k)
  // У Яндекса нет API «играет / пауза»: считаем, что музыка пошла, когда нажали внутрь плеера
  const [yPlaying, setYPlaying] = useState(false)
  useEffect(() => { setYPlaying(false) }, [ySrc, service])
  useEffect(() => {
    if (service !== 'yandex') return
    const onBlur = () => setTimeout(() => { const a = document.activeElement; if (a && a.tagName === 'IFRAME' && a.closest('.player')) setYPlaying(true) }, 0)
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [service])

  // Страница музыки на компьютере не прокручивается, поэтому колесо в любом месте страницы
  // прокручивает список песен. Над самим списком он прокручивается сам (data-lenis-prevent),
  // над плеером колесо остаётся плееру: это чужая страница в iframe, сайт его не получает.
  const page = useRef(null), list = useRef(null)
  useEffect(() => {
    const fixed = window.matchMedia('(min-width: 861px) and (min-height: 700px)')
    const el = page.current
    if (!el) return
    const onWheel = (e) => {
      if (!fixed.matches || !list.current || list.current.contains(e.target)) return
      e.preventDefault()
      list.current.scrollBy({ top: e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const host = useRef(null)
  const enabled = consent === 'all' && !!uri
  const { mode, playing: spPlaying } = useSpotifyPlayer(host, uri, consent === 'all' && service === 'spotify', 380)
  const playing = service === 'yandex' ? yPlaying : spPlaying
  const hasPlayer = service === 'yandex' ? !!ySrc : !!uri
  const albumTracks = era.tracks.filter((x) => !x.single)
  const realCount = era.albumCount || albumTracks.length
  const yearsLabel = (lang === 'en' && era.yearsEn) || era.years
  const count = realCount ? `${realCount} ${t.music.tracksWord(realCount)}` : t.music.wholeAlbum

  return (
    <>
      <div className={`music era-${era.id}`} ref={page} data-lenis-prevent>
        {/* data-lenis-prevent: колесо над списком прокручивает сам список, а не страницу */}
        <aside className="jcard" aria-label={t.music.title} data-lenis-prevent ref={list}>
          <h1 className="music-title">{t.music.title}</h1>
          <p className="music-sub">{t.music.sub}</p>
          <ol className="jcard-eras">
            {eras.map((e) => (
              <li key={e.id} className={`jcard-era ${e.idx === sel.e ? 'is-on' : ''}`}>
                <div className="jcard-head">
                  <span className={`jcard-name ${e.font}`}><NoBr>{scriptCase(tr(e.title, lang), e.font)}</NoBr></span>
                  <span className="jcard-year">{e.year}</span>
                </div>
                <ul className="jcard-tracks">
                  {(e.albumId || e.yandexAlbum) && (
                    <li>
                      <button className={`jcard-track jcard-track--album ${e.idx === sel.e && sel.k === 'album' ? 'is-on' : ''}`}
                        onClick={() => setSel({ e: e.idx, k: 'album' })} aria-current={e.idx === sel.e && sel.k === 'album'}>
                        <span className="jcard-disc" aria-hidden="true" />
                        {t.music.albumRow}
                        <span className="jcard-count">{(e.albumCount || e.tracks.filter((x) => !x.single).length)} {t.music.tracksWord(e.albumCount || e.tracks.filter((x) => !x.single).length)}</span>
                      </button>
                    </li>
                  )}
                  {e.tracks.map((tk, k) => tk.single ? null : (
                    <li key={tk.t}>
                      <button className={`jcard-track ${e.idx === sel.e && k === sel.k ? 'is-on' : ''}`} onClick={() => setSel({ e: e.idx, k })} aria-current={e.idx === sel.e && k === sel.k}>
                        <span className="jcard-n">{String(e.tracks.slice(0, k + 1).filter((x) => !x.single).length).padStart(2, '0')}</span>{tk.t}
                      </button>
                    </li>
                  ))}
                </ul>
                {e.tracks.some((x) => x.single) && (
                  <>
                    <p className="jcard-sub">{t.music.singles}</p>
                    <ul className="jcard-tracks">
                      {e.tracks.map((tk, k) => !tk.single ? null : (
                        <li key={tk.t}>
                          <button className={`jcard-track jcard-track--single ${e.idx === sel.e && k === sel.k ? 'is-on' : ''}`} onClick={() => setSel({ e: e.idx, k })} aria-current={e.idx === sel.e && k === sel.k}>
                            <span className="jcard-n" aria-hidden="true">✦</span>{tk.t}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ol>
        </aside>

        <section className="stage">
          <div className="stage-deck">
            <Turntable era={era} bpm={track?.bpm || 110} title={title} playing={enabled && playing} cover={track?.cover || era.cover} />
          </div>
          <div className="stage-side">
            <span className="stage-meta">{yearsLabel}, {tr(era.title, lang)}{sel.k === 'album' ? ` · ${count}` : ''}</span>
            <h2 className={`stage-track ${era.font}`} aria-label={title}><NoBr>{scriptCase(title, era.font)}</NoBr></h2>
            <div className="svc" role="tablist" aria-label={t.music.service}>
              {[['yandex', 'Яндекс Музыка'], ['spotify', 'Spotify']].map(([v, l]) => (
                <button key={v} role="tab" aria-selected={service === v} className={`svc-btn svc-btn--${v} ${service === v ? 'is-on' : ''}`} onClick={() => setService(v)}>{l}</button>
              ))}
            </div>
            {/* место под подсказку зарезервировано: когда музыка пошла, подсказка гаснет, а плеер не сдвигается */}
            <div className="hint-slot">
              {consent === 'all' && hasPlayer && (
                <div className={`play-hint ${playing ? 'is-gone' : ''}`} role="status" aria-hidden={playing}>
                  <span className="play-hint-ico" aria-hidden="true">▶</span>
                  <span>{sel.k === 'album' ? t.music.hintAlbum : t.music.hintTrack}</span>
                </div>
              )}
            </div>
            <div className="player">
              {consent !== 'all' ? (
                <PlayerConsent t={t} onPick={setService} />
              ) : service === 'yandex' ? (
                ySrc
                  ? <iframe key={ySrc} title={`Яндекс Музыка: ${title}`} className="player-frame player-frame--yandex" src={ySrc} width="100%" height="420" loading="lazy" allow="clipboard-write" />
                  : <div className="player-card player-card--yandex">
                      <p>{t.music.yandexMissing}</p>
                      <a className="listen svc-open" href={track ? yandexWeb(track.t) : YANDEX_ARTIST} target="_blank" rel="noreferrer">{t.music.openYandex}</a>
                    </div>
              ) : (
                <>
                  <div ref={host} className="player-host" />
                  {mode === 'iframe' && uri && (
                    <iframe key={uri} title={`Spotify: ${title}`} className="player-frame"
                      src={`https://open.spotify.com/embed/${uri.split(':')[1]}/${uri.split(':')[2]}?utm_source=generator&theme=0`}
                      width="100%" height="380" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                  )}
                  {!uri && (
                    <div className="player-card"><p>{t.music.noEmbed}</p></div>
                  )}
                </>
              )}
              {sel.k !== 'album' && !track?.spotify && !track?.yandex && !track?.single && consent === 'all' && (
                <p className="player-inalbum">{t.music.inAlbum}</p>
              )}
            </div>
            <div className="player-meta">
              {service === 'spotify'
                ? <a className="listen" href={webOf(uri, track?.t)} target="_blank" rel="noreferrer">{t.music.open}</a>
                : hasPlayer && <a className="listen svc-open" href={track ? yandexWeb(track.t) : (era.yandexAlbum ? `https://music.yandex.ru/album/${era.yandexAlbum}` : YANDEX_ARTIST)} target="_blank" rel="noreferrer">{t.music.openYandex}</a>}
              <p className="player-note">{t.music.note}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
