// Подпись автора сайта: логотип cookiekiller и рядом «designed by cookiekiller.online».
// Логотип - src/assets/credit/cookiekiller.svg (одноцветный контур). Вставляем его прямо в разметку
// как SVG с заливкой currentColor: он перекрашивается под цвет текста и работает в любом браузере.
// (CSS-маска с data:-ссылкой не срабатывала в Safari на iOS и давала серый прямоугольник.)
// Если файла нет - показывается текстовый знак cookiekiller®.
const files = import.meta.glob('../assets/credit/cookiekiller.svg', { eager: true, query: '?raw', import: 'default' })
const RAW = Object.values(files)[0] || null
const LOGO = RAW && RAW
  .replace(/<\?xml[^>]*>/, '')
  .replace(/\s(width|height)="[^"]*"/g, '')                     // размер задаёт CSS
  .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')       // цвет - от текста
  .replace('<svg', '<svg aria-hidden="true" focusable="false" preserveAspectRatio="xMinYMid meet"')
export const CREDIT_URL = 'https://cookiekiller.online'

export default function DesignCredit({ className = '' }) {
  return (
    <a className={`credit ${className}`} href={CREDIT_URL} target="_blank" rel="noopener noreferrer" aria-label="designed by cookiekiller.online">
      {LOGO
        ? <span className="credit-logo" dangerouslySetInnerHTML={{ __html: LOGO }} />
        : <span className="credit-mark" aria-hidden="true">cookiekiller<sup>®</sup></span>}
      <span className="credit-by">designed by cookiekiller.online</span>
    </a>
  )
}
