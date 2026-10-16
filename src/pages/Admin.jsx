import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useContentApi, mergeDoc } from '../content/ContentProvider'
import { BLOCKS, blockDefault, sanitize, validate } from '../admin/schema'
import { ListEditor, Fields } from '../admin/fields'
import { DEFAULT_ORG } from '../content/defaults'
import { store } from '../store'
import EraPhoto from '../components/EraPhoto'
import { DEFAULTS } from '../content/defaults'
import { OUTRO_ERA } from '../data/photos'
import MerchArt from '../components/MerchArt'
import DesignCredit from '../components/DesignCredit'

const clone = (x) => JSON.parse(JSON.stringify(x ?? null))

function Setup() {
  return (
    <div className="a-box">
      <h1 className="a-title">Админка</h1>
      <p>Админка работает через Supabase. Подключение займёт минут десять:</p>
      <ol className="a-steps">
        <li>Создайте проект на supabase.com и выполните в SQL Editor весь файл <code>supabase/schema.sql</code>.</li>
        <li>В Authentication → Users нажмите Add user и создайте себе email и пароль.</li>
        <li>Скопируйте id этого пользователя и выполните <code>insert into admins (user_id) values ('ваш-id');</code></li>
        <li>В Authentication → Sign In / Providers выключите регистрацию новых пользователей.</li>
        <li>Добавьте <code>VITE_SUPABASE_URL</code> и <code>VITE_SUPABASE_ANON_KEY</code> в переменные окружения Vercel и пересоберите сайт.</li>
      </ol>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass })
    setBusy(false)
    if (error) setErr('Не получилось войти. Проверьте email и пароль.')
  }
  return (
    <form className="a-box a-login" onSubmit={submit}>
      <h1 className="a-title">Вход в админку</h1>
      <label className="f"><span className="f-label">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
      <label className="f"><span className="f-label">Пароль</span><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="current-password" /></label>
      {err && <p className="f-err" role="alert">{err}</p>}
      <button className="a-btn" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      <DesignCredit className="credit--admin credit--login" />
    </form>
  )
}

const PhotoPreview = ({ item }) => {
  const era = DEFAULTS.eras.find((e) => e.id === item.id) || (item.id === 'outro' ? OUTRO_ERA : DEFAULTS.eras[0])
  return <div className="a-clip-prev"><EraPhoto era={era} photo={item} placeholder={`фото ${era.year}`} /></div>
}
const MerchPreview = ({ item }) => (
  <div className="a-merch-prev">
    {item.photo ? <span className="sticker-photo"><img src={item.photo} alt="" /></span> : <MerchArt kind={item.art || 'stickers'} />}
  </div>
)
const PREVIEWS = { photo: PhotoPreview, merch: MerchPreview }

function DocEditor({ block, onDirty }) {
  const { docs, reload, ready } = useContentApi()
  const [data, setData] = useState(null)
  const [orig, setOrig] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const table = block.private ? 'private_content' : 'content'

  useEffect(() => {
    if (!ready) return
    let alive = true
    setData(null); setMsg(null)
    const load = async () => {
      let value
      if (block.private) {
        const { data: row, error } = await supabase.from(table).select('data').eq('key', block.key).maybeSingle()
        if (error) { setMsg({ type: 'err', text: 'Не удалось загрузить: ' + error.message }); value = DEFAULT_ORG }
        else value = row?.data ? { ...DEFAULT_ORG, ...row.data } : DEFAULT_ORG
      } else value = docs[block.key]
      if (alive) { setData(clone(value)); setOrig(clone(value)) }
    }
    load()
    return () => { alive = false }
  }, [block.key, ready])

  const dirty = useMemo(() => data && JSON.stringify(data) !== JSON.stringify(orig), [data, orig])
  useEffect(() => { onDirty(!!dirty) }, [dirty])

  const save = async () => {
    const errs = validate(block, data)
    if (errs.length) { setMsg({ type: 'err', text: 'Проверьте поля:', list: errs.slice(0, 8) }); return }
    setBusy(true); setMsg(null)
    const payload = sanitize(block, data)
    const { error } = await supabase.from(table).upsert({ key: block.key, data: payload, updated_at: new Date().toISOString() })
    setBusy(false)
    if (error) { setMsg({ type: 'err', text: 'Не сохранилось: ' + error.message }); return }
    const fresh = block.private ? { ...DEFAULT_ORG, ...payload } : mergeDoc(block.key, payload)
    setData(clone(fresh)); setOrig(clone(fresh))
    if (!block.private) reload()
    setMsg({ type: 'ok', text: 'Сохранено. На сайте уже обновилось.' })
  }

  const revert = () => { setData(clone(orig)); setMsg(null) }

  const reset = async () => {
    if (!window.confirm(`Вернуть блок «${block.title}» к исходным значениям? Ваши правки в нём удалятся.`)) return
    setBusy(true)
    const { error } = await supabase.from(table).delete().eq('key', block.key)
    setBusy(false)
    if (error) { setMsg({ type: 'err', text: 'Не получилось: ' + error.message }); return }
    const def = clone(blockDefault(block))
    setData(def); setOrig(clone(def))
    if (!block.private) reload()
    setMsg({ type: 'ok', text: 'Блок вернулся к исходным значениям.' })
  }

  if (!data) return <p className="a-loading">Загружаем…</p>
  const Preview = PREVIEWS[block.preview]

  return (
    <section className="a-doc">
      <header className="a-doc-head">
        <h1 className="a-title">{block.title}</h1>
        {block.hint && <p className="a-hint">{block.hint}</p>}
      </header>

      {block.kind === 'single'
        ? <div className="a-card"><Fields fields={block.fields} value={data} onChange={setData} folder={block.key} /></div>
        : <ListEditor fields={block.fields} items={data} onChange={setData} itemTitle={block.itemTitle}
            newItem={block.newItem} fixed={block.fixed} folder={block.key} Preview={Preview} />}

      <div className={`a-bar ${dirty ? 'is-dirty' : ''}`}>
        <div className="a-bar-msg" aria-live="polite">
          {msg && <div className={`a-msg a-msg--${msg.type}`}>{msg.text}{msg.list && <ul>{msg.list.map((e) => <li key={e}>{e}</li>)}</ul>}</div>}
          {!msg && dirty && <span className="a-unsaved">Есть несохранённые изменения</span>}
        </div>
        <div className="a-bar-actions">
          <button type="button" className="a-link" onClick={reset} disabled={busy}>Вернуть исходное</button>
          {dirty && <button type="button" className="a-btn a-btn--ghost" onClick={revert} disabled={busy}>Отменить правки</button>}
          <button type="button" className="a-btn" onClick={save} disabled={busy || !dirty}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </div>
    </section>
  )
}

export default function Admin() {
  const [session, setSession] = useState(undefined)
  const [isAdmin, setIsAdmin] = useState(null)
  const [tab, setTab] = useState(BLOCKS[0].key)
  const [dirty, setDirty] = useState(false)
  useEffect(() => { store.eraTarget = 0 }, [])

  // админку не индексируем
  useEffect(() => {
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setIsAdmin(null); return }
    supabase.rpc('is_admin').then(({ data, error }) => setIsAdmin(error ? 'nofn' : !!data))
  }, [session])

  useEffect(() => {
    if (!dirty) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (!supabase) return <div className="a-page"><Setup /></div>
  if (session === undefined) return <div className="a-page" />
  if (!session) return <div className="a-page"><Login /></div>
  if (isAdmin === null) return <div className="a-page"><p className="a-loading">Проверяем доступ…</p></div>
  if (isAdmin !== true) {
    return (
      <div className="a-page">
        <div className="a-box">
          <h1 className="a-title">Нет прав администратора</h1>
          {isAdmin === 'nofn'
            ? <p>В базе нет функции <code>is_admin</code>. Выполните заново <code>supabase/schema.sql</code>.</p>
            : <p>Добавьте этого пользователя в таблицу admins:<br /><code>insert into admins (user_id) values ('{session.user.id}');</code></p>}
          <button className="a-btn" onClick={() => supabase.auth.signOut()}>Выйти</button>
        </div>
      </div>
    )
  }

  const switchTab = (k) => {
    if (k === tab) return
    if (dirty && !window.confirm('Есть несохранённые изменения. Уйти без сохранения?')) return
    setDirty(false); setTab(k)
  }
  const block = BLOCKS.find((b) => b.key === tab)

  return (
    <div className="a-page a-page--app">
      <aside className="a-side">
        <div className="a-side-top">
          <span className="a-brand">дора / админка</span>
          <span className="a-user">{session.user.email}</span>
        </div>
        <nav className="a-tabs" aria-label="Блоки сайта">
          {BLOCKS.map((b) => (
            <button key={b.key} className={`a-tab ${b.key === tab ? 'is-on' : ''}`} onClick={() => switchTab(b.key)} aria-current={b.key === tab}>
              {b.title}{b.private && <span className="a-lock" aria-label="закрытый блок"> •</span>}
            </button>
          ))}
        </nav>
        <div className="a-side-foot">
          <Link className="a-link" to="/">Открыть сайт</Link>
          <button className="a-link" onClick={() => { if (!dirty || window.confirm('Выйти без сохранения?')) supabase.auth.signOut() }}>Выйти</button>
          <DesignCredit className="credit--admin" />
        </div>
      </aside>
      <main className="a-main">
        <DocEditor key={block.key} block={block} onDirty={setDirty} />
      </main>
    </div>
  )
}
