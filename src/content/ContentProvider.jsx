import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULTS, DEFAULT_ORG, DEFAULT_PIN, MERGE_BY_ID } from './defaults'

const Ctx = createContext({ docs: DEFAULTS, reload: () => {}, ready: true })

export function mergeDoc(key, remote) {
  const def = DEFAULTS[key]
  if (remote == null) return def
  if (Array.isArray(def)) {
    if (!Array.isArray(remote)) return def
    if (MERGE_BY_ID.includes(key)) {
      return def.map((d) => {
        const r = remote.find((x) => x && x.id === d.id)
        return r ? { ...d, ...r } : d
      })
    }
    return remote.filter((x) => x && typeof x === 'object')
  }
  return typeof remote === 'object' ? { ...def, ...remote } : def
}

export function ContentProvider({ children }) {
  const [docs, setDocs] = useState(DEFAULTS)
  const [ready, setReady] = useState(!supabase)

  const reload = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('content').select('key, data')
    if (!error && Array.isArray(data)) {
      const next = { ...DEFAULTS }
      data.forEach((row) => { if (row.key in DEFAULTS) next[row.key] = mergeDoc(row.key, row.data) })
      setDocs(next)
    }
    setReady(true)
  }, [])

  useEffect(() => { reload() }, [reload])
  return <Ctx.Provider value={{ docs, reload, ready }}>{children}</Ctx.Provider>
}

export const useContent = (key) => useContext(Ctx).docs[key]
export const useContentApi = () => useContext(Ctx)

// Набор для организаторов: с Supabase код проверяется на сервере
export async function fetchOrgKit(pin) {
  if (supabase) {
    const { data, error } = await supabase.rpc('org_kit', { pin })
    if (!error) return data || null
    // функция ещё не создана в базе: работаем на значениях по умолчанию
  }
  return pin === DEFAULT_PIN ? DEFAULT_ORG : null
}
