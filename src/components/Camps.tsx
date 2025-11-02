import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mountain, Calendar, Users, Snowflake, ChevronLeft, ChevronRight } from "lucide-react";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { getCamps, type Camp } from "@/lib/api";

const Camps = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCamps()
      .then((data) => {
        setCamps(data.filter((c) => c.is_active !== false));
        setLoading(false);
      })
      .catch(() => {
        setCamps([]);
        setLoading(false);
      });
  }, []);

  // Минимальная дистанция для свайпа
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < camps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : camps.length - 1));
  }, [camps.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < camps.length - 1 ? prev + 1 : 0));
  }, [camps.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Поддержка клавиатурной навигации
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (camps.length === 0) return;
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camps.length, goToPrevious, goToNext]);

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const parseList = (value?: string) => {
    if (!value) return [] as string[];
    try {
      const v = JSON.parse(value);
      return Array.isArray(v) ? (v as string[]) : [];
    } catch {
      return [];
    }
  };

  return (
    <section id="camps" className="py-12 md:py-20 bg-gradient-dark text-ski-white relative overflow-hidden">
      {/* Geometric Patterns */}
      <GeometricPatterns type="triangle" color="primary" size="xl" opacity={50} className="top-8 right-8 md:top-12 md:right-12 rotate-12" />
      <GeometricPatterns type="x-grid" color="primary" size="lg" opacity={45} className="bottom-8 left-8 md:bottom-12 md:left-12" />
      <GeometricPatterns type="chevrons-left" color="primary" size="md" opacity={40} className="top-1/4 left-4 md:left-8" />
      <GeometricPatterns type="chevrons-right" color="primary" size="md" opacity={40} className="bottom-1/4 right-4 md:right-8" />
      <GeometricPatterns type="zigzag" color="primary" size="sm" opacity={35} className="top-16 left-1/2 -translate-x-1/2 w-24 md:w-32" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              Тренировочные <span className="text-primary">сборы</span>
            </h2>
            <p className="text-base md:text-xl text-ski-white/80 max-w-2xl mx-auto px-4">
              Выездные тренировки на лучших горнолыжных курортах
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto relative">
          {loading ? (
            <div className="bg-ski-white/5 backdrop-blur-sm border-2 border-primary/30 rounded-xl md:rounded-2xl p-6 md:p-12 mb-6 md:mb-8">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                <div>
                  <Skeleton className="h-8 md:h-10 w-48 mb-4 md:mb-6 bg-ski-white/10" />
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded bg-ski-white/10 flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2 bg-ski-white/10" />
                        <Skeleton className="h-3 w-48 bg-ski-white/10" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded bg-ski-white/10 flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2 bg-ski-white/10" />
                        <Skeleton className="h-3 w-40 bg-ski-white/10" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded bg-ski-white/10 flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2 bg-ski-white/10" />
                        <Skeleton className="h-3 w-36 bg-ski-white/10" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded bg-ski-white/10 flex-shrink-0" />
                      <Skeleton className="h-4 w-40 bg-ski-white/10" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-hero rounded-lg md:rounded-xl p-5 md:p-6">
                  <Skeleton className="h-6 md:h-8 w-40 mb-3 md:mb-4 bg-ski-white/20" />
                  <div className="space-y-2 md:space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Skeleton className="h-2 w-2 rounded-full bg-ski-white/30 mt-1.5 flex-shrink-0" />
                        <Skeleton className="h-4 flex-1 bg-ski-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-5 md:pt-6 border-t border-ski-white/20">
                <Skeleton className="h-4 w-64 mx-auto mb-3 md:mb-4 bg-ski-white/10" />
                <Skeleton className="h-12 md:h-14 w-48 mx-auto rounded-md bg-ski-white/10" />
              </div>
            </div>
          ) : camps.length === 0 ? (
            <ScrollReveal>
            <div className="bg-ski-white/5 backdrop-blur-sm border-2 border-primary/30 rounded-xl md:rounded-2xl p-6 md:p-12 mb-6 md:mb-8 text-center">
              Данные о сборах появятся позже
            </div>
            </ScrollReveal>
          ) : (
            <>
              {/* Карусель контейнер */}
              <div 
                ref={containerRef}
                className="relative overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {camps.map((camp, index) => (
                    <div key={camp.id} className="min-w-full px-2">
                      <ScrollReveal delay={150}>
                        <div className="bg-ski-white/5 backdrop-blur-sm border-2 border-primary/30 rounded-xl md:rounded-2xl p-6 md:p-12 mb-6 md:mb-8">
                          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                            <div>
                              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{camp.title}</h3>
                              <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                                <div className="flex items-start gap-2 md:gap-3">
                                  <Mountain className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold">{camp.location}</p>
                                    {camp.location_desc && (
                                      <p className="text-ski-white/70 text-xs md:text-sm">{camp.location_desc}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 md:gap-3">
                                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold">{camp.dates}</p>
                                    {camp.duration && (
                                      <p className="text-ski-white/70 text-xs md:text-sm">Продолжительность: {camp.duration}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 md:gap-3">
                                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                                  <div>
                                    {camp.group_size && <p className="font-semibold">Группы: {camp.group_size}</p>}
                                    {camp.group_desc && (
                                      <p className="text-ski-white/70 text-xs md:text-sm">{camp.group_desc}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 md:gap-3">
                                  <Snowflake className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                                  <div>
                                    {camp.training_desc && <p className="font-semibold">{camp.training_desc}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-hero rounded-lg md:rounded-xl p-5 md:p-6">
                              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Что включено:</h4>
                              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                                {parseList(camp.included_items).map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-ski-white rounded-full mt-1.5 md:mt-2 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {parseList(camp.included_items).length === 0 && (
                                  <li className="text-ski-white/80">Список формируется…</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="text-center pt-5 md:pt-6 border-t border-ski-white/20">
                            <p className="text-sm md:text-lg mb-3 md:mb-4">
                              Места ограничены! Успейте записаться в группу
                            </p>
                            <Button variant="hero" size="lg" onClick={scrollToForm} className="text-sm md:text-base h-12 md:h-14 touch-manipulation">
                              Оставить заявку
                            </Button>
                          </div>
                        </div>
                      </ScrollReveal>
                    </div>
                  ))}
                </div>
              </div>

              {/* Навигационные стрелки */}
              {camps.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-8 lg:-translate-x-12 z-10 bg-ski-white/10 hover:bg-ski-white/20 backdrop-blur-sm border border-primary/30 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation shadow-lg"
                    aria-label="Предыдущий слайд"
                  >
                    <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-8 lg:translate-x-12 z-10 bg-ski-white/10 hover:bg-ski-white/20 backdrop-blur-sm border border-primary/30 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation shadow-lg"
                    aria-label="Следующий слайд"
                  >
                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </button>
                </>
              )}

              {/* Индикаторы точек */}
              {camps.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 md:mt-6">
                  {camps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full touch-manipulation ${
                        index === currentIndex
                          ? "bg-primary w-8 h-2 md:w-10 md:h-2.5"
                          : "bg-ski-white/30 w-2 h-2 md:w-2.5 md:h-2.5 hover:bg-ski-white/50"
                      }`}
                      aria-label={`Перейти к слайду ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Past camps highlights */}
        <div className="grid md:grid-cols-3 gap-3 md:gap-4 text-center">
          {[
            { value: "5", label: "Сборов в прошлом сезоне" },
            { value: "80+", label: "Участников сборов" },
            { value: "98%", label: "Родителей рекомендуют" },
          ].map((item, index) => (
            <ScrollReveal key={index} delay={index * 100}>
            <div className="bg-ski-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-ski-white/10">
              <p className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">{item.value}</p>
              <p className="text-xs md:text-sm text-ski-white/80">{item.label}</p>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Camps;
