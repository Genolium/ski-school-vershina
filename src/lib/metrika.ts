// Скрипт для Яндекс.Метрики (должен быть встроен в HTML)
declare global {
  interface Window {
    ym?: (counterId: string | number, method: string, targetId: string, params?: Record<string, unknown>) => void;
  }
}

export const initYandexMetrika = (counterId: string | number) => {
  if (typeof window === 'undefined' || window.ym) return;

  (function(m: Window & { ym?: typeof window.ym }, e: Document, t: string, r: string, i: string, k: HTMLScriptElement | null, a: HTMLScriptElement | null) {
    m[i] = m[i] || function(...args: unknown[]){(m[i]!.a = m[i]!.a || []).push(args)};
    m[i]!.l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) { return; }
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    if (k && a) {
      k.async = true;
      k.src = r;
      a.parentNode?.insertBefore(k, a);
    }
  })(window as Window & { ym?: typeof window.ym }, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(counterId, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true
  });
};

export const reachGoal = (counterId: string | number, goalId: string) => {
  if (window.ym) {
    window.ym(counterId, 'reachGoal', goalId);
  }
};

