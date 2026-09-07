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
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hasIntersection = entries.some((entry) => entry.isIntersecting);
        if (hasIntersection) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
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
