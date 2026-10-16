import { useRef } from 'react'
import { useLang } from '../../i18n'
import { useContent } from '../../content/ContentProvider'
import { useTape } from './useTape'
import Cover from './Cover'
import ScrollHint from './ScrollHint'
import Prologue from './chapters/Prologue'
import Sister from './chapters/Sister'
import CuteRock from './chapters/CuteRock'
import Miss from './chapters/Miss'
import LoveSongs from './chapters/LoveSongs'
import Now from './chapters/Now'
import Outro from './chapters/Outro'

const CHAPTERS = { prologue: Prologue, sister: Sister, cuterock: CuteRock, miss: Miss, lovesongs: LoveSongs, now: Now }

// Главная: обложка, шесть глав и финал на горизонтальной ленте
export default function Home() {
  const { t, lang } = useLang()
  const eras = useContent('eras')
  const wrap = useRef(null), track = useRef(null)
  useTape(wrap, track, [lang, eras])

  return (
    <>
      <div className="h-wrap" ref={wrap}>
        <div className="h-track" ref={track}>
          <Cover t={t} />
          {eras.map((era) => {
            const Chapter = CHAPTERS[era.id]
            return Chapter ? <Chapter key={era.id} era={era} t={t} lang={lang} /> : null
          })}
          <Outro t={t} lang={lang} />
        </div>
      </div>
      <ScrollHint t={t} />
    </>
  )
}
