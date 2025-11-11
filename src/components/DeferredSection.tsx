import { ComponentType, ReactNode, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

interface DeferredSectionProps<ComponentProps> {
  /**
   * Импортируемый компонент, который нужно загрузить лениво.
   */
  loader: () => Promise<{ default: ComponentType<ComponentProps> }>;
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
  /**
   * Свойства, передаваемые ленивому компоненту.
   */
  componentProps?: ComponentProps;
}

/**
 * Отложенно рендерит тяжёлый компонент, запуская загрузку только когда секция попадает в зону видимости.
 *
 * Args:
 *     loader: Метод импорта компонента.
 *     fallback: JSX-заполнитель до загрузки.
 *     wrapperClassName: Дополнительные классы для контейнера.
 *     rootMargin: Отступ для IntersectionObserver.
 *     componentProps: Пропсы для ленивого компонента.
 *
 * Returns:
 *     JSX.Element: Обёртка, которая управляет загрузкой и отображением компонента.
 */
const DeferredSection = <ComponentProps,>({
  loader,
  fallback,
  wrapperClassName,
  rootMargin = "200px",
  componentProps,
}: DeferredSectionProps<ComponentProps>) => {
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
          <LazyComponent {...(componentProps as ComponentProps)} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default DeferredSection;


