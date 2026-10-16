// Бумажное сердце-наклейка для пролога: мятая бумага с белой вырубкой по контуру
export default function HeartSticker({ className = '' }) {
  return (
    <svg className={`heart-sticker ${className}`} viewBox="0 0 220 200" aria-hidden="true">
      <defs>
        <filter id="paper-crumple" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7" result="n" />
          <feDiffuseLighting in="n" lightingColor="#fff" surfaceScale="2.4" result="light"><feDistantLight azimuth="235" elevation="48" /></feDiffuseLighting>
          <feComposite in="light" in2="SourceGraphic" operator="in" result="lit" />
          <feBlend in="SourceGraphic" in2="lit" mode="multiply" />
        </filter>
        <filter id="paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="3" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
      </defs>
      <path d="M110 188S10 128 14 64C17 26 54 8 84 22c12 6 20 16 26 26 6-10 14-20 26-26 30-14 67 4 70 42 4 64-96 124-96 124z" fill="#fff" />
      <path d="M110 174S26 120 29 66c2-28 30-42 53-32 13 6 22 18 28 30 6-12 15-24 28-30 23-10 51 4 53 32 3 54-81 108-81 108z" fill="#E2252E" filter="url(#paper-crumple)" />
      <path d="M110 174S26 120 29 66c2-28 30-42 53-32 13 6 22 18 28 30 6-12 15-24 28-30 23-10 51 4 53 32 3 54-81 108-81 108z" fill="#000" filter="url(#paper-grain)" />
    </svg>
  )
}
