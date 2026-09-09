/**
 * Умный парсер и сериализатор для массивов и объектов.
 * Корректно обрабатывает:
 * - Валидный JSON: ["Пункт 1", "Пункт 2"]
 * - Списки через точку с запятой в кавычках: "Пункт 1"; "Пункт 2";
 * - Списки с новой строки
 * - Списки с буллетами (-, *, •, 1.)
 * - Списки через запятую
 */

/**
 * Очищает отдельный элемент от обрамляющих кавычек, точек с запятой и буллетов
 */
export function cleanItemString(item: string): string {
  if (!item) return "";
  let s = item.trim();

  // До 3 итераций для очистки вложенных/комбинированных буллетов, кавычек и пунктуации
  for (let i = 0; i < 3; i++) {
    s = s.trim();

    // 1. Удаляем обрамляющие кавычки (двойные, одинарные, «ёлочки», “лапки”, „лапки“) и пробелы
    s = s.replace(/^["'«“„`\s]+|["'»”„`\s;,]+$/g, "").trim();

    // 2. Удаляем буллеты списков в начале:
    // - символы: •, -, *, –, —, +, >
    // - нумерация: 1., 1), (1), 1:
    s = s.replace(/^([•*–—\-+>]|\(?\d+[\.\):])\s*/, "").trim();

    // 3. Удаляем знаки препинания по краям (точки с запятой, запятые)
    s = s.replace(/^[\s;,]+|[\s;,]+$/g, "").trim();
  }

  return s;
}

/**
 * Умно преобразует любую строку или массив в чистый строковый массив
 */
export function parseSmartArray(input: unknown): string[] {
  if (!input) return [];

  // Если уже массив
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? cleanItemString(item) : String(item).trim()))
      .filter((s) => s.length > 0);
  }

  if (typeof input !== "string") {
    return [];
  }

  const raw = input.trim();
  if (!raw) return [];

  // 1. Попытка распарсить как валидный JSON
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? cleanItemString(item) : String(item).trim()))
        .filter((s) => s.length > 0);
    }
  } catch {
    // Не валидный JSON - продолжаем с умным эвристическим парсингом
  }

  // 2. Если содержит переносы строк
  if (raw.includes("\n")) {
    const lines = raw.split(/\r?\n/);
    const items: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Если строка внутри себя содержит точки с запятой (например: "Пункт 1"; "Пункт 2";)
      if (trimmed.includes(";")) {
        const parts = trimmed.split(";").map(cleanItemString).filter((s) => s.length > 0);
        items.push(...parts);
      } else {
        const cleaned = cleanItemString(trimmed);
        if (cleaned) items.push(cleaned);
      }
    }
    if (items.length > 0) return items;
  }

  // 3. Если разделен точкой с запятой (как: "Проживание"; "Питание"; "3 тренировки в день";)
  if (raw.includes(";")) {
    return raw
      .split(";")
      .map(cleanItemString)
      .filter((s) => s.length > 0);
  }

  // 4. Если в кавычках через пробел или запятую (например: "Пункт 1" "Пункт 2")
  if (raw.includes('"') || raw.includes("'") || raw.includes("«") || raw.includes("“")) {
    const quoteMatches = raw.match(/["'«“][^"'»”\n\r]+["'»”]/g);
    if (quoteMatches && quoteMatches.length > 1) {
      return quoteMatches.map(cleanItemString).filter((s) => s.length > 0);
    }
  }

  // 5. Если разделен запятыми
  if (raw.includes(",")) {
    return raw
      .split(",")
      .map(cleanItemString)
      .filter((s) => s.length > 0);
  }

  // Одиночный элемент
  const single = cleanItemString(raw);
  return single ? [single] : [];
}

/**
 * Сериализует массив строк в валидный JSON-массив
 */
export function serializeSmartArray(items: string[]): string {
  if (!Array.isArray(items)) return "[]";
  const clean = items.map(cleanItemString).filter((s) => s.length > 0);
  return JSON.stringify(clean);
}

/**
 * Умно преобразует строку в объект ключ-значение
 */
export function parseSmartObject(input: unknown): Record<string, string> {
  if (!input) return {};

  if (typeof input === "object" && !Array.isArray(input)) {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const cleanKey = cleanItemString(k);
      if (cleanKey) {
        result[cleanKey] = v !== null && v !== undefined ? cleanItemString(String(v)) : "";
      }
    }
    return result;
  }

  if (typeof input !== "string") return {};

  const raw = input.trim();
  if (!raw) return {};

  // 1. Попытка распарсить как JSON объект
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        const cleanKey = cleanItemString(k);
        if (cleanKey) {
          result[cleanKey] = v !== null && v !== undefined ? cleanItemString(String(v)) : "";
        }
      }
      return result;
    }
  } catch {
    // Не валидный JSON
  }

  // 2. Попытка распарсить пары вида "ключ: значение"
  const result: Record<string, string> = {};
  const lines = raw.split(/[\r\n;]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(":");
    const eqIdx = trimmed.indexOf("=");
    const sepIdx = colonIdx !== -1 ? colonIdx : eqIdx;
    if (sepIdx !== -1) {
      const k = cleanItemString(trimmed.slice(0, sepIdx));
      const v = cleanItemString(trimmed.slice(sepIdx + 1));
      if (k) result[k] = v;
    }
  }

  return result;
}

/**
 * Сериализует объект ключ-значение в валидный JSON
 */
export function serializeSmartObject(obj: Record<string, string>): string {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "{}";
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const cleanKey = cleanItemString(k);
    if (cleanKey) {
      clean[cleanKey] = typeof v === "string" ? cleanItemString(v) : String(v).trim();
    }
  }
  return JSON.stringify(clean);
}
