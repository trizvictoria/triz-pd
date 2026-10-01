/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADVANCE_ONLY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

