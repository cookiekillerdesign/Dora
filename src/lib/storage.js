export const safeGet = (k, s = 'local') => {
  try { return (s === 'session' ? sessionStorage : localStorage).getItem(k) } catch { return null }
}
export const safeSet = (k, v, s = 'local') => {
  try { (s === 'session' ? sessionStorage : localStorage).setItem(k, v) } catch {}
}
export const safeDel = (k, s = 'local') => {
  try { (s === 'session' ? sessionStorage : localStorage).removeItem(k) } catch {}
}
