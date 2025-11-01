export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return "";
  // Если уже абсолютный или data URL - возвращаем как есть
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;

  // Определение origin бэкенда
  const envOrigin = (import.meta as any).env?.VITE_BACKEND_ORIGIN as string | undefined;
  const fallbackOrigin = typeof window !== "undefined" && window.location?.port === "3000" ? "http://localhost:8080" : "";
  const backendOrigin = envOrigin || fallbackOrigin || "";

  // Добавление origin бэкенда к загрузкам
  if (path.startsWith("/uploads")) {
    return `${backendOrigin}${path}`;
  }

  return path;
}


