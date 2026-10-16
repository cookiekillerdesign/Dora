import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { newId } from './schema'

// Фото с телефона весят 3-10 МБ. Перед загрузкой уменьшаем до 2000px по длинной стороне
// и сохраняем в WebP прямо в браузере. SVG, GIF и не-картинки загружаются как есть.
const MAX_SIDE = 2000
export async function compressImage(file) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return file
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
    const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
    bmp.close?.()
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.86))
    // если браузер не умеет WebP или выигрыша нет - оставляем оригинал
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}

export async function uploadFile(file, folder) {
  const safe = file.name.toLowerCase().replace(/[^\w.-]+/g, '_')
  const path = `${folder}/${newId()}-${safe}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

// Из ссылки open.spotify.com/track/ID?si=… достаём только ID
// Из ссылки music.yandex.ru/album/8886142/track/58507005 берём последний числовой ID
import { youtubeId } from '../data/videos'

export const yandexId = (v) => {
  if (!v) return ''
  const m = String(v).match(/track\/(\d+)/) || String(v).match(/album\/(\d+)/)
  return m ? m[1] : String(v).trim()
}

export const spotifyId = (v) => {
  if (!v) return ''
  const m = String(v).match(/(?:track|album)[/:]([A-Za-z0-9]{10,})/)
  return m ? m[1] : String(v).trim()
}

function Upload({ value, onChange, folder, accept, image }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pick = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 20 * 1024 * 1024) { setErr('Файл больше 20 МБ, уменьшите его.'); return }
    setBusy(true); setErr('')
    try { onChange(await uploadFile(await compressImage(f), folder)) } catch (x) { setErr('Не загрузилось: ' + (x.message || 'ошибка хранилища')) }
    setBusy(false)
  }
  return (
    <div className="f-upload">
      {value && image && <img className="f-thumb" src={value} alt="" />}
      {value && !image && <a className="f-filelink" href={value} target="_blank" rel="noreferrer">{decodeURIComponent(value.split('/').pop()).replace(/^[a-z0-9]+-/, '')}</a>}
      <div className="f-upload-row">
        <label className="a-btn a-btn--ghost">
          {busy ? 'Загружаем…' : value ? 'Заменить' : 'Загрузить'}
          <input type="file" accept={accept} onChange={pick} disabled={busy} hidden />
        </label>
        {value && <button type="button" className="a-link" onClick={() => onChange(null)}>Убрать</button>}
      </div>
      {err && <p className="f-err">{err}</p>}
    </div>
  )
}

function Strings({ value = [], onChange }) {
  return (
    <div className="f-strings">
      {value.map((s, i) => (
        <div key={i} className="f-strings-row">
          <input value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className="a-icon" aria-label="Удалить" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="a-link" onClick={() => onChange([...value, ''])}>+ Добавить</button>
    </div>
  )
}

export function Field({ f, value, onChange, item, folder }) {
  if (f.showIf && !f.showIf(item)) return null
  const label = <span className="f-label">{f.label}{f.required && <b aria-hidden="true"> *</b>}</span>
  switch (f.type) {
    case 'textarea':
      return <label className="f">{label}<textarea rows={4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></label>
    case 'number':
      return <label className="f f--short">{label}<input type="number" value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} /></label>
    case 'date':
      return <label className="f f--short">{label}<input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></label>
    case 'checkbox':
      return <label className="f f--check"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />{f.label}</label>
    case 'select':
      return (
        <label className="f f--short">{label}
          <select value={value ?? f.options[0][0]} onChange={(e) => onChange(e.target.value)}>
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      )
    case 'i18n': {
      const v = value || { ru: '', en: '' }
      const Tag = f.multiline ? 'textarea' : 'input'
      return (
        <fieldset className="f f--i18n">
          <legend>{label}</legend>
          <label><span className="f-lang">RU</span><Tag rows={f.multiline ? 4 : undefined} value={v.ru ?? ''} placeholder={f.placeholder} onChange={(e) => onChange({ ...v, ru: e.target.value })} /></label>
          <label><span className="f-lang">EN</span><Tag rows={f.multiline ? 4 : undefined} value={v.en ?? ''} onChange={(e) => onChange({ ...v, en: e.target.value })} /></label>
        </fieldset>
      )
    }
    case 'spotify':
      return (
        <label className="f">{label}
          <input value={value ?? ''} placeholder="https://open.spotify.com/track/…" onChange={(e) => onChange(spotifyId(e.target.value))} />
          {value && <span className="f-note">ID: {value}</span>}
        </label>
      )
    case 'youtube':
      return (
        <label className="f">{label}
          <input value={value ?? ''} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => onChange(youtubeId(e.target.value))} />
          {value && <span className="f-note">ID: {value}</span>}
        </label>
      )
    case 'yandex':
      return (
        <label className="f">{label}
          <input value={value ?? ''} placeholder="https://music.yandex.ru/album/…" onChange={(e) => onChange(yandexId(e.target.value))} />
          {value && <span className="f-note">ID: {value}</span>}
        </label>
      )
    case 'image':
      return <div className="f">{label}<Upload value={value} onChange={onChange} folder={folder} accept="image/*" image /></div>
    case 'file':
      return <div className="f">{label}<Upload value={value} onChange={onChange} folder={folder} accept=".pdf,.zip,.png,.jpg,.jpeg,.svg,.doc,.docx" /></div>
    case 'strings':
      return <div className="f">{label}<Strings value={value || []} onChange={onChange} /></div>
    case 'list':
      return <div className="f f--list">{label}<ListEditor fields={f.fields} items={value || []} onChange={onChange} itemTitle={f.itemTitle} newItem={f.newItem} folder={folder} nested /></div>
    default:
      return <label className="f">{label}<input value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} /></label>
  }
}

export function Fields({ fields, value, onChange, folder }) {
  return (
    <div className="f-grid">
      {fields.map((f, i) => (
        <Field key={`${f.name}-${i}`} f={f} item={value} folder={folder} value={value?.[f.name]}
          onChange={(v) => onChange({ ...value, [f.name]: v })} />
      ))}
    </div>
  )
}

export function ListEditor({ fields, items, onChange, itemTitle, newItem, fixed, folder, nested, Preview }) {
  const [open, setOpen] = useState(() => new Set())
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const n = [...items];[n[i], n[j]] = [n[j], n[i]]; onChange(n)
  }
  const add = () => {
    const n = [...items, { id: newId(), ...(newItem ? newItem() : {}) }]
    onChange(n); setOpen((s) => new Set(s).add(n.length - 1))
  }
  const remove = (i) => {
    const name = itemTitle?.(items[i]) || 'элемент'
    if (window.confirm(`Удалить «${name}»?`)) onChange(items.filter((_, j) => j !== i))
  }

  return (
    <div className={`l ${nested ? 'l--nested' : ''}`}>
      {items.length === 0 && <p className="l-empty">Пока пусто.</p>}
      {items.map((it, i) => {
        const isOpen = open.has(i)
        return (
          <div key={it.id || i} className={`l-item ${isOpen ? 'is-open' : ''}`}>
            <div className="l-head">
              <button type="button" className="l-title" onClick={() => toggle(i)} aria-expanded={isOpen}>
                <span className="l-caret" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                {itemTitle?.(it) || `№${i + 1}`}
              </button>
              {!fixed && (
                <div className="l-tools">
                  <button type="button" className="a-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Выше">↑</button>
                  <button type="button" className="a-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Ниже">↓</button>
                  <button type="button" className="a-icon a-icon--danger" onClick={() => remove(i)} aria-label="Удалить">×</button>
                </div>
              )}
            </div>
            {isOpen && (
              <div className="l-body">
                {Preview && <div className="l-preview"><Preview item={it} /></div>}
                <Fields fields={fields} value={it} folder={folder} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
              </div>
            )}
          </div>
        )
      })}
      {!fixed && <button type="button" className="a-btn a-btn--ghost l-add" onClick={add}>+ Добавить</button>}
    </div>
  )
}
