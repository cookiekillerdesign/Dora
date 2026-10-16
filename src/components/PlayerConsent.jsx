import { Link } from 'react-router-dom'
import { setConsent } from '../lib/consent'

// Оповещение на странице музыки: разрешить сторонние плееры и сразу выбрать, где слушать.
// Один клик - согласие на cookie плееров и включение выбранного сервиса.
export default function PlayerConsent({ t, onPick }) {
  const pick = (service) => { setConsent('all'); onPick(service) }
  return (
    <div className="pconsent" role="dialog" aria-labelledby="pconsent-title" aria-describedby="pconsent-text">
      <span className="pconsent-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
      </span>
      <h3 id="pconsent-title" className="pconsent-title">{t.music.consentTitle}</h3>
      <p id="pconsent-text" className="pconsent-text">{t.music.consentText}</p>
      <div className="pconsent-actions">
        <button type="button" className="pconsent-btn pconsent-btn--yandex" onClick={() => pick('yandex')}>{t.music.listenYandex}</button>
        <button type="button" className="pconsent-btn pconsent-btn--spotify" onClick={() => pick('spotify')}>{t.music.listenSpotify}</button>
      </div>
      <Link to="/cookies" className="pconsent-more">{t.music.consentMore}</Link>
    </div>
  )
}
