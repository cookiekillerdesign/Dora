// Слова с дефисом («кьют-рок», «Самолёты-поезда») не переносятся по дефису: при нехватке места
// слово целиком уходит на следующую строку. Широкие шрифты эпох иначе рвут названия пополам.
export function NoBr({ children }) {
  if (typeof children !== 'string') return children
  return children.split(/(\S+-\S+)/g).map((part, i) =>
    /\S+-\S+/.test(part) ? <span key={i} style={{ whiteSpace: 'nowrap' }}>{part}</span> : part
  )
}

// Каллиграфия заглавными не читается: в скриптовых заголовках «LOVESONGS» показываем как «Lovesongs»
export const scriptCase = (text, font) =>
  font === 'f-love' && typeof text === 'string'
    ? text.replace(/[A-ZА-ЯЁ]{3,}/g, (w) => w[0] + w.slice(1).toLowerCase())
    : text
