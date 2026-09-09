/**
 * Утилиты для клиентской обработки и оптимизации изображений перед загрузкой.
 * Решает проблемы с фотографиями высокого разрешения со смартфонов (10-25MB),
 * нормализует расширения файлов и ускоряет загрузку на мобильном интернете.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Проверяет, является ли файл изображением
 */
export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'jfif'].includes(ext);
}

/**
 * Нормализует имя файла (заменяет пробелы, приводит расширение к нижнему регистру)
 */
export function normalizeImageFileName(originalName: string, targetExt = 'jpg'): string {
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const cleaned = baseName
    .replace(/[^\wа-яА-ЯёЁ-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  const finalName = cleaned || 'photo';
  return `${finalName}.${targetExt}`;
}

/**
 * Оптимизирует и при необходимости сжимает изображение перед отправкой на сервер.
 * Уменьшает габариты до 1920px и сжимает в JPEG с сохранением отличного качества.
 * При ошибке (или в среде без DOM/Canvas) безопасно возвращает исходный файл.
 */
export async function prepareImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.88,
  } = options;

  // Если файл не изображение или размер уже очень мал (< 500KB) и расширение стандартное
  if (!isImageFile(file)) {
    return file;
  }

  // Проверка доступности DOM API (для Node / тестового окружения)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  // Если размер меньше 600KB и формат jpeg/png/webp, не обязательно пережимать,
  // но нормализуем имя если расширение было верхнего регистра
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const isAlreadyOptimized = file.size < 600 * 1024 && ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

  if (isAlreadyOptimized && file.name.endsWith(`.${ext}`)) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);

        try {
          let { width, height } = img;

          // Рассчитываем пропорциональное масштабирование
          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Белый фон для прозрачных изображений при конвертации в JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const newFileName = normalizeImageFileName(file.name, 'jpg');
              const optimizedFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              // Если оптимизированный файл почему-то оказался больше оригинала, используем оригинал
              if (optimizedFile.size > file.size && file.size > 0) {
                resolve(file);
              } else {
                resolve(optimizedFile);
              }
            },
            'image/jpeg',
            quality
          );
        } catch {
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      img.src = url;
    } catch {
      resolve(file);
    }
  });
}
