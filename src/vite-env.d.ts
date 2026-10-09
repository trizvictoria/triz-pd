/// <reference types="vite/client" />

declare module '*.html?raw' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_ADVANCE_ONLY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

