/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for the public Web3Forms form key (see src/api/site.ts). */
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
