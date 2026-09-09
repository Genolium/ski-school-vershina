import { ComponentType, ReactNode, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

interface DeferredSectionProps {
  /**
   * Импортируемый компонент, который нужно загрузить лениво.
   */
  loader: () => Promise<{ default: ComponentType }>;
  /**
   * Заполнитель, отображаемый до момента загрузки основного компонента.
   */
  fallback: ReactNode;
  /**
   * Классы для обертки, чтобы сохранить сетку/отступы.
   */
  wrapperClassName?: string;
  /**
   * Отступ срабатывания IntersectionObserver, по умолчанию 200px.
   */
  rootMargin?: string;
}

/**
 * Отложенно рендерит тяжёлый компонент, запуская загрузку только когда секция попадает в зону видимости.
 *
 * Args:
 *     loader: Метод импорта компонента.
 *     fallback: JSX-заполнитель до загрузки.
 *     wrapperClassName: Дополнительные классы для контейнера.
 *     rootMargin: Отступ для IntersectionObserver.
 *
 * Returns:
 *     JSX.Element: Обёртка, которая управляет загрузкой и отображением компонента.
 */
const DeferredSection = ({
  loader,
  fallback,
  wrapperClassName,
  rootMargin = "200px",
}: DeferredSectionProps) => {
  const LazyComponent = useMemo(() => lazy(loader), [loader]);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const element = containerRef.current;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (typeof window !== "undefined") {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(
          () => {
            setShouldLoad(true);
          },
          { timeout: 3000 }
        );
      } else {
        timerId = setTimeout(() => {
          setShouldLoad(true);
        }, 2000);
      }
    }

    let observer: IntersectionObserver | null = null;
    if (element && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const hasIntersection = entries.some((entry) => entry.isIntersecting);
          if (hasIntersection) {
            setShouldLoad(true);
            observer?.disconnect();
          }
        },
        { rootMargin },
      );
      observer.observe(element);
    }

    return () => {
      observer?.disconnect();
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [rootMargin, shouldLoad]);

  return (
    <div ref={containerRef} className={wrapperClassName} aria-busy={!shouldLoad}>
      {shouldLoad ? (
        <Suspense fallback={fallback}>
          <LazyComponent />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default DeferredSection;
