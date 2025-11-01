// Централизованный обработчик ошибок для фронтенда
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const logError = (error: unknown, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  if (import.meta.env.DEV) {
    console.error(`[${context || 'Error'}]`, errorMessage, errorStack);
  } else {
    // В production можно отправлять ошибки на сервер
    console.error(`[${context || 'Error'}]`, errorMessage);
  }
};

export const handleApiError = (error: unknown): string => {
  logError(error, 'API');
  
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Обработка специфичных ошибок
    if (error.message === 'TOKEN_EXPIRED' || error.message === 'UNAUTHORIZED') {
      return 'Сессия истекла. Пожалуйста, войдите снова.';
    }
    
    return error.message || 'Произошла ошибка при выполнении запроса.';
  }
  
  return 'Произошла неизвестная ошибка. Попробуйте позже.';
};

