// Текст на нужном языке; если английского нет, показываем русский
export const tr = (obj, lang) => (obj && (obj[lang] || obj.ru)) || ''
