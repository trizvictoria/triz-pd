import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.dirname(fileURLToPath(import.meta.url))
const experienceDirs = ['construcao', 'educacional', 'interesse', 'suri', 'totvs', 'winthor']

function publishExperiences(): Plugin {
  let outDir = path.resolve(root, 'dist')
  return {
    name: 'publish-experiences',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      for (const folder of experienceDirs) {
        const from = path.join(root, 'docs', folder)
        if (!fs.existsSync(from)) continue
        fs.cpSync(from, path.join(outDir, folder), { recursive: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), publishExperiences()],
  base: process.env.BASE_PATH || '/',
})
