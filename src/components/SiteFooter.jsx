import Socials from './Socials'
import DesignCredit from './DesignCredit'
import { Link } from 'react-router-dom'
import { openConsent } from '../lib/consent'
import { useLang } from '../i18n'

export default function SiteFooter() {
  const { t } = useLang()
  return (
    <footer className="site-footer">
      <h2 className="foot-title">{t.socials.title}</h2>
      <Socials />
      <nav className="foot-legal" aria-label={t.legal.docs}>
        <Link to="/legal">{t.legal.info}</Link>
        <Link to="/privacy">{t.legal.privacy}</Link>
        <Link to="/cookies">{t.legal.cookies}</Link>
        <Link to="/terms">{t.legal.terms}</Link>
        <button type="button" onClick={openConsent}>{t.legal.settings}</button>
      </nav>
      <DesignCredit className="credit--foot" />
    </footer>
  )
}
