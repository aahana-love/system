import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import { remarkTermLinks } from './src/mdx/remark-term-links.ts'

// Fixed port: progress lives in the browser's IndexedDB, which is tied to the
// origin. Changing the port would make your progress look empty.
const PORT = 5180
const here = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: here,
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm, remarkTermLinks] }) },
    react({ include: /\.(mdx|jsx|js|tsx|ts)$/ }),
    tailwindcss(),
  ],
  server: {
    port: PORT,
    strictPort: true,
    // node_modules is a junction to a folder outside OneDrive; let Vite serve it.
    fs: { allow: [here, realpathSync(fileURLToPath(new URL('./node_modules', import.meta.url)))] },
  },
  preview: { port: PORT, strictPort: true },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
