import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Клиент создаётся только если заданы ключи. Сейчас сайт работает и без них.
export const supabase = url && key ? createClient(url, key) : null
