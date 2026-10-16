// Обложка трека или альбома. Пока обложка не загружена в админке, показывается
// заглушка в цветах эпохи: градиент, пластинка и название.
const PALETTES = [['#FF3D8B', '#2a0a2e'], ['#9FD8FF', '#1F3FAF'], ['#FFE45C', '#E0103A'], ['#C9CDD6', '#3b0f35'], ['#FFB46B', '#5A0F26'], ['#DDEBFF', '#081133'], ['#B04A9E', '#FFB3D9']]

export default function CoverArt({ src, title, index = 0, label }) {
  if (src) return <img className="cover-art" src={src} alt={title} loading="lazy" draggable="false" />
  const [a, b] = PALETTES[index % PALETTES.length]
  return (
    <span className="cover-art cover-art--ph" style={{ '--a': a, '--b': b }} role="img" aria-label={title}>
      <span className="cover-art-disc" aria-hidden="true" />
      <span className="cover-art-title">{title}</span>
      {label && <span className="cover-art-label">{label}</span>}
    </span>
  )
}
