/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_YANDEX_METRIKA_ID?: string
  readonly VITE_BACKEND_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export type YandexMetrikaFn = {
  (counterId: string | number, method: string, ...args: unknown[]): void;
  a?: unknown[];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrikaFn;
  }
}
