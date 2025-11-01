/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_YANDEX_METRIKA_ID?: string
  readonly VITE_BACKEND_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ym?: (counterId: string | number, method: string, targetId: string, params?: Record<string, unknown>) => void
}
