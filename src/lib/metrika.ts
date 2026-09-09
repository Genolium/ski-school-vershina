// Скрипт для Яндекс.Метрики (должен быть встроен в HTML)
import type { YandexMetrikaFn } from "@/vite-env";

const METRIKA_SCRIPT_URL = "https://mc.yandex.ru/metrika/tag.js";
let isInitialized = false;
let scheduledHandle: number | null = null;

const ensureStub = () => {
  if (!window.ym) {
    const stub = function (...args: unknown[]) {
      (stub.a = stub.a || []).push(args);
    } as YandexMetrikaFn;
    stub.l = Date.now();
    window.ym = stub;
  }
};

const injectScript = () => {
  const existingScript = Array.from(document.getElementsByTagName("script")).find((script) =>
    script.src.startsWith(METRIKA_SCRIPT_URL),
  );
  if (existingScript) {
    return;
  }

  const firstScript = document.getElementsByTagName("script")[0];
  const scriptElement = document.createElement("script");
  scriptElement.async = true;
  scriptElement.src = METRIKA_SCRIPT_URL;
  scriptElement.setAttribute("data-name", "yandex-metrika");

  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(scriptElement, firstScript);
  } else {
    document.head.appendChild(scriptElement);
  }
};

const scheduleInitialization = (counterId: string | number) => {
  if (isInitialized || scheduledHandle !== null) {
    return;
  }

  const runInitialization = () => {
    scheduledHandle = null;
    if (isInitialized) {
      return;
    }

    ensureStub();
    injectScript();

    window.ym?.(counterId, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      url: typeof location !== "undefined" ? location.href : "",
      accurateTrackBounce: true,
      trackLinks: true,
    });

    isInitialized = true;
  };

  if (typeof window.requestIdleCallback === "function") {
    scheduledHandle = window.requestIdleCallback(
      () => runInitialization(),
      { timeout: 2500 },
    );
    return;
  }

  scheduledHandle = window.setTimeout(() => runInitialization(), 1500);
};

/**
 * Инициализирует асинхронную загрузку счётчика Яндекс.Метрики.
 *
 * Args:
 *     counterId (str | int): Идентификатор счётчика из кабинета Метрики.
 */
export const initYandexMetrika = (counterId: string | number) => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname.startsWith("/admin")) {
    return;
  }

  if (isInitialized) {
    return;
  }

  const ymStub = window.ym as unknown as { a?: unknown[][] } | undefined;
  if (ymStub?.a && Array.isArray(ymStub.a)) {
    const alreadyInitted = ymStub.a.some(
      (entry) => Array.isArray(entry) && String(entry[0]) === String(counterId) && entry[1] === "init"
    );
    if (alreadyInitted) {
      isInitialized = true;
      return;
    }
  }

  scheduleInitialization(counterId);
};

/**
 * Фиксирует достижение цели в Яндекс.Метрике.
 *
 * Args:
 *     counterId (str | int): Идентификатор счётчика.
 *     goalId (str): Идентификатор цели.
 */
export const reachGoal = (counterId: string | number, goalId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  ensureStub();
  window.ym?.(counterId, "reachGoal", goalId);
};

