import { STORE_URL } from './links'
// Ассортимент официального магазина realdora.store. Описания пересказаны коротко.
// Картинки - наши собственные стикер-иллюстрации; фото товаров позже возьмём у команды.
export const MERCH = [
  { id: 'pick', art: 'pick', url: 'https://realdora.store/mediator-cute-rock',
    name: { ru: 'Медиаторы «Cute rock»', en: '“Cute rock” picks' },
    desc: { ru: 'Набор из двух: чёрный и белый.', en: 'A set of two, black and white.' } },
  { id: 'tee', art: 'tee', url: STORE_URL,
    name: { ru: 'Футболка', en: 'T-shirt' },
    desc: { ru: 'Свободный крой, унисекс.', en: 'Loose fit, unisex.' } },
  { id: 'pendant', art: 'pendant', url: 'https://realdora.store/kulon-cute-rock',
    name: { ru: 'Кулон «Cute rock»', en: '“Cute rock” pendant' },
    desc: { ru: 'Металл, длинная цепочка.', en: 'Metal, long chain.' } },
  { id: 'stickers', art: 'stickers', url: STORE_URL,
    name: { ru: 'Стикерпак', en: 'Sticker pack' },
    desc: { ru: 'Цветные наклейки на плёнке, А5.', en: 'Color stickers on film, A5.' } },
  { id: 'hoodie', art: 'hoodie', url: STORE_URL,
    name: { ru: 'Худи', en: 'Hoodie' },
    desc: { ru: 'Оверсайз, капюшон на шнурках.', en: 'Oversized, drawstring hood.' } },
  { id: 'tag', art: 'tag', url: 'https://realdora.store/geton-cute-rock',
    name: { ru: 'Жетон «Cute rock»', en: '“Cute rock” dog tag' },
    desc: { ru: 'Металлический жетон на цепочке.', en: 'Metal tag on a chain.' } },
  { id: 'poster', art: 'poster', url: 'https://realdora.store/poster',
    name: { ru: 'Плакат с автографом', en: 'Signed poster' },
    desc: { ru: 'Формат А4.', en: 'A4 size.' } },
  { id: 'socks', art: 'socks', url: STORE_URL,
    name: { ru: 'Носки «дора»', en: '“дора” socks' },
    desc: { ru: 'Хлопок, мягкие и лёгкие.', en: 'Cotton, soft and light.' } },
  { id: 'bracelet', art: 'bracelet', url: 'https://realdora.store/braslet-cute-rock',
    name: { ru: 'Браслет «Cute rock»', en: '“Cute rock” wristband' },
    desc: { ru: 'Силикон, принт шелкографией.', en: 'Silicone, screen-printed.' } }
]
