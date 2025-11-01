// Утилиты аутентификации для безопасного управления токенами
export const AUTH_TOKEN_KEY = "admin_token";
export const REFRESH_TOKEN_KEY = "admin_refresh_token";

// Использование sessionStorage вместо localStorage для большей безопасности
// Токены очищаются при закрытии вкладки или окна браузера
export const getAuthToken = (): string | null => {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    // Тихая ошибка в продакшене - проблемы с хранилищем токенов не должны крашить приложение
    if (import.meta.env.DEV) {
      console.error("Failed to save token:", error);
    }
  }
};

export const setRefreshToken = (token: string): void => {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to save refresh token:", error);
    }
  }
};

export const removeAuthToken = (): void => {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    // Тихая ошибка в продакшене
    if (import.meta.env.DEV) {
      console.error("Failed to remove token:", error);
    }
  }
};

// Проверка истечения токена (базовая проверка без парсинга JWT)
// Полная валидация выполняется на бэкенде
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    // Простая проверка: JWT токены имеют 3 части, разделенные точками
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    
    // Декодирование payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    
    // Проверка истечения
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Конвертация в миллисекунды
      // Добавляем запас 1 минуту для расхождения часов
      return Date.now() >= (expirationTime - 60000);
    }
    
    return false;
  } catch {
    return true;
  }
};

// Перехват fetch запросов для обработки ошибок 401 и автоматического обновления токенов
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Проверка истечения токена
  if (isTokenExpired(token)) {
    // Попытка обновить токен через refresh token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const { adminRefreshToken } = await import('./api');
        const { access_token, refresh_token } = await adminRefreshToken(refreshToken);
        setAuthToken(access_token);
        setRefreshToken(refresh_token);
        
        // Повтор запроса с новым токеном
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${access_token}`);
        headers.set("Content-Type", "application/json");
        
        return fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        // Если refresh не удался - удаляем токены
        removeAuthToken();
        throw new Error("TOKEN_EXPIRED");
      }
    } else {
      removeAuthToken();
      throw new Error("TOKEN_EXPIRED");
    }
  }
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  headers.set("Content-Type", "application/json");
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Обработка 401 Unauthorized - токен истек или недействителен
  if (response.status === 401) {
    // Попытка обновить токен через refresh token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const { adminRefreshToken } = await import('./api');
        const { access_token, refresh_token } = await adminRefreshToken(refreshToken);
        setAuthToken(access_token);
        setRefreshToken(refresh_token);
        
        // Повтор запроса с новым токеном
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set("Authorization", `Bearer ${access_token}`);
        retryHeaders.set("Content-Type", "application/json");
        
        return fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } catch (error) {
        // Если refresh не удался - удаляем токены
        removeAuthToken();
        throw new Error("UNAUTHORIZED");
      }
    } else {
      removeAuthToken();
      throw new Error("UNAUTHORIZED");
    }
  }
  
  return response;
};

