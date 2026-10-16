// Иллюстрации товаров в стиле вырезанных наклеек: толстый белый контур + чёрная обводка
const S = { stroke: '#1A0A14', strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round' }

function Die({ children }) {
  // белая «подложка» наклейки: та же фигура с очень толстым белым контуром
  return <g>
    <g style={{ filter: 'drop-shadow(0 6px 0 rgba(26,10,20,.18))' }}>
      <g stroke="#fff" strokeWidth="22" strokeLinejoin="round" strokeLinecap="round" fill="#fff">{children}</g>
    </g>
    {children}
  </g>
}

const ART = {
  pick: () => <Die>
    <path d="M60 40c30-10 70-4 78 14 6 16-24 70-38 82-14-12-50-62-48-80 1-8 3-12 8-16z" fill="#1A0A14" {...S} transform="rotate(-14 100 90)" />
    <path d="M86 50c30-10 70-4 78 14 6 16-24 70-38 82-14-12-50-62-48-80 1-8 3-12 8-16z" fill="#fff" {...S} transform="rotate(12 120 90)" />
    <text x="128" y="98" fontSize="13" fontWeight="800" textAnchor="middle" fill="#E0103A" transform="rotate(12 120 90)" fontFamily="Onest, sans-serif">CUTE ROCK</text>
  </Die>,
  tee: () => <Die>
    <path d="M70 40l-36 20 14 28 18-8v74h68V80l18 8 14-28-36-20c-4 12-16 18-30 18S74 52 70 40z" fill="#FF3D8B" {...S} />
    <text x="100" y="118" fontSize="24" textAnchor="middle" fill="#fff" fontFamily="'Rubik Dirt', Impact, sans-serif">дора</text>
  </Die>,
  pendant: () => <Die>
    <path d="M60 24c10 40 70 40 80 0" fill="none" {...S} strokeDasharray="2 7" />
    <path d="M100 168S56 138 56 108a22 22 0 0 1 44-6 22 22 0 0 1 44 6c0 30-44 60-44 60z" fill="#C9CDD6" {...S} />
    <circle cx="100" cy="66" r="6" fill="#fff" {...S} />
    <text x="100" y="124" fontSize="13" fontWeight="800" textAnchor="middle" fill="#1A0A14" fontFamily="Onest, sans-serif">CUTE ROCK</text>
  </Die>,
  stickers: () => <Die>
    <rect x="42" y="34" width="116" height="140" rx="10" fill="#9FD8FF" {...S} transform="rotate(-5 100 104)" />
    <path d="M78 92s-18-11-18-22a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 11-18 22-18 22z" fill="#E0103A" {...S} />
    <path d="M128 60l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#FFE45C" {...S} />
    <circle cx="80" cy="134" r="16" fill="#FFB3D9" {...S} />
    <path d="M126 112l-12 22h10l-4 18 16-24h-10z" fill="#fff" {...S} />
  </Die>,
  hoodie: () => <Die>
    <path d="M74 40c4-10 48-10 52 0l30 22 12 70-20 4-6-40v80H58V96l-6 40-20-4 12-70z" fill="#1A0A14" {...S} />
    <path d="M78 42c4 24 40 24 44 0" fill="none" stroke="#fff" strokeWidth="4" />
    <path d="M92 66v22M108 66v22" stroke="#FFB3D9" strokeWidth="4" strokeLinecap="round" />
    <rect x="78" y="134" width="44" height="22" rx="6" fill="none" stroke="#fff" strokeWidth="3" />
  </Die>,
  tag: () => <Die>
    <path d="M60 22c14 30 66 30 80 0" fill="none" {...S} strokeDasharray="2 7" />
    <rect x="66" y="56" width="68" height="112" rx="22" fill="#DDEBFF" {...S} />
    <circle cx="100" cy="72" r="5" fill="#fff" {...S} />
    <text x="100" y="112" fontSize="14" fontWeight="800" textAnchor="middle" fill="#1A0A14" fontFamily="Onest, sans-serif">CUTE</text>
    <text x="100" y="132" fontSize="14" fontWeight="800" textAnchor="middle" fill="#1A0A14" fontFamily="Onest, sans-serif">ROCK</text>
  </Die>,
  poster: () => <Die>
    <rect x="50" y="26" width="100" height="144" rx="4" fill="#FFE9E0" {...S} transform="rotate(4 100 98)" />
    <path d="M70 60h60M70 76h44" stroke="#E9B7B0" strokeWidth="8" strokeLinecap="round" transform="rotate(4 100 98)" />
    <path d="M68 132c10-16 18 10 26-4s10-18 18-2 12 6 20-6" fill="none" stroke="#1F3FAF" strokeWidth="4" strokeLinecap="round" transform="rotate(4 100 98)" />
  </Die>,
  socks: () => <Die>
    <path d="M70 30h40v80c0 10 6 16 16 20l18 8c12 6 10 30-8 30H86c-14 0-20-10-20-24V30z" fill="#fff" {...S} transform="rotate(-8 100 100)" />
    <path d="M70 46h40M70 58h40" stroke="#FF3D8B" strokeWidth="6" transform="rotate(-8 100 100)" />
    <text x="92" y="100" fontSize="16" textAnchor="middle" fill="#E0103A" transform="rotate(-8 100 100)" fontFamily="'Unbounded', sans-serif">дора</text>
  </Die>,
  bracelet: () => <Die>
    <ellipse cx="100" cy="100" rx="70" ry="44" fill="none" stroke="#1A0A14" strokeWidth="26" />
    <ellipse cx="100" cy="100" rx="70" ry="44" fill="none" stroke="#E0103A" strokeWidth="18" />
    <text x="100" y="152" fontSize="15" fontWeight="800" textAnchor="middle" fill="#fff" fontFamily="Onest, sans-serif" letterSpacing="2">CUTE ROCK</text>
  </Die>
}

export default function MerchArt({ kind }) {
  const A = ART[kind]
  return <svg viewBox="0 0 200 200" className="merch-art" aria-hidden="true"><A /></svg>
}
