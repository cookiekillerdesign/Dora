// Поддельный Supabase для автотестов админки (в сборку сайта не попадает)
const db = {
  content: {},
  private_content: { organizers: { pin: '1111', photos: [], docs: [{ id: 'tech', title: { ru: 'Технический райдер', en: 'Technical rider' }, url: null }] } }
}
try { const seed = JSON.parse(localStorage.getItem('__mockdb') || 'null'); if (seed) Object.assign(db.content, seed) } catch {}
window.__db = db
let session = null
const subs = []
const emit = (e) => subs.forEach((cb) => cb(e, session))

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (cb) => { subs.push(cb); return { data: { subscription: { unsubscribe() {} } } } },
    signInWithPassword: async ({ email, password }) => {
      if (password !== 'test') return { error: { message: 'Invalid login' } }
      session = { user: { id: 'u-1', email } }; emit('SIGNED_IN'); return { error: null }
    },
    signOut: async () => { session = null; emit('SIGNED_OUT'); return { error: null } }
  },
  from(table) {
    return {
      select() {
        return {
          _k: null,
          eq(_c, v) { this._k = v; return this },
          async maybeSingle() { const d = db[table][this._k]; return { data: d ? { data: d } : null, error: null } },
          then(res, rej) { return Promise.resolve({ data: Object.entries(db[table]).map(([key, data]) => ({ key, data })), error: null }).then(res, rej) }
        }
      },
      async upsert(row) { if (!session) return { error: { message: 'RLS' } }; db[table][row.key] = JSON.parse(JSON.stringify(row.data)); return { error: null } },
      delete() { return { eq: async (_c, v) => { delete db[table][v]; return { error: null } } } }
    }
  },
  async rpc(name, args) {
    if (name === 'is_admin') return { data: !!session, error: null }
    if (name === 'org_kit') {
      const d = db.private_content.organizers
      if (d && d.pin === args.pin) { const { pin, ...rest } = d; return { data: rest, error: null } }
      return { data: null, error: null }
    }
    return { data: null, error: { message: 'no fn' } }
  },
  storage: { from: () => ({ upload: async (path, file) => { window.__uploads = [...(window.__uploads || []), { path, type: file?.type, size: file?.size }]; return { error: null } }, getPublicUrl: (p) => ({ data: { publicUrl: 'https://example.com/' + p } }) }) }
}
