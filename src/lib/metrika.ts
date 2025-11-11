// Скрипт для Яндекс.Метрики (должен быть встроен в HTML)
type RequestIdleCallbackHandle = number;

interface RequestIdleCallbackDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

interface RequestIdleCallbackOptions {
  timeout?: number;
}

type YandexMetrikaFn = ((
  counterId: string | number,
  method: string,
  targetId: string,
  params?: Record<string, unknown>,
) => void) & {
  a?: unknown[];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrikaFn;
    requestIdleCallback?: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      options?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle;
    cancelIdleCallback?: (handle: RequestIdleCallbackHandle) => void;
  }
}

const METRIKA_SCRIPT_URL = "https://mc.yandex.ru/metrika/tag.js";
let isInitialized = false;
let scheduledHandle: RequestIdleCallbackHandle | number | null = null;

const ensureStub = () => {
  const win = window as Window;
  if (!win.ym) {
    win.ym = function (...args: unknown[]) {
      (win.ym!.a = win.ym!.a || []).push(args);
    } as YandexMetrikaFn;
    win.ym.l = Date.now();
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
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
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
  if (typeof window === "undefined" || !window.ym) {
    return;
  }

  window.ym(counterId, "reachGoal", goalId);
};

