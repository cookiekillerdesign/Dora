import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// mode "artifact" собирает всё в один HTML для превью; обычный build идёт на Vercel
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'artifact' ? [viteSingleFile()] : [])],
  build: { assetsInlineLimit: mode === 'artifact' ? 100000000 : 4096 }
}))
