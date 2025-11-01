import { ReactNode } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

/**
 * Компонент для анимации появления контента при скролле.
 * 
 * @param children - Контент для анимации
 * @param delay - Задержка анимации в миллисекундах (по умолчанию 0)
 * @param className - Дополнительные CSS классы
 * @param direction - Направление анимации (up, down, left, right, fade)
 */
const ScrollReveal = ({
  children,
  delay = 0,
  className,
  direction = "up",
}: ScrollRevealProps) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true,
  });

  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return "translate-y-8";
      case "down":
        return "-translate-y-8";
      case "left":
        return "-translate-x-8";
      case "right":
        return "translate-x-8";
      case "fade":
      default:
        return "";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        !isVisible && `${getInitialTransform()} opacity-0`,
        isVisible && "translate-y-0 translate-x-0 opacity-100",
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        data-visible={isVisible.toString()}
        className="backdrop-blur-transition"
        style={{
          "--backdrop-blur-delay": `${delay}ms`,
        } as React.CSSProperties & { "--backdrop-blur-delay"?: string }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollReveal;

