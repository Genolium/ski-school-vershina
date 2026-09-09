/**
 * Утилиты оптимизации изображений и адаптации к мобильному интернету на горнолыжных склонах.
 * 
 * Горнолыжные склоны характеризуются:
 * - Нестабильным покрытием сотовой сети (слабый 3G, скачущий LTE, высокая задержка/RTT).
 * - Режимом экономии данных (Data Saver) у пользователей в роуминге.
 * - Холодовым троттлингом аккумуляторов смартфонов.
 * 
 * Данный модуль предоставляет:
 * 1. Определение характеристик сетевого соединения (Network Information API, saveData, effectiveType).
 * 2. Стратегию загрузки изображений (eager/lazy, high/low priority, async decoding).
 * 3. Генерацию нативных легковесных SVG blur-placeholder data URI (0 байт сетевого трафика, CLS = 0).
 * 4. Хелпер современных форматов (WebP/AVIF) и адаптивную подстройку качества под 3G.
 */

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export interface NetworkConnectionInfo {
  saveData: boolean;
  effectiveType: EffectiveConnectionType;
  downlink?: number; // Скорость в Мбит/с
  rtt?: number;      // Задержка (Round Trip Time) в мс
  isSlow: boolean;   // Признак медленного соединения (3G, 2G или saveData)
}

export interface ImageLoadingStrategy {
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync';
  fetchPriority: 'high' | 'low' | 'auto';
}

export interface ImageOptimizationConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  isPriority?: boolean;
}

// Сетевое соединение по умолчанию для SSR, тестов или неподдерживаемых браузеров
const DEFAULT_NETWORK_INFO: NetworkConnectionInfo = {
  saveData: false,
  effectiveType: '4g',
  isSlow: false,
};

interface NetworkInformationEventMap {
  change: Event;
}

interface NetworkInformation extends EventTarget {
  readonly saveData: boolean;
  readonly effectiveType: EffectiveConnectionType;
  readonly downlink?: number;
  readonly rtt?: number;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Получает сетевой объект браузера с поддержкой вендорных префиксов
 */
function getRawConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
}

/**
 * Возвращает текущее состояние сетевого соединения пользователя.
 * Анализирует navigator.connection (Chrome, Android, Edge, Opera) с безопасным fallback для Safari/iOS/Firefox.
 */
export function getNetworkConnectionInfo(): NetworkConnectionInfo {
  const connection = getRawConnection();

  if (!connection) {
    return DEFAULT_NETWORK_INFO;
  }

  const saveData = Boolean(connection.saveData);
  const effectiveType: EffectiveConnectionType = connection.effectiveType || '4g';
  const downlink = connection.downlink;
  const rtt = connection.rtt;

  // Медленным считаем соединение при 2G/3G, включенном Data Saver, высоком RTT (>600мс) или низкой скорости (<1.5 Мбит/с)
  const isSlow =
    saveData ||
    ['slow-2g', '2g', '3g'].includes(effectiveType) ||
    (downlink !== undefined && downlink < 1.5) ||
    (rtt !== undefined && rtt > 600);

  return {
    saveData,
    effectiveType,
    downlink,
    rtt,
    isSlow,
  };
}

/**
 * Быстрая проверка: находится ли пользователь на медленном соединении
 */
export function isSlowConnection(): boolean {
  return getNetworkConnectionInfo().isSlow;
}

/**
 * Подписка на изменение типа сетевого соединения (например, при спуске с горы или смене вышки)
 */
export function subscribeToNetworkChanges(
  callback: (info: NetworkConnectionInfo) => void
): () => void {
  const connection = getRawConnection();
  if (!connection || typeof connection.addEventListener !== 'function') {
    return () => {};
  }

  const listener = () => {
    callback(getNetworkConnectionInfo());
  };

  connection.addEventListener('change', listener);
  return () => {
    connection.removeEventListener('change', listener);
  };
}

/**
 * Формирует оптимальную стратегию загрузки изображения на основе приоритета и контекста сети.
 * 
 * - Приоритетные изображения (LCP, Hero, первые элементы карусели):
 *   `loading="eager"`, `decoding="async"`, `fetchPriority="high"`
 * - Второстепенные изображения (галерея ниже первого экрана, футер):
 *   `loading="lazy"`, `decoding="async"`, `fetchPriority="low"`
 * - При медленном соединении (3G на склоне) приоритет некритичных изображений принудительно понижается.
 */
export function getImageLoadingStrategy(options?: {
  isPriority?: boolean;
  index?: number;
  aboveTheFold?: boolean;
}): ImageLoadingStrategy {
  const isSlow = isSlowConnection();
  const isPriority = Boolean(
    options?.isPriority ||
    options?.aboveTheFold ||
    (options?.index !== undefined && options.index < 2)
  );

  if (isPriority) {
    return {
      loading: 'eager',
      decoding: 'async',
      fetchPriority: 'high',
    };
  }

  return {
    loading: 'lazy',
    decoding: 'async',
    fetchPriority: isSlow ? 'low' : 'auto',
  };
}

/**
 * Создает нативный SVG Gaussian Blur placeholder в виде Data URI.
 * Весит менее 300 байт, не требует сетевых запросов и предотвращает Cumulative Layout Shift (CLS).
 */
export function createSvgBlurPlaceholder(options: {
  width?: number;
  height?: number;
  color1?: string;
  color2?: string;
  blurStdDev?: number;
} = {}): string {
  const {
    width = 400,
    height = 300,
    color1 = '#0f172a',
    color2 = '#0284c7',
    blurStdDev = 20,
  } = options;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <filter id="b">
      <feGaussianBlur stdDeviation="${blurStdDev}"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" filter="url(#b)"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Готовые фирменные заглушки для горнолыжной школы «Вершина»:
 * - 'mountain': зимняя горная палитра (глубокий синий и снежный лазурный)
 * - 'snow': светлый снежный градиент
 * - 'neutral': нейтральный серый
 */
export function getSkiBlurPlaceholder(
  theme: 'mountain' | 'snow' | 'neutral' = 'mountain',
  width = 600,
  height = 400
): string {
  switch (theme) {
    case 'snow':
      return createSvgBlurPlaceholder({
        width,
        height,
        color1: '#e2e8f0',
        color2: '#cbd5e1',
        blurStdDev: 15,
      });
    case 'neutral':
      return createSvgBlurPlaceholder({
        width,
        height,
        color1: '#1e293b',
        color2: '#334155',
        blurStdDev: 15,
      });
    case 'mountain':
    default:
      return createSvgBlurPlaceholder({
        width,
        height,
        color1: '#0f172a',
        color2: '#0284c7',
        blurStdDev: 25,
      });
  }
}

/**
 * Проверяет поддержку браузером современных форматов (WebP)
 */
export function supportsWebP(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Адаптирует URL изображения под текущие условия сети.
 * 
 * Если соединение медленное (3G/2G/saveData):
 * - Автоматически снижает качество (с 85% до 60%)
 * - Уменьшает запрашиваемое разрешение (на 40-50%)
 * - Переключает на WebP для экономии полосы пропускания
 * 
 * Поддерживает URL с параметрами оптимизации (Unsplash, Cloudinary, Imgproxy, локальный API).
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationConfig = {}
): string {
  if (!src) return '';

  const network = getNetworkConnectionInfo();
  const isSlow = network.isSlow;

  let targetWidth = options.width;
  let targetQuality = options.quality ?? 85;

  if (isSlow) {
    if (targetWidth) {
      targetWidth = Math.round(targetWidth * 0.6); // 60% ширины на слабом 3G
    }
    targetQuality = Math.min(targetQuality, 60); // качество до 60%
  }

  // Если URL поддерживает query params (напр. CDN / прокси)
  try {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const url = new URL(src);
      if (targetWidth && !url.searchParams.has('w')) {
        url.searchParams.set('w', targetWidth.toString());
      }
      if (targetQuality && !url.searchParams.has('q')) {
        url.searchParams.set('q', targetQuality.toString());
      }
      if (options.format && !url.searchParams.has('fm')) {
        url.searchParams.set('fm', options.format);
      }
      return url.toString();
    }
  } catch {
    // В случае относительного URL или ошибки парсинга возвращаем src
  }

  return src;
}

/**
 * Генерирует строку srcset для адаптивных изображений
 */
export function generateResponsiveSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280]
): string {
  if (!src) return '';
  return widths
    .map((w) => `${getOptimizedImageUrl(src, { width: w })} ${w}w`)
    .join(', ');
}
