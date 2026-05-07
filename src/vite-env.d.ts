/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HIS_BASE_URL: string
  readonly VITE_EMR_BASE_URL: string
  readonly VITE_PACS_BASE_URL: string
  readonly VITE_AI_BASE_URL: string
  readonly VITE_IOT_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
