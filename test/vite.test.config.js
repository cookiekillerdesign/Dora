import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
const mock = fileURLToPath(new URL('./mockSupabase.js', import.meta.url))
export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  plugins: [react(), { name: 'mock-supabase', enforce: 'pre', resolveId(id, importer) { if (id.endsWith('/lib/supabase') || id.endsWith('lib/supabase.js')) return mock } }],
  build: { outDir: 'dist-test', emptyOutDir: true }
})
