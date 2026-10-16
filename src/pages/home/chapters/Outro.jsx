import DesignCredit from '../../../components/DesignCredit'
import { Link } from 'react-router-dom'
import Socials, { MetaNote } from '../../../components/Socials'
import { useContent } from '../../../content/ContentProvider'
import { OUTRO_ERA } from '../../../data/photos'
import { EraSlot } from '../shared'

function OutroLegal({ t }) {
  const socials = useContent('socials')
  return (<>
    <p className="outro-note">{t.outro.note} <Link to="/legal">{t.legal.info}</Link></p>
    <MetaNote socials={socials} />
    <DesignCredit className="credit--outro" />
  </>)
}

export default function Outro({ t, lang }) {
  return (
    <section className="panel panel--outro">
      <div className="outro-main">
        <h2 className="outro-title">{t.outro.title}</h2>
        <Socials big />
        <OutroLegal t={t} />
      </div>
      <EraSlot era={OUTRO_ERA} lang={lang} />
      <EraSlot era={OUTRO_ERA} lang={lang} which="second" />
    </section>
  )
}
